import express from 'express';
const router = express.Router();

import { listHistories } from '../controllers/history.controller';
import { requireSignin } from '../controllers/auth.controller';

router.get('/list-histories/:idAuth/:idHouse', requireSignin, listHistories);

module.exports = router;
