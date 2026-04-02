const router = require('express').Router()
const ctrl = require('../controllers/appointmentsController')
const { authenticate, requireAdmin } = require('../middleware/auth')

// Authenticated routes (customer or admin)
router.get('/', authenticate, ctrl.listAppointments)
router.get('/:id', authenticate, ctrl.getAppointment)
router.post('/', authenticate, ctrl.bookAppointment)
router.put('/:id/reschedule', authenticate, ctrl.rescheduleAppointment)
router.delete('/:id', authenticate, ctrl.cancelAppointment)
router.post('/:id/feedback', authenticate, ctrl.submitFeedback)

// Admin-only routes
router.put('/:id/status', authenticate, requireAdmin, ctrl.updateStatus)
router.post('/:id/force', authenticate, requireAdmin, ctrl.forceBookAppointment)

module.exports = router
