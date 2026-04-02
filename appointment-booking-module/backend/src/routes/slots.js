const router = require('express').Router()
const ctrl = require('../controllers/slotsController')
const { authenticate, requireAdmin } = require('../middleware/auth')

// Public – customers need to see slot availability
router.get('/', ctrl.getSlots)

// Admin-only
router.post('/generate', authenticate, requireAdmin, ctrl.generateSlots)
router.put('/:id/block', authenticate, requireAdmin, ctrl.blockSlot)
router.put('/:id/unblock', authenticate, requireAdmin, ctrl.unblockSlot)

module.exports = router
