import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Edit2, Trash2, Mail, Phone, 
  Check, AlertCircle, RefreshCw, UserCheck, Star 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);

  const [formFields, setFormFields] = useState({
    name: '',
    phone: '',
    email: '',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'Classic Barber Expert',
    bio: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});

  const loadStaffList = async () => {
    setLoading(true);
    try {
      const list = await db.getStaff();
      setStaff(list);
    } catch (err) {
      console.error("Gagal memuat daftar barber:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setTargetId(null);
    setFormFields({
      name: '',
      phone: '',
      email: '',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      specialty: 'Classic Cuts Specialist',
      bio: '',
      is_active: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditMode(true);
    setTargetId(member.id);
    setFormFields({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      photo_url: member.photo_url || '',
      specialty: member.specialty || '',
      bio: member.bio || '',
      is_active: member.is_active
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formFields.name.trim()) errors.name = 'Nama lengkap barber wajib diisi.';
    if (!formFields.phone.trim()) errors.phone = 'Nomor telepon/WhatsApp wajib diisi.';
    if (!formFields.specialty.trim()) errors.specialty = 'Spesialisasi/keahlian wajib diisi.';
    if (!formFields.bio.trim()) errors.bio = 'Kutipan bio singkat wajib diisi.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        name: formFields.name.trim(),
        phone: formFields.phone.trim(),
        email: formFields.email.trim() || null,
        photo_url: formFields.photo_url.trim(),
        specialty: formFields.specialty.trim(),
        bio: formFields.bio.trim(),
        is_active: formFields.is_active
      };

      if (editMode && targetId) {
        await db.updateStaff(targetId, payload);
      } else {
        await db.addStaff(payload);
      }

      setModalOpen(false);
      await loadStaffList(); // Reload table
    } catch (err) {
      alert("Gagal menyimpan barber: " + err.message);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Menghapus "${name}" akan menghapus seluruh jadwal kerjanya secara permanen. Lanjutkan?`)) return;
    try {
      await db.deleteStaff(id);
      await loadStaffList();
    } catch (err) {
      alert("Gagal menghapus barber: " + err.message);
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await db.updateStaff(member.id, { is_active: !member.is_active });
      await loadStaffList();
    } catch (err) {
      alert("Gagal mengubah status aktif: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Barber Expert</h1>
            <p className="text-xs text-gray-500 mt-1.5">Kelola data barber ahli, biografi singkat, dan status keaktifan penugasan.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="self-start sm:self-auto bg-gold-500 hover:bg-gold-600 text-black px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus size={16} /> Tambah Barber
          </button>
        </div>

        {/* Staff display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-24 text-center text-gray-400">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
              <span className="text-xs">Memuat daftar barber expert...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="col-span-full border border-gray-200 bg-white p-12 rounded-2xl text-center flex flex-col items-center">
              <User size={32} className="text-gold-500 mb-3" />
              <h4 className="font-bold text-sm text-gray-800">Daftar Barber Kosong</h4>
              <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                Belum ada barber terdaftar di database. Silakan klik tombol "Tambah Barber" di kanan atas.
              </p>
            </div>
          ) : (
            staff.map(member => (
              <div 
                key={member.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center relative ${
                  !member.is_active ? 'opacity-60 border-gray-200 bg-gray-50/10' : 'border-gray-200'
                }`}
              >
                {/* Active Indicator status */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${
                    member.is_active 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    {member.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Portrait Circle Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-150 mb-4 group-hover:border-gold-500 transition-colors">
                  <img 
                    src={member.photo_url} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-gray-900 font-extrabold text-md">{member.name}</h3>
                <span className="text-[10px] text-gold-600 font-bold bg-gold-500/10 border border-gold-500/10 px-3 py-0.5 rounded-full mt-2">
                  {member.specialty}
                </span>

                <p className="text-[11px] text-gray-500 text-center italic mt-4 leading-relaxed font-medium flex-grow px-2">
                  "{member.bio || 'Barber handal siap memberikan pelayanan potongan terbaik.'}"
                </p>

                {/* Action buttons */}
                <div className="border-t border-gray-150 w-full pt-4 mt-6 flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1"><Phone size={11} /> {member.phone}</span>
                    {member.email && <span className="flex items-center gap-1"><Mail size={11} /> {member.email}</span>}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`p-2 rounded border transition-colors cursor-pointer ${
                        member.is_active 
                          ? 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600' 
                          : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={member.is_active ? "Nonaktifkan Barber" : "Aktifkan Barber"}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-2 rounded border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      title="Edit Barber"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member.id, member.name)}
                      className="p-2 rounded border border-red-100 hover:border-red-200 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Hapus Barber"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* CHOOSE MODAL DIALOG */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form 
              onSubmit={handleFormSubmit}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-gray-200"
            >
              <div className="p-5 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-md flex items-center gap-1.5">
                    <User size={18} className="text-gold-500" />
                    {editMode ? 'Edit Profil Barber Expert' : 'Daftarkan Barber Baru'}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nama Lengkap Barber <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Fadilah"
                    value={formFields.name}
                    onChange={e => setFormFields(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                      formErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {formErrors.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nomor HP / WhatsApp <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: +628111111111"
                      value={formFields.phone}
                      onChange={e => setFormFields(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Email Staff (Opsional)</label>
                    <input
                      type="email"
                      placeholder="ahmad@yantocut.com"
                      value={formFields.email}
                      onChange={e => setFormFields(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Spesialisasi Barber <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: Fade & Detailing Beard"
                      value={formFields.specialty}
                      onChange={e => setFormFields(prev => ({ ...prev, specialty: e.target.value }))}
                      className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                        formErrors.specialty ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.specialty && (
                      <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {formErrors.specialty}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer font-bold text-gray-600">
                      <input
                        type="checkbox"
                        checked={formFields.is_active}
                        onChange={e => setFormFields(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded text-gold-500 focus:ring-gold-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Barber Aktif Bekerja</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">URL Foto Portrait Avatar</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formFields.photo_url}
                    onChange={e => setFormFields(prev => ({ ...prev, photo_url: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Biografi Singkat (Bio Quote) <span className="text-red-500">*</span></label>
                  <textarea
                    rows="3"
                    placeholder="Tulis kutipan singkat mengenai pengalaman cukur rambut atau gaya khas barber..."
                    value={formFields.bio}
                    onChange={e => setFormFields(prev => ({ ...prev, bio: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold resize-none ${
                      formErrors.bio ? 'border-red-500' : 'border-gray-200'
                    }`}
                  ></textarea>
                  {formErrors.bio && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {formErrors.bio}
                    </span>
                  )}
                </div>

              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 text-right flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-black px-5 py-2 rounded-lg font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  {editMode ? 'Simpan Profil' : 'Daftarkan Barber'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
