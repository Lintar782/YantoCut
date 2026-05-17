// ========================================================
// Unified Database Access Layer (Supabase / LocalStorage Hybrid)
// ========================================================

import { supabase } from './supabaseClient';
import { mockDb } from './mockDb';

// Helper to determine if we should use the mock database
const isMock = () => {
  return !supabase;
};

export const db = {
  // --- BUSINESS ---
  getBusiness: async () => {
    if (isMock()) {
      return mockDb.getBusiness();
    }
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getBusiness error, falling back to mock:", err);
      return mockDb.getBusiness();
    }
  },
  
  updateBusiness: async (businessData) => {
    if (isMock()) {
      return mockDb.updateBusiness(businessData);
    }
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('slug', 'yantocut')
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateBusiness error, falling back to mock:", err);
      return mockDb.updateBusiness(businessData);
    }
  },

  // --- SERVICES ---
  getServices: async (onlyActive = false) => {
    if (isMock()) {
      return mockDb.getServices(onlyActive);
    }
    try {
      let query = supabase.from('services').select('*');
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query.order('category', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getServices error, falling back to mock:", err);
      return mockDb.getServices(onlyActive);
    }
  },

  addService: async (serviceData) => {
    if (isMock()) {
      return mockDb.addService(serviceData);
    }
    try {
      const business = await db.getBusiness();
      const { data, error } = await supabase
        .from('services')
        .insert([{ 
          ...serviceData, 
          business_id: business.id,
          price: Number(serviceData.price),
          duration_minutes: Number(serviceData.duration_minutes)
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase addService error, falling back to mock:", err);
      return mockDb.addService(serviceData);
    }
  },

  updateService: async (id, serviceData) => {
    if (isMock()) {
      return mockDb.updateService(id, serviceData);
    }
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          ...serviceData,
          price: serviceData.price !== undefined ? Number(serviceData.price) : undefined,
          duration_minutes: serviceData.duration_minutes !== undefined ? Number(serviceData.duration_minutes) : undefined
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateService error, falling back to mock:", err);
      return mockDb.updateService(id, serviceData);
    }
  },

  deleteService: async (id) => {
    if (isMock()) {
      return mockDb.deleteService(id);
    }
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteService error, falling back to mock:", err);
      return mockDb.deleteService(id);
    }
  },

  // --- STAFF ---
  getStaff: async (onlyActive = false) => {
    if (isMock()) {
      return mockDb.getStaff(onlyActive);
    }
    try {
      let query = supabase.from('staff').select('*');
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getStaff error, falling back to mock:", err);
      return mockDb.getStaff(onlyActive);
    }
  },

  addStaff: async (staffData) => {
    if (isMock()) {
      return mockDb.addStaff(staffData);
    }
    try {
      const business = await db.getBusiness();
      // Fetch default branch
      const { data: branchData } = await supabase.from('branches').select('id').limit(1).single();
      const { data, error } = await supabase
        .from('staff')
        .insert([{ 
          ...staffData, 
          business_id: business.id,
          branch_id: branchData ? branchData.id : null
        }])
        .select()
        .single();
      if (error) throw error;
      
      // Seed schedules in Supabase too
      const schedules = [];
      for (let i = 0; i <= 6; i++) {
        schedules.push({
          staff_id: data.id,
          day_of_week: i,
          start_time: '09:00:00',
          end_time: i === 6 ? '15:00:00' : '18:00:00',
          break_start: i === 0 ? null : '12:00:00',
          break_end: i === 0 ? null : (i === 6 ? '12:30:00' : '13:00:00'),
          is_working: i !== 0
        });
      }
      await supabase.from('staff_schedules').insert(schedules);
      
      return data;
    } catch (err) {
      console.error("Supabase addStaff error, falling back to mock:", err);
      return mockDb.addStaff(staffData);
    }
  },

  updateStaff: async (id, staffData) => {
    if (isMock()) {
      return mockDb.updateStaff(id, staffData);
    }
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(staffData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateStaff error, falling back to mock:", err);
      return mockDb.updateStaff(id, staffData);
    }
  },

  deleteStaff: async (id) => {
    if (isMock()) {
      return mockDb.deleteStaff(id);
    }
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteStaff error, falling back to mock:", err);
      return mockDb.deleteStaff(id);
    }
  },

  // --- STAFF SCHEDULES ---
  getSchedules: async (staffId = null) => {
    if (isMock()) {
      return mockDb.getSchedules(staffId);
    }
    try {
      let query = supabase.from('staff_schedules').select('*');
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getSchedules error, falling back to mock:", err);
      return mockDb.getSchedules(staffId);
    }
  },

  updateSchedule: async (id, scheduleData) => {
    if (isMock()) {
      return mockDb.updateSchedule(id, scheduleData);
    }
    try {
      const { data, error } = await supabase
        .from('staff_schedules')
        .update(scheduleData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateSchedule error, falling back to mock:", err);
      return mockDb.updateSchedule(id, scheduleData);
    }
  },

  // --- BLOCKED TIMES ---
  getBlockedTimes: async (staffId = null) => {
    if (isMock()) {
      return mockDb.getBlockedTimes(staffId);
    }
    try {
      let query = supabase.from('blocked_times').select('*');
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getBlockedTimes error, falling back to mock:", err);
      return mockDb.getBlockedTimes(staffId);
    }
  },

  addBlockedTime: async (blockedTimeData) => {
    if (isMock()) {
      return mockDb.addBlockedTime(blockedTimeData);
    }
    try {
      const business = await db.getBusiness();
      // Fetch default branch
      const { data: branchData } = await supabase.from('branches').select('id').limit(1).single();
      const { data, error } = await supabase
        .from('blocked_times')
        .insert([{
          ...blockedTimeData,
          business_id: business.id,
          branch_id: branchData ? branchData.id : null
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase addBlockedTime error, falling back to mock:", err);
      return mockDb.addBlockedTime(blockedTimeData);
    }
  },

  deleteBlockedTime: async (id) => {
    if (isMock()) {
      return mockDb.deleteBlockedTime(id);
    }
    try {
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteBlockedTime error, falling back to mock:", err);
      return mockDb.deleteBlockedTime(id);
    }
  },

  // --- BOOKINGS ---
  getBookings: async () => {
    if (isMock()) {
      return mockDb.getBookings();
    }
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getBookings error, falling back to mock:", err);
      return mockDb.getBookings();
    }
  },

  getBookingById: async (id) => {
    if (isMock()) {
      return mockDb.getBookingById(id);
    }
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getBookingById error, falling back to mock:", err);
      return mockDb.getBookingById(id);
    }
  },

  getBookingByCode: async (code) => {
    if (isMock()) {
      return mockDb.getBookingByCode(code);
    }
    try {
      const formattedCode = String(code).trim().toUpperCase();
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_code', formattedCode)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getBookingByCode error, falling back to mock:", err);
      return mockDb.getBookingByCode(code);
    }
  },

  createBooking: async (bookingData) => {
    if (isMock()) {
      return mockDb.createBooking(bookingData);
    }
    try {
      const business = await db.getBusiness();
      const { data: branchData } = await supabase.from('branches').select('id').limit(1).single();
      
      // Auto-generate short visual code: e.g. YTC-X1A
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randCode = `YTC-${Math.floor(10 + Math.random() * 89)}${letters.charAt(Math.floor(Math.random() * 26))}`;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          booking_code: randCode,
          business_id: business.id,
          branch_id: branchData ? branchData.id : null,
          status: 'pending',
          payment_status: bookingData.payment_status || 'unpaid',
          total_price: Number(bookingData.total_price)
        }])
        .select()
        .single();
      if (error) throw error;
      
      // Create initial log in Supabase
      await supabase.from('booking_status_logs').insert([{
        booking_id: data.id,
        new_status: 'pending',
        note: 'Booking dibuat secara online.'
      }]);

      return data;
    } catch (err) {
      console.error("Supabase createBooking error, falling back to mock:", err);
      return mockDb.createBooking(bookingData);
    }
  },

  updateBookingStatus: async (id, status, notes = '') => {
    if (isMock()) {
      return mockDb.updateBookingStatus(id, status, notes);
    }
    try {
      // Get current booking first to know the old status
      const current = await db.getBookingById(id);
      const oldStatus = current ? current.status : null;
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      // Insert audit log
      await supabase.from('booking_status_logs').insert([{
        booking_id: id,
        old_status: oldStatus,
        new_status: status,
        note: notes || `Status diubah dari ${oldStatus} menjadi ${status}.`
      }]);
      
      return data;
    } catch (err) {
      console.error("Supabase updateBookingStatus error, falling back to mock:", err);
      return mockDb.updateBookingStatus(id, status, notes);
    }
  },

  updateBookingPayment: async (id, paymentStatus) => {
    if (isMock()) {
      return mockDb.updateBookingPayment(id, paymentStatus);
    }
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateBookingPayment error, falling back to mock:", err);
      return mockDb.updateBookingPayment(id, paymentStatus);
    }
  },

  // --- STATUS LOGS ---
  getStatusLogs: async (bookingId = null) => {
    if (isMock()) {
      return mockDb.getStatusLogs(bookingId);
    }
    try {
      let query = supabase.from('booking_status_logs').select('*');
      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase getStatusLogs error, falling back to mock:", err);
      return mockDb.getStatusLogs(bookingId);
    }
  }
};
