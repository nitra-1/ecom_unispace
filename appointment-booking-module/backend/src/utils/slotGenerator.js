/**
 * slotGenerator.js
 *
 * Utility that auto-generates appointment_slots rows for a section
 * based on its section_schedules and section_capacity settings.
 *
 * Usage:
 *   const { generateSlotsForSection } = require('./slotGenerator')
 *   await generateSlotsForSection(db, sectionId, startDate, endDate)
 */

const moment = require('moment')

/**
 * generateSlotsForSection
 *
 * @param {object} db        - Knex database instance
 * @param {number} sectionId - ID of the section to generate slots for
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate   - End date   in YYYY-MM-DD format
 * @returns {Promise<number>} Number of slots created
 */
async function generateSlotsForSection(db, sectionId, startDate, endDate) {
  // 1. Load the section (duration) and its weekly schedule
  const section = await db('sections').where('id', sectionId).first()
  if (!section) throw new Error(`Section ${sectionId} not found`)

  const schedules = await db('section_schedules')
    .where('section_id', sectionId)
    .where('is_open', true)

  // Build a lookup: day_of_week → { open_time, close_time }
  const scheduleMap = {}
  schedules.forEach((s) => {
    scheduleMap[s.day_of_week] = {
      openTime: s.open_time,
      closeTime: s.close_time
    }
  })

  const durationMinutes = section.appointment_duration_minutes || 60
  const slotsToInsert = []

  // 2. Iterate each calendar day in the range
  let current = moment(startDate)
  const end = moment(endDate)

  while (current.isSameOrBefore(end, 'day')) {
    const dayOfWeek = current.day() // 0=Sun … 6=Sat
    const dateStr = current.format('YYYY-MM-DD')

    if (scheduleMap[dayOfWeek]) {
      const { openTime, closeTime } = scheduleMap[dayOfWeek]

      // 3. Walk through the day generating one slot per durationMinutes window
      let slotStart = moment(`${dateStr} ${openTime}`, 'YYYY-MM-DD HH:mm')
      const dayEnd = moment(`${dateStr} ${closeTime}`, 'YYYY-MM-DD HH:mm')

      while (slotStart.clone().add(durationMinutes, 'minutes').isSameOrBefore(dayEnd)) {
        const slotEnd = slotStart.clone().add(durationMinutes, 'minutes')

        // 4. Determine max_bookings from section_capacity override, else default to 1
        const capacityRow = await db('section_capacity')
          .where('section_id', sectionId)
          .where('date', dateStr)
          .where('hour_start', slotStart.format('HH:mm'))
          .first()

        const maxBookings = capacityRow ? capacityRow.salesperson_count : 1

        slotsToInsert.push({
          section_id: sectionId,
          date: dateStr,
          start_time: slotStart.format('HH:mm'),
          end_time: slotEnd.format('HH:mm'),
          max_bookings: maxBookings,
          current_bookings: 0,
          status: 'available'
        })

        slotStart = slotEnd
      }
    }

    current.add(1, 'day')
  }

  if (slotsToInsert.length === 0) return 0

  // 5. Upsert slots (ignore duplicates so re-running is safe)
  for (const slot of slotsToInsert) {
    const existing = await db('appointment_slots')
      .where('section_id', slot.section_id)
      .where('date', slot.date)
      .where('start_time', slot.start_time)
      .first()

    if (!existing) {
      await db('appointment_slots').insert(slot)
    } else {
      // Update max_bookings in case capacity was changed, but only if not yet booked
      await db('appointment_slots')
        .where('id', existing.id)
        .where('current_bookings', 0)
        .update({ max_bookings: slot.max_bookings })
    }
  }

  // Refresh status for all affected slots
  await refreshSlotStatuses(db, sectionId, startDate, endDate)

  return slotsToInsert.length
}

/**
 * refreshSlotStatuses
 * Marks slots as "full" when current_bookings >= max_bookings.
 */
async function refreshSlotStatuses(db, sectionId, startDate, endDate) {
  // Mark full
  await db('appointment_slots')
    .where('section_id', sectionId)
    .whereBetween('date', [startDate, endDate])
    .whereRaw('current_bookings >= max_bookings')
    .where('status', '!=', 'blocked')
    .update({ status: 'full' })

  // Mark available again (in case capacity was increased)
  await db('appointment_slots')
    .where('section_id', sectionId)
    .whereBetween('date', [startDate, endDate])
    .whereRaw('current_bookings < max_bookings')
    .where('status', 'full')
    .update({ status: 'available' })
}

/**
 * generateBookingId
 * Creates a human-readable booking reference like APT-20240402-0042.
 */
async function generateBookingId(db) {
  const today = moment().format('YYYYMMDD')
  const count = await db('appointments')
    .whereRaw("booking_id LIKE ?", [`APT-${today}-%`])
    .count('id as cnt')
    .first()

  const seq = String((parseInt(count.cnt) || 0) + 1).padStart(4, '0')
  return `APT-${today}-${seq}`
}

module.exports = { generateSlotsForSection, refreshSlotStatuses, generateBookingId }
