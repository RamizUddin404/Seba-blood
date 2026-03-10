import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("bloodbank.db");

// Supabase Setup (Optional)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL, -- 'donor' or 'public'
    blood_group TEXT,
    district TEXT,
    phone TEXT,
    photo TEXT,
    bio TEXT,
    last_donation TEXT,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    hospital TEXT NOT NULL,
    district TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'success', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    lat REAL,
    lng REAL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'request', 'message', 'system'
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(cookieParser());

  // WebSocket connections map
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws, req) => {
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as any);

    const userId = cookies?.userId ? parseInt(cookies.userId) : null;
    if (userId) {
      clients.set(userId, ws);
      ws.on('close', () => clients.delete(userId));
    }

    ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.type === 'chat' && userId) {
          const { receiver_id, content } = payload;
          
          // Save to DB
          const info = db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES (?, ?, ?)
          `).run(userId, receiver_id, content);

          const message = {
            id: info.lastInsertRowid,
            sender_id: userId,
            receiver_id,
            content,
            created_at: new Date().toISOString()
          };

          // Send to receiver if online
          const receiverWs = clients.get(receiver_id);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({ type: 'chat', message }));
          }

          // Also send back to sender for confirmation
          ws.send(JSON.stringify({ type: 'chat_sent', message }));
        }
      } catch (e) {
        console.error('WS Error:', e);
      }
    });
  });

  // Auth Middleware (Simple)
  const getSessionUser = (req: any) => {
    const userId = req.cookies.userId;
    if (!userId) return null;
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  };

  // OpenRouteService Distance Verification (Mocked if no key, but logic is there)
  const verifyDistance = async (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const apiKey = process.env.OPENROUTE_API_KEY;
    if (!apiKey) {
      // Fallback to simple Haversine if no key
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    try {
      const res = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${lng1},${lat1}&end=${lng2},${lat2}`);
      const data = await res.json();
      return data.features[0].properties.summary.distance / 1000; // km
    } catch (e) {
      return 999; // Error fallback
    }
  };

  // --- API Routes ---

  app.post("/api/register", (req, res) => {
    const { name, email, password, type, blood_group, district, phone, lat, lng } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO users (name, email, password, type, blood_group, district, phone, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, email, password, type, blood_group || null, district || null, phone || null, lat || null, lng || null);
      
      res.cookie("userId", info.lastInsertRowid, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json({ user });
    } catch (e: any) {
      res.status(400).json({ error: e.message.includes("UNIQUE") ? "Email already exists" : "Registration failed" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.cookie("userId", user.id, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      res.json({ user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("userId", { secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  app.get("/api/me", (req, res) => {
    const user = getSessionUser(req);
    res.json({ user: user || null });
  });

  app.put("/api/profile", (req, res) => {
    const user: any = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const fields = ['name', 'phone', 'district', 'blood_group', 'bio', 'photo', 'last_donation', 'lat', 'lng'];
    const updates: string[] = [];
    const params: any[] = [];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field] === "" ? null : req.body[field]);
      }
    });

    if (updates.length > 0) {
      try {
        params.push(user.id);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      } catch (e) {
        return res.status(400).json({ error: "Update failed" });
      }
    }

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    res.json({ user: updatedUser });
  });

  app.get("/api/donors", (req, res) => {
    const { blood_group, district } = req.query;
    let query = "SELECT id, name, blood_group, district, phone, photo, bio, lat, lng FROM users WHERE type = 'donor'";
    const params: any[] = [];

    if (blood_group) {
      query += " AND blood_group = ?";
      params.push(blood_group);
    }
    if (district) {
      query += " AND district = ?";
      params.push(district);
    }

    const donors = db.prepare(query).all(...params);
    res.json({ donors });
  });

  app.post("/api/requests", async (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { patient_name, blood_group, hospital, district, phone, lat, lng } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO blood_requests (user_id, patient_name, blood_group, hospital, district, phone, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, patient_name, blood_group, hospital, district, phone, lat || null, lng || null);
      
      const requestId = info.lastInsertRowid;

      // --- Intelligence: Notify matching donors ---
      const matchingDonors = db.prepare(`
        SELECT id, lat, lng FROM users 
        WHERE type = 'donor' AND blood_group = ? AND id != ?
      `).all(blood_group, user.id);

      for (const donor of matchingDonors as any[]) {
        let isVerified = true;
        let distance = 0;

        if (lat && lng && donor.lat && donor.lng) {
          distance = await verifyDistance(lat, lng, donor.lat, donor.lng);
          // Only notify if within 50km (custom verification logic)
          if (distance > 50) isVerified = false;
        }

        if (isVerified) {
          const title = `Urgent: ${blood_group} Needed!`;
          const message = `${patient_name} needs blood at ${hospital}. ${distance > 0 ? `Distance: ${distance.toFixed(1)}km` : ''}`;
          
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, ?)
          `).run(donor.id, title, message, 'request');

          // Send real-time notification if online
          const donorWs = clients.get(donor.id);
          if (donorWs && donorWs.readyState === WebSocket.OPEN) {
            donorWs.send(JSON.stringify({ 
              type: 'notification', 
              notification: { title, message, type: 'request', created_at: new Date().toISOString() } 
            }));
          }
        }
      }
      
      res.json({ success: true, id: requestId });
    } catch (e: any) {
      console.error(e);
      res.status(400).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/requests", (req, res) => {
    const requests = db.prepare("SELECT * FROM blood_requests ORDER BY created_at DESC").all();
    res.json({ requests });
  });

  app.get("/api/notifications", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all();
    res.json({ notifications });
  });

  app.put("/api/notifications/read", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(user.id);
    res.json({ success: true });
  });

  app.get("/api/messages/:otherId", (req, res) => {
    const user: any = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { otherId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(user.id, otherId, otherId, user.id);
    res.json({ messages });
  });

  app.put("/api/requests/:id/status", (req, res) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    const { id } = req.params;

    try {
      db.prepare("UPDATE blood_requests SET status = ? WHERE id = ?").run(status, id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Update failed" });
    }
  });

  app.get("/api/stats", (req, res) => {
    const totalDonors = db.prepare("SELECT COUNT(*) as count FROM users WHERE type = 'donor'").get().count;
    const totalRequests = db.prepare("SELECT COUNT(*) as count FROM blood_requests").get().count;
    const pendingRequests = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'pending'").get().count;
    const successRequests = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'success'").get().count;
    
    res.json({
      donors: totalDonors,
      requests: totalRequests,
      pending: pendingRequests,
      success: successRequests
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
