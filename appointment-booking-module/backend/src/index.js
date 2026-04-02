/**
 * index.js – Appointment Booking API Server
 *
 * Start the server:
 *   npm run dev      (development with auto-restart)
 *   npm start        (production)
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const rateLimit = require('express-rate-limit')
const db = require('./config/db')
const { scheduleReminders } = require('./utils/notifications')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Global limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'Too many requests, please try again later.' }
})

// Stricter limiter for booking creation to prevent abuse (20 per 15 min per IP)
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'Too many booking attempts, please try again later.' }
})

app.use(globalLimiter)

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`))
    }
  },
  credentials: true
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/sections', require('./routes/sections'))
app.use('/api/slots', require('./routes/slots'))
// Apply stricter rate limit on appointment creation
app.use('/api/appointments', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') return bookingLimiter(req, res, next)
  return next()
})
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/notifications', require('./routes/notifications'))

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// Cron jobs – appointment reminders
// '0 * * * *' = "at minute 0 of every hour" (i.e. runs once per hour)
// Sends reminders for appointments that are 24 h and 2 h away.
cron.schedule('0 * * * *', async () => {
  const intervals = (process.env.REMINDER_INTERVALS_HOURS || '24,2')
    .split(',')
    .map((h) => parseInt(h.trim()))

  for (const hours of intervals) {
    await scheduleReminders(db, hours).catch(console.error)
  }
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5050

app.listen(PORT, async () => {
  // Run pending DB migrations automatically on start
  try {
    await db.migrate.latest({
      directory: `${__dirname}/../database/migrations`
    })
    console.log('✅ Database migrations up to date')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
  }

  console.log(`🚀 Appointment Booking API running on http://localhost:${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Database    : ${process.env.DB_CLIENT || 'sqlite3'}`)
})

module.exports = app
