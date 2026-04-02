const router = require('express').Router()
const ctrl = require('../controllers/notificationsController')
const { authenticate, requireAdmin } = require('../middleware/auth')

router.use(authenticate, requireAdmin)

router.get('/templates', ctrl.listTemplates)
router.get('/templates/:id', ctrl.getTemplate)
router.put('/templates/:id', ctrl.updateTemplate)
router.get('/log', ctrl.getNotificationLog)

module.exports = router
