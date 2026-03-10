import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("bloodbank.db");

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
    last_donation TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Auth Middleware (Simple)
  const getSessionUser = (req: any) => {
    const userId = req.cookies.userId;
    if (!userId) return null;
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  };

  // --- API Routes ---

  app.post("/api/register", (req, res) => {
    const { name, email, password, type, blood_group, district, phone } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO users (name, email, password, type, blood_group, district, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, email, password, type, blood_group || null, district || null, phone || null);
      
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

    const { name, phone, district, blood_group, bio, photo, last_donation } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, district = ?, blood_group = ?, bio = ?, photo = ?, last_donation = ?
      WHERE id = ?
    `).run(
      name || user.name, 
      phone || user.phone, 
      district || user.district, 
      blood_group || user.blood_group, 
      bio || user.bio, 
      photo || user.photo,
      last_donation || user.last_donation,
      user.id
    );

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    res.json({ user: updatedUser });
  });

  app.get("/api/donors", (req, res) => {
    const { blood_group, district } = req.query;
    let query = "SELECT id, name, blood_group, district, phone, photo, bio FROM users WHERE type = 'donor'";
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
