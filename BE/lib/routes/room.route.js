import express from 'express';
const router = express.Router();

import {
  getRoomById,
  updateRoom,
  addRoom,
  listRoom,
  removeById,
  addMember,
  removeMember,
  getNameRoom,
  getRoomBySubName,
  updateCodeRoom,
  updateInfoMember,
  liquidationRoom,
  changeValueContract,
  changeMemberToNewRoom,
  CreateNewDataInNewRoom,
  changeOneMemberToNewRoom,
  removeOldDataMemberInOldRoom,
  reviewAfterLiquidation,
} from '../controllers/room.controller';
import { requireSignin } from '../controllers/auth.controller';
import { checkIdRoomParam, checkIdUser } from '../validator';
import {
  checkBeforAddRoom,
  checkEmptyCodeRoom,
  checkEmptyHouse,
  checkFieldRoom,
  checkRoleMember,
} from '../validator/room.validator';

router.param('idRoom', checkIdRoomParam);
router.param('idAuth', checkIdUser);

router.get('/room/getName/:idRoom', getNameRoom);
router.get('/room/get-data/:subname', getRoomBySubName);
router.get('/room/:idRoom', getRoomById);
router.get('/list-room/:idAuth/:idHouse', requireSignin, listRoom);

router.post('/room/add', requireSignin, checkFieldRoom, checkEmptyHouse, checkBeforAddRoom, addRoom);
router.post('/room/edit-code-room', requireSignin, checkEmptyCodeRoom, updateCodeRoom);
router.post('/room/review', reviewAfterLiquidation);
router.post('/room/liquidation', checkEmptyHouse, liquidationRoom);
router.post('/room/change-all-member', CreateNewDataInNewRoom, changeMemberToNewRoom);
router.post('/room/change-one-member', removeOldDataMemberInOldRoom, changeOneMemberToNewRoom);
router.post('/room/:idRoom/member/add', requireSignin, addMember);
router.post('/room/:idRoom/member/remove', requireSignin, removeMember);
router.post('/room/:idRoom/updateInfoMember', checkRoleMember, updateInfoMember);

router.put('/room/update/:idRoom', requireSignin, updateRoom);

router.delete('/room/remove/:idRoom', requireSignin, removeById);

module.exports = router;
