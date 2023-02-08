const House = require('../models/house.model');
import { toLowerCaseNonAccentVietnamese } from '../validator';
import Room from '../models/room.model';
const { v1: uuidv1 } = require('uuid');

export const checkFieldRoom = (req, res, next) => {
  try {
    if (
      !req.body.name ||
      !req.body.maxMember ||
      !req.body.idAuth ||
      !req.body.idHouse ||
      !req.body.price ||
      !req.body.area
    ) {
      return res.status(400).json({
        message: 'Phải điền đầy đủ thông tin bắt buộc',
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};
export const checkEmptyHouse = async (req, res, next) => {
  try {
    if (req.body.name) {
      await House.findById(req.body.idHouse, (err, house) => {
        if (err || !house) {
          return res.status(400).json({
            message: 'Nhà không tồn tại',
          });
        } else {
          function randomIntFromInterval(min, max) {
            // min and max included
            return Math.floor(Math.random() * (max - min + 1) + min);
          }
          const format2 = toLowerCaseNonAccentVietnamese(req.body.name);
          const matches2 = format2.match(/\b(\w)/g);
          const newNameRoom = matches2.join('');

          const format1 = toLowerCaseNonAccentVietnamese(house.name);
          const matches1 = format1.match(/\b(\w)/g);
          const newNameHouse = matches1.join('');
          const newName = `${newNameHouse}_${newNameRoom}_${uuidv1().slice(-5)}_${randomIntFromInterval(
            1,
            1000,
          )}_${randomIntFromInterval(1, 1000)}`;

          req.nameRoom = newName;
          next();
        }
      });
    } else {
      return res.status(400).json({
        message: 'Thiếu thông tin!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

export const checkBeforAddRoom = async (req, res, next) => {
  try {
    if (req.body.idHouse) {
      await Room.findOne({ idHouse: req.body.idHouse, name: req.body.name }, async (err, rooms) => {
        if (rooms) {
          return res.status(400).json({ message: 'Tên phòng đã tồn tại !' });
        } else {
          next();
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

export const checkEmptyCodeRoom = async (req, res, next) => {
  const ValidatorCodeRoom = /^[a-zA-Z0-9&@.$%\-_,():;`]+$/;

  if (req.body.idRoom || req.body.codeRoom) {
    await Room.find({ subName: req.body.codeRoom }, (err, docs) => {
      if (err) {
        return res.status(400).json({
          message: 'Có lỗi sảy ra',
        });
      }
      if (docs.length) {
        return res.status(400).json({
          message: 'Mã đăng nhập của người thuê đã tồn tại',
        });
      }
      if (!docs.length) {
        if (ValidatorCodeRoom.test(req.body.codeRoom)) {
          next();
        } else {
          return res.status(400).json({
            message: 'Mã đăng nhập của người dùng không đúng định dang!',
          });
        }
      } else {
        return res.status(400).json({
          message: 'Có lỗi sảy ra',
        });
      }
    });
  } else {
    return res.status(400).json({
      message: 'Thiếu mã đăng nhập',
    });
  }
};

export const checkRoleMember = async (req, res, next) => {
  try {
    if (req.body.status == 'true') {
      await Room.findById(req.params.idRoom, async (err, docs) => {
        if (!docs || err) {
          return res.status(400).json({
            message: 'Phòng không tồn tại!',
          });
        } else {
          const { listMember: tempListMember } = { ...docs.toJSON() };

          const checkData = tempListMember.find((item) => item.status == true);
          if (checkData) {
            if (checkData._id != req.body.id) {
              return res.status(400).json({
                message: 'Phòng đã có người đại diện!',
              });
            } else {
              next();
            }
          } else {
            next();
          }
        }
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Cập nhật thành viên không thành công!',
    });
  }
};
