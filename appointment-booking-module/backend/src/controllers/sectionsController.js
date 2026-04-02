/**
 * sectionsController.js
 *
 * Handles CRUD operations for showroom sections and their schedules / capacity.
 *
 * Endpoints
 * ─────────
 * GET    /api/sections               – list all active sections
 * GET    /api/sections/:id           – get single section with schedule
 * POST   /api/sections               – create section         [admin]
 * PUT    /api/sections/:id           – update section         [admin]
 * DELETE /api/sections/:id           – soft-delete (is_active=false) [admin]
 *
 * GET    /api/sections/:id/schedule       – get weekly schedule
 * PUT    /api/sections/:id/schedule       – update weekly schedule [admin]
 *
 * GET    /api/sections/:id/capacity       – get capacity overrides
 * POST   /api/sections/:id/capacity       – set capacity for date/hour [admin]
 */

const db = require('../config/db')

// ── Section CRUD ──────────────────────────────────────────────────────────────

async function listSections(req, res, next) {
  try {
    const sections = await db('sections')
      .where('is_active', true)
      .orderBy('name')
    res.json({ code: 200, data: sections })
  } catch (err) {
    next(err)
  }
}

async function getSection(req, res, next) {
  try {
    const section = await db('sections').where('id', req.params.id).first()
    if (!section) return res.status(404).json({ code: 404, message: 'Section not found' })

    const schedules = await db('section_schedules')
      .where('section_id', req.params.id)
      .orderBy('day_of_week')

    res.json({ code: 200, data: { ...section, schedules } })
  } catch (err) {
    next(err)
  }
}

async function createSection(req, res, next) {
  try {
    const {
      name, slug, description, location, icon_url, image_url,
      appointment_duration_minutes = 60
    } = req.body

    if (!name || !slug) {
      return res.status(400).json({ code: 400, message: 'name and slug are required' })
    }

    const [id] = await db('sections').insert({
      name, slug, description, location, icon_url, image_url,
      appointment_duration_minutes,
      is_active: true
    }).returning('id')

    const resolvedId = typeof id === 'object' ? id.id : id

    // Create default Mon-Sat schedule automatically
    const defaultSchedule = [0,1,2,3,4,5,6].map((dow) => ({
      section_id: resolvedId,
      day_of_week: dow,
      open_time: '10:00',
      close_time: '19:00',
      is_open: dow !== 0 // Closed on Sunday
    }))
    await db('section_schedules').insert(defaultSchedule)

    const created = await db('sections').where('id', resolvedId).first()
    res.status(201).json({ code: 201, data: created, message: 'Section created' })
  } catch (err) {
    next(err)
  }
}

async function updateSection(req, res, next) {
  try {
    const updated = await db('sections')
      .where('id', req.params.id)
      .update({ ...req.body, updated_at: new Date() })

    if (!updated) return res.status(404).json({ code: 404, message: 'Section not found' })
    const section = await db('sections').where('id', req.params.id).first()
    res.json({ code: 200, data: section, message: 'Section updated' })
  } catch (err) {
    next(err)
  }
}

async function deleteSection(req, res, next) {
  try {
    const updated = await db('sections')
      .where('id', req.params.id)
      .update({ is_active: false, updated_at: new Date() })

    if (!updated) return res.status(404).json({ code: 404, message: 'Section not found' })
    res.json({ code: 200, message: 'Section deactivated' })
  } catch (err) {
    next(err)
  }
}

// ── Schedule ──────────────────────────────────────────────────────────────────

async function getSchedule(req, res, next) {
  try {
    const schedules = await db('section_schedules')
      .where('section_id', req.params.id)
      .orderBy('day_of_week')
    res.json({ code: 200, data: schedules })
  } catch (err) {
    next(err)
  }
}

async function updateSchedule(req, res, next) {
  try {
    // req.body.schedules is an array of { day_of_week, open_time, close_time, is_open }
    const { schedules } = req.body
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ code: 400, message: 'schedules must be an array' })
    }

    for (const sched of schedules) {
      await db('section_schedules')
        .where('section_id', req.params.id)
        .where('day_of_week', sched.day_of_week)
        .update({
          open_time: sched.open_time,
          close_time: sched.close_time,
          is_open: sched.is_open,
          updated_at: new Date()
        })
    }

    const updated = await db('section_schedules')
      .where('section_id', req.params.id)
      .orderBy('day_of_week')
    res.json({ code: 200, data: updated, message: 'Schedule updated' })
  } catch (err) {
    next(err)
  }
}

// ── Capacity ──────────────────────────────────────────────────────────────────

async function getCapacity(req, res, next) {
  try {
    const { date } = req.query
    let query = db('section_capacity').where('section_id', req.params.id)
    if (date) query = query.where('date', date)
    const rows = await query.orderBy(['date', 'hour_start'])
    res.json({ code: 200, data: rows })
  } catch (err) {
    next(err)
  }
}

async function setCapacity(req, res, next) {
  try {
    const { date, hour_start, salesperson_count } = req.body
    if (!date || !hour_start || salesperson_count == null) {
      return res.status(400).json({ code: 400, message: 'date, hour_start, salesperson_count are required' })
    }

    const existing = await db('section_capacity')
      .where('section_id', req.params.id)
      .where('date', date)
      .where('hour_start', hour_start)
      .first()

    if (existing) {
      await db('section_capacity')
        .where('id', existing.id)
        .update({ salesperson_count, updated_at: new Date() })
    } else {
      await db('section_capacity').insert({
        section_id: req.params.id, date, hour_start, salesperson_count
      })
    }

    // Reflect the change in the generated slot
    await db('appointment_slots')
      .where('section_id', req.params.id)
      .where('date', date)
      .where('start_time', hour_start)
      .where('status', '!=', 'blocked')
      .update({ max_bookings: salesperson_count })

    res.json({ code: 200, message: 'Capacity updated' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listSections, getSection, createSection, updateSection, deleteSection,
  getSchedule, updateSchedule,
  getCapacity, setCapacity
}
