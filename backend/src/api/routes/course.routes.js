const express = require('express');
const { courseController } = require('../controllers');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth(), courseController.getCourses);

module.exports = router;
