import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Scissors, User, Eye, Sparkles, FileText, CheckCircle 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedDayBookings, setSelectedDayBookings] = useState([]);

  // Selected details modal (same high-fidelity detail modal as Bookings Manager)
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [modalNotes, setModalNotes] = useState('');

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const bList = await db.getBookings();
      const sList = await db.getServices();
      const staffList = await db.getStaff();
      
      setBookings(bList);
      setServices(sList);
      setBarbers(staffList);

      // Default select today
      const todayStr = new Date().toISOString().split('T')[0];
      setSelectedDateStr(todayStr);
      setSelectedDayBookings(bList.filter(b => b.booking_date === todayStr));
    } catch (err) {
      console.error("Error loading calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const handleOpenDetails = async (booking) => {
    setSelectedBooking(booking);
    setModalNotes('');
    try {
      const logs = await db.getStatusLogs(booking.id);
      setSelectedLogs(logs);
    } catch (err) {
      console.error("Error loading logs:", err);
    }
  };

  const handleStatusTransition = async (status) => {
    if (!selectedBooking) return;
    const notes = modalNotes.trim() || `Status diperbarui oleh Admin via Kalender.`;
    
    if (!window.confirm(`Ubah status booking ${selectedBooking.booking_code} menjadi "${status}"?`)) return;

    try {
      const updated = await db.updateBookingStatus(selectedBooking.id, status, notes);
      setSelectedBooking(updated);
      setModalNotes('');
      
      const logs = await db.getStatusLogs(selectedBooking.id);
      setSelectedLogs(logs);
      
      // Reload calendar data
      const bList = await db.getBookings();
      setBookings(bList);
      
      // Refresh current day view
      setSelectedDayBookings(bList.filter(b => b.booking_date === selectedDateStr));
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name || "Layanan Cukur";
  const getBarberName = (id) => barbers.find(b => b.id === id)?.name || "Barber Expert";

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar Math: Generate grid of days for the current Month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // day of week of 1st day (0 = Sun, 1 = Mon...)
    const numDays = new Date(year, month + 1, 0).getDate(); // total days in month
    
    const days = [];
    
    // Pad initial Sunday cells if month does not start on Sunday
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ isPadding: true, dayNum: null, dateStr: '' });
    }
    
    // Add real days
    for (let d = 1; d <= numDays; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.booking_date === dStr && b.status !== 'cancelled');
      days.push({
        isPadding: false,
        dayNum: d,
        dateStr: dStr,
        bookingsCount: dayBookings.length,
        bookings: dayBookings
      });
    }

    return days;
  };

  const handleSelectDay = (day) => {
    if (day.isPadding) return;
    setSelectedDateStr(day.dateStr);
    setSelectedDayBookings(bookings.filter(b => b.booking_date === day.dateStr));
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 border border-yellow-200 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>;
      case 'confirmed':
        return <span className="bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Confirmed</span>;
      case 'completed':
        return <span className="bg-green-100 border border-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 border border-red-200 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Kalender Reservasi</h1>
            <p className="text-xs text-gray-500 mt-1.5">Tampilan bulanan visual jadwal cukur barbershop Anda secara interaktif.</p>
          </div>
        </div>

        {/* Dual Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column Left: Visual Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-gold-600 shrink-0" size={20} />
                <h2 className="text-lg font-black text-gray-900 leading-none">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays Labels Header */}
            <div className="grid grid-cols-7 text-center font-bold text-gray-400 text-[10px] tracking-wider uppercase mb-3">
              <div>Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            {/* Calendar cells grid */}
            <div className="grid grid-cols-7 gap-2">
              {loading ? (
                <div className="col-span-7 py-24 text-center text-gray-400">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
                  <span className="text-xs">Memuat sel kalender bulanan...</span>
                </div>
              ) : (
                getDaysInMonth().map((day, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectDay(day)}
                    className={`h-20 border rounded-xl p-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                      day.isPadding 
                        ? 'border-transparent bg-transparent cursor-default' 
                        : selectedDateStr === day.dateStr
                          ? 'border-gold-500 bg-gold-500/5 shadow shadow-gold-500/5'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/20'
                    }`}
                  >
                    {!day.isPadding && (
                      <>
                        <span className={`text-xs font-bold ${
                          selectedDateStr === day.dateStr ? 'text-gold-600' : 'text-gray-400'
                        }`}>
                          {day.dayNum}
                        </span>
                        
                        {day.bookingsCount > 0 && (
                          <span className="bg-gold-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full self-start shadow-sm mt-auto max-w-full truncate">
                            {day.bookingsCount} Cukur
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column Right: Selected Day Schedule Details (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
            <div className="border-b border-gray-150 pb-4 mb-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Daftar Jadwal Tanggal</span>
              <h3 className="text-md font-extrabold text-gray-900 mt-1">{selectedDateStr || 'Pilih Tanggal'}</h3>
            </div>

            <div className="flex-grow flex flex-col gap-3 overflow-y-auto max-h-[450px]">
              {selectedDayBookings.length === 0 ? (
                <div className="text-center text-gray-400 my-auto py-12 flex flex-col items-center">
                  <Sparkles size={24} className="text-gold-500 mb-2" />
                  <h4 className="font-bold text-xs text-gray-800">Tidak Ada Antrean</h4>
                  <p className="text-[10px] text-gray-400 max-w-xs mt-1 leading-relaxed">
                    Tidak ada jadwal cukur rambut atau reservasi aktif di tanggal terpilih.
                  </p>
                </div>
              ) : (
                selectedDayBookings
                  .sort((a, b) => a.start_time.localeCompare(b.start_time)) // sort by start time
                  .map(b => (
                    <div
                      key={b.id}
                      onClick={() => handleOpenDetails(b)}
                      className="border border-gray-200 hover:border-gray-300 p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-50 flex flex-col gap-2 relative bg-gray-50/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-gray-900 tracking-wider">{b.booking_code}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <div className="text-xs font-semibold text-gray-800">
                        <span className="block text-gray-900 font-bold">{b.customer_name}</span>
                        <span className="text-[10px] text-gray-500 font-normal mt-0.5 block">{getServiceName(b.service_id)} • {getBarberName(b.staff_id)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                        <span className="text-[10px] font-bold text-gold-600 flex items-center gap-1">
                          <Clock size={11} /> {b.start_time.substring(0, 5)} WIB
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          Rp {Number(b.total_price).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

        {/* MODAL DRAWER */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-gray-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Detail Kalender Reservasi</span>
                  <h2 className="text-2xl font-black tracking-widest mt-0.5 flex items-center gap-3">
                    {selectedBooking.booking_code}
                    {getStatusBadge(selectedBooking.status)}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Column Left: Booking details */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 mb-3 flex items-center gap-1.5">
                      <FileText size={14} className="text-gold-600" /> Rincian Cukuran
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-medium">Layanan Cukur:</span>
                        <span className="block font-bold text-gray-800 text-sm mt-0.5">{getServiceName(selectedBooking.service_id)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Barber Expert:</span>
                        <span className="block font-bold text-gray-800 text-sm mt-0.5">{getBarberName(selectedBooking.staff_id)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Tanggal Booking:</span>
                        <span className="block font-bold text-gray-800 text-sm mt-0.5">{selectedBooking.booking_date}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Pukul / Jam:</span>
                        <span className="block font-bold text-gold-600 text-sm mt-0.5">{selectedBooking.start_time.substring(0, 5)} WIB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 mb-3 flex items-center gap-1.5">
                      <User size={14} className="text-gold-600" /> Pelanggan & Catatan
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="text-gray-400 font-medium">Nama Pelanggan:</span>
                        <span className="block font-bold text-gray-800 text-sm mt-0.5">{selectedBooking.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">WhatsApp / HP:</span>
                        <span className="block font-bold text-gray-800 text-sm mt-0.5">{selectedBooking.customer_phone}</span>
                      </div>
                    </div>
                    {selectedBooking.notes && (
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs">
                        <span className="text-gray-400 font-bold uppercase text-[9px]">Catatan Pelanggan:</span>
                        <p className="text-gray-600 italic mt-1 leading-relaxed">"{selectedBooking.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column Right: Actions & Timeline */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                    <div className="border border-gray-200 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Tindakan Admin</h4>
                      
                      <textarea
                        rows="2"
                        placeholder="Tulis alasan status diubah..."
                        value={modalNotes}
                        onChange={e => setModalNotes(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs focus:outline-none focus:border-gold-500 font-semibold resize-none mb-3"
                      ></textarea>

                      <div className="grid grid-cols-2 gap-2">
                        {selectedBooking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusTransition('confirmed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow shadow-blue-600/10 text-center"
                          >
                            Setujui Booking
                          </button>
                        )}
                        {selectedBooking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusTransition('completed')}
                            className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow shadow-green-600/10 text-center"
                          >
                            Selesaikan
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusTransition('cancelled')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer text-center"
                        >
                          Batalkan Booking
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl max-h-[220px] overflow-y-auto">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Audit Logs</h4>
                    <div className="flex flex-col gap-4 relative pl-3 before:content-[''] before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                      {selectedLogs.map(log => (
                        <div key={log.id} className="relative text-[11px] leading-relaxed">
                          <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border border-gray-300 bg-white"></div>
                          <div>
                            <span className="font-bold text-gray-900 uppercase text-[10px]">
                              {log.new_status === 'pending' ? 'Dibuat' : log.new_status === 'confirmed' ? 'Diterima' : log.new_status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                            </span>
                            <p className="text-gray-500 mt-0.5 font-medium">{log.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Tutup Rincian
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
