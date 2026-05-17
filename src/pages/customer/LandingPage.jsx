import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Clock, MapPin, Phone, Calendar, ArrowRight, MessageCircle, Star, Award, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/db';

export default function LandingPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    // Add cinematic dark theme body hook
    document.body.classList.add('dark-theme-active');
    
    // Fetch data
    const fetchData = async () => {
      try {
        const activeServices = await db.getServices(true);
        const activeBarbers = await db.getStaff(true);
        const biz = await db.getBusiness();
        setServices(activeServices.slice(0, 3)); // show top 3 on landing page
        setBarbers(activeBarbers);
        setBusiness(biz);
      } catch (err) {
        console.error("Error loading landing data:", err);
      }
    };
    fetchData();

    return () => {
      document.body.classList.remove('dark-theme-active');
    };
  }, []);

  return (
    <div className="min-h-screen text-gray-100 font-sans pb-16 relative overflow-hidden bg-dark-bg">
      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-gold-500/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-500/5 blur-[120px] animate-pulse-slow"></div>

      {/* Header / Navbar */}
      <header className="border-b border-dark-border sticky top-0 bg-dark-bg/85 backdrop-blur-md z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-gold-500/20">
              Y
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-gold-400 bg-clip-text text-transparent">
                Yanto<span className="text-gold-500">Cut</span>
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-gold-500 font-semibold leading-none">
                Premium Barbershop
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#services" className="hover:text-gold-500 transition-colors">Layanan</a>
            <a href="#barbers" className="hover:text-gold-500 transition-colors">Barber Expert</a>
            <a href="#info" className="hover:text-gold-500 transition-colors">Lokasi & Jam</a>
            <button 
              onClick={() => navigate('/booking/status')} 
              className="text-xs uppercase tracking-wider text-gold-500 border border-gold-500/30 hover:border-gold-500 px-3 py-1.5 rounded-full transition-all"
            >
              Cek Status Booking
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/booking')} 
              className="bg-gold-500 hover:bg-gold-600 text-black font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Book Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-24 text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-7 flex flex-col justify-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-semibold uppercase tracking-wider self-center md:self-start mb-6">
            <Award size={14} /> Barbershop Pilihan Utama di Jakarta
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white mb-6">
            Gaya Klasik Maupun Modern <br/>
            Dikerjakan Oleh <span className="text-gold-500">Expert.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-8 max-w-xl leading-relaxed">
            {business?.description || "Kami menghadirkan pengalaman bercukur premium bintang lima dengan mengombinasikan keahlian barber profesional, handuk hangat relaksasi, dan teknik cukur legendaris."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button 
              onClick={() => navigate('/booking')} 
              className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-extrabold text-md px-8 py-4 rounded-full flex items-center justify-center gap-3 shadow-xl shadow-gold-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Mulai Booking Sekarang
              <Calendar size={18} />
            </button>
            <a 
              href="#services" 
              className="w-full sm:w-auto text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all"
            >
              Lihat Menu Layanan
            </a>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-12 border-t border-dark-border mt-12 max-w-lg">
            <div>
              <span className="block text-2xl font-bold text-white">5 Bintang</span>
              <span className="text-xs text-gray-500">Rating Pelanggan</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">10+ Tahun</span>
              <span className="text-xs text-gray-500">Barber Pengalaman</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-gray-500">Kepuasan Terjamin</span>
            </div>
          </div>
        </div>

        {/* Hero Image Component */}
        <div className="md:col-span-5 relative flex justify-center animate-fade-in-up">
          <div className="w-[280px] h-[360px] md:w-[320px] md:h-[440px] rounded-2xl overflow-hidden shadow-2xl border border-dark-border relative group z-10">
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80" 
              alt="Premium Barbershop Interior"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-effect border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-gold-500 font-semibold">Desain Interior</span>
              <h3 className="text-white font-bold text-sm mt-1">Klasik & Maskulin Modern</h3>
            </div>
          </div>
          {/* Accent decoration boxes */}
          <div className="absolute top-[20px] right-[20px] w-full h-full border-2 border-gold-500/25 rounded-2xl transform translate-x-4 translate-y-4 -z-0"></div>
        </div>
      </section>

      {/* Services Showcase */}
      <section id="services" className="max-w-6xl mx-auto px-4 py-20 border-t border-dark-border relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-500 font-bold block mb-3">MENU LAYANAN</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Layanan Terbaik Kami</h2>
          <p className="text-gray-400 mt-4 font-light">
            Silakan pilih layanan cukur rambut, shaving jenggot, maupun perawatan kulit kepala premium terbaik kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden group hover:border-gold-500/30 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={service.image_url} 
                  alt={service.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-4 right-4 bg-black/75 px-3 py-1 rounded-full text-xs font-semibold text-gold-500 flex items-center gap-1.5 border border-gold-500/20">
                  <Clock size={12} /> {service.duration_minutes} Menit
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gold-500 mb-2">{service.category}</span>
                <h3 className="text-white font-bold text-xl group-hover:text-gold-500 transition-colors">{service.name}</h3>
                <p className="text-gray-400 text-sm font-light mt-3 leading-relaxed flex-grow">
                  {service.description}
                </p>
                <div className="flex items-center justify-between border-t border-dark-border/55 pt-5 mt-6">
                  <span className="text-lg font-black text-white">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => navigate('/booking')} 
                    className="text-xs uppercase tracking-wider font-extrabold text-gold-500 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                  >
                    Booking <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/booking')} 
            className="text-sm font-semibold text-gold-500 hover:text-gold-400 border-b border-gold-500 hover:border-gold-400 pb-1.5 transition-all cursor-pointer"
          >
            Lihat Semua Layanan Menu & Paket Lengkap
          </button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-dark-surface/50 border-y border-dark-border py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 shrink-0">
                <Scissors size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-2">Barber Berpengalaman</h4>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Semua barber kami adalah expert bersertifikat dengan jam terbang tinggi, melayani potongan detail tingkat milimeter.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-2">Higienis & Steril</h4>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Peralatan cukur disterilkan berkala sebelum penggunaan. Kami menjamin kebersihan handuk dan silet sekali pakai.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-2">Sistem Booking Pintar</h4>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Bebas antre lama! Pilih jam kerja, pilih barber favorit, dan waktu Anda akan dikunci otomatis tanpa double booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barbers Showcase */}
      <section id="barbers" className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-500 font-bold block mb-3">TEAM EXPERT</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Barber Pilihan Anda</h2>
          <p className="text-gray-400 mt-4 font-light">
            Kenali barber ahli kami yang siap membentuk potongan rambut maskulin maksimal Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div 
              key={barber.id} 
              className="bg-dark-surface border border-dark-border p-6 rounded-xl hover:border-gold-500/25 transition-all text-center flex flex-col items-center group"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-dark-border group-hover:border-gold-500 transition-colors relative mb-6">
                <img 
                  src={barber.photo_url} 
                  alt={barber.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
              </div>
              <h3 className="text-white font-bold text-xl">{barber.name}</h3>
              <span className="text-xs text-gold-500 font-semibold bg-gold-500/10 border border-gold-500/10 px-3 py-1 rounded-full mt-2">
                {barber.specialty}
              </span>
              <p className="text-gray-400 text-xs font-light mt-4 leading-relaxed italic">
                "{barber.bio || 'Barber handal siap memberikan pelayanan potongan premium terbaik.'}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Branch Info */}
      <section id="info" className="max-w-6xl mx-auto px-4 py-20 border-t border-dark-border relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-500 font-bold block mb-3">LOKASI & JAM OPERASIONAL</span>
            <h2 className="text-3xl font-extrabold text-white mb-6">Kunjungi YantoCut</h2>
            
            <div className="flex flex-col gap-6 text-gray-300">
              <div className="flex items-start gap-4">
                <MapPin className="text-gold-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Alamat Barbershop</h4>
                  <p className="text-sm text-gray-400 mt-1">{business?.address || "Jl. Cempaka Putih Raya No. 12, Jakarta Pusat"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="text-gold-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Jam Buka - Operasional</h4>
                  <p className="text-sm text-gray-400 mt-1">Setiap Hari: 09:00 - 21:00 WIB</p>
                  <p className="text-xs text-gold-500 mt-1">*Kecuali Hari Libur Nasional</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-gold-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-white">Kontak Customer Service</h4>
                  <p className="text-sm text-gray-400 mt-1">{business?.phone || "+62 812-3456-789"}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => navigate('/booking')} 
                className="bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-gold-500/10 transition-all cursor-pointer"
              >
                Booking Jadwal Sekarang
              </button>
            </div>
          </div>

          <div className="h-64 md:h-80 rounded-2xl overflow-hidden border border-dark-border relative shadow-2xl">
            {/* Standard Leaflet / Map mockup with gorgeous styling */}
            <div className="absolute inset-0 bg-dark-surface flex flex-col items-center justify-center p-6 text-center">
              <MapPin size={48} className="text-gold-500 mb-4 animate-bounce" />
              <h4 className="font-bold text-white">Cempaka Putih, Jakarta Pusat</h4>
              <p className="text-xs text-gray-400 mt-2 max-w-xs">
                Lokasi strategis di sebelah Circle-K Cempaka Putih. Parkir luas gratis bagi pelanggan.
              </p>
              <a 
                href={`https://wa.me/${business?.whatsapp_number || '628123456789'}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-gold-500 hover:text-gold-400"
              >
                Buka di Google Maps <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border mt-20 pt-12 pb-6 relative z-10 text-gray-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gold-500 flex items-center justify-center text-black font-extrabold text-xs">
              Y
            </div>
            <span className="font-bold text-sm text-gray-300">
              Yanto<span className="text-gold-500">Cut</span>
            </span>
          </div>
          
          <p className="text-center md:text-right">
            © 2026 BooklyPro — YantoCut Barbershop. All Rights Reserved. <br/>
            Designed with Premium HSL Glassmorphism by Antigravity.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${business?.whatsapp_number || '628123456789'}?text=Halo%20YantoCut%2C%20saya%20tertarik%20untuk%20booking%20cukur%20rambut.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-3 active:scale-95 group"
        aria-label="Chat WhatsApp YantoCut"
      >
        <MessageCircle size={26} className="fill-white stroke-none" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-semibold text-sm transition-all duration-300 ease-out whitespace-nowrap">
          Tanya Barber
        </span>
      </a>
    </div>
  );
}
