import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Trash2, Plus, Check, Save, 
  AlertCircle, RefreshCw, Eye, Sparkles, UserCheck, ShieldAlert 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminSchedules() {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Blocked time form fields
  const [blockForm, setBlockForm] = useState({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Active editing week schedule line index
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    start_time: '',
    end_time: '',
    break_start: '',
    break_end: '',
    is_working: true
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const bList = await db.getStaff();
      setBarbers(bList);
      if (bList.length > 0) {
        setSelectedBarberId(bList[0].id);
        await loadBarberSchedule(bList[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat data awal jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBarberSchedule = async (staffId) => {
    try {
      const sList = await db.getSchedules(staffId);
      const bTimes = await db.getBlockedTimes(staffId);
      
      // Sort schedules Mon (1) to Sun (0)
      const sortedSchedules = sList.sort((a, b) => {
        const valA = a.day_of_week === 0 ? 7 : a.day_of_week;
        const valB = b.day_of_week === 0 ? 7 : b.day_of_week;
        return valA - valB;
      });

      setSchedules(sortedSchedules);
      setBlockedTimes(bTimes);
    } catch (err) {
      console.error("Gagal memuat detail jadwal barber:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleBarberChange = async (e) => {
    const id = e.target.value;
    setSelectedBarberId(id);
    setEditingScheduleId(null);
    setLoading(true);
    await loadBarberSchedule(id);
    setLoading(false);
  };

  // Inline Schedule Editing trigger
  const handleStartEditSchedule = (sched) => {
    setEditingScheduleId(sched.id);
    setEditingFields({
      start_time: sched.start_time.substring(0, 5),
      end_time: sched.end_time.substring(0, 5),
      break_start: sched.break_start ? sched.break_start.substring(0, 5) : '',
      break_end: sched.break_end ? sched.break_end.substring(0, 5) : '',
      is_working: sched.is_working
    });
  };

  const handleSaveSchedule = async (schedId) => {
    try {
      const payload = {
        start_time: `${editingFields.start_time}:00`,
        end_time: `${editingFields.end_time}:00`,
        break_start: editingFields.break_start ? `${editingFields.break_start}:00` : null,
        break_end: editingFields.break_end ? `${editingFields.break_end}:00` : null,
        is_working: editingFields.is_working
      };

      await db.updateSchedule(schedId, payload);
      setEditingScheduleId(null);
      await loadBarberSchedule(selectedBarberId);
    } catch (err) {
      alert("Gagal memperbarui jadwal rutin: " + err.message);
    }
  };

  // Blocked Times triggers
  const handleAddBlockedTime = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!blockForm.date) errors.date = 'Tanggal libur/izin wajib diisi.';
    if (!blockForm.reason.trim()) errors.reason = 'Alasan blokir waktu wajib diisi.';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await db.addBlockedTime({
        staff_id: selectedBarberId,
        date: blockForm.date,
        start_time: `${blockForm.start_time}:00`,
        end_time: `${blockForm.end_time}:00`,
        reason: blockForm.reason.trim()
      });

      // Reset Form fields
      setBlockForm({
        date: '',
        start_time: '09:00',
        end_time: '17:00',
        reason: ''
      });
      setFormErrors({});
      await loadBarberSchedule(selectedBarberId);
    } catch (err) {
      alert("Gagal menambahkan blocked time: " + err.message);
    }
  };

  const handleDeleteBlockedTime = async (id) => {
    if (!window.confirm("Buka kembali waktu terblokir ini agar pelanggan dapat booking kembali?")) return;
    try {
      await db.deleteBlockedTime(id);
      await loadBarberSchedule(selectedBarberId);
    } catch (err) {
      alert("Gagal menghapus blocked time: " + err.message);
    }
  };

  // Helper day names resolver
  const getDayName = (dayNum) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayNum];
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Jadwal & Waktu Libur</h1>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Atur jam operasional rutin mingguan dan catat cuti/sakit barber Anda.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase shrink-0">Pilih Barber:</span>
            <select
              value={selectedBarberId}
              onChange={handleBarberChange}
              className="bg-white border border-gray-300 p-2 rounded-lg text-xs font-bold focus:outline-none focus:border-gold-500 cursor-pointer shadow-sm min-w-[200px]"
            >
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
            <span className="text-xs">Memuat penugasan jadwal kerja...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column Left: Weekly Routine Schedules Table (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <div className="mb-4">
                <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock size={16} className="text-gold-600" /> Jam Kerja Rutin Mingguan
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Tentukan jam masuk kerja dan jam istirahat rutin mingguan.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="p-3">Hari</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Jam Masuk</th>
                      <th className="p-3">Jam Istirahat</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {schedules.map(sched => {
                      const isEditing = editingScheduleId === sched.id;
                      return (
                        <tr key={sched.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 font-bold text-gray-800">{getDayName(sched.day_of_week)}</td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="checkbox"
                                checked={editingFields.is_working}
                                onChange={e => setEditingFields(prev => ({ ...prev, is_working: e.target.checked }))}
                                className="rounded text-gold-500 focus:ring-gold-500 w-4 h-4 cursor-pointer"
                              />
                            ) : (
                              <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                                sched.is_working 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-gray-100 border-gray-200 text-gray-500'
                              }`}>
                                {sched.is_working ? 'Masuk' : 'Libur'}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingFields.start_time}
                                  onChange={e => setEditingFields(prev => ({ ...prev, start_time: e.target.value }))}
                                  className="w-12 bg-gray-50 border border-gray-200 p-1 rounded text-center text-xs font-bold"
                                />
                                <span>-</span>
                                <input
                                  type="text"
                                  value={editingFields.end_time}
                                  onChange={e => setEditingFields(prev => ({ ...prev, end_time: e.target.value }))}
                                  className="w-12 bg-gray-50 border border-gray-200 p-1 rounded text-center text-xs font-bold"
                                />
                              </div>
                            ) : sched.is_working ? (
                              <span className="font-semibold text-gray-900">
                                {sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Mulai"
                                  value={editingFields.break_start}
                                  onChange={e => setEditingFields(prev => ({ ...prev, break_start: e.target.value }))}
                                  className="w-12 bg-gray-50 border border-gray-200 p-1 rounded text-center text-xs font-bold"
                                />
                                <span>-</span>
                                <input
                                  type="text"
                                  placeholder="Selesai"
                                  value={editingFields.break_end}
                                  onChange={e => setEditingFields(prev => ({ ...prev, break_end: e.target.value }))}
                                  className="w-12 bg-gray-50 border border-gray-200 p-1 rounded text-center text-xs font-bold"
                                />
                              </div>
                            ) : sched.is_working && sched.break_start ? (
                              <span className="font-semibold text-gray-500">
                                {sched.break_start.substring(0, 5)} - {sched.break_end.substring(0, 5)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isEditing ? (
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleSaveSchedule(sched.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors cursor-pointer"
                                  title="Simpan"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingScheduleId(null)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-1 rounded transition-colors cursor-pointer"
                                  title="Batal"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEditSchedule(sched)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column Right: Custom Blocked Times Manager & Form (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Add Blocked form */}
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar size={16} className="text-gold-600" /> Catat Waktu Libur / Cuti
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Tutup ketersediaan slot barber untuk tanggal/jam tertentu.</p>
                </div>

                <form onSubmit={handleAddBlockedTime} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tanggal Berhalangan <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={blockForm.date}
                      onChange={e => setBlockForm(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                        formErrors.date ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.date && (
                      <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {formErrors.date}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Jam Mulai</label>
                      <input
                        type="text"
                        placeholder="HH:MM"
                        value={blockForm.start_time}
                        onChange={e => setBlockForm(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Jam Selesai</label>
                      <input
                        type="text"
                        placeholder="HH:MM"
                        value={blockForm.end_time}
                        onChange={e => setBlockForm(prev => ({ ...prev, end_time: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 text-xs text-center font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Alasan Berhalangan <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: Izin Cuti / Sakit Gigi / Keperluan Keluarga"
                      value={blockForm.reason}
                      onChange={e => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                      className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                        formErrors.reason ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.reason && (
                      <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {formErrors.reason}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer text-center mt-2"
                  >
                    Kunci Slot Ketersediaan
                  </button>
                </form>
              </div>

              {/* Blocked Times List display */}
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex-grow max-h-[300px] overflow-y-auto">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Daftar Cuti / Berhalangan</h4>
                
                {blockedTimes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                    <Sparkles size={18} className="text-gold-500 mb-1" />
                    <span className="text-[10px]">Belum ada jadwal berhalangan tercatat.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {blockedTimes
                      .sort((a, b) => b.date.localeCompare(a.date)) // latest first
                      .map(block => (
                        <div key={block.id} className="border border-gray-150 p-3 rounded-xl flex items-center justify-between gap-3 text-xs bg-gray-50/20">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-gray-900 text-[11px]">{block.date}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">({block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)})</span>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-0.5 block italic">"{block.reason}"</span>
                          </div>
                          <button
                            onClick={() => handleDeleteBlockedTime(block.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Hapus Blocked Waktu"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
