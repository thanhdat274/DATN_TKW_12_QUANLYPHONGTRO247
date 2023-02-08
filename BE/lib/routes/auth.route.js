const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

import { signup, signin, signout, forgot_password, reset_password, confirmEmail, resendLink, changePassword } from '../controllers/auth.controller';

export const checkRules = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
router.post(
  '/signup',
  [
    check('name', 'Name is required').isLength({ min: 3, max: 50 }),
    check('email', 'Email must be between 3 to 32').isEmail(),
    check('password', 'Password is required').isLength({ min: 8, max: 50 }),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must contain at least 6 characters')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
  ],
  checkRules,
  signup,
);
router.post('/signin', signin);
router.get('/signout', signout);

router.get('/confirmation/:email/:token', confirmEmail);
router.post('/resend', resendLink);
router.put('/change-password', changePassword);
router.post('/forgot-password', forgot_password);
router.post('/reset_password', reset_password);

module.exports = router;
