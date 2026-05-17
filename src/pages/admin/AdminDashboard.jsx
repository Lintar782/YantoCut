import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, DollarSign, AlertCircle, CheckCircle, 
  ChevronRight, Scissors, UserCheck, RefreshCw, XCircle 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todayTotal: 0,
    pendingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    todayRevenue: 0
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const bList = await db.getBookings();
      const sList = await db.getServices();
      const staffList = await db.getStaff();
      
      setBookings(bList);
      setServices(sList);
      setBarbers(staffList);

      // Calculate statistics
      const todayStr = new Date().toISOString().split('T')[0];
      const todayBookings = bList.filter(b => b.booking_date === todayStr);
      
      const pending = bList.filter(b => b.status === 'pending').length;
      const confirmed = bList.filter(b => b.status === 'confirmed').length;
      const completed = bList.filter(b => b.status === 'completed').length;
      
      // Calculate revenue from all completed and confirmed bookings
      const revenue = bList
        .filter(b => (b.status === 'completed' || b.status === 'confirmed') && b.booking_date === todayStr)
        .reduce((sum, b) => sum + Number(b.total_price), 0);

      setStats({
        todayTotal: todayBookings.length,
        pendingCount: pending,
        confirmedCount: confirmed,
        completedCount: completed,
        todayRevenue: revenue
      });
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick Action Handler for inline status transitions
  const handleQuickStatusUpdate = async (id, newStatus, message) => {
    if (!window.confirm(`Ubah status booking menjadi "${newStatus}"?`)) return;
    try {
      await db.updateBookingStatus(id, newStatus, message);
      await loadDashboardData(); // Reload metrics
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  // Helper resolvers
  const getServiceName = (id) => services.find(s => s.id === id)?.name || "Layanan Cukur";
  const getBarberName = (id) => barbers.find(b => b.id === id)?.name || "Barber";

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Confirmed</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Selamat Datang di YantoCut!</h1>
            <p className="text-xs text-gray-500 mt-1.5">Berikut adalah performa reservasi barbershop Anda hari ini.</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="self-start sm:self-auto border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Segarkan Data
          </button>
        </div>

        {/* Stats Grid Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pemasukan Hari Ini</span>
              <span className="block text-2xl font-black text-gray-950 mt-1">
                Rp {stats.todayRevenue.toLocaleString('id-ID')}
              </span>
              <span className="block text-[10px] text-green-600 font-bold mt-1.5">Daripada kemarin +15%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Antrean Pending</span>
              <span className="block text-2xl font-black text-gray-950 mt-1">{stats.pendingCount} Booking</span>
              <span className="block text-[10px] text-yellow-600 font-semibold mt-1.5">Perlu persetujuan segera</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <AlertCircle size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Jadwal Confirmed</span>
              <span className="block text-2xl font-black text-gray-950 mt-1">{stats.confirmedCount} Booking</span>
              <span className="block text-[10px] text-blue-600 font-semibold mt-1.5">Jadwal barber terkunci</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={24} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Hari Ini</span>
              <span className="block text-2xl font-black text-gray-950 mt-1">{stats.todayTotal} Cukuran</span>
              <span className="block text-[10px] text-green-600 font-semibold mt-1.5">{stats.completedCount} Selesai dicukur</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>

        </div>

        {/* Recent Booking Table Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-gray-900 text-lg">Booking Terbaru Masuk</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Daftar reservasi terbaru yang masuk ke dalam sistem.</p>
            </div>
            <button 
              onClick={() => navigate('/admin/bookings')} 
              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 cursor-pointer"
            >
              Semua Booking <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">Kode / Customer</th>
                  <th className="p-4">Layanan Cukur</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Tanggal & Jam</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gold-500 animate-spin mx-auto mb-2"></div>
                      Memuat data reservasi...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      Belum ada reservasi masuk ke sistem.
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="block font-black text-gray-900 tracking-wider">{b.booking_code}</span>
                        <span className="block text-gray-500 mt-0.5 font-semibold">{b.customer_name}</span>
                        <span className="block text-[10px] text-gray-400">{b.customer_phone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">{getServiceName(b.service_id)}</span>
                        <span className="block text-gray-400 text-[10px] mt-0.5">Rp {Number(b.total_price).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-700">{getBarberName(b.staff_id)}</span>
                      </td>
                      <td className="p-4">
                        <span className="block font-semibold text-gray-900">{b.booking_date}</span>
                        <span className="block text-gray-400 text-[10px] mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> {b.start_time.substring(0, 5)} WIB
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(b.id, 'confirmed', 'Admin menyetujui reservasi.')}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Terima
                            </button>
                          )}
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(b.id, 'completed', 'Admin menyelesaikan proses cukur rambut.')}
                              className="bg-green-50 hover:bg-green-100 text-green-600 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Selesai
                            </button>
                          )}
                          {b.status !== 'completed' && b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(b.id, 'cancelled', 'Admin membatalkan booking.')}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/admin/bookings', { state: { highlightId: b.id } })}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
