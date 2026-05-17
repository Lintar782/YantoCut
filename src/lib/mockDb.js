// ========================================================
// Mock Database Engine (LocalStorage Relational Model)
// Seeded for "YantoCut" Barbershop
// ========================================================

const STORAGE_KEYS = {
  BUSINESS: 'kp_business',
  BRANCHES: 'kp_branches',
  SERVICES: 'kp_services',
  STAFF: 'kp_staff',
  SCHEDULES: 'kp_schedules',
  BLOCKED_TIMES: 'kp_blocked_times',
  BOOKINGS: 'kp_bookings',
  STATUS_LOGS: 'kp_status_logs',
  PROFILES: 'kp_profiles'
};

// --- INITIAL SEED DATA ---
const DEFAULT_BUSINESS = {
  id: 'b1111111-1111-1111-1111-111111111111',
  name: 'YantoCut Barbershop',
  slug: 'yantocut',
  description: 'Premium barbershop di Jakarta Pusat. Potongan rambut modern dengan barber expert dan pelayanan premium untuk tampilan klimis maksimal.',
  logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80',
  phone: '+628123456789',
  email: 'hello@yantocut.com',
  whatsapp_number: '628123456789', // E.164 format without '+' for WhatsApp API integration
  address: 'Jl. Cempaka Putih Raya No. 12, Jakarta Pusat, DKI Jakarta',
  status: 'active'
};

const DEFAULT_BRANCHES = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Cempaka Putih (Pusat)',
    address: 'Jl. Cempaka Putih Raya No. 12, Jakarta Pusat',
    phone: '+628123456789',
    whatsapp_number: '628123456789',
    opening_time: '09:00:00',
    closing_time: '21:00:00',
    is_active: true
  }
];

const DEFAULT_SERVICES = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Classic Gentleman Cut',
    description: 'Potongan rambut klasik premium, termasuk pijat kepala ringan, cuci rambut handuk hangat, dan styling pomade terbaik.',
    price: 75000,
    duration_minutes: 45,
    category: 'Haircut',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=60',
    is_active: true
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Modern Fade & Undercut',
    description: 'Gaya rambut modern dengan detail fade gradasi super halus dan taper dikerjakan oleh barber expert.',
    price: 85000,
    duration_minutes: 45,
    category: 'Haircut',
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=60',
    is_active: true
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Beard Shaving & Hot Towel',
    description: 'Cukur jenggot dan kumis klimis presisi menggunakan pisau lipat tradisional dengan relaksasi handuk hangat ganda.',
    price: 45000,
    duration_minutes: 30,
    category: 'Shaving',
    image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop&q=60',
    is_active: true
  },
  {
    id: 's4444444-4444-4444-4444-444444444444',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Premium Hair Spa & Scalp Wash',
    description: 'Perawatan kulit kepala berketombe/rontok intensif dengan pijat leher, pencucian rambut dingin, serta hair tonic vitamin.',
    price: 60000,
    duration_minutes: 30,
    category: 'Treatment',
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&auto=format&fit=crop&q=60',
    is_active: true
  },
  {
    id: 's5555555-5555-5555-5555-555555555555',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Yanto Special Combo',
    description: 'Layanan terlaris di YantoCut! Paket hemat lengkap: Classic Gentleman Cut + Beard Shaving + Hair Spa Relaksasi.',
    price: 120000,
    duration_minutes: 75,
    category: 'Combo',
    image_url: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&auto=format&fit=crop&q=60',
    is_active: true
  }
];

const DEFAULT_STAFF = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Yanto (Master Barber)',
    phone: '+628111111111',
    email: 'yanto@yantocut.com',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Beautiful portrait avatar
    specialty: 'Classic Scissor Cuts & Fades',
    bio: 'Pendiri YantoCut dengan pengalaman mencukur lebih dari 10 tahun. Ahli dalam potongan rambut pria tradisional dan modern.',
    is_active: true
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Ahmad (Senior Barber)',
    phone: '+628222222222',
    email: 'ahmad@yantocut.com',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Razor Shaving & Beard Art',
    bio: 'Barber senior dengan tingkat ketelitian tinggi. Spesialis shaving handuk hangat dan detailing pola jenggot maskulin.',
    is_active: true
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    name: 'Budi (Modern Stylist)',
    phone: '+628333333333',
    email: 'budi@yantocut.com',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Korean Texture & Crop Cut',
    bio: 'Barber muda berbakat dengan pemahaman mendalam tentang tren gaya rambut K-Pop dan potongan bertekstur modern.',
    is_active: true
  }
];

// Seed 0 = Sunday, 1 = Monday ... 6 = Saturday working schedules
const DEFAULT_SCHEDULES = [];
DEFAULT_STAFF.forEach(staff => {
  // Monday to Friday: 09:00 - 17:00, break 12:00-13:00
  // Saturday: 09:00 - 15:00, break 12:00-12:30
  // Sunday: Off
  for (let i = 1; i <= 6; i++) {
    DEFAULT_SCHEDULES.push({
      id: `${staff.id.substring(0, 10)}-day-${i}`,
      staff_id: staff.id,
      day_of_week: i,
      start_time: '09:00:00',
      end_time: i === 6 ? '15:00:00' : '18:00:00',
      break_start: '12:00:00',
      break_end: i === 6 ? '12:30:00' : '13:00:00',
      is_working: true
    });
  }
  // Sunday (0): Off
  DEFAULT_SCHEDULES.push({
    id: `${staff.id.substring(0, 10)}-day-0`,
    staff_id: staff.id,
    day_of_week: 0,
    start_time: '09:00:00',
    end_time: '17:00:00',
    break_start: null,
    break_end: null,
    is_working: false
  });
});

const DEFAULT_BLOCKED_TIMES = [
  {
    id: 'x1111111-1111-1111-1111-111111111111',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    staff_id: DEFAULT_STAFF[0].id, // Yanto
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
    start_time: '14:00:00',
    end_time: '15:30:00',
    reason: 'Izin ke Dokter Gigi'
  }
];

// Seed 3 existing bookings for visual graphs and dashboard
const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const DEFAULT_BOOKINGS = [
  {
    id: 'k1111111-1111-1111-1111-111111111111',
    booking_code: 'YTC-94A',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    service_id: DEFAULT_SERVICES[0].id,
    staff_id: DEFAULT_STAFF[0].id, // Yanto
    customer_name: 'Doni Pratama',
    customer_phone: '08122334455',
    customer_email: 'doni@gmail.com',
    booking_date: yesterdayStr,
    start_time: '10:00:00',
    end_time: '10:45:00',
    status: 'completed',
    notes: 'Minta potong belah samping klimis.',
    total_price: DEFAULT_SERVICES[0].price,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'k2222222-2222-2222-2222-222222222222',
    booking_code: 'YTC-82B',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    service_id: DEFAULT_SERVICES[1].id,
    staff_id: DEFAULT_STAFF[1].id, // Ahmad
    customer_name: 'Rian Hidayat',
    customer_phone: '08199887766',
    customer_email: 'rian.h@outlook.com',
    booking_date: todayStr,
    start_time: '13:00:00',
    end_time: '13:45:00',
    status: 'confirmed',
    notes: 'Rambut pinggir tipis sekali fade gradasi.',
    total_price: DEFAULT_SERVICES[1].price,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'k3333333-3333-3333-3333-333333333333',
    booking_code: 'YTC-15C',
    business_id: DEFAULT_BUSINESS.id,
    branch_id: DEFAULT_BRANCHES[0].id,
    service_id: DEFAULT_SERVICES[4].id,
    staff_id: DEFAULT_STAFF[0].id, // Yanto
    customer_name: 'Bagus Setiawan',
    customer_phone: '08571234567',
    customer_email: 'bagus@gmail.com',
    booking_date: tomorrowStr,
    start_time: '11:00:00',
    end_time: '12:15:00',
    status: 'pending',
    notes: 'Booking lengkap cukur jenggot dan rambut spa.',
    total_price: DEFAULT_SERVICES[4].price,
    payment_status: 'unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_STATUS_LOGS = [
  {
    id: 'log-1',
    booking_id: 'k1111111-1111-1111-1111-111111111111',
    old_status: 'pending',
    new_status: 'confirmed',
    changed_by: null,
    note: 'System auto-confirmed',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'log-2',
    booking_id: 'k1111111-1111-1111-1111-111111111111',
    old_status: 'confirmed',
    new_status: 'completed',
    changed_by: null,
    note: 'Admin completed appointment',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'log-3',
    booking_id: 'k2222222-2222-2222-2222-222222222222',
    old_status: 'pending',
    new_status: 'confirmed',
    changed_by: null,
    note: 'Admin approved booking request',
    created_at: new Date().toISOString()
  }
];

// Initialize Storage if empty
const initMockStorage = () => {
  const checkAndSet = (key, defaultData) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  };
  checkAndSet(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS);
  checkAndSet(STORAGE_KEYS.BRANCHES, DEFAULT_BRANCHES);
  checkAndSet(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  checkAndSet(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  checkAndSet(STORAGE_KEYS.SCHEDULES, DEFAULT_SCHEDULES);
  checkAndSet(STORAGE_KEYS.BLOCKED_TIMES, DEFAULT_BLOCKED_TIMES);
  checkAndSet(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
  checkAndSet(STORAGE_KEYS.STATUS_LOGS, DEFAULT_STATUS_LOGS);
};

// Run initialization immediately on import
if (typeof window !== 'undefined') {
  initMockStorage();
}

// --- HELPER STORAGE READ/WRITE METHODS ---
const readTable = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const writeTable = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- MOCK DATABASE CLIENT INTERFACES ---
export const mockDb = {
  // Business info
  getBusiness: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS) || JSON.stringify(DEFAULT_BUSINESS));
  },
  updateBusiness: (businessData) => {
    const current = mockDb.getBusiness();
    const updated = { ...current, ...businessData, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(updated));
    return updated;
  },

  // Services CRUD
  getServices: (onlyActive = false) => {
    const list = readTable(STORAGE_KEYS.SERVICES);
    return onlyActive ? list.filter(s => s.is_active) : list;
  },
  addService: (service) => {
    const list = readTable(STORAGE_KEYS.SERVICES);
    const newService = {
      ...service,
      id: crypto.randomUUID(),
      price: Number(service.price),
      duration_minutes: Number(service.duration_minutes),
      is_active: service.is_active !== undefined ? service.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newService);
    writeTable(STORAGE_KEYS.SERVICES, list);
    return newService;
  },
  updateService: (id, serviceData) => {
    const list = readTable(STORAGE_KEYS.SERVICES);
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Service not found");
    const updated = {
      ...list[index],
      ...serviceData,
      price: serviceData.price !== undefined ? Number(serviceData.price) : list[index].price,
      duration_minutes: serviceData.duration_minutes !== undefined ? Number(serviceData.duration_minutes) : list[index].duration_minutes,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    writeTable(STORAGE_KEYS.SERVICES, list);
    return updated;
  },
  deleteService: (id) => {
    const list = readTable(STORAGE_KEYS.SERVICES);
    const filtered = list.filter(s => s.id !== id);
    writeTable(STORAGE_KEYS.SERVICES, filtered);
    return true;
  },

  // Staff CRUD
  getStaff: (onlyActive = false) => {
    const list = readTable(STORAGE_KEYS.STAFF);
    return onlyActive ? list.filter(s => s.is_active) : list;
  },
  addStaff: (staffMember) => {
    const list = readTable(STORAGE_KEYS.STAFF);
    const newStaff = {
      ...staffMember,
      id: crypto.randomUUID(),
      is_active: staffMember.is_active !== undefined ? staffMember.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newStaff);
    writeTable(STORAGE_KEYS.STAFF, list);

    // Auto-generate working schedules for this new staff
    const schedules = readTable(STORAGE_KEYS.SCHEDULES);
    for (let i = 1; i <= 6; i++) {
      schedules.push({
        id: crypto.randomUUID(),
        staff_id: newStaff.id,
        day_of_week: i,
        start_time: '09:00:00',
        end_time: '18:00:00',
        break_start: '12:00:00',
        break_end: '13:00:00',
        is_working: true
      });
    }
    schedules.push({
      id: crypto.randomUUID(),
      staff_id: newStaff.id,
      day_of_week: 0,
      start_time: '09:00:00',
      end_time: '17:00:00',
      break_start: null,
      break_end: null,
      is_working: false
    });
    writeTable(STORAGE_KEYS.SCHEDULES, schedules);

    return newStaff;
  },
  updateStaff: (id, staffData) => {
    const list = readTable(STORAGE_KEYS.STAFF);
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Staff member not found");
    const updated = {
      ...list[index],
      ...staffData,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    writeTable(STORAGE_KEYS.STAFF, list);
    return updated;
  },
  deleteStaff: (id) => {
    const list = readTable(STORAGE_KEYS.STAFF);
    const filtered = list.filter(s => s.id !== id);
    writeTable(STORAGE_KEYS.STAFF, filtered);

    // Clean schedules & blocked times
    const schedules = readTable(STORAGE_KEYS.SCHEDULES).filter(s => s.staff_id !== id);
    writeTable(STORAGE_KEYS.SCHEDULES, schedules);
    const blocked = readTable(STORAGE_KEYS.BLOCKED_TIMES).filter(s => s.staff_id !== id);
    writeTable(STORAGE_KEYS.BLOCKED_TIMES, blocked);

    return true;
  },

  // Schedules
  getSchedules: (staffId) => {
    const list = readTable(STORAGE_KEYS.SCHEDULES);
    return staffId ? list.filter(s => s.staff_id === staffId) : list;
  },
  updateSchedule: (id, scheduleData) => {
    const list = readTable(STORAGE_KEYS.SCHEDULES);
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Schedule not found");
    const updated = {
      ...list[index],
      ...scheduleData,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    writeTable(STORAGE_KEYS.SCHEDULES, list);
    return updated;
  },

  // Blocked Times CRUD
  getBlockedTimes: (staffId = null) => {
    const list = readTable(STORAGE_KEYS.BLOCKED_TIMES);
    return staffId ? list.filter(b => b.staff_id === staffId || b.staff_id === null) : list;
  },
  addBlockedTime: (blockedTime) => {
    const list = readTable(STORAGE_KEYS.BLOCKED_TIMES);
    const newBlocked = {
      ...blockedTime,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    list.push(newBlocked);
    writeTable(STORAGE_KEYS.BLOCKED_TIMES, list);
    return newBlocked;
  },
  deleteBlockedTime: (id) => {
    const list = readTable(STORAGE_KEYS.BLOCKED_TIMES);
    const filtered = list.filter(b => b.id !== id);
    writeTable(STORAGE_KEYS.BLOCKED_TIMES, filtered);
    return true;
  },

  // Bookings CRUD
  getBookings: () => {
    return readTable(STORAGE_KEYS.BOOKINGS);
  },
  getBookingById: (id) => {
    return readTable(STORAGE_KEYS.BOOKINGS).find(b => b.id === id) || null;
  },
  getBookingByCode: (code) => {
    const list = readTable(STORAGE_KEYS.BOOKINGS);
    const formattedCode = String(code).trim().toUpperCase();
    return list.find(b => b.booking_code === formattedCode) || null;
  },
  createBooking: (bookingData) => {
    const list = readTable(STORAGE_KEYS.BOOKINGS);
    
    // Auto-generate short visual code: e.g. YTC-X1A
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randCode = `YTC-${Math.floor(10 + Math.random() * 89)}${letters.charAt(Math.floor(Math.random() * 26))}`;
    
    const newBooking = {
      ...bookingData,
      id: crypto.randomUUID(),
      booking_code: randCode,
      status: 'pending',
      payment_status: bookingData.payment_status || 'unpaid',
      total_price: Number(bookingData.total_price),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newBooking);
    writeTable(STORAGE_KEYS.BOOKINGS, list);

    // Create initial log
    mockDb.addStatusLog({
      booking_id: newBooking.id,
      old_status: null,
      new_status: 'pending',
      note: 'Booking dibuat secara online.'
    });

    return newBooking;
  },
  updateBookingStatus: (id, status, notes = '') => {
    const list = readTable(STORAGE_KEYS.BOOKINGS);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");

    const oldStatus = list[index].status;
    const updated = {
      ...list[index],
      status,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    writeTable(STORAGE_KEYS.BOOKINGS, list);

    // Create log
    mockDb.addStatusLog({
      booking_id: id,
      old_status: oldStatus,
      new_status: status,
      note: notes || `Status diubah dari ${oldStatus} menjadi ${status}.`
    });

    return updated;
  },
  updateBookingPayment: (id, paymentStatus) => {
    const list = readTable(STORAGE_KEYS.BOOKINGS);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");

    const updated = {
      ...list[index],
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    writeTable(STORAGE_KEYS.BOOKINGS, list);
    return updated;
  },

  // Status Logs
  getStatusLogs: (bookingId = null) => {
    const list = readTable(STORAGE_KEYS.STATUS_LOGS);
    const sorted = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Latest first
    return bookingId ? sorted.filter(l => l.booking_id === bookingId) : sorted;
  },
  addStatusLog: (logData) => {
    const list = readTable(STORAGE_KEYS.STATUS_LOGS);
    const newLog = {
      ...logData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    list.push(newLog);
    writeTable(STORAGE_KEYS.STATUS_LOGS, list);
    return newLog;
  }
};
