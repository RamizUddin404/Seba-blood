/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, 
  Users, 
  Search, 
  HandHelping, 
  ArrowRight, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter,
  ChevronRight,
  HeartPulse,
  UserPlus,
  AlertCircle,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  Camera,
  Edit3,
  Save
} from 'lucide-react';

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
}

// --- Data ---
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Brahmanbaria', 'Noakhali', 'Feni', 'Chandpur', 'Lakshmipur'
];

// --- Components ---

const Navbar = ({ user, onLogout, onOpenAuth }: { user: UserData | null, onLogout: () => void, onOpenAuth: (mode: 'login' | 'register') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Find Donor', href: '#find' },
    { name: 'Request Blood', href: '#request' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
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
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-semibold hover:text-primary transition-colors text-slate-700"
            >
              {link.name}
            </a>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4">
              <a href="#profile" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary">
                {user.photo ? (
                  <img src={user.photo} className="w-8 h-8 rounded-full object-cover border border-primary/20" alt="Profile" />
                ) : (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                )}
                <span>{user.name.split(' ')[0]}</span>
              </a>
              <button onClick={onLogout} className="text-slate-400 hover:text-primary transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => onOpenAuth('login')} className="text-sm font-bold text-slate-700 hover:text-primary">Login</button>
              <button onClick={() => onOpenAuth('register')} className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                Join Us
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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
              <a 
                key={link.name} 
                href={link.href} 
                className="text-xl font-bold text-slate-800"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {user ? (
              <>
                <a href="#profile" className="text-xl font-bold text-primary" onClick={() => setIsOpen(false)}>My Profile</a>
                <button onClick={onLogout} className="text-xl font-bold text-slate-500 text-left">Logout</button>
              </>
            ) : (
              <button onClick={() => { onOpenAuth('login'); setIsOpen(false); }} className="bg-primary text-white px-6 py-4 rounded-2xl text-center font-bold text-lg">
                Join Now
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64 })
        });
        const result = await res.json();
        if (res.ok) onUpdate(result.user);
      } catch (err) {
        console.error(err);
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
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden"
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
      </div>
    </section>
  );
};

const Hero = () => {
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
            <HeartPulse size={16} /> Emergency Blood Service Bangladesh
          </div>
          <h1 className="text-5xl md:text-7xl font-bold serif leading-tight mb-8 text-slate-900">
            Your One Drop <br />
            <span className="text-primary italic">Saves Three</span> <br />
            Lives Today.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
            Connect with voluntary blood donors across Bangladesh. Fast, free, and reliable service for those in urgent need.
          </p>
          <div className="flex flex-wrap gap-5">
            <a href="#find" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-secondary transition-all shadow-xl shadow-primary/20">
              Find a Donor <Search size={20} />
            </a>
            <a href="#register" className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-bold hover:border-primary/20 hover:bg-primary/5 transition-all">
              Become a Donor
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

const SearchSection = () => {
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
            <h2 className="text-3xl font-bold serif text-slate-900 mb-4">Quick Donor Search</h2>
            <p className="text-slate-500">Select blood group and location to find available donors near you.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Blood Group</label>
              <select 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-6 py-4 bg-accent rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-semibold appearance-none"
              >
                <option value="">Select Group</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">District</label>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-6 py-4 bg-accent rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-semibold appearance-none"
              >
                <option value="">Select District</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Searching...' : <><Search size={20} /> Search Donors</>}
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
                {donors.length > 0 ? `Found ${donors.length} Donors` : 'No Donors Found'}
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
                        Last Donation: <span className="text-slate-600 font-bold">{donor.last_donation || 'N/A'}</span>
                      </div>
                      <a 
                        href={`tel:${donor.phone}`}
                        className="bg-white text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Phone size={18} />
                      </a>
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

const Features = () => {
  const features = [
    {
      title: 'Find Donors',
      desc: 'Instant access to thousands of voluntary donors across Bangladesh.',
      icon: <Search className="text-primary" size={32} />,
      color: 'bg-red-50'
    },
    {
      title: 'Blood Request',
      desc: 'Post an emergency request and get notified when a donor is found.',
      icon: <AlertCircle className="text-orange-500" size={32} />,
      color: 'bg-orange-50'
    },
    {
      title: 'Donor Network',
      desc: 'Join our growing community of lifesavers and manage your donations.',
      icon: <UserPlus className="text-blue-500" size={32} />,
      color: 'bg-blue-50'
    },
    {
      title: '24/7 Support',
      desc: 'Our dedicated team is always ready to assist you in emergencies.',
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

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] overflow-hidden grid lg:grid-cols-2 shadow-2xl">
          <div className="p-16 text-white flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold serif mb-8">Need Urgent <br /><span className="text-primary">Blood?</span></h2>
            <p className="text-slate-400 mb-12 text-lg leading-relaxed">
              Our emergency helpline is available 24/7. Call us immediately if you have a medical emergency and need blood donors.
            </p>
            
            <div className="space-y-8">
              <a href="tel:+880123456789" className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone size={28} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Emergency Hotline</div>
                  <div className="text-2xl font-bold">+880 1234 567890</div>
                </div>
              </a>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center">
                  <Mail size={28} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Email Support</div>
                  <div className="text-2xl font-bold">help@sebablood.org</div>
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
                <h3 className="text-2xl font-bold text-white mb-6">Request Blood</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Patient Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/40" />
                  <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white appearance-none">
                    <option className="text-slate-900">Blood Group</option>
                    {BLOOD_GROUPS.map(g => <option key={g} className="text-slate-900">{g}</option>)}
                  </select>
                  <input type="text" placeholder="Hospital Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/40" />
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary transition-all">
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
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
              Connecting voluntary blood donors with those in need across Bangladesh. Our mission is to ensure no one suffers due to the unavailability of blood.
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
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-8">Quick Links</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Find Donor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Register as Donor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blood Requests</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-8">Blood Groups</h4>
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
          <p>© 2026 Seba Blood Bank Bangladesh. All rights reserved.</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

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
      />
      
      {user ? (
        <ProfileSection user={user} onUpdate={setUser} />
      ) : (
        <>
          <Hero />
          <SearchSection />
          <Features />
          <RegisterForm onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} />
          <Contact />
        </>
      )}

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal({ ...authModal, mode })}
        onAuthSuccess={setUser}
      />
      
      <Footer />
    </div>
  );
}
