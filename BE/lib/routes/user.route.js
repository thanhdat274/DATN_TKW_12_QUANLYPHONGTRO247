import express from 'express';
const router = express.Router();

import { read, update, checkIdUser } from '../controllers/user.controller';
import { requireSignin, isAdmin, isAuth } from '../controllers/auth.controller';
import { CheckReturnPaymentUpdateAcc, CreatePaymentUpdateAcc } from '../controllers/updateAccount.controller';

router.param('userId', checkIdUser);

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get('/user/:userId', requireSignin, read);
router.put('/user/:userId', requireSignin, update);
router.post('/user/update-account', CreatePaymentUpdateAcc);
router.post('/user/payment-return', CheckReturnPaymentUpdateAcc);

module.exports = router;
