/**
 * Seed: 001_sections
 *
 * Inserts the default showroom sections with operating hours.
 * Run with:  npm run seed
 */

const SECTIONS = [
  {
    name: 'Kitchen',
    slug: 'kitchen',
    description: 'Explore modular kitchens with premium finishes and smart storage solutions.',
    location: 'Ground Floor, Zone A',
    icon_url: '/icons/kitchen.svg',
    image_url: '/images/Kitchen.png',
    appointment_duration_minutes: 60,
    is_active: true
  },
  {
    name: 'Wardrobe',
    slug: 'wardrobe',
    description: 'Customise walk-in and sliding wardrobes to fit your bedroom perfectly.',
    location: 'Ground Floor, Zone B',
    icon_url: '/icons/wardrobe.svg',
    image_url: '/images/Wardrobe.png',
    appointment_duration_minutes: 60,
    is_active: true
  },
  {
    name: 'Tiles',
    slug: 'tiles',
    description: 'Browse thousands of tile options for flooring, walls, and outdoor spaces.',
    location: 'First Floor, Zone C',
    icon_url: '/icons/tiles.svg',
    image_url: '/images/Tiles.png',
    appointment_duration_minutes: 60,
    is_active: true
  },
  {
    name: 'Bathspace',
    slug: 'bathspace',
    description: 'Multi-brand bathspace fittings, sanitaryware, and accessories.',
    location: 'First Floor, Zone D',
    icon_url: '/icons/bathspace.svg',
    image_url: '/images/Bathspace.png',
    appointment_duration_minutes: 60,
    is_active: true
  },
  {
    name: 'Living Room',
    slug: 'living-room',
    description: 'Furniture, lighting, and décor for the perfect living space.',
    location: 'Second Floor, Zone E',
    icon_url: '/icons/living-room.svg',
    image_url: '/images/LivingRoom.png',
    appointment_duration_minutes: 60,
    is_active: true
  }
]

// Operating hours (Mon–Sat 10:00–19:00, Sunday closed)
const SCHEDULE_TEMPLATE = [
  { day_of_week: 0, open_time: '10:00', close_time: '19:00', is_open: false }, // Sun
  { day_of_week: 1, open_time: '10:00', close_time: '19:00', is_open: true },  // Mon
  { day_of_week: 2, open_time: '10:00', close_time: '19:00', is_open: true },  // Tue
  { day_of_week: 3, open_time: '10:00', close_time: '19:00', is_open: true },  // Wed
  { day_of_week: 4, open_time: '10:00', close_time: '19:00', is_open: true },  // Thu
  { day_of_week: 5, open_time: '10:00', close_time: '19:00', is_open: true },  // Fri
  { day_of_week: 6, open_time: '10:00', close_time: '18:00', is_open: true }   // Sat
]

const NOTIFICATION_TEMPLATES = [
  {
    name: 'booking_confirmation',
    channel: 'email',
    subject: 'Your Appointment is Confirmed – {{booking_id}}',
    body: `Hi {{user_name}},

Your appointment has been confirmed!

📋 Booking ID   : {{booking_id}}
🏠 Section      : {{section_name}}
📅 Date         : {{appointment_date}}
🕐 Time         : {{appointment_time}}

Please arrive 10 minutes early. Bring this confirmation email or quote your Booking ID at the reception.

Need to reschedule or cancel? Reply to this email or visit your account on our website.

Warm regards,
Aparna Unispace Team`,
    is_active: true
  },
  {
    name: 'reminder_24h',
    channel: 'email',
    subject: 'Reminder: Your appointment is tomorrow – {{booking_id}}',
    body: `Hi {{user_name}},

This is a friendly reminder that you have an appointment tomorrow.

📋 Booking ID   : {{booking_id}}
🏠 Section      : {{section_name}}
📅 Date         : {{appointment_date}}
🕐 Time         : {{appointment_time}}

See you soon!
Aparna Unispace Team`,
    is_active: true
  },
  {
    name: 'reminder_2h',
    channel: 'email',
    subject: 'Your appointment is in 2 hours – {{booking_id}}',
    body: `Hi {{user_name}},

Your appointment at Aparna Unispace is in 2 hours.

📋 Booking ID   : {{booking_id}}
🏠 Section      : {{section_name}}
🕐 Time         : {{appointment_time}}

We look forward to seeing you!
Aparna Unispace Team`,
    is_active: true
  },
  {
    name: 'booking_cancellation',
    channel: 'email',
    subject: 'Appointment Cancelled – {{booking_id}}',
    body: `Hi {{user_name}},

Your appointment ({{booking_id}}) for {{section_name}} on {{appointment_date}} at {{appointment_time}} has been cancelled.

Reason: {{cancellation_reason}}

You can book a new appointment at any time on our website.

Aparna Unispace Team`,
    is_active: true
  }
]

exports.seed = async (knex) => {
  // Clear existing data in reverse dependency order
  await knex('notification_log').del()
  await knex('notification_templates').del()
  await knex('appointment_feedback').del()
  await knex('appointments').del()
  await knex('appointment_slots').del()
  await knex('section_capacity').del()
  await knex('section_schedules').del()
  await knex('sections').del()

  // Insert sections
  const sectionIds = await knex('sections').insert(SECTIONS).returning('id')

  // For each section, insert the weekly schedule
  const scheduleRows = []
  const ids = sectionIds.map ? sectionIds.map((r) => r.id || r) : sectionIds

  ids.forEach((sectionId) => {
    SCHEDULE_TEMPLATE.forEach((sched) => {
      scheduleRows.push({ section_id: sectionId, ...sched })
    })
  })
  await knex('section_schedules').insert(scheduleRows)

  // Insert notification templates
  await knex('notification_templates').insert(NOTIFICATION_TEMPLATES)
}
