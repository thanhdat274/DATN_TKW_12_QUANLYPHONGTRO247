const express = require('express');
const {
  createBillRoom,
  getBillAll,
  getBillId,
  read,
  removeBill,
  createBillHouse,
  updateBill,
  getBillIdRoom,
  updateDebtRoomForHouse,
  addAllBillForHouse,
  B1InitBill,
  B2InitBill,
} = require('../controllers/bill.controller');
const { requireSignin } = require('../controllers/auth.controller');
const { checkIdHouse, checkIdBill } = require('../validator');

const router = express.Router();
router.param('id', getBillId);

router.param('idHouse', checkIdHouse);
router.post('/bill-house-all/:idHouse', B1InitBill);
router.post('/bill-room', B2InitBill);
router.get('/bill-all/list/:idAuth/:idHouse/:year/:month', requireSignin, getBillAll);
router.get('/bill/detail/:id', requireSignin, checkIdBill, read);
router.delete('/bill/delete/:id', requireSignin, removeBill);

router.put('/bill-update/:id', requireSignin, updateBill);
router.get('/bill-room/:idRoom/:year/:month', getBillIdRoom);

module.exports = router;
