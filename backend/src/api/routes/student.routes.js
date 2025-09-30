const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { studentValidation } = require('../validations');
const { studentController } = require('../controllers');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(studentValidation.createStudent), studentController.createStudent)
    .get(auth(), studentController.getStudents);

router
    .route('/:studentId')
    .get(auth(), studentController.getStudent)

router
    .route('/:studentId/scores')
    .post(auth(), validate(studentValidation.addScore), studentController.addScore)

module.exports = router;