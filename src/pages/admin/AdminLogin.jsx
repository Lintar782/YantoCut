import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, KeyRound, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Add dark layout theme active on login page for cinematic feel
    document.body.classList.add('dark-theme-active');
    
    // Check if already logged in
    const session = localStorage.getItem('kp_session');
    if (session) {
      navigate('/admin/dashboard');
    }

    return () => {
      document.body.classList.remove('dark-theme-active');
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Mohon masukkan email dan password.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. If Supabase is active, authenticate via Supabase Auth
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Save session indicator
        localStorage.setItem('kp_session', JSON.stringify({
          user: data.user,
          role: 'admin',
          email: data.user.email
        }));
        
        navigate('/admin/dashboard');
      } else {
        // 2. Offline Mock Auth Fallback
        // Accept admin@yantocut.com / admin123
        const mockEmail = "admin@yantocut.com";
        const mockPass = "admin123";

        if (email.trim().toLowerCase() === mockEmail && password === mockPass) {
          // Store dummy session
          localStorage.setItem('kp_session', JSON.stringify({
            role: 'admin',
            email: mockEmail,
            full_name: 'Yanto (Owner Admin)'
          }));
          // Artificial network delay for realistic visual feel
          await new Promise(r => setTimeout(r, 800));
          navigate('/admin/dashboard');
        } else {
          throw new Error("Kredensial salah. Silakan coba kembali (Gunakan: admin@yantocut.com / admin123)");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Gagal login. Kredensial tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-effect p-8 rounded-2xl border border-dark-border shadow-2xl relative z-10 animate-fade-in-up">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gold-500 flex items-center justify-center text-black font-black text-3xl mx-auto shadow-xl shadow-gold-500/10 mb-4">
            Y
          </div>
          <h1 className="text-2xl font-black text-white">Yanto<span className="text-gold-500">Cut</span> Admin</h1>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1.5 font-bold">
            Booking Control Center
          </p>
        </div>

        {errorMsg && (
          <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-start gap-3 mb-6">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
            <span className="text-xs text-red-200 leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Email Administrasi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="email"
                placeholder="admin@yantocut.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border pl-11 pr-4 py-3 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-gold-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Password PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border pl-11 pr-4 py-3 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-gold-500 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-black p-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/15 transition-all cursor-pointer mt-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Autentikasi Masuk'}
          </button>
        </form>

        {/* Guest credentials hint for easy testing */}
        <div className="mt-8 pt-6 border-t border-dark-border/60 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded-full border border-gold-500/15">
            <KeyRound size={12} /> Demo: admin@yantocut.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
