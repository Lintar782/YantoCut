import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, Clock, Calendar as CalendarIcon, User, Check, ArrowRight, ArrowLeft, 
  UserCheck, AlertTriangle, Landmark, MessageSquare, AlertCircle, ShoppingBag, 
  MapPin, HelpCircle 
} from 'lucide-react';
import { db } from '../../lib/db';
import { generateAvailableSlots } from '../../lib/bookingEngine';

export default function BookingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Core Booking State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // DB Fetched Data State
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Filtering & UI loading states
  const [serviceCategory, setServiceCategory] = useState('All');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Cinematic dark theme mount
    document.body.classList.add('dark-theme-active');

    const loadCoreData = async () => {
      try {
        const sList = await db.getServices(true);
        const bList = await db.getStaff(true);
        setServices(sList);
        setBarbers(bList);
      } catch (err) {
        console.error("Error loading wizard core data:", err);
      }
    };
    loadCoreData();

    // Default select date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);

    return () => {
      document.body.classList.remove('dark-theme-active');
    };
  }, []);

  // Recalculate Time Slots when Date, Barber, or Service changes
  useEffect(() => {
    if (!selectedBarber || !selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    const calculateSlots = async () => {
      setLoadingSlots(true);
      try {
        // Fetch barber weekly routine schedules
        const allSchedules = await db.getSchedules(selectedBarber.id);
        const dateObj = new Date(selectedDate);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday etc.
        const daySchedule = allSchedules.find(s => s.day_of_week === dayOfWeek);

        // Fetch active bookings for this barber on this date
        const allBookings = await db.getBookings();
        const existingBookings = allBookings.filter(b => 
          b.staff_id === selectedBarber.id && 
          b.booking_date === selectedDate && 
          b.status !== 'cancelled'
        );

        // Fetch custom blocked times for this date
        const allBlocks = await db.getBlockedTimes(selectedBarber.id);
        const blockedTimes = allBlocks.filter(b => b.date === selectedDate);

        // Calculate available slots
        const slots = generateAvailableSlots(
          selectedDate,
          selectedService.duration_minutes,
          existingBookings,
          blockedTimes,
          daySchedule
        );
        
        setAvailableSlots(slots);
        
        // Reset selected time if it's no longer in the recalculated list
        if (selectedTime && !slots.some(s => s.start === selectedTime.start)) {
          setSelectedTime(null);
        }
      } catch (err) {
        console.error("Error calculating slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    calculateSlots();
  }, [selectedBarber, selectedDate, selectedService]);

  // Categories extraction
  const categories = ['All', ...new Set(services.map(s => s.category))];

  // Steps definitions
  const steps = [
    { number: 1, label: 'Layanan' },
    { number: 2, label: 'Barber' },
    { number: 3, label: 'Jadwal' },
    { number: 4, label: 'Data Diri' },
    { number: 5, label: 'Konfirmasi' }
  ];

  // Booking details confirmation submission
  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      alert("Detail booking kurang lengkap. Silakan cek kembali.");
      return;
    }

    try {
      const bookingPayload = {
        service_id: selectedService.id,
        staff_id: selectedBarber.id,
        customer_name: customerForm.name.trim(),
        customer_phone: customerForm.phone.trim(),
        customer_email: customerForm.email.trim() || null,
        booking_date: selectedDate,
        start_time: `${selectedTime.start}:00`,
        end_time: `${selectedTime.end}:00`,
        notes: customerForm.notes.trim() || null,
        total_price: selectedService.price,
        payment_status: 'unpaid'
      };

      const result = await db.createBooking(bookingPayload);
      
      // Redirect to success page, pass bookingCode in state
      navigate('/booking/confirmation', { state: { booking: result } });
    } catch (err) {
      console.error("Gagal mengirim booking:", err);
      alert("Mohon maaf, terjadi gangguan server saat membuat booking. Silakan coba kembali.");
    }
  };

  // Form Validation checks
  const validateForm = () => {
    const errors = {};
    if (!customerForm.name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    
    const phoneRegex = /^[0-9+]{8,15}$/;
    if (!customerForm.phone.trim()) {
      errors.phone = 'Nomor WhatsApp wajib diisi.';
    } else if (!phoneRegex.test(customerForm.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Nomor WhatsApp tidak valid (misal: 08123456789 atau +628123456789).';
    }

    if (customerForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerForm.email.trim())) {
        errors.email = 'Format alamat email tidak valid.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      alert("Silakan pilih salah satu layanan terlebih dahulu.");
      return;
    }
    if (currentStep === 2 && !selectedBarber) {
      alert("Silakan pilih barber expert pilihan Anda.");
      return;
    }
    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      alert("Silakan pilih tanggal dan jam kosong yang tersedia.");
      return;
    }
    if (currentStep === 4) {
      if (!validateForm()) return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Helper date lists generator: 14 upcoming days
  const getUpcomingDaysList = () => {
    const list = [];
    const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const isSunday = date.getDay() === 0;
      list.push({
        fullDate: date.toISOString().split('T')[0],
        dayNum: date.getDate(),
        dayLabel: weekdays[date.getDay()],
        monthLabel: months[date.getMonth()],
        isClosed: isSunday // Default Sunday closed for visual indicators
      });
    }
    return list;
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans bg-dark-bg pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

      {/* Mini Nav */}
      <header className="border-b border-dark-border py-4 px-4 bg-dark-surface/60 sticky top-0 backdrop-blur-md z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center text-black font-extrabold text-md">
              Y
            </div>
            <span className="font-extrabold text-lg text-white">Yanto<span className="text-gold-500">Cut</span></span>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Batal melakukan booking dan kembali ke halaman utama?")) {
                navigate('/');
              }
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Batal
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto relative px-2">
            {/* Stepper bar background */}
            <div className="absolute left-0 right-0 top-[20px] h-[2px] bg-dark-border z-0"></div>
            <div 
              className="absolute left-0 top-[20px] h-[2px] bg-gold-500 transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map(step => (
              <div key={step.number} className="flex flex-col items-center z-10 relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    currentStep === step.number 
                      ? 'bg-gold-500 border-gold-500 text-black shadow-lg shadow-gold-500/25'
                      : currentStep > step.number
                        ? 'bg-dark-surface border-gold-500 text-gold-500'
                        : 'bg-dark-surface border-dark-border text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? <Check size={16} /> : step.number}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 ${
                  currentStep === step.number ? 'text-gold-500' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Wizard Body */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in-up">
          
          {/* STEP 1: CHOOSE SERVICE */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Pilih Layanan Cukur</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Pilih salah satu layanan cukur, pijat handuk hangat, maupun paket treatment hemat terbaik kami.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-dark-border/55 pb-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                      serviceCategory === cat 
                        ? 'bg-gold-500/10 border-gold-500 text-gold-500' 
                        : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-1 gap-4">
                {services
                  .filter(s => serviceCategory === 'All' || s.category === serviceCategory)
                  .map(service => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`border rounded-xl p-4 md:p-5 flex items-center justify-between cursor-pointer transition-all ${
                        selectedService?.id === service.id
                          ? 'border-gold-500 bg-gold-500/5 shadow-md shadow-gold-500/5'
                          : 'border-dark-border hover:border-gray-600 bg-dark-surface/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedService?.id === service.id 
                            ? 'border-gold-500 bg-gold-500 text-black' 
                            : 'border-dark-border'
                        }`}>
                          {selectedService?.id === service.id && <Check size={14} />}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-md md:text-lg">{service.name}</h3>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-lg hidden sm:block">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] uppercase font-bold text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded">
                              {service.category}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} /> {service.duration_minutes} Menit
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-black text-md md:text-lg text-white">
                          Rp {Number(service.price).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE BARBER */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Pilih Barber Expert</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Setiap barber di YantoCut memiliki sertifikasi tinggi. Pilih barber favorit Anda atau andalkan barber yang tersedia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {barbers.map(barber => (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`border rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center relative ${
                      selectedBarber?.id === barber.id
                        ? 'border-gold-500 bg-gold-500/5'
                        : 'border-dark-border hover:border-gray-600 bg-dark-surface/40'
                    }`}
                  >
                    {selectedBarber?.id === barber.id && (
                      <div className="absolute top-3 right-3 bg-gold-500 text-black p-1 rounded-full">
                        <Check size={14} className="stroke-[3px]" />
                      </div>
                    )}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dark-border mb-4">
                      <img 
                        src={barber.photo_url} 
                        alt={barber.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-bold text-md">{barber.name}</h3>
                    <span className="text-[10px] text-gold-500 font-semibold bg-gold-500/10 px-2.5 py-0.5 rounded-full mt-2">
                      {barber.specialty}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-3 italic leading-relaxed">
                      "{barber.bio || 'Barber expert yang berdedikasi tinggi.'}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME SELECTOR */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Atur Jadwal Cukur</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Pilih tanggal dan jam kosong di mana barber <span className="text-gold-500 font-semibold">{selectedBarber?.name}</span> tersedia.
                </p>
              </div>

              {/* Horizontal Date picker */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Pilih Tanggal
                </label>
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
                  {getUpcomingDaysList().map(day => (
                    <button
                      key={day.fullDate}
                      onClick={() => {
                        if (day.isClosed) {
                          alert("Mohon maaf, Barbershop YantoCut tutup pada hari Minggu.");
                          return;
                        }
                        setSelectedDate(day.fullDate);
                      }}
                      className={`flex flex-col items-center justify-center p-3 min-w-[70px] rounded-xl border transition-all shrink-0 cursor-pointer ${
                        selectedDate === day.fullDate
                          ? 'border-gold-500 bg-gold-500 text-black shadow-lg shadow-gold-500/15'
                          : day.isClosed
                            ? 'border-dark-border/40 opacity-40 bg-dark-surface/10 cursor-not-allowed'
                            : 'border-dark-border bg-dark-surface hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold ${
                        selectedDate === day.fullDate ? 'text-black' : 'text-gray-400'
                      }`}>
                        {day.dayLabel}
                      </span>
                      <span className="text-xl font-extrabold mt-1">{day.dayNum}</span>
                      <span className={`text-[9px] uppercase tracking-wider mt-1 ${
                        selectedDate === day.fullDate ? 'text-black' : 'text-gray-500'
                      }`}>
                        {day.monthLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Pilih Waktu Tersedia
                </label>
                
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="w-8 h-8 rounded-full border-4 border-gold-500/25 border-t-gold-500 animate-spin mb-3"></div>
                    <span className="text-xs">Menghitung slot jadwal aman...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="border border-dark-border bg-dark-surface/20 p-8 rounded-xl text-center flex flex-col items-center">
                    <AlertTriangle className="text-gold-500 mb-3" size={28} />
                    <h4 className="font-bold text-white text-md">Tidak Ada Jam Tersedia</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                      Barber sedang off-duty, libur rutin, atau slot jam di tanggal terpilih sudah sepenuhnya terisi. Silakan pilih tanggal lain di bar atas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 rounded-lg border text-sm font-semibold text-center transition-all cursor-pointer ${
                          selectedTime?.start === slot.start
                            ? 'border-gold-500 bg-gold-500 text-black shadow-lg shadow-gold-500/10'
                            : 'border-dark-border bg-dark-surface hover:border-gray-600'
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS FORM */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Masukkan Data Diri</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Isi data di bawah ini untuk konfirmasi pesanan dan penerimaan notifikasi kode booking via WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Doni Pratama"
                    value={customerForm.name}
                    onChange={e => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full bg-dark-bg border p-3 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-all ${
                      formErrors.name ? 'border-red-500' : 'border-dark-border'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={customerForm.phone}
                    onChange={e => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full bg-dark-bg border p-3 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-all ${
                      formErrors.phone ? 'border-red-500' : 'border-dark-border'
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.phone}
                    </span>
                  )}
                  <span className="block text-[10px] text-gray-500 mt-1.5">
                    *Gunakan nomor aktif untuk kemudahan kirim rincian booking.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: doni@gmail.com"
                    value={customerForm.email}
                    onChange={e => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full bg-dark-bg border p-3 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-all ${
                      formErrors.email ? 'border-red-500' : 'border-dark-border'
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Catatan Tambahan untuk Barber
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Tulis instruksi khusus jika ada (misal: minta potongan belah samping klimis)"
                    value={customerForm.notes}
                    onChange={e => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border p-3 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW BOOKING SHEET */}
          {currentStep === 5 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Konfirmasi Detail Reservasi</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Mohon tinjau rincian di bawah sebelum menyelesaikan transaksi. Reservasi akan masuk dengan status <span className="text-gold-500 font-semibold">Pending</span> menunggu approval admin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Visual Invoice card */}
                <div className="border border-dark-border bg-dark-bg p-5 rounded-xl flex flex-col">
                  <div className="flex items-center gap-3 pb-4 border-b border-dark-border">
                    <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center text-black font-extrabold text-lg">
                      Y
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-md">YantoCut Invoice</h3>
                      <span className="text-[10px] text-gray-500">Jakarta Pusat</span>
                    </div>
                  </div>
                  
                  <div className="py-4 flex-grow flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-400">Layanan Dipilih:</span>
                      <div className="text-right">
                        <span className="block text-sm font-semibold text-white">{selectedService?.name}</span>
                        <span className="text-[10px] text-gold-500">{selectedService?.category} • {selectedService?.duration_minutes} Menit</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Barber Expert:</span>
                      <span className="text-sm font-semibold text-white">{selectedBarber?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Tanggal Cukur:</span>
                      <span className="text-sm font-semibold text-white">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Pukul / Jam:</span>
                      <span className="text-sm font-semibold text-gold-500">{selectedTime?.start} WIB</span>
                    </div>
                  </div>

                  <div className="border-t border-dark-border pt-4 mt-auto flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total Tagihan:</span>
                    <span className="text-xl font-black text-white">
                      Rp {Number(selectedService?.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Customer summary */}
                <div className="border border-dark-border bg-dark-bg p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-md border-b border-dark-border pb-3 mb-3">Data Pelanggan</h3>
                    <div className="flex flex-col gap-3 text-xs">
                      <div>
                        <span className="block text-gray-500">Nama Pelanggan</span>
                        <span className="text-sm text-white font-semibold mt-0.5 block">{customerForm.name}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">WhatsApp Aktif</span>
                        <span className="text-sm text-white font-semibold mt-0.5 block">{customerForm.phone}</span>
                      </div>
                      {customerForm.email && (
                        <div>
                          <span className="block text-gray-500">Alamat Email</span>
                          <span className="text-sm text-white font-semibold mt-0.5 block">{customerForm.email}</span>
                        </div>
                      )}
                      {customerForm.notes && (
                        <div>
                          <span className="block text-gray-500">Catatan Khusus</span>
                          <span className="text-sm text-gray-300 italic mt-0.5 block">"{customerForm.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gold-500/5 border border-gold-500/20 p-3 rounded-lg mt-6 flex items-start gap-2.5">
                    <HelpCircle className="text-gold-500 shrink-0 mt-0.5" size={14} />
                    <span className="text-[10px] text-gray-400 leading-relaxed">
                      Sisa bayar di kasir secara tunai / transfer setelah proses potong rambut selesai. Pembatalan dapat dilakukan via WA CS minimum 1 jam sebelumnya.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper buttons controls */}
          <div className="flex items-center justify-between border-t border-dark-border mt-8 pt-6">
            {currentStep > 1 ? (
              <button
                onClick={handleBackStep}
                className="px-5 py-3 rounded-lg border border-dark-border hover:border-gray-500 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer text-gray-300"
              >
                <ArrowLeft size={16} /> Kembali
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-3 rounded-lg border border-dark-border hover:border-gray-500 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer text-gray-400"
              >
                Kembali ke Home
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                className="bg-gold-500 hover:bg-gold-600 text-black px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ml-auto"
              >
                Lanjut <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitBooking}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black px-8 py-4 rounded-lg font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-gold-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
              >
                Konfirmasi & Book <Check size={18} />
              </button>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
