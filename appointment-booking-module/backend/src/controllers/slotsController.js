/**
 * slotsController.js
 *
 * Endpoints
 * ─────────
 * GET  /api/slots                        – get slots for a section + date range (customer)
 * POST /api/slots/generate               – auto-generate slots         [admin]
 * PUT  /api/slots/:id/block              – block a slot                [admin]
 * PUT  /api/slots/:id/unblock            – unblock a slot              [admin]
 */

const db = require('../config/db')
const { generateSlotsForSection } = require('../utils/slotGenerator')

/**
 * getSlots
 * Returns slot availability for a section on a specific date.
 * Used by the frontend to show colour-coded availability grid.
 *
 * Query params: sectionId, date
 */
async function getSlots(req, res, next) {
  try {
    const { sectionId, date } = req.query
    if (!sectionId || !date) {
      return res.status(400).json({ code: 400, message: 'sectionId and date are required' })
    }

    const slots = await db('appointment_slots')
      .where('section_id', sectionId)
      .where('date', date)
      .orderBy('start_time')

    // Enrich each slot with availability info for the frontend
    const enriched = slots.map((s) => ({
      id: s.id,
      startTime: s.start_time,
      endTime: s.end_time,
      label: `${s.start_time} - ${s.end_time}`,
      maxBookings: s.max_bookings,
      currentBookings: s.current_bookings,
      remainingSlots: Math.max(0, s.max_bookings - s.current_bookings),
      status: s.status, // "available" | "full" | "blocked"
      // Colour hint for the UI
      availability:
        s.status === 'blocked'
          ? 'blocked'
          : s.current_bookings >= s.max_bookings
          ? 'full'     // red
          : s.current_bookings >= s.max_bookings * 0.8
          ? 'limited'  // amber
          : 'available' // green
    }))

    res.json({ code: 200, data: enriched })
  } catch (err) {
    next(err)
  }
}

/**
 * generateSlots  [admin]
 * Body: { sectionId, startDate, endDate }
 */
async function generateSlots(req, res, next) {
  try {
    const { sectionId, startDate, endDate } = req.body
    if (!sectionId || !startDate || !endDate) {
      return res.status(400).json({ code: 400, message: 'sectionId, startDate, endDate are required' })
    }

    const count = await generateSlotsForSection(db, sectionId, startDate, endDate)
    res.json({ code: 200, message: `${count} slots processed`, data: { count } })
  } catch (err) {
    next(err)
  }
}

/**
 * blockSlot  [admin]
 */
async function blockSlot(req, res, next) {
  try {
    const slot = await db('appointment_slots').where('id', req.params.id).first()
    if (!slot) return res.status(404).json({ code: 404, message: 'Slot not found' })

    await db('appointment_slots')
      .where('id', req.params.id)
      .update({ status: 'blocked', updated_at: new Date() })

    res.json({ code: 200, message: 'Slot blocked' })
  } catch (err) {
    next(err)
  }
}

/**
 * unblockSlot  [admin]
 */
async function unblockSlot(req, res, next) {
  try {
    const slot = await db('appointment_slots').where('id', req.params.id).first()
    if (!slot) return res.status(404).json({ code: 404, message: 'Slot not found' })

    const newStatus = slot.current_bookings >= slot.max_bookings ? 'full' : 'available'
    await db('appointment_slots')
      .where('id', req.params.id)
      .update({ status: newStatus, updated_at: new Date() })

    res.json({ code: 200, message: 'Slot unblocked', data: { status: newStatus } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getSlots, generateSlots, blockSlot, unblockSlot }
