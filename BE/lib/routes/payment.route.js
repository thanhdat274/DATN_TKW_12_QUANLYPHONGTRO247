const express = require('express');
const {
  CreateBillPayment,
  CheckReturnPayment,
  getPaymentMethodOfHouse,
  getInfoPaymentOfHouse,
  getListBill,
  filterBillPayment,
} = require('../controllers/payment.controller');
const router = express.Router();

router.get('/payment/setting/:idHouse', getInfoPaymentOfHouse);
router.get('/payment/list/:idHouse', getListBill);
router.post('/payment/create-payment/:idHouse', getPaymentMethodOfHouse, CreateBillPayment);
router.post('/payment/payment-return/:idHouse', getPaymentMethodOfHouse, CheckReturnPayment);
router.post('/payment/filter', filterBillPayment);

module.exports = router;
