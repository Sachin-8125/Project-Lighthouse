const express = require('express');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const { authValidation } = require('../validations');
const { authController } = require('../controllers');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/profile', auth(), authController.getProfile);

module.exports = router;
