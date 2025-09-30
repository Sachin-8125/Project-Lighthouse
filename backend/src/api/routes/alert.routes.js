const express = require('express');
const { alertController } = require('../controllers');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router
    .route('/')
    .get(auth(), alertController.getAlerts);

router
    .route('/:alertId/status')
    .patch(auth(), alertController.updateAlertStatus);


module.exports = router;