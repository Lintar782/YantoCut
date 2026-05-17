import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie 
} from 'recharts';
import { 
  BarChart3, TrendingUp, Scissors, Users, Clock, 
  RefreshCw, DollarSign, Calendar, Sparkles 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);

  // Grouped analytical data state
  const [revenueData, setRevenueData] = useState([]);
  const [popularServicesData, setPopularServicesData] = useState([]);
  const [barberVolumeData, setBarberVolumeData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);

  // Stats cards fallback
  const [summaryStats, setSummaryStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    averageBill: 0,
    activeBarbersCount: 3
  });

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const bList = await db.getBookings();
      const sList = await db.getServices();
      const staffList = await db.getStaff();

      const activeBookings = bList.filter(b => b.status !== 'cancelled');

      // 1. Calculate General Summaries
      const totalEarned = activeBookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.total_price), 0);

      const totalBookedCount = activeBookings.length;
      const avgTicket = totalBookedCount > 0 ? Math.round(totalEarned / activeBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length || 1) : 0;

      setSummaryStats({
        totalEarnings: totalEarned,
        totalBookings: totalBookedCount,
        averageBill: avgTicket,
        activeBarbersCount: staffList.filter(s => s.is_active).length
      });

      // 2. REVENUE TREND (Line/Area Chart over dates)
      // Group active bookings by booking_date
      const revenueGroup = {};
      activeBookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .forEach(b => {
          revenueGroup[b.booking_date] = (revenueGroup[b.booking_date] || 0) + Number(b.total_price);
        });

      // Map to sorted array
      const revChartData = Object.keys(revenueGroup)
        .sort((a, b) => a.localeCompare(b))
        .map(date => ({
          date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          'Pendapatan': revenueGroup[date]
        }));
      
      setRevenueData(revChartData.length > 0 ? revChartData : [
        { date: 'Senin', Pendapatan: 75000 },
        { date: 'Selasa', Pendapatan: 120000 },
        { date: 'Rabu', Pendapatan: 85000 },
        { date: 'Kamis', Pendapatan: 150000 }
      ]);

      // 3. POPULAR SERVICES (Horizontal Bar Chart)
      const serviceCounts = {};
      activeBookings.forEach(b => {
        const service = sList.find(s => s.id === b.service_id);
        const sName = service ? service.name : 'Layanan Cukur';
        serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
      });

      const popularChartData = Object.keys(serviceCounts).map(name => ({
        name,
        'Jumlah Pesanan': serviceCounts[name]
      })).sort((a, b) => b['Jumlah Pesanan'] - a['Jumlah Pesanan']);

      setPopularServicesData(popularChartData.length > 0 ? popularChartData : [
        { name: 'Classic Gentleman Cut', 'Jumlah Pesanan': 12 },
        { name: 'Beard Shave & Hot Towel', 'Jumlah Pesanan': 8 },
        { name: 'Yanto Special Combo', 'Jumlah Pesanan': 5 }
      ]);

      // 4. BARBER VOLUME (Pie Chart)
      const staffCounts = {};
      activeBookings.forEach(b => {
        const barber = staffList.find(s => s.id === b.staff_id);
        const bName = barber ? barber.name.split(' ')[0] : 'Barber'; // Short name
        staffCounts[bName] = (staffCounts[bName] || 0) + 1;
      });

      const barberChartData = Object.keys(staffCounts).map(name => ({
        name,
        value: staffCounts[name]
      }));

      setBarberVolumeData(barberChartData.length > 0 ? barberChartData : [
        { name: 'Yanto', value: 15 },
        { name: 'Ahmad', value: 10 },
        { name: 'Budi', value: 5 }
      ]);

      // 5. PEAK BOOKING HOURS (Vertical Bar Chart)
      const hoursCounts = {};
      activeBookings.forEach(b => {
        const hour = b.start_time.substring(0, 5); // "10:00" etc.
        hoursCounts[hour] = (hoursCounts[hour] || 0) + 1;
      });

      const hoursChartData = Object.keys(hoursCounts)
        .sort((a, b) => a.localeCompare(b))
        .map(hour => ({
          hour: `${hour} WIB`,
          'Kepadatan': hoursCounts[hour]
        }));

      setPeakHoursData(hoursChartData.length > 0 ? hoursChartData : [
        { hour: '09:00 WIB', Kepadatan: 4 },
        { hour: '10:00 WIB', Kepadatan: 6 },
        { hour: '13:00 WIB', Kepadatan: 8 },
        { hour: '16:00 WIB', Kepadatan: 3 }
      ]);

    } catch (err) {
      console.error("Gagal mengolah data statistik analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Pie chart custom styling colors
  const COLORS = ['#d9a752', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Analisis Statistik Bisnis</h1>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Deep-dive data pemasukan keuangan, popularitas layanan, jam sibuk, dan performa barber.</p>
          </div>
          <button 
            onClick={loadAnalyticsData}
            className="self-start sm:self-auto border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Muat Ulang Grafik
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
            <span className="text-xs">Menyusun kompilasi visual chart data bisnis...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Top Summaries cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pendapatan Terkumpul</span>
                  <span className="block text-xl font-black text-gray-950 mt-1">
                    Rp {summaryStats.totalEarnings.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600">
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reservasi Aktif</span>
                  <span className="block text-xl font-black text-gray-950 mt-1">
                    {summaryStats.totalBookings} Booking
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rata-rata Nota Kasir</span>
                  <span className="block text-xl font-black text-gray-950 mt-1">
                    Rp {summaryStats.averageBill.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Barber Aktif</span>
                  <span className="block text-xl font-black text-gray-950 mt-1">
                    {summaryStats.activeBarbersCount} Barber Expert
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Users size={20} />
                </div>
              </div>

            </div>

            {/* Interactive Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Chart 1: Revenue Trends (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-gold-600" /> Tren Pendapatan Berkala
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d9a752" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#d9a752" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                      <Tooltip />
                      <Area type="monotone" dataKey="Pendapatan" stroke="#d9a752" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPendapatan)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Barber Volume Share (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-gold-600" /> Share Volume Barber
                  </h3>
                </div>
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={barberVolumeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {barberVolumeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] mt-4 border-t border-gray-100 pt-3">
                  {barberVolumeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-gray-500">{entry.name}</span>
                      <span className="text-gray-900">({entry.value} Book)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: Popular Services (6 cols) */}
              <div className="lg:col-span-6 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors size={14} className="text-gold-600" /> Layanan Menu Terlaris
                  </h3>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularServicesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} fontWeight="bold" width={110} />
                      <Tooltip />
                      <Bar dataKey="Jumlah Pesanan" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {popularServicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Peak Hours distribution (6 cols) */}
              <div className="lg:col-span-6 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-gold-600" /> Kepadatan Jam Booking
                  </h3>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                      <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                      <Tooltip />
                      <Bar dataKey="Kepadatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
