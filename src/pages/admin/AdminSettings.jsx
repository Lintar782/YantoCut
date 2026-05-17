import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Globe, Phone, Mail, MapPin, 
  Check, RefreshCw, Sparkles, MessageSquare, AlertCircle 
} from 'lucide-react';
import { db } from '../../lib/db';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const biz = await db.getBusiness();
      if (biz) {
        setFormFields({
          name: biz.name || '',
          description: biz.description || '',
          phone: biz.phone || '',
          email: biz.email || '',
          whatsapp_number: biz.whatsapp_number || '',
          address: biz.address || ''
        });
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan toko:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formFields.name.trim()) errors.name = 'Nama bisnis/barbershop wajib diisi.';
    if (!formFields.phone.trim()) errors.phone = 'Nomor telepon wajib diisi.';
    if (!formFields.whatsapp_number.trim()) {
      errors.whatsapp_number = 'Nomor API WhatsApp wajib diisi.';
    } else if (formFields.whatsapp_number.includes('+')) {
      errors.whatsapp_number = 'Gunakan format angka murni E.164 tanpa "+" (contoh: 628123456789).';
    }
    if (!formFields.address.trim()) errors.address = 'Alamat toko wajib diisi.';
    if (!formFields.description.trim()) errors.description = 'Deskripsi promosi wajib diisi.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setSuccessMsg('');

    try {
      await db.updateBusiness({
        name: formFields.name.trim(),
        description: formFields.description.trim(),
        phone: formFields.phone.trim(),
        email: formFields.email.trim() || null,
        whatsapp_number: formFields.whatsapp_number.trim(),
        address: formFields.address.trim()
      });

      setSuccessMsg('Pengaturan toko dan branding berhasil disimpan!');
      // Auto-fade alert after 3 seconds
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert("Gagal menyimpan pengaturan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Pengaturan Toko</h1>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Ubah rincian profil bisnis, alamat cabang, deskripsi landing page, dan kontak WhatsApp.</p>
          </div>
        </div>

        {successMsg && (
          <div className="border border-green-500/20 bg-green-500/5 p-4 rounded-xl flex items-center gap-2.5 text-xs text-green-700 font-bold animate-fade-in-up">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gold-500 animate-spin mx-auto mb-3"></div>
            <span className="text-xs">Memuat konfigurasi toko...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitSettings} className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6 text-xs font-semibold">
            
            {/* Business Info Section */}
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-150 pb-2.5 mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                <Globe size={16} className="text-gold-600" /> Profil Barbershop & Landing Copy
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nama Bisnis / Toko <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formFields.name}
                    onChange={e => setFormFields(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold ${
                      formErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-normal">
                      <AlertCircle size={11} /> {formErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Teks Deskripsi Landing Page <span className="text-red-500">*</span></label>
                  <textarea
                    rows="3"
                    value={formFields.description}
                    onChange={e => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-200'
                    }`}
                  ></textarea>
                  {formErrors.description && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-normal">
                      <AlertCircle size={11} /> {formErrors.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Channels */}
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-150 pb-2.5 mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                <Phone size={16} className="text-gold-600" /> Kontak & API WhatsApp
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nomor Telepon Kantor <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formFields.phone}
                    onChange={e => setFormFields(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-normal">
                      <AlertCircle size={11} /> {formErrors.phone}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">WhatsApp API Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: 628123456789"
                    value={formFields.whatsapp_number}
                    onChange={e => setFormFields(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold ${
                      formErrors.whatsapp_number ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.whatsapp_number && (
                    <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-normal font-sans">
                      <AlertCircle size={11} /> {formErrors.whatsapp_number}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Alamat Email Bisnis</label>
                  <input
                    type="email"
                    value={formFields.email}
                    onChange={e => setFormFields(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Location Address */}
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-150 pb-2.5 mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin size={16} className="text-gold-600" /> Alamat Fisik Cabang
              </h3>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Alamat Cabang Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formFields.address}
                  onChange={e => setFormFields(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 focus:outline-none focus:border-gold-500 font-semibold ${
                    formErrors.address ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {formErrors.address && (
                  <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-normal">
                    <AlertCircle size={11} /> {formErrors.address}
                  </span>
                )}
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-gray-200 pt-5 mt-4 text-right flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gold-500 hover:bg-gold-600 text-black px-6 py-3 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                Simpan Konfigurasi Toko
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
}
