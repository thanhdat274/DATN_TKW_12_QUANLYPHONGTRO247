const express = require('express');
const {
  checkRequire,
  editBillService,
  checkAuth,
  checkValue,
  addBillService,
  getListService,
  // createBillForAllRoom,
  getServiceHouse,
  getAllBillByMonthYear,
  createAllBillForHouse,
} = require('../controllers/billService.controller');
const { requireSignin } = require('../controllers/auth.controller');
const { checkIdHouse, checkIdBillService } = require('../validator');

const router = express.Router();

router.param('idBillService', checkIdBillService);
router.param('idHouse', checkIdHouse);

router.post('/bill/create', requireSignin, checkRequire, addBillService);
router.patch('/bill/update/:idBillService', requireSignin, editBillService);
router.get('/bill/get-list/:idHouse/:type/:month/:year', requireSignin, getListService);
router.get('/bill/:type/:idHouse/:month/:year', getAllBillByMonthYear);
router.post('/bill/create-for-house', getServiceHouse, createAllBillForHouse);

module.exports = router;
