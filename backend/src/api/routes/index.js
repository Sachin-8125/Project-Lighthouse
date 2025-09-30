const express = require('express');
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const alertRoutes = require('./alert.routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/students',
    route: studentRoutes,
  },
  {
    path: '/alerts',
    route: alertRoutes,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;