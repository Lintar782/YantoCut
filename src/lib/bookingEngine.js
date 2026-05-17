// ========================================================
// Booking Scheduling Engine (Availability & Slot Calculator)
// Prevents double bookings and overlaps mathematically
// ========================================================

/**
 * Converts "HH:MM:SS" or "HH:MM" time string to minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight back to "HH:MM" 24h string format
 */
export const minutesToTimeStr = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Checks if two time intervals [s1, e1] and [s2, e2] overlap
 */
export const isOverlapping = (s1, e1, s2, e2) => {
  // Overlaps if slot starts before event ends and ends after event starts
  return s1 < e2 && e1 > s2;
};

/**
 * Generates available time slots for a staff member on a specific date
 * 
 * @param {string} dateStr - Date format "YYYY-MM-DD"
 * @param {number} serviceDuration - Service duration in minutes
 * @param {Array} existingBookings - Confirmed/Pending bookings for that day
 * @param {Array} blockedTimes - Blocked times for that day (staff specific or branch-wide)
 * @param {Object} staffSchedule - Staff's weekly schedule configuration for that day of the week
 * @returns {Array} List of time slot strings (e.g., ["09:00", "09:45"])
 */
export const generateAvailableSlots = (
  dateStr,
  serviceDuration,
  existingBookings = [],
  blockedTimes = [],
  staffSchedule = null
) => {
  // 1. If staff does not work on this day or schedule not active, no slots available
  if (!staffSchedule || !staffSchedule.is_working) {
    return [];
  }

  const startMin = timeToMinutes(staffSchedule.start_time);
  const endMin = timeToMinutes(staffSchedule.end_time);

  // Buffer list of slots
  const slots = [];
  
  // Set intervals to step by 30 minutes (gives a standard elegant booking grid)
  const slotInterval = 30;

  // Calculate current minutes if checking for TODAY to avoid booking past hours
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isToday = dateStr === todayDateStr;
  
  let nowMinutes = 0;
  if (isToday) {
    const now = new Date();
    // 15 minutes buffer to allow client to show up
    nowMinutes = now.getHours() * 60 + now.getMinutes() + 15;
  }

  // Parse routine break times if defined
  const breakStartMin = staffSchedule.break_start ? timeToMinutes(staffSchedule.break_start) : null;
  const breakEndMin = staffSchedule.break_end ? timeToMinutes(staffSchedule.break_end) : null;

  // 2. Loop from working start time to end time, checking slots
  for (let currentStart = startMin; currentStart <= endMin - serviceDuration; currentStart += slotInterval) {
    const currentEnd = currentStart + serviceDuration;
    let isValid = true;

    // A. Check if the slot is in the past (for today)
    if (isToday && currentStart < nowMinutes) {
      isValid = false;
    }

    // B. Check if overlapping with routine break times
    if (isValid && breakStartMin !== null && breakEndMin !== null) {
      if (isOverlapping(currentStart, currentEnd, breakStartMin, breakEndMin)) {
        isValid = false;
      }
    }

    // C. Check if overlapping with any specific blocked time ranges
    if (isValid && blockedTimes && blockedTimes.length > 0) {
      for (const block of blockedTimes) {
        const blockStart = timeToMinutes(block.start_time);
        const blockEnd = timeToMinutes(block.end_time);
        if (isOverlapping(currentStart, currentEnd, blockStart, blockEnd)) {
          isValid = false;
          break;
        }
      }
    }

    // D. Check if overlapping with existing bookings (only active pending or confirmed bookings)
    if (isValid && existingBookings && existingBookings.length > 0) {
      for (const booking of existingBookings) {
        if (booking.status === 'cancelled') continue; // Cancelled bookings release their lock
        
        const bookStart = timeToMinutes(booking.start_time);
        const bookEnd = timeToMinutes(booking.end_time);
        if (isOverlapping(currentStart, currentEnd, bookStart, bookEnd)) {
          isValid = false;
          break;
        }
      }
    }

    // E. Add to slots if it passes all filters!
    if (isValid) {
      slots.push({
        start: minutesToTimeStr(currentStart),
        end: minutesToTimeStr(currentEnd),
        label: `${minutesToTimeStr(currentStart)} - ${minutesToTimeStr(currentEnd)}`
      });
    }
  }

  return slots;
};
