import React, { useState, useEffect } from 'react';
import { 
  Scissors, Plus, Edit2, Trash2, Clock, 
  RefreshCw, Check, AlertCircle, Sparkles, AlertTriangle 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);

  // Form Fields state
  const [formFields, setFormFields] = useState({
    name: '',
    price: '',
    duration_minutes: '30',
    category: 'Haircut',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=60',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});

  const loadServices = async () => {
    setLoading(true);
    try {
      const list = await db.getServices();
      setServices(list);
    } catch (err) {
      console.error("Gagal memuat katalog layanan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setTargetId(null);
    setFormFields({
      name: '',
      price: '',
      duration_minutes: '30',
      category: 'Haircut',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=60',
      is_active: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditMode(true);
    setTargetId(service.id);
    setFormFields({
      name: service.name,
      price: String(service.price),
      duration_minutes: String(service.duration_minutes),
      category: service.category,
      description: service.description || '',
      image_url: service.image_url || '',
      is_active: service.is_active
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formFields.name.trim()) errors.name = 'Nama layanan wajib diisi.';
    if (!formFields.price || Number(formFields.price) <= 0) errors.price = 'Harga layanan harus lebih besar dari 0.';
    if (!formFields.duration_minutes || Number(formFields.duration_minutes) < 15) errors.duration_minutes = 'Durasi minimum layanan adalah 15 menit.';
    if (!formFields.description.trim()) errors.description = 'Deskripsi layanan wajib diisi.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        name: formFields.name.trim(),
        price: Number(formFields.price),
        duration_minutes: Number(formFields.duration_minutes),
        category: formFields.category,
        description: formFields.description.trim(),
        image_url: formFields.image_url.trim(),
        is_active: formFields.is_active
      };

      if (editMode && targetId) {
        await db.updateService(targetId, payload);
      } else {
        await db.addService(payload);
      }

      setModalOpen(false);
      await loadServices(); // Refresh list
    } catch (err) {
      alert("Gagal menyimpan layanan: " + err.message);
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus layanan "${name}" dari katalog?`)) return;
    try {
      await db.deleteService(id);
      await loadServices();
    } catch (err) {
      alert("Gagal menghapus layanan: " + err.message);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await db.updateService(service.id, { is_active: !service.is_active });
      await loadServices();
    } catch (err) {
      alert("Gagal mengubah status aktif: " + err.message);
    }
  };

  const categories = ['Haircut', 'Shaving', 'Treatment', 'Style', 'Combo'];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Katalog Layanan</h1>
            <p className="text-xs text-gray-500 mt-1.5">Atur menu potongan rambut, pijat handuk hangat, dan harga menu barbershop.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="self-start sm:self-auto bg-gold-500 hover:bg-gold-600 text-black px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus size={16} /> Tambah Layanan
          </button>
        </div>

        {/* Services List Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-24 text-center text-gray-400">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
              <span className="text-xs">Memuat daftar katalog layanan...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full border border-gray-200 bg-white p-12 rounded-2xl text-center flex flex-col items-center">
              <Scissors size={32} className="text-gold-500 mb-3" />
              <h4 className="font-bold text-sm text-gray-800">Katalog Layanan Kosong</h4>
              <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                Belum ada layanan terdaftar. Silakan klik tombol "Tambah Layanan" di kanan atas.
              </p>
            </div>
          ) : (
            services.map(service => (
              <div 
                key={service.id} 
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group ${
                  !service.is_active ? 'opacity-60 border-gray-200 bg-gray-50/10' : 'border-gray-200'
                }`}
              >
                {/* Status indicator pill */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded shadow-sm border ${
                    service.is_active 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    {service.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={service.image_url} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/75 px-2.5 py-1 rounded text-[10px] font-bold text-gold-500 flex items-center gap-1 border border-gold-500/10 shadow">
                    <Clock size={11} /> {service.duration_minutes} Mnt
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow text-xs">
                  <span className="text-[10px] uppercase font-bold text-gold-600 mb-1.5">{service.category}</span>
                  <h3 className="text-gray-900 font-extrabold text-sm leading-tight mb-2 truncate" title={service.name}>
                    {service.name}
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-medium mb-4 flex-grow line-clamp-3">
                    {service.description}
                  </p>

                  <div className="border-t border-gray-150 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900">
                      Rp {Number(service.price).toLocaleString('id-ID')}
                    </span>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`p-2 rounded border transition-colors cursor-pointer ${
                          service.is_active 
                            ? 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600' 
                            : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={service.is_active ? "Nonaktifkan Layanan" : "Aktifkan Layanan"}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(service)}
                        className="p-2 rounded border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        title="Edit Layanan"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id, service.name)}
                        className="p-2 rounded border border-red-100 hover:border-red-200 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Hapus Layanan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
                    <Scissors size={18} className="text-gold-500" />
                    {editMode ? 'Edit Layanan Cukur' : 'Tambah Layanan Baru'}
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nama Layanan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: Gentleman Haircut"
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
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Harga (Rp) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="Contoh: 75000"
                      value={formFields.price}
                      onChange={e => setFormFields(prev => ({ ...prev, price: e.target.value }))}
                      className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold ${
                        formErrors.price ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.price && (
                      <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {formErrors.price}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Durasi (Menit) <span className="text-red-500">*</span></label>
                    <select
                      value={formFields.duration_minutes}
                      onChange={e => setFormFields(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="15">15 Menit</option>
                      <option value="30">30 Menit</option>
                      <option value="45">45 Menit</option>
                      <option value="60">60 Menit</option>
                      <option value="75">75 Menit</option>
                      <option value="90">90 Menit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Kategori Menu</label>
                    <select
                      value={formFields.category}
                      onChange={e => setFormFields(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer font-bold text-gray-600">
                      <input
                        type="checkbox"
                        checked={formFields.is_active}
                        onChange={e => setFormFields(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded text-gold-500 focus:ring-gold-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Aktifkan Layanan</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">URL Gambar Unsplash</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formFields.image_url}
                    onChange={e => setFormFields(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Deskripsi Layanan <span className="text-red-500">*</span></label>
                  <textarea
                    rows="3"
                    placeholder="Tulis penjelasan lengkap rincian layanan cukur..."
                    value={formFields.description}
                    onChange={e => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 text-xs focus:outline-none focus:border-gold-500 font-semibold resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-200'
                    }`}
                  ></textarea>
                  {formErrors.description && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {formErrors.description}
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
                  {editMode ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
