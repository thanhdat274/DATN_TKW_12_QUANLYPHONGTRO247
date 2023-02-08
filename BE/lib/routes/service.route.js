const express = require('express');
const {
  editService,
  checkHouse,
  addService,
  listServiceByIdHouse,
  removeService,
  getServiceById,
  getOneService,
  getHouseByIdService,
} = require('../controllers/service.controller');
const { requireSignin } = require('../controllers/auth.controller');
const { checkIdHouse, checkIdService } = require('../validator');

const router = express.Router();

router.param('idHouse', checkIdHouse);
router.param('idService', checkIdService);

router.get('/service-house/:idHouse', listServiceByIdHouse);
router.get('/service/:idService', requireSignin, getServiceById);
router.get('/service/get-service/:idHouse/:name', getOneService);
router.delete('/service/remove/:idHouse/:idService', requireSignin, removeService);

router.post('/service/create', requireSignin, addService);
router.patch('/service/update/:idService', requireSignin, getHouseByIdService, editService);

module.exports = router;
