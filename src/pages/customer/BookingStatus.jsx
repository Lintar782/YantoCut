import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, User, Scissors, Clock, ArrowRight, MessageSquare, 
  HelpCircle, ChevronRight, CheckCircle, AlertCircle, RefreshCw, XCircle 
} from 'lucide-react';
import { db } from '../../lib/db';

export default function BookingStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingCode, setBookingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Service & Barber data cache for details display
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    // Cinematic dark theme body hook
    document.body.classList.add('dark-theme-active');

    // Pre-cache services & barbers for rendering lookup details
    const loadCache = async () => {
      try {
        const sList = await db.getServices();
        const bList = await db.getStaff();
        setServices(sList);
        setBarbers(bList);
      } catch (err) {
        console.error("Cache load error:", err);
      }
    };
    loadCache();

    // Auto-search if booking code passed in navigation state
    if (location.state?.code) {
      setBookingCode(location.state.code);
      handleSearch(location.state.code);
    }

    return () => {
      document.body.classList.remove('dark-theme-active');
    };
  }, [location.state]);

  const handleSearch = async (overrideCode = '') => {
    const codeToSearch = (overrideCode || bookingCode).trim().toUpperCase();
    if (!codeToSearch) {
      setErrorMsg("Silakan masukkan kode booking terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setBooking(null);
    setStatusLogs([]);
    setSearched(true);

    try {
      const result = await db.getBookingByCode(codeToSearch);
      if (!result) {
        setErrorMsg(`Booking dengan kode "${codeToSearch}" tidak ditemukan. Pastikan kode yang dimasukkan benar.`);
      } else {
        setBooking(result);
        // Fetch logs
        const logs = await db.getStatusLogs(result.id);
        setStatusLogs(logs);
      }
    } catch (err) {
      console.error("Error searching booking status:", err);
      setErrorMsg("Terjadi kesalahan sistem saat mencari status. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  // Helper getters
  const getServiceName = (id) => services.find(s => s.id === id)?.name || "Layanan Cukur";
  const getBarberName = (id) => barbers.find(b => b.id === id)?.name || "Barber Expert";

  // Status Badge Formatter
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Menunggu Persetujuan
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Diterima (Jadwal Terkunci)
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={12} /> Selesai Cukur
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <XCircle size={12} /> Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans bg-dark-bg pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

      {/* Mini Nav */}
      <header className="border-b border-dark-border py-4 px-4 bg-dark-surface/60 sticky top-0 backdrop-blur-md z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center text-black font-extrabold text-md">
              Y
            </div>
            <span className="font-extrabold text-lg text-white">Yanto<span className="text-gold-500">Cut</span></span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Kembali ke Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 mt-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Cek Status Reservasi</h1>
          <p className="text-xs text-gray-400 mt-2">
            Masukkan 6-karakter Kode Booking Anda untuk melihat jadwal dan status persetujuan.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-dark-surface border border-dark-border p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Masukkan Kode Booking (contoh: YTC-82B)"
              value={bookingCode}
              onChange={e => setBookingCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-dark-bg border border-dark-border pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-600 text-sm font-semibold uppercase tracking-widest focus:outline-none focus:border-gold-500 transition-all"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 text-black px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10 transition-all cursor-pointer whitespace-nowrap"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Cek Status'}
          </button>
        </div>

        {/* Lookup Results */}
        {searched && (
          <div className="animate-fade-in-up">
            {errorMsg ? (
              <div className="border border-red-500/20 bg-red-500/5 p-5 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <span className="text-xs text-red-200 leading-relaxed">{errorMsg}</span>
              </div>
            ) : booking ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left side: details card */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  <div className="bg-dark-surface border border-dark-border p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between border-b border-dark-border/55 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Kode Booking</span>
                        <h2 className="text-xl font-black text-white">{booking.booking_code}</h2>
                      </div>
                      <div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Scissors className="text-gold-500 shrink-0 mt-0.5" size={15} />
                        <div>
                          <span className="block text-gray-500 uppercase font-bold tracking-wider text-[9px]">Layanan:</span>
                          <span className="text-sm font-semibold text-white mt-0.5 block">{getServiceName(booking.service_id)}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="text-gold-500 shrink-0 mt-0.5" size={15} />
                        <div>
                          <span className="block text-gray-500 uppercase font-bold tracking-wider text-[9px]">Barber:</span>
                          <span className="text-sm font-semibold text-white mt-0.5 block">{getBarberName(booking.staff_id)}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="text-gold-500 shrink-0 mt-0.5" size={15} />
                        <div>
                          <span className="block text-gray-500 uppercase font-bold tracking-wider text-[9px]">Tanggal Cukur:</span>
                          <span className="text-sm font-semibold text-white mt-0.5 block">{booking.booking_date}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="text-gold-500 shrink-0 mt-0.5" size={15} />
                        <div>
                          <span className="block text-gray-500 uppercase font-bold tracking-wider text-[9px]">Pukul / Jam:</span>
                          <span className="text-sm font-semibold text-gold-500 mt-0.5 block">{booking.start_time.substring(0, 5)} WIB</span>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="bg-dark-bg/50 border border-dark-border p-3 rounded-lg mt-2">
                          <span className="block text-gray-500 uppercase font-bold tracking-wider text-[8px] mb-1">Catatan Tambahan:</span>
                          <p className="text-gray-300 italic text-[11px] leading-relaxed">
                            "{booking.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Contact WA Desk Help */}
                  <div className="border border-dark-border bg-dark-surface/40 p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-gold-500 shrink-0" size={20} />
                      <div>
                        <h4 className="font-bold text-white text-xs">Butuh perubahan jadwal?</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Hubungi customer service kami via WhatsApp.</p>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/628123456789?text=Halo%20YantoCut%2C%20saya%20ingin%20mengubah%20jadwal%20booking%20dengan%20kode%20${booking.booking_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2.5 rounded-full shadow-md transition-all shrink-0 flex items-center justify-center"
                    >
                      <MessageSquare className="fill-white stroke-none" size={16} />
                    </a>
                  </div>
                </div>

                {/* Right side: status history timeline */}
                <div className="md:col-span-5">
                  <div className="bg-dark-surface border border-dark-border p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-white text-sm border-b border-dark-border pb-3 mb-4">Riwayat Status</h3>
                    
                    <div className="flex flex-col gap-6 relative pl-4 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-dark-border">
                      {statusLogs.map((log, index) => (
                        <div key={log.id} className="relative flex gap-3 text-xs items-start">
                          <div className={`absolute left-[-16px] top-1.5 w-3 h-3 rounded-full border-2 ${
                            index === 0 
                              ? 'bg-gold-500 border-gold-500 animate-ping-once' 
                              : 'bg-dark-surface border-dark-border'
                          }`}></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-xs uppercase">
                                {log.new_status === 'pending' ? 'Dibuat' : log.new_status === 'confirmed' ? 'Diterima' : log.new_status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{log.note}</p>
                            <span className="block text-[8px] text-gray-600 mt-0.5">
                              {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
