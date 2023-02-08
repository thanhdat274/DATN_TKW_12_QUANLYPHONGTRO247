import express, { Router } from 'express';
const router = express.Router();

import {
  AcceptTakeRoom,
  create,
  listBookingByHouse,
  removeBooking,
  showDetailBooking,
} from '../controllers/booking.controller';
import { requireSignin } from '../controllers/auth.controller';
import {
  checkCardNumber,
  checkCardNumberAccept,
  checkEmptyField,
  checkStatusRoom,
  getDataBooking,
} from '../validator/booking.validator';
import { checkIdBooking, checkIdBookingBody, checkIdHouse, checkIdRoomBody } from '../validator/index';

router.param('idHouse', checkIdHouse);

router.post('/booking/create', requireSignin, checkEmptyField, checkCardNumber, create);
router.get('/booking/list/:idHouse', requireSignin, checkIdHouse, listBookingByHouse);
router.get('/booking/get-detail/:idBooking', requireSignin, checkIdBooking, showDetailBooking);
router.post(
  '/booking/accept-take-room',
  requireSignin,
  checkIdRoomBody,
  checkIdBookingBody,
  checkStatusRoom,
  getDataBooking,
  checkCardNumberAccept,
  AcceptTakeRoom,
);

router.delete('/booking/remove-booking/:idBooking', requireSignin, checkIdBooking, removeBooking);

module.exports = router;
