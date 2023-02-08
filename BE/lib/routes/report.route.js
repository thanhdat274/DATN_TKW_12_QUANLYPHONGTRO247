const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createReport,
  readReportHouse,
  updateReport,
  readReportRoom,
  removeReport,
  countReportNotComp,
} = require('../controllers/report.controller');
const { requireSignin } = require('../controllers/auth.controller');
const { checkIdHouse } = require('../validator');

const router = express.Router();
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
  message: 'Bạn gửi quá nhiều thông báo tới chủ nhà!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/report/create', createAccountLimiter, createReport);
router.get('/report/list-house/:id', requireSignin, readReportHouse);
router.get('/report/list-room/:id', readReportRoom);
router.put('/report/update/:id', requireSignin, updateReport);
router.delete('/report/remove/:id', removeReport);
router.get('/report/count-not-complete/:idHouse', checkIdHouse, countReportNotComp);

module.exports = router;
