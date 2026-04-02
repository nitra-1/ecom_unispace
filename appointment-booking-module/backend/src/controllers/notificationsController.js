/**
 * notificationsController.js
 *
 * Endpoints
 * ─────────
 * GET  /api/notifications/templates          – list all templates [admin]
 * GET  /api/notifications/templates/:id      – get single template [admin]
 * PUT  /api/notifications/templates/:id      – update template [admin]
 * GET  /api/notifications/log                – view outbound log [admin]
 */

const db = require('../config/db')

async function listTemplates(req, res, next) {
  try {
    const templates = await db('notification_templates').orderBy('name')
    res.json({ code: 200, data: templates })
  } catch (err) {
    next(err)
  }
}

async function getTemplate(req, res, next) {
  try {
    const template = await db('notification_templates').where('id', req.params.id).first()
    if (!template) return res.status(404).json({ code: 404, message: 'Template not found' })
    res.json({ code: 200, data: template })
  } catch (err) {
    next(err)
  }
}

async function updateTemplate(req, res, next) {
  try {
    const { subject, body, is_active } = req.body
    const updated = await db('notification_templates')
      .where('id', req.params.id)
      .update({ subject, body, is_active, updated_at: new Date() })

    if (!updated) return res.status(404).json({ code: 404, message: 'Template not found' })
    const template = await db('notification_templates').where('id', req.params.id).first()
    res.json({ code: 200, data: template, message: 'Template updated' })
  } catch (err) {
    next(err)
  }
}

async function getNotificationLog(req, res, next) {
  try {
    // Note: This admin endpoint requires JWT + admin role (see routes/notifications.js).
    // The 'apptRef' query param is a numeric filter, not a credential — safe as GET param.
    const apptRef = req.query.apptRef
    const { status, pageIndex = 1, pageSize = 50 } = req.query

    let query = db('notification_log')
      .leftJoin('notification_templates', 'notification_log.template_id', 'notification_templates.id')
      .select('notification_log.*', 'notification_templates.name as template_name')

    if (apptRef) query = query.where('notification_log.appointment_id', apptRef)
    if (status) query = query.where('notification_log.status', status)

    const total = await query.clone().count('notification_log.id as cnt').first()
    const recordCount = parseInt(total.cnt) || 0

    const data = await query
      .orderBy('notification_log.created_at', 'desc')
      .limit(pageSize)
      .offset((pageIndex - 1) * pageSize)

    res.json({
      code: 200,
      data,
      pagination: {
        pageIndex: parseInt(pageIndex),
        pageSize: parseInt(pageSize),
        recordCount,
        pageCount: Math.ceil(recordCount / pageSize)
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { listTemplates, getTemplate, updateTemplate, getNotificationLog }
