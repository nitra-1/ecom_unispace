/**
 * notifications.js
 *
 * Utility for sending email notifications and logging them.
 * Uses Nodemailer for email delivery.
 *
 * Template variables are replaced using {{variable}} syntax.
 */

const nodemailer = require('nodemailer')

// Create the email transporter once at startup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

/**
 * renderTemplate
 * Replaces {{key}} placeholders in a template string with values.
 *
 * @param {string} template - Template with {{key}} placeholders
 * @param {object} vars     - Key/value replacement map
 * @returns {string}
 */
function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

/**
 * sendEmailNotification
 *
 * @param {object} db          - Knex database instance
 * @param {object} options
 * @param {number} options.appointmentId
 * @param {string} options.templateName  - e.g. "booking_confirmation"
 * @param {string} options.recipientEmail
 * @param {object} options.vars          - Template variables
 */
async function sendEmailNotification(db, { appointmentId, templateName, recipientEmail, vars }) {
  // 1. Fetch template
  const template = await db('notification_templates')
    .where('name', templateName)
    .where('channel', 'email')
    .where('is_active', true)
    .first()

  if (!template) {
    console.warn(`[notifications] Template "${templateName}" not found or inactive.`)
    return
  }

  const subject = renderTemplate(template.subject || '', vars)
  const body = renderTemplate(template.body, vars)

  // 2. Create log entry (status: pending)
  const [logId] = await db('notification_log').insert({
    appointment_id: appointmentId,
    template_id: template.id,
    channel: 'email',
    recipient: recipientEmail,
    status: 'pending'
  }).returning('id')

  const resolvedLogId = typeof logId === 'object' ? logId.id : logId

  try {
    // 3. Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@aparna.com',
      to: recipientEmail,
      subject,
      text: body
    })

    // 4. Mark as sent
    await db('notification_log')
      .where('id', resolvedLogId)
      .update({ status: 'sent', sent_at: new Date() })
  } catch (err) {
    console.error('[notifications] Failed to send email to:', recipientEmail, err.message)

    await db('notification_log')
      .where('id', resolvedLogId)
      .update({ status: 'failed', error_message: err.message })
  }
}

/**
 * scheduleReminders
 * Called by the cron job to send reminders for upcoming appointments.
 *
 * @param {object} db     - Knex instance
 * @param {number} hours  - Send reminders for appointments this many hours away
 */
async function scheduleReminders(db, hours) {
  const moment = require('moment')
  const targetTime = moment().add(hours, 'hours')
  const targetDate = targetTime.format('YYYY-MM-DD')
  const targetHour = targetTime.format('HH')

  const client = process.env.DB_CLIENT || 'sqlite3'

  // Extract the hour from appointment_time in a database-agnostic way
  const hourCondition =
    client === 'pg'
      ? `EXTRACT(HOUR FROM appointments.appointment_time::time) = ?`
      : `strftime('%H', appointments.appointment_time) = ?`

  const appointments = await db('appointments')
    .join('sections', 'appointments.section_id', 'sections.id')
    .where('appointments.appointment_date', targetDate)
    .whereRaw(hourCondition, [targetHour])
    .whereIn('appointments.status', ['Pending', 'Schedule'])
    .select(
      'appointments.*',
      'sections.name as section_name'
    )

  const templateName = hours === 24 ? 'reminder_24h' : 'reminder_2h'

  for (const appt of appointments) {
    await sendEmailNotification(db, {
      appointmentId: appt.id,
      templateName,
      recipientEmail: appt.user_email,
      vars: {
        booking_id: appt.booking_id,
        user_name: appt.user_name,
        section_name: appt.section_name,
        appointment_date: appt.appointment_date,
        appointment_time: appt.appointment_time
      }
    })
  }
}

module.exports = { sendEmailNotification, scheduleReminders, renderTemplate }
