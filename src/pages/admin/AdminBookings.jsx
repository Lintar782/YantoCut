import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, 
  ChevronDown, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, 
  CreditCard, MessageSquare, Tag, FileText 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminBookings() {
  const location = useLocation();

  // Core Data Lists
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [barberFilter, setBarberFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Booking details modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [modalNotes, setModalNotes] = useState('');

  const loadBookingsData = async () => {
    setLoading(true);
    try {
      const bList = await db.getBookings();
      const sList = await db.getServices();
      const staffList = await db.getStaff();
      
      setBookings(bList);
      setServices(sList);
      setBarbers(staffList);

      // Auto-open modal if navigated from dashboard with highlightId
      if (location.state?.highlightId) {
        const target = bList.find(b => b.id === location.state.highlightId);
        if (target) {
          handleOpenDetails(target);
        }
      }
    } catch (err) {
      console.error("Error loading bookings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingsData();
  }, [location.state]);

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
    const notes = modalNotes.trim() || `Status diperbarui oleh Admin.`;
    
    if (!window.confirm(`Ubah status booking ${selectedBooking.booking_code} menjadi "${status}"?`)) return;

    try {
      const updated = await db.updateBookingStatus(selectedBooking.id, status, notes);
      
      // Update selected modal view in-place
      setSelectedBooking(updated);
      setModalNotes('');
      
      // Reload logs and core table
      const logs = await db.getStatusLogs(selectedBooking.id);
      setSelectedLogs(logs);
      await loadBookingsData();
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const handleTogglePayment = async () => {
    if (!selectedBooking) return;
    const newPaymentStatus = selectedBooking.payment_status === 'paid' ? 'unpaid' : 'paid';
    
    try {
      const updated = await db.updateBookingPayment(selectedBooking.id, newPaymentStatus);
      setSelectedBooking(updated);
      await loadBookingsData();
    } catch (err) {
      alert("Gagal mengubah status pembayaran: " + err.message);
    }
  };

  // Helper resolvers
  const getServiceName = (id) => services.find(s => s.id === id)?.name || "Layanan Cukur";
  const getBarberName = (id) => barbers.find(b => b.id === id)?.name || "Barber Expert";

  // Filter Logic
  const filteredBookings = bookings.filter(b => {
    const sName = getServiceName(b.service_id).toLowerCase();
    const bName = getBarberName(b.staff_id).toLowerCase();
    const cName = b.customer_name.toLowerCase();
    const cPhone = b.customer_phone;
    const cCode = b.booking_code.toLowerCase();
    const query = searchQuery.toLowerCase();

    // Text Search Match
    const matchesSearch = cName.includes(query) || 
                          cPhone.includes(query) || 
                          cCode.includes(query) || 
                          sName.includes(query) ||
                          bName.includes(query);

    // Dropdown filters match
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesBarber = barberFilter === 'All' || b.staff_id === barberFilter;
    const matchesDate = !dateFilter || b.booking_date === dateFilter;

    return matchesSearch && matchesStatus && matchesBarber && matchesDate;
  });

  // Paginated List
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const getPaymentBadge = (status) => {
    return status === 'paid' 
      ? <span className="bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Lunas</span>
      : <span className="bg-gray-100 border border-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Belum Lunas</span>;
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Manajemen Booking</h1>
            <p className="text-xs text-gray-500 mt-1.5">Kelola konfirmasi, riwayat status, dan tagihan cukur customer.</p>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Pencarian Global</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Nama, telp, kode booking..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-gold-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Filter Status</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Filter Barber</label>
            <select
              value={barberFilter}
              onChange={e => { setBarberFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="All">Semua Barber</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Pilih Tanggal Khusus</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Main Bookings Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">Kode Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Layanan Cukur</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Tanggal & Jam</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Pembayaran</th>
                  <th className="p-4 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gold-500 animate-spin mx-auto mb-2"></div>
                      Memuat rincian daftar booking...
                    </td>
                  </tr>
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      Tidak ada daftar booking ditemukan sesuai kriteria filter.
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-black tracking-wider text-gray-900">{b.booking_code}</td>
                      <td className="p-4 font-bold text-gray-800">
                        <span>{b.customer_name}</span>
                        <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{b.customer_phone}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">
                        {getServiceName(b.service_id)}
                        <span className="block text-[10px] text-gray-400 font-normal mt-0.5">Rp {Number(b.total_price).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{getBarberName(b.staff_id)}</td>
                      <td className="p-4">
                        <span className="block font-semibold text-gray-900">{b.booking_date}</span>
                        <span className="block text-gray-400 text-[10px] mt-0.5">{b.start_time.substring(0, 5)} WIB</span>
                      </td>
                      <td className="p-4">{getStatusBadge(b.status)}</td>
                      <td className="p-4">{getPaymentBadge(b.payment_status)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(b)}
                          className="p-2 rounded hover:bg-gray-100 text-gold-600 hover:text-gold-700 transition-colors cursor-pointer"
                          title="Lihat Rincian Lengkap"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Menampilkan halaman {currentPage} dari {totalPages} ({filteredBookings.length} total baris)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* EXECUTIVE DETAILS MODAL DRAWER */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-gray-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Detail Rincian Reservasi</span>
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
                
                {/* Column Left: Booking details sheet */}
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
                      {selectedBooking.customer_email && (
                        <div className="col-span-2">
                          <span className="text-gray-400 font-medium">Email:</span>
                          <span className="block font-bold text-gray-800 text-sm mt-0.5">{selectedBooking.customer_email}</span>
                        </div>
                      )}
                    </div>
                    {selectedBooking.notes && (
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs">
                        <span className="text-gray-400 font-bold uppercase text-[9px]">Catatan Pelanggan:</span>
                        <p className="text-gray-600 italic mt-1 leading-relaxed">"{selectedBooking.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Payment controls */}
                  <div className="border border-gray-200 bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-gray-400" size={20} />
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Tagihan:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-black text-gray-800">Rp {Number(selectedBooking.total_price).toLocaleString('id-ID')}</span>
                          {getPaymentBadge(selectedBooking.payment_status)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePayment}
                      className="border border-gray-300 hover:border-gray-400 bg-white px-3.5 py-1.5 rounded-lg font-bold text-xs text-gray-700 transition-all cursor-pointer shadow-sm"
                    >
                      {selectedBooking.payment_status === 'paid' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                    </button>
                  </div>
                </div>

                {/* Column Right: status transitions & logs timeline */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  
                  {/* Status transitions input */}
                  {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                    <div className="border border-gray-200 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Tindakan Admin</h4>
                      
                      <textarea
                        rows="2"
                        placeholder="Tulis alasan status diubah (misal: Barber Ahmad bersiap, atau Cukuran selesai)"
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

                  {/* Audit Trail Logs */}
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex-grow max-h-[300px] overflow-y-auto">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Audit Trail Logs</h4>
                    <div className="flex flex-col gap-4 relative pl-3 before:content-[''] before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                      {selectedLogs.map(log => (
                        <div key={log.id} className="relative text-[11px] leading-relaxed">
                          <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border border-gray-300 bg-white"></div>
                          <div>
                            <span className="font-bold text-gray-900 uppercase text-[10px]">
                              {log.new_status === 'pending' ? 'Dibuat' : log.new_status === 'confirmed' ? 'Diterima' : log.new_status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                            </span>
                            <span className="text-[9px] text-gray-400 ml-1">
                              {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <p className="text-gray-500 mt-0.5 font-medium">{log.note}</p>
                            <span className="block text-[8px] text-gray-400 mt-0.5">
                              {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
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
