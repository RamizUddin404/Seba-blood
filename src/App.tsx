/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, 
  Search, 
  User, 
  MapPin, 
  Phone, 
  AlertCircle, 
  HeartPulse, 
  Clock, 
  ChevronRight, 
  Menu, 
  X, 
  Plus, 
  LogOut, 
  Settings, 
  Bell, 
  MessageSquare, 
  Send, 
  Camera, 
  Edit3, 
  Save, 
  CheckCircle2, 
  Facebook, 
  Twitter, 
  Instagram,
  UserPlus,
  Navigation,
  Mail,
  Users
} from 'lucide-react';

import { translations, Language } from './translations';

// --- Types ---
interface UserData {
  id: number;
  name: string;
  email: string;
  type: 'donor' | 'public';
  blood_group?: string;
  district?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  last_donation?: string;
  lat?: number;
  lng?: number;
}

interface BloodRequest {
  id: number;
  user_id: number;
  patient_name: string;
  blood_group: string;
  hospital: string;
  district: string;
  phone: string;
  status: 'pending' | 'success' | 'cancelled';
  created_at: string;
  lat?: number;
  lng?: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

// --- Data ---
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Brahmanbaria', 'Noakhali', 'Feni', 'Chandpur', 'Lakshmipur'
];

// --- Components ---

const Navbar = ({ 
  user, 
  onLogout, 
  onOpenAuth, 
  notifications, 
  unreadCount, 
  onOpenChat, 
  onMarkRead,
  lang,
  setLang,
  view,
  setView
}: { 
  user: UserData | null, 
  onLogout: () => void, 
  onOpenAuth: (mode: 'login' | 'register') => void,
  notifications: Notification[],
  unreadCount: number,
  onOpenChat: (id: number, name: string) => void,
  onMarkRead: () => void,
  lang: Language,
  setLang: (l: Language) => void,
  view: string,
  setView: (v: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.home, id: 'home' },
    { name: t.findDonor, id: 'find' },
    { name: t.requests, id: 'requests' },
    { name: t.contact, id: 'contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Droplet size={24} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold serif text-primary leading-none">Seba</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary">Blood Bank</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button 
              key={link.id} 
              onClick={() => {
                if (link.id === 'find' || link.id === 'contact') {
                  setView('home');
                  setTimeout(() => {
                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  setView(link.id);
                }
              }}
              className={`text-sm font-semibold transition-colors ${view === link.id ? 'text-primary' : 'text-slate-700 hover:text-primary'}`}
            >
              {link.name}
            </button>
          ))}
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-3 py-1 rounded-lg bg-accent text-[10px] font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-all uppercase"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>

          {user ? (
            <div className="flex items-center gap-6 border-l border-slate-200 pl-8">
              <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); onMarkRead(); }}
                  className="text-slate-400 hover:text-primary transition-colors relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-900">Notifications</div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <div className="font-bold text-xs text-slate-900 mb-1">{n.title}</div>
                              <div className="text-xs text-slate-500 leading-relaxed">{n.message}</div>
                              <div className="text-[10px] text-slate-300 mt-2">{new Date(n.created_at).toLocaleTimeString()}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('profile')}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary"
                >
                  {user.photo ? (
                    <img src={user.photo} className="w-8 h-8 rounded-full object-cover border border-primary/20" alt="Profile" />
                  ) : (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                  )}
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <button onClick={onLogout} className="text-slate-400 hover:text-primary transition-colors ml-2">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => onOpenAuth('login')} className="text-sm font-bold text-slate-700 hover:text-primary">{t.login}</button>
              <button onClick={() => onOpenAuth('register')} className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                {t.register}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-2 py-1 rounded-lg bg-accent text-[8px] font-bold text-slate-600 uppercase"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button className="text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl py-8 px-6 flex flex-col gap-6 md:hidden border-t border-slate-100"
          >
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                className={`text-xl font-bold text-left ${view === link.id ? 'text-primary' : 'text-slate-800'}`}
                onClick={() => {
                  if (link.id === 'find' || link.id === 'contact') {
                    setView('home');
                    setTimeout(() => {
                      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    setView(link.id);
                  }
                  setIsOpen(false);
                }}
              >
                {link.name}
              </button>
            ))}
            {user ? (
              <>
                <button 
                  onClick={() => { setView('profile'); setIsOpen(false); }}
                  className="text-xl font-bold text-primary text-left"
                >
                  {t.profile}
                </button>
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="text-xl font-bold text-slate-500 text-left">{t.logout}</button>
              </>
            ) : (
              <button onClick={() => { onOpenAuth('login'); setIsOpen(false); }} className="bg-primary text-white px-6 py-4 rounded-2xl text-center font-bold text-lg">
                Join Now
              </button>
            )}
            <a href="tel:+8801726717432" className="flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold">
              <Phone size={20} /> Call Support
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ChatBox = ({ 
  user, 
  otherId, 
  otherName, 
  onClose, 
  messages, 
  onSendMessage 
}: { 
  user: UserData, 
  otherId: number, 
  otherName: string, 
  onClose: () => void,
  messages: Message[],
  onSendMessage: (content: string) => void
}) => {
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content);
    setContent('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col z-[100] overflow-hidden"
    >
      <div className="p-6 bg-primary text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <div className="font-bold text-sm leading-none">{otherName}</div>
            <div className="text-[10px] opacity-70 mt-1">Online</div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
              m.sender_id === user.id 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white text-slate-700 shadow-sm rounded-tl-none'
            }`}>
              {m.content}
              <div className={`text-[9px] mt-1 opacity-50 ${m.sender_id === user.id ? 'text-right' : 'text-left'}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-accent rounded-xl outline-none text-sm font-medium"
        />
        <button type="submit" className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-secondary transition-colors">
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
};

const AuthModal = ({ isOpen, onClose, mode, setMode, onAuthSuccess }: { 
  isOpen: boolean, 
  onClose: () => void, 
  mode: 'login' | 'register', 
  setMode: (m: 'login' | 'register') => void,
  onAuthSuccess: (u: UserData) => void
}) => {
  const [type, setType] = useState<'donor' | 'public'>('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const payload = mode === 'login' ? data : { ...data, type };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold serif text-slate-900">
                  {mode === 'login' ? 'Welcome Back' : 'Join Seba'}
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-primary"><X size={24} /></button>
              </div>

              {mode === 'register' && (
                <div className="flex bg-accent p-1 rounded-2xl mb-8">
                  <button 
                    onClick={() => setType('donor')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'donor' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    Donor Account
                  </button>
                  <button 
                    onClick={() => setType('public')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'public' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    Public Account
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input name="name" required type="text" className="w-full px-6 py-4 bg-accent rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 font-semibold" placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input name="email" required type="email" className="w-full px-6 py-4 bg-accent rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 font-semibold" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input name="password" required type="password" className="w-full px-6 py-4 bg-accent rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 font-semibold" placeholder="••••••••" />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full px-6 py-4 bg-accent rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 font-semibold" placeholder="017XXXXXXXX" />
                  </div>
                )}

                {mode === 'register' && type === 'donor' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Blood Group</label>
                      <select name="blood_group" className="w-full px-4 py-4 bg-accent rounded-2xl outline-none font-semibold appearance-none">
                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">District</label>
                      <select name="district" className="w-full px-4 py-4 bg-accent rounded-2xl outline-none font-semibold appearance-none">
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {error && <div className="text-primary text-sm font-bold text-center bg-primary/5 py-3 rounded-xl">{error}</div>}

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-secondary transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
                </button>
              </form>

              <div className="mt-8 text-center text-slate-500 text-sm">
                {mode === 'login' ? (
                  <p>Don't have an account? <button onClick={() => setMode('register')} className="text-primary font-bold">Register Now</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => setMode('login')} className="text-primary font-bold">Login Now</button></p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ProfileSection = ({ user, onUpdate }: { user: UserData, onUpdate: (u: UserData) => void }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setMyRequests(data.requests.filter((r: any) => r.user_id === user.id));
      });
  }, [user.id]);

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMyRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        onUpdate(result.user);
        setEditing(false);
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error during profile update");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        setLoading(true);
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64 })
        });
        const result = await res.json();
        if (res.ok) {
          onUpdate(result.user);
        } else {
          alert(result.error || "Failed to upload photo");
        }
      } catch (err) {
        console.error(err);
        alert("Connection error during photo upload");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="profile" className="py-32 bg-accent min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden mb-12"
        >
          <div className="h-48 bg-primary relative">
            <div className="absolute -bottom-16 left-12">
              <div className="relative group">
                {user.photo ? (
                  <img src={user.photo} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-xl" alt="Profile" />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center text-slate-300">
                    <User size={64} />
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera size={24} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>
            <div className="absolute bottom-4 right-8">
              <button 
                onClick={() => setEditing(!editing)}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                {editing ? <X size={18} /> : <Edit3 size={18} />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="pt-20 p-12">
            {!editing ? (
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold serif text-slate-900 mb-2">{user.name}</h2>
                  <p className="text-primary font-bold uppercase tracking-widest text-xs mb-6">{user.type} Account</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-slate-600">
                      <Mail size={18} className="text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <Phone size={18} className="text-slate-400" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <MapPin size={18} className="text-slate-400" />
                      <span>{user.district || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-bold text-slate-900 mb-3">Bio</h4>
                    <p className="text-slate-500 leading-relaxed italic">
                      {user.bio || "No bio added yet. Tell people why you donate!"}
                    </p>
                  </div>
                </div>

                {user.type === 'donor' && (
                  <div className="bg-accent rounded-3xl p-8">
                    <h4 className="font-bold text-slate-900 mb-6">Donation Info</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Blood Group</div>
                        <div className="text-2xl font-bold text-primary">{user.blood_group}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Last Donation</div>
                        <div className="text-sm font-bold text-slate-700">{user.last_donation || 'Never'}</div>
                      </div>
                    </div>
                    <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <HeartPulse size={20} />
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        Your profile is visible to people searching for donors in <b>{user.district}</b>.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input name="name" defaultValue={user.name} className="w-full px-6 py-4 bg-accent rounded-2xl outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input name="phone" defaultValue={user.phone} className="w-full px-6 py-4 bg-accent rounded-2xl outline-none font-semibold" />
                  </div>
                </div>
                {user.type === 'donor' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Blood Group</label>
                      <select name="blood_group" defaultValue={user.blood_group} className="w-full px-4 py-4 bg-accent rounded-2xl outline-none font-semibold appearance-none">
                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">District</label>
                      <select name="district" defaultValue={user.district} className="w-full px-4 py-4 bg-accent rounded-2xl outline-none font-semibold appearance-none">
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Donation</label>
                      <input name="last_donation" type="date" defaultValue={user.last_donation} className="w-full px-4 py-4 bg-accent rounded-2xl outline-none font-semibold" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio</label>
                  <textarea name="bio" defaultValue={user.bio} rows={3} className="w-full px-6 py-4 bg-accent rounded-2xl outline-none font-semibold resize-none" placeholder="Tell us about yourself..."></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-secondary transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  <Save size={20} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
        {/* My Requests & Chats Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Droplet className="text-primary" /> My Blood Requests
            </h3>
            
            {myRequests.length === 0 ? (
              <div className="text-center py-12 bg-accent rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400">You haven't posted any blood requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-6 bg-accent rounded-3xl border border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                        {req.blood_group}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{req.patient_name}</div>
                        <div className="text-xs text-slate-500">{req.hospital}, {req.district}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {req.status}
                      </div>
                      
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'success')}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all"
                          >
                            Mark Success
                          </button>
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'cancelled')}
                            className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MessageSquare className="text-primary" /> Recent Conversations
            </h3>
            <div className="text-center py-12 bg-accent rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">Your active chats will appear here. Start a conversation with a donor or requester to see it here.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = ({ lang }: { lang: Language }) => {
  const t = translations[lang].hero;
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-accent">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            <HeartPulse size={16} /> {t.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold serif leading-tight mb-8 text-slate-900">
            {t.title1} <br />
            <span className="text-primary italic">{t.title2}</span> <br />
            {t.title3}
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
            {t.subtitle}
          </p>
          <div className="flex flex-wrap gap-5">
            <a href="#find" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-secondary transition-all shadow-xl shadow-primary/20">
              {t.findBtn} <Search size={20} />
            </a>
            <a href="tel:+8801726717432" className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-bold hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center gap-3">
              {t.emergencyBtn} <Phone size={20} className="text-primary" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1615461066841-6116ecaaba30?auto=format&fit=crop&q=80&w=1000" 
              alt="Blood donation process" 
              className="w-full h-[600px] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Droplet size={24} fill="currentColor" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12,450+</div>
                  <div className="text-xs uppercase tracking-widest opacity-80">Successful Donations</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-10 top-20 bg-white p-6 rounded-3xl shadow-2xl z-20 hidden lg:block border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="font-bold text-slate-900">Live Donor</div>
                <div className="text-xs text-slate-500">O+ Available in Dhaka</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const SearchSection = ({ onOpenChat, lang }: { onOpenChat: (id: number, name: string) => void, lang: Language }) => {
  const t = translations[lang].search;
  const [bloodGroup, setBloodGroup] = useState('');
  const [district, setDistrict] = useState('');
  const [donors, setDonors] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (bloodGroup) params.append('blood_group', bloodGroup);
      if (district) params.append('district', district);
      
      const res = await fetch(`/api/donors?${params.toString()}`);
      const data = await res.json();
      setDonors(data.donors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="find" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-16 -mt-32 relative z-30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold serif text-slate-900 mb-4">{t.title}</h2>
            <p className="text-slate-500">{t.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">{t.bloodGroup}</label>
              <select 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-6 py-4 bg-accent rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-semibold appearance-none"
              >
                <option value="">{lang === 'en' ? 'Select Group' : 'গ্রুপ নির্বাচন করুন'}</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">{t.district}</label>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-6 py-4 bg-accent rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-semibold appearance-none"
              >
                <option value="">{lang === 'en' ? 'Select District' : 'জেলা নির্বাচন করুন'}</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? t.searching : <><Search size={20} /> {t.searchBtn}</>}
              </button>
            </div>
          </div>

          {searched && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Users className="text-primary" /> 
                {donors.length > 0 ? t.found.replace('{count}', donors.length.toString()) : t.notFound}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map((donor) => (
                  <div key={donor.id} className="bg-accent p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      {donor.photo ? (
                        <img src={donor.photo} className="w-16 h-16 rounded-2xl object-cover" alt={donor.name} />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300">
                          <User size={32} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{donor.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {donor.district}
                        </div>
                      </div>
                      <div className="ml-auto bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">
                        {donor.blood_group}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-xs text-slate-400">
                        {t.lastDonation}: <span className="text-slate-600 font-bold">{donor.last_donation || 'N/A'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onOpenChat(donor.id, donor.name)}
                          className="bg-white text-slate-600 p-3 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <a 
                          href={`tel:${donor.phone}`}
                          className="bg-white text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const Features = ({ lang }: { lang: Language }) => {
  const features = [
    {
      title: lang === 'en' ? 'Find Donors' : 'দাতা খুঁজুন',
      desc: lang === 'en' ? 'Instant access to thousands of voluntary donors across Bangladesh.' : 'সারা বাংলাদেশে হাজার হাজার স্বেচ্ছায় দাতার তাৎক্ষণিক অ্যাক্সেস।',
      icon: <Search className="text-primary" size={32} />,
      color: 'bg-red-50'
    },
    {
      title: lang === 'en' ? 'Blood Request' : 'রক্তের অনুরোধ',
      desc: lang === 'en' ? 'Post an emergency request and get notified when a donor is found.' : 'একটি জরুরী অনুরোধ পোস্ট করুন এবং দাতা পাওয়া গেলে বিজ্ঞপ্তি পান।',
      icon: <AlertCircle className="text-orange-500" size={32} />,
      color: 'bg-orange-50'
    },
    {
      title: lang === 'en' ? 'Donor Network' : 'দাতা নেটওয়ার্ক',
      desc: lang === 'en' ? 'Join our growing community of lifesavers and manage your donations.' : 'আমাদের ক্রমবর্ধমান জীবন রক্ষাকারী সম্প্রদায়ে যোগ দিন এবং আপনার দান পরিচালনা করুন।',
      icon: <UserPlus className="text-blue-500" size={32} />,
      color: 'bg-blue-50'
    },
    {
      title: lang === 'en' ? '24/7 Support' : '২৪/৭ সাপোর্ট',
      desc: lang === 'en' ? 'Our dedicated team is always ready to assist you in emergencies.' : 'আমাদের নিবেদিত দল জরুরী অবস্থায় আপনাকে সহায়তা করার জন্য সর্বদা প্রস্তুত।',
      icon: <Clock className="text-green-500" size={32} />,
      color: 'bg-green-50'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-8`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RegisterForm = ({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'register') => void }) => {
  return (
    <section id="register" className="py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold serif text-slate-900 mb-8">Become a <span className="text-primary">Lifesaver</span> Today.</h2>
          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            Register as a voluntary donor and help us maintain a stable blood supply in Bangladesh. Your small act of kindness can give someone a second chance at life.
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">1</div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">Quick Registration</h4>
                <p className="text-slate-500 text-sm">Fill out a simple form with your basic details and blood group.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">2</div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">Get Notified</h4>
                <p className="text-slate-500 text-sm">Receive alerts when someone in your area needs your blood group.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">3</div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">Save Lives</h4>
                <p className="text-slate-500 text-sm">Donate blood at your convenience and become a hero in your community.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8">
            <UserPlus size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Start Your Journey</h3>
          <p className="text-slate-500 mb-10">Create an account to join our network of voluntary donors and lifesavers.</p>
          <button 
            onClick={() => onOpenAuth('register')}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-secondary transition-all"
          >
            Create Donor Account
          </button>
          <p className="mt-6 text-sm text-slate-400">
            Already have an account? <button onClick={() => onOpenAuth('login')} className="text-primary font-bold">Login here</button>
          </p>
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ lang }: { lang: Language }) => {
  const [stats, setStats] = useState({ donors: 0, requests: 0, pending: 0, success: 0 });
  const t = translations[lang].stats;

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const items = [
    { label: lang === 'en' ? 'Total Donors' : 'মোট দাতা', value: stats.donors, icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: lang === 'en' ? 'Blood Requests' : 'রক্তের অনুরোধ', value: stats.requests, icon: <Droplet size={24} />, color: 'text-primary', bg: 'bg-red-50' },
    { label: lang === 'en' ? 'Pending' : 'অপেক্ষমান', value: stats.pending, icon: <Clock size={24} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: lang === 'en' ? 'Success' : 'সফল', value: stats.success, icon: <CheckCircle2 size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {item.icon}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{item.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BloodRequestsFeed = ({ onOpenChat, lang }: { onOpenChat: (id: number, name: string) => void, lang: Language }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang].requests;

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <section id="requests" className="py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold serif text-slate-900 mb-4">{lang === 'en' ? 'Emergency Blood Requests' : 'জরুরী রক্তের অনুরোধ'}</h2>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.slice(0, 6).map((req) => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              {req.status === 'pending' && (
                <div className="absolute top-6 right-6 flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Clock size={12} /> {t.urgent}
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                  {req.blood_group}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{req.patient_name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> {req.hospital}, {req.district}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t.posted}</span>
                  <span className="text-slate-700 font-medium">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t.status}</span>
                  <span className={`font-bold uppercase text-[10px] tracking-widest ${req.status === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenChat(req.user_id, req.patient_name)}
                  className="flex-1 bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                >
                  <MessageSquare size={18} /> {t.chat}
                </button>
                <a 
                  href={`tel:${req.phone}`}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all"
                >
                  <Phone size={18} /> {t.call}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RequestsPage = ({ onOpenChat, lang }: { onOpenChat: (id: number, name: string) => void, lang: Language }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const t = translations[lang].requests;

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filteredRequests = filter 
    ? requests.filter(r => r.blood_group === filter)
    : requests;

  return (
    <div className="pt-32 pb-24 bg-accent min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-bold serif text-slate-900 mb-4">{t.title}</h1>
            <p className="text-slate-500 text-lg">{t.subtitle}</p>
          </div>
          <div className="flex gap-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 shadow-sm"
            >
              <option value="">{lang === 'en' ? 'All Groups' : 'সব গ্রুপ'}</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <a href="#request" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2">
              <Plus size={20} /> {t.postBtn}
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/50 animate-pulse h-64 rounded-[2.5rem]"></div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Droplet size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t.noRequests}</h3>
            <p className="text-slate-400">Be the first to help or post a request.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequests.map((req) => (
              <motion.div 
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all"
              >
                {req.status === 'pending' && (
                  <div className="absolute top-6 right-6 flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={12} /> {t.urgent}
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                    {req.blood_group}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{req.patient_name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={12} /> {req.hospital}, {req.district}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{t.posted}</span>
                    <span className="text-slate-700 font-medium">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{t.status}</span>
                    <span className={`font-bold uppercase text-[10px] tracking-widest ${req.status === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => onOpenChat(req.user_id, req.patient_name)}
                    className="flex-1 bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                  >
                    <MessageSquare size={18} /> {t.chat}
                  </button>
                  <a 
                    href={`tel:${req.phone}`}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all"
                  >
                    <Phone size={18} /> {t.call}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Contact = ({ lang }: { lang: Language }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const t = translations[lang].requests;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSuccess(true);
        e.currentTarget.reset();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="request" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] overflow-hidden grid lg:grid-cols-2 shadow-2xl">
          <div className="p-16 text-white flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold serif mb-8">
              {lang === 'en' ? <>Need Urgent <br /><span className="text-primary">Blood?</span></> : <>জরুরী <br /><span className="text-primary">রক্ত প্রয়োজন?</span></>}
            </h2>
            <p className="text-slate-400 mb-12 text-lg leading-relaxed">
              {lang === 'en' 
                ? 'Our emergency helpline is available 24/7. Call us immediately if you have a medical emergency and need blood donors.' 
                : 'আমাদের জরুরী হেল্পলাইন ২৪/৭ উপলব্ধ। আপনার যদি মেডিকেল ইমার্জেন্সি থাকে এবং রক্তদাতার প্রয়োজন হয় তবে অবিলম্বে আমাদের কল করুন।'}
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <a href="tel:+8801726717432" className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={28} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">{lang === 'en' ? 'Emergency Hotline 1' : 'জরুরী হটলাইন ১'}</div>
                    <div className="text-2xl font-bold">01726-717432</div>
                  </div>
                </a>
                <a href="tel:+8801627035504" className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={28} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">{lang === 'en' ? 'Emergency Hotline 2' : 'জরুরী হটলাইন ২'}</div>
                    <div className="text-2xl font-bold">01627-035504</div>
                  </div>
                </a>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                  <Mail size={28} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">{lang === 'en' ? 'Support Email' : 'সাপোর্ট ইমেইল'}</div>
                  <div className="text-2xl font-bold">romij2882@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?auto=format&fit=crop&q=80&w=1000" 
              alt="Medical support" 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 w-full max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6">{lang === 'en' ? 'Request Blood' : 'রক্তের অনুরোধ'}</h3>
                {success ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{lang === 'en' ? 'Request Submitted' : 'অনুরোধ জমা দেওয়া হয়েছে'}</h4>
                    <p className="text-white/60 text-sm mb-8">{lang === 'en' ? "We've posted your request. Donors will be notified." : 'আমরা আপনার অনুরোধ পোস্ট করেছি। দাতাদের জানানো হবে।'}</p>
                    <button onClick={() => setSuccess(false)} className="text-primary font-bold">{lang === 'en' ? 'Post another request' : 'আরেকটি অনুরোধ পোস্ট করুন'}</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="patient_name" required type="text" placeholder={lang === 'en' ? "Patient Name" : "রোগীর নাম"} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/40" />
                    <div className="grid grid-cols-2 gap-4">
                      <select name="blood_group" required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white appearance-none">
                        <option className="text-slate-900" value="">{lang === 'en' ? "Group" : "গ্রুপ"}</option>
                        {BLOOD_GROUPS.map(g => <option key={g} className="text-slate-900" value={g}>{g}</option>)}
                      </select>
                      <select name="district" required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white appearance-none">
                        <option className="text-slate-900" value="">{lang === 'en' ? "District" : "জেলা"}</option>
                        {DISTRICTS.map(d => <option key={d} className="text-slate-900" value={d}>{d}</option>)}
                      </select>
                    </div>
                    <input name="hospital" required type="text" placeholder={lang === 'en' ? "Hospital Name" : "হাসপাতালের নাম"} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/40" />
                    <input name="phone" required type="tel" placeholder={lang === 'en' ? "Contact Phone" : "যোগাযোগের ফোন"} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/40" />
                    <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-all disabled:opacity-50">
                      {loading ? (lang === 'en' ? 'Submitting...' : 'জমা দেওয়া হচ্ছে...') : (lang === 'en' ? 'Submit Request' : 'অনুরোধ জমা দিন')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ lang }: { lang: Language }) => {
  const t = translations[lang].footer;
  return (
    <footer className="bg-accent pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                <Droplet size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold serif text-primary">Seba Blood Bank</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
              {t.description}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
            <div className="mt-8 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.contactUs}</div>
              <div className="text-sm font-bold text-slate-700">romij2882@gmail.com</div>
              <div className="text-sm font-bold text-slate-700">01726-717432 | 01627-035504</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-8">{t.quickLinks}</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#find" className="hover:text-primary transition-colors">{t.findDonors}</a></li>
              <li><a href="#request" className="hover:text-primary transition-colors">{t.requestBlood}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t.terms}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-8">{lang === 'en' ? 'Blood Groups' : 'রক্তের গ্রুপ'}</h4>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(g => (
                <div key={g} className="bg-white p-2 rounded-lg text-center text-xs font-bold text-slate-600 border border-slate-100">
                  {g}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400 font-medium">
          <p>© 2026 Seba Blood Bank Bangladesh. {t.allRightsReserved}</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-primary transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' as 'login' | 'register' });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatState, setChatState] = useState<{ isOpen: boolean, otherId: number, otherName: string }>({ isOpen: false, otherId: 0, otherName: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState('home');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          fetchNotifications();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // Setup WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        } else if (data.type === 'chat') {
          if (chatState.isOpen && data.message.sender_id === chatState.otherId) {
            setMessages(prev => [...prev, data.message]);
          } else {
            // Show notification for new message
            setNotifications(prev => [{
              id: Date.now(),
              title: 'New Message',
              message: `You received a new message from a donor.`,
              type: 'message',
              is_read: 0,
              created_at: new Date().toISOString()
            }, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        } else if (data.type === 'chat_sent') {
          setMessages(prev => [...prev, data.message]);
        }
      };

      // Get location for verification
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          });
        });
      }

      return () => socket.close();
    }
  }, [user, chatState.isOpen, chatState.otherId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch('/api/notifications/read', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const openChat = async (otherId: number, otherName: string) => {
    try {
      const res = await fetch(`/api/messages/${otherId}`);
      const data = await res.json();
      setMessages(data.messages);
      setChatState({ isOpen: true, otherId, otherName });
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = (content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        receiver_id: chatState.otherId,
        content
      }));
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    window.location.hash = '';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-primary"
      >
        <Droplet size={64} fill="currentColor" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen selection:bg-primary/10 selection:text-primary">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} 
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenChat={openChat}
        onMarkRead={markNotificationsRead}
        lang={lang}
        setLang={setLang}
        view={view}
        setView={setView}
      />
      
      <AnimatePresence mode="wait">
        {view === 'profile' && user ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProfileSection user={user} onUpdate={setUser} />
          </motion.div>
        ) : view === 'requests' ? (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RequestsPage onOpenChat={openChat} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero lang={lang} />
            <StatsSection lang={lang} />
            <SearchSection onOpenChat={openChat} lang={lang} />
            <BloodRequestsFeed onOpenChat={openChat} lang={lang} />
            <Features lang={lang} />
            <RegisterForm onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} />
            <Contact lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal({ ...authModal, mode })}
        onAuthSuccess={setUser}
      />

      <AnimatePresence>
        {chatState.isOpen && user && (
          <ChatBox 
            user={user}
            otherId={chatState.otherId}
            otherName={chatState.otherName}
            messages={messages}
            onClose={() => setChatState({ ...chatState, isOpen: false })}
            onSendMessage={sendMessage}
          />
        )}
      </AnimatePresence>
      
      <Footer lang={lang} />
    </div>
  );
}
