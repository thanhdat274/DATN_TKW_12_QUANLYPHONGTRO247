const express = require('express');
const router = express.Router();

const { saveBillLiquidation, getListBillLiqui, updateBillLiqui } = require('../controllers/billLiquidation.controller');

router.get('/bill-liqui/:idHouse', getListBillLiqui);
router.post('/bill-liqui/create', saveBillLiquidation);
router.patch('/bill-liqui/update/:idHouse', updateBillLiqui);

module.exports = router;
