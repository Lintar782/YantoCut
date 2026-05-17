import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Scissors, User, Clock, BarChart3, Settings, 
  LogOut, Menu, X, Bell, UserCircle2, ChevronRight, Sparkles 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Standard RLS/Session check
    const sessionStr = localStorage.getItem('kp_session');
    if (!sessionStr) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(sessionStr));

    // Disable body dark-theme active to enforce dashboard light mode!
    document.body.classList.remove('dark-theme-active');
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      localStorage.removeItem('kp_session');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { label: 'Ringkasan', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Daftar Booking', path: '/admin/bookings', icon: Calendar },
    { label: 'Visual Kalender', path: '/admin/calendar', icon: Sparkles },
    { label: 'Layanan Cukur', path: '/admin/services', icon: Scissors },
    { label: 'Barber Expert', path: '/admin/staff', icon: User },
    { label: 'Jadwal & Libur', path: '/admin/schedules', icon: Clock },
    { label: 'Statistik Bisnis', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Pengaturan Toko', path: '/admin/settings', icon: Settings }
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gold-500/20 border-t-gold-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* 1. Sidebar Panel */}
      <aside 
        className={`bg-slate-900 text-slate-300 w-64 border-r border-slate-800 shrink-0 z-30 flex flex-col fixed md:sticky top-0 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center text-black font-extrabold shrink-0">
              Y
            </div>
            {(!sidebarOpen ? false : true) && (
              <div>
                <span className="font-extrabold text-sm text-white tracking-wide block">
                  Yanto<span className="text-gold-500">Cut</span> Panel
                </span>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold leading-none mt-0.5">
                  Management Suite
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile close toggle */}
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="flex-grow py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gold-500 text-black shadow-md shadow-gold-500/10' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {(!sidebarOpen ? false : true) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-all cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            {(!sidebarOpen ? false : true) && <span>Keluar Panel</span>}
          </button>
        </div>
      </aside>

      {/* Main Wrapper Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* 2. Topbar Navigation */}
        <header className="h-16 border-b border-gray-200 bg-white px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Collapse toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-500 hover:text-gray-800 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb bread */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="text-gray-800 font-bold">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="text-gray-400 hover:text-gray-700 relative p-1.5 rounded hover:bg-gray-100 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {/* Profile Avatar info */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <UserCircle2 className="text-gray-400" size={24} />
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-gray-800 leading-none">
                  {adminUser.full_name || 'Admin Yanto'}
                </span>
                <span className="block text-[9px] text-gray-400 mt-0.5 font-bold uppercase">
                  {adminUser.role === 'owner' ? 'Owner' : 'Super Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Central Page Content slot */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
