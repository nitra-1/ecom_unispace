/**
 * appointmentsController.js
 *
 * Endpoints
 * ─────────
 * GET    /api/appointments             – list appointments [admin: all, customer: own]
 * GET    /api/appointments/:id         – get single appointment
 * POST   /api/appointments             – book appointment        [customer]
 * PUT    /api/appointments/:id/status  – update status           [admin]
 * PUT    /api/appointments/:id/reschedule – reschedule           [admin/customer]
 * DELETE /api/appointments/:id         – cancel appointment      [admin/customer]
 * POST   /api/appointments/:id/force   – force-book VIP          [admin]
 * POST   /api/appointments/:id/feedback– submit feedback         [customer]
 */

const db = require('../config/db')
const { generateBookingId, refreshSlotStatuses } = require('../utils/slotGenerator')
const { sendEmailNotification } = require('../utils/notifications')

// ── List appointments ─────────────────────────────────────────────────────────

async function listAppointments(req, res, next) {
  try {
    const {
      userId, sectionId, status, date, searchText,
      pageIndex = 1, pageSize = 20
    } = req.query

    let query = db('appointments')
      .join('sections', 'appointments.section_id', 'sections.id')
      .select(
        'appointments.*',
        'sections.name as section_name',
        'sections.icon_url as section_icon'
      )

    // Customers can only see their own appointments
    if (req.user && req.user.role !== 'admin') {
      query = query.where('appointments.user_id', req.user.id)
    } else {
      if (userId) query = query.where('appointments.user_id', userId)
    }

    if (sectionId) query = query.where('appointments.section_id', sectionId)
    if (status) query = query.where('appointments.status', status)
    if (date) query = query.where('appointments.appointment_date', date)

    if (searchText) {
      const term = `%${searchText}%`
      query = query.where(function () {
        this.where('appointments.user_name', 'like', term)
          .orWhere('appointments.user_email', 'like', term)
          .orWhere('appointments.user_phone', 'like', term)
          .orWhere('appointments.booking_id', 'like', term)
      })
    }

    const total = await query.clone().count('appointments.id as cnt').first()
    const recordCount = parseInt(total.cnt) || 0
    const pageCount = Math.ceil(recordCount / pageSize)

    // Admins typically want most recent first; customers want upcoming first
    const sortDir = req.user?.role === 'admin' ? 'desc' : 'asc'
    const data = await query
      .orderBy('appointments.appointment_date', sortDir)
      .orderBy('appointments.appointment_time', sortDir)
      .limit(pageSize)
      .offset((pageIndex - 1) * pageSize)

    res.json({
      code: 200,
      data,
      pagination: { pageIndex: parseInt(pageIndex), pageSize: parseInt(pageSize), recordCount, pageCount }
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single appointment ────────────────────────────────────────────────────

async function getAppointment(req, res, next) {
  try {
    const appt = await db('appointments')
      .join('sections', 'appointments.section_id', 'sections.id')
      .select('appointments.*', 'sections.name as section_name')
      .where('appointments.id', req.params.id)
      .first()

    if (!appt) return res.status(404).json({ code: 404, message: 'Appointment not found' })

    // Only admin or the appointment owner can view
    if (req.user.role !== 'admin' && appt.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: 'Access denied' })
    }

    const feedback = await db('appointment_feedback')
      .where('appointment_id', appt.id)
      .first()

    res.json({ code: 200, data: { ...appt, feedback: feedback || null } })
  } catch (err) {
    next(err)
  }
}

// ── Book appointment ──────────────────────────────────────────────────────────

async function bookAppointment(req, res, next) {
  try {
    const {
      slotId, sectionId,
      userName, userEmail, userPhone, userId,
      appointmentDate, appointmentTime
    } = req.body

    if (!slotId || !sectionId || !userName || !userEmail || !userPhone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ code: 400, message: 'Missing required fields' })
    }

    // 1. Verify slot is available
    const slot = await db('appointment_slots').where('id', slotId).first()
    if (!slot) return res.status(404).json({ code: 404, message: 'Slot not found' })
    if (slot.status !== 'available') {
      return res.status(409).json({ code: 409, message: 'Slot is no longer available' })
    }

    // 2. Generate booking ID
    const bookingId = await generateBookingId(db)

    // 3. Create the appointment
    const [newId] = await db('appointments').insert({
      booking_id: bookingId,
      slot_id: slotId,
      section_id: sectionId,
      user_id: userId || null,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'Schedule'
    }).returning('id')

    const resolvedId = typeof newId === 'object' ? newId.id : newId

    // 4. Increment slot counter
    await db('appointment_slots')
      .where('id', slotId)
      .increment('current_bookings', 1)

    // 5. Refresh slot status (mark full if needed)
    await refreshSlotStatuses(db, sectionId, appointmentDate, appointmentDate)

    // 6. Send confirmation email (non-blocking)
    const section = await db('sections').where('id', sectionId).first()
    sendEmailNotification(db, {
      appointmentId: resolvedId,
      templateName: 'booking_confirmation',
      recipientEmail: userEmail,
      vars: {
        booking_id: bookingId,
        user_name: userName,
        section_name: section?.name || '',
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      }
    }).catch(console.error)

    const created = await db('appointments').where('id', resolvedId).first()
    res.status(201).json({ code: 201, data: created, message: 'Appointment booked successfully' })
  } catch (err) {
    next(err)
  }
}

// ── Update status [admin] ─────────────────────────────────────────────────────

async function updateStatus(req, res, next) {
  try {
    const { status, notes } = req.body
    const validStatuses = ['Pending', 'Schedule', 'Reschedule', 'In-Discussion', 'Completed', 'Cancelled', 'No-Show']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: 'Invalid status value' })
    }

    const apptExists = await db('appointments').where('id', req.params.id).first()
    if (!apptExists) return res.status(404).json({ code: 404, message: 'Appointment not found' })

    await db('appointments').where('id', req.params.id).update({
      status,
      ...(notes !== undefined ? { notes } : {}),
      updated_at: new Date()
    })
    res.json({ code: 200, message: 'Status updated' })
  } catch (err) {
    next(err)
  }
}

// ── Reschedule ────────────────────────────────────────────────────────────────

async function rescheduleAppointment(req, res, next) {
  try {
    const { newSlotId, appointmentDate, appointmentTime } = req.body
    if (!newSlotId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ code: 400, message: 'newSlotId, appointmentDate, appointmentTime required' })
    }

    const appt = await db('appointments').where('id', req.params.id).first()
    if (!appt) return res.status(404).json({ code: 404, message: 'Appointment not found' })

    // Customers can only reschedule their own appointments
    if (req.user.role !== 'admin' && appt.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: 'Access denied' })
    }

    const newSlot = await db('appointment_slots').where('id', newSlotId).first()
    if (!newSlot || newSlot.status !== 'available') {
      return res.status(409).json({ code: 409, message: 'New slot is not available' })
    }

    // Release the old slot
    await db('appointment_slots')
      .where('id', appt.slot_id)
      .decrement('current_bookings', 1)
    await refreshSlotStatuses(db, appt.section_id, appt.appointment_date, appt.appointment_date)

    // Book the new slot
    await db('appointment_slots').where('id', newSlotId).increment('current_bookings', 1)
    await refreshSlotStatuses(db, appt.section_id, appointmentDate, appointmentDate)

    await db('appointments').where('id', req.params.id).update({
      slot_id: newSlotId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'Reschedule',
      updated_at: new Date()
    })

    res.json({ code: 200, message: 'Appointment rescheduled' })
  } catch (err) {
    next(err)
  }
}

// ── Cancel ────────────────────────────────────────────────────────────────────

async function cancelAppointment(req, res, next) {
  try {
    const { reason, cancelledBy = 'customer' } = req.body

    const appt = await db('appointments').where('id', req.params.id).first()
    if (!appt) return res.status(404).json({ code: 404, message: 'Appointment not found' })

    if (req.user.role !== 'admin' && appt.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: 'Access denied' })
    }

    await db('appointments').where('id', req.params.id).update({
      status: 'Cancelled',
      cancelled_by: cancelledBy,
      cancellation_reason: reason || null,
      updated_at: new Date()
    })

    // Release the slot
    await db('appointment_slots')
      .where('id', appt.slot_id)
      .decrement('current_bookings', 1)
    await refreshSlotStatuses(db, appt.section_id, appt.appointment_date, appt.appointment_date)

    // Send cancellation email
    const section = await db('sections').where('id', appt.section_id).first()
    sendEmailNotification(db, {
      appointmentId: appt.id,
      templateName: 'booking_cancellation',
      recipientEmail: appt.user_email,
      vars: {
        booking_id: appt.booking_id,
        user_name: appt.user_name,
        section_name: section?.name || '',
        appointment_date: appt.appointment_date,
        appointment_time: appt.appointment_time,
        cancellation_reason: reason || 'Not specified'
      }
    }).catch(console.error)

    res.json({ code: 200, message: 'Appointment cancelled' })
  } catch (err) {
    next(err)
  }
}

// ── Force-book VIP [admin] ────────────────────────────────────────────────────

async function forceBookAppointment(req, res, next) {
  try {
    const {
      slotId, sectionId,
      userName, userEmail, userPhone, userId,
      appointmentDate, appointmentTime
    } = req.body

    const slot = await db('appointment_slots').where('id', slotId).first()
    if (!slot) return res.status(404).json({ code: 404, message: 'Slot not found' })

    const bookingId = await generateBookingId(db)

    const [newId] = await db('appointments').insert({
      booking_id: bookingId,
      slot_id: slotId,
      section_id: sectionId,
      user_id: userId || null,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'Schedule',
      is_vip: true
    }).returning('id')

    const resolvedId = typeof newId === 'object' ? newId.id : newId

    await db('appointment_slots').where('id', slotId).increment('current_bookings', 1)

    const created = await db('appointments').where('id', resolvedId).first()
    res.status(201).json({ code: 201, data: created, message: 'VIP appointment force-booked' })
  } catch (err) {
    next(err)
  }
}

// ── Feedback ──────────────────────────────────────────────────────────────────

async function submitFeedback(req, res, next) {
  try {
    const { rating, comment } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ code: 400, message: 'Rating must be between 1 and 5' })
    }

    const appt = await db('appointments').where('id', req.params.id).first()
    if (!appt) return res.status(404).json({ code: 404, message: 'Appointment not found' })

    const existing = await db('appointment_feedback')
      .where('appointment_id', req.params.id)
      .first()

    if (existing) {
      await db('appointment_feedback')
        .where('id', existing.id)
        .update({ rating, comment, updated_at: new Date() })
    } else {
      await db('appointment_feedback').insert({
        appointment_id: req.params.id, rating, comment
      })
    }

    res.json({ code: 200, message: 'Feedback submitted' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listAppointments, getAppointment, bookAppointment,
  updateStatus, rescheduleAppointment, cancelAppointment,
  forceBookAppointment, submitFeedback
}
