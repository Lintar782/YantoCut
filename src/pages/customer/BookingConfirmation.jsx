import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, MessageSquare, Calendar, User, Scissors, Clock, ArrowRight, Home } from 'lucide-react';
import { db } from '../../lib/db';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract booking from router state passed during wizard navigate
  const booking = location.state?.booking;

  // Local state fallbacks for testing if accessed directly
  const dummyBooking = {
    booking_code: 'YTC-99X',
    customer_name: 'Doni Pratama',
    total_price: 75000,
    booking_date: '2026-05-19',
    start_time: '14:00:00',
    notes: 'Potongan klasik klimis.'
  };

  const activeBooking = booking || dummyBooking;

  useEffect(() => {
    // Cinematic dark theme body hook
    document.body.classList.add('dark-theme-active');
    return () => {
      document.body.classList.remove('dark-theme-active');
    };
  }, []);

  // WhatsApp text template generator
  const getWhatsAppLink = () => {
    const phone = "628123456789"; // YantoCut desk phone
    const text = encodeURIComponent(
      `Halo YantoCut! Saya telah membuat booking online di YantoCut Barbershop.\n\n` +
      `*Rincian Booking:*\n` +
      `• *Kode Booking:* ${activeBooking.booking_code}\n` +
      `• *Nama Pelanggan:* ${activeBooking.customer_name}\n` +
      `• *Tanggal Cukur:* ${activeBooking.booking_date}\n` +
      `• *Waktu Mulai:* ${activeBooking.start_time.substring(0, 5)} WIB\n` +
      `• *Total Tagihan:* Rp ${Number(activeBooking.total_price).toLocaleString('id-ID')}\n\n` +
      `Mohon bantuannya untuk mengonfirmasi pesanan saya. Terima kasih!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans bg-dark-bg pb-24 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background radial highlight */}
      <div className="absolute top-[30%] left-[50%] w-[35rem] h-[35rem] rounded-full bg-gold-500/5 blur-[130px] transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-md w-full px-4 relative z-10 animate-fade-in-up">
        {/* Success Icon Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gold-500/10 border-2 border-gold-500 flex items-center justify-center mx-auto text-gold-500 mb-4 shadow-lg shadow-gold-500/15 animate-bounce">
            <CheckCircle size={44} className="stroke-[1.5px]" />
          </div>
          <h1 className="text-3xl font-black text-white">Booking Berhasil!</h1>
          <p className="text-xs text-gray-400 mt-2">
            Reservasi Anda telah terdaftar di database YantoCut.
          </p>
        </div>

        {/* Visual Ticket Receipt */}
        <div className="border border-dark-border bg-dark-surface rounded-2xl overflow-hidden shadow-2xl relative mb-6">
          {/* Ticket Header */}
          <div className="bg-gold-500 p-5 text-black flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Kode Booking</span>
              <h2 className="text-2xl font-black tracking-widest mt-0.5">{activeBooking.booking_code}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Status</span>
              <span className="block text-xs uppercase font-extrabold bg-black text-gold-500 px-2 py-0.5 rounded mt-1 border border-gold-500/10">
                PENDING
              </span>
            </div>
          </div>

          {/* Ticket Body details */}
          <div className="p-5 flex flex-col gap-4 text-xs border-b border-dashed border-dark-border">
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Nama Pelanggan:</span>
              <span className="font-semibold text-white text-sm">{activeBooking.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Tanggal:</span>
              <span className="font-semibold text-white text-sm">{activeBooking.booking_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Waktu Mulai:</span>
              <span className="font-semibold text-gold-500 text-sm">{activeBooking.start_time.substring(0, 5)} WIB</span>
            </div>
            {activeBooking.notes && (
              <div className="pt-2 border-t border-dark-border/40">
                <span className="text-gray-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Catatan Anda:</span>
                <p className="text-gray-300 italic text-[11px] leading-relaxed">
                  "{activeBooking.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Ticket Footer Pricing */}
          <div className="p-5 bg-dark-bg/40 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Pembayaran:</span>
            <span className="text-lg font-black text-white">
              Rp {Number(activeBooking.total_price).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Ticket jagged edge visual divider handles */}
          <div className="absolute left-[-10px] bottom-[65px] w-5 h-5 rounded-full bg-dark-bg border border-dark-border z-20"></div>
          <div className="absolute right-[-10px] bottom-[65px] w-5 h-5 rounded-full bg-dark-bg border border-dark-border z-20"></div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          <a 
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/10 transition-all hover:scale-105 active:scale-95 text-center"
          >
            <MessageSquare className="fill-white stroke-none" size={18} />
            Kirim Detail ke WhatsApp Kasir
          </a>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => navigate('/booking/status', { state: { code: activeBooking.booking_code } })}
              className="border border-dark-border bg-dark-surface hover:border-gray-500 p-3.5 rounded-xl font-semibold text-xs text-center transition-all cursor-pointer text-gray-300"
            >
              Cek Status Realtime
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-dark-border bg-dark-surface hover:border-gray-500 p-3.5 rounded-xl font-semibold text-xs text-center transition-all cursor-pointer text-gray-300 flex items-center justify-center gap-1.5"
            >
              <Home size={13} /> Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
