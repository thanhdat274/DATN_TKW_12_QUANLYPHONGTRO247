const express = require('express');

const { requireSignin } = require('../controllers/auth.controller');
const {
  getAllStatusRoom,
  getListContractExpiration,
  getAllBillServiceByYear,
  getBillServiceByYear,
  getDetailBillServiceByMonthYear,
  getStatisHomePage,
  StatisticalPayment,
} = require('../controllers/statistical.controller');
const { getCountHouseAndRoom, getDataFullPayment, getAllBillData } = require('../helpers/statistical.helper');
const { checkIdHouse, checkYearParam, checkIdRoomParam, checkNameService, checkMonthParam } = require('../validator');

const router = express.Router();

router.param('idHouse', checkIdHouse);

router.get('/statistical/:idHouse/room-status', checkIdHouse, getListContractExpiration, getAllStatusRoom);
router.get('/statistical/:idHouse/:year/:name/get-all-bill-service', getAllBillServiceByYear);
router.get(
  '/statistical/get-bill-service/:idRoom/:name/:year',
  checkIdRoomParam,
  checkNameService,
  checkYearParam,
  getBillServiceByYear,
);

router.get(
  '/statistical/get-detail-bill-service/:idRoom/:name/:month/:year',
  checkIdRoomParam,
  checkNameService,
  checkMonthParam,
  checkYearParam,
  getDetailBillServiceByMonthYear,
);

router.get(
  '/statistical/get-statical-payment/:idHouse/:year',
  checkIdHouse,
  checkYearParam,
  getDataFullPayment,
  getAllBillData,
  StatisticalPayment,
);

router.get('/statistical/get-statis', getCountHouseAndRoom, getStatisHomePage);

module.exports = router;
