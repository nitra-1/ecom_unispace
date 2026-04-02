const router = require('express').Router()
const ctrl = require('../controllers/sectionsController')
const { authenticate, requireAdmin } = require('../middleware/auth')

// Public – customers can browse sections
router.get('/', ctrl.listSections)
router.get('/:id', ctrl.getSection)
router.get('/:id/schedule', ctrl.getSchedule)

// Admin-only
router.post('/', authenticate, requireAdmin, ctrl.createSection)
router.put('/:id', authenticate, requireAdmin, ctrl.updateSection)
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteSection)
router.put('/:id/schedule', authenticate, requireAdmin, ctrl.updateSchedule)
router.get('/:id/capacity', authenticate, requireAdmin, ctrl.getCapacity)
router.post('/:id/capacity', authenticate, requireAdmin, ctrl.setCapacity)

module.exports = router
