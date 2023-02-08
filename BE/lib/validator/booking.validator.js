const Room = require('../models/room.model');
const Booking = require('../models/booking.model');

export const checkEmptyField = (req, res, next) => {
  const { idRoom, idHouse, fullName, email, phoneNumber, bookMoney, expectTime } = req.body;

  if (!idRoom || !idHouse || !fullName || !email || !phoneNumber || !bookMoney || !expectTime) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
  } else {
    next();
  }
};

export const checkCardNumber = async (req, res, next) => {
  const { email, idHouse } = req.body;

  if (!email.length) {
    console.log(email.length);
    next();
  }
  if (email.length) {
    await Room.findOne({ emailOfAuth: email, idHouse }, (err, docs) => {
      if (err || !docs) {
        next();
      }
      if (docs) {
        res.status(400).json({
          message: 'Email đã được dùng để đăng kí phòng !',
        });
      }
    });
  }
};

export const checkStatusRoom = async (req, res, next) => {
  await Room.findById(req.body.idRoom, (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: 'Có lỗi sảy ra!',
      });
    }
    if (!docs) {
      return res.status(400).json({
        message: 'Phòng không tồn tại!',
      });
    } else {
      if (docs.status == false) {
        return res.status(400).json({
          message: 'Phòng đang bảo trì , không thể nhận phòng này hiện tại',
        });
      }
      if (docs.listMember.length) {
        return res.status(400).json({
          message: 'Phòng đang có người sử dụng , không thể chuyển người khác vào ở!',
        });
      } else {
        next();
      }
    }
  });
};

export const getDataBooking = async (req, res, next) => {
  await Booking.findById(req.body.idBooking, (err, docs) => {
    if (err || !docs) {
      return res.status(400).json({
        message: 'Đặt cọc phòng không thành công!',
      });
    } else {
      req.dataBooking = docs;
      next();
    }
  });
};

export const checkCardNumberAccept = async (req, res, next) => {
  const { cardNumber } = req.body;
  const { cardNumber: cardNumberOfData } = req.dataBooking;

  if (cardNumber || cardNumberOfData.length) {
    next();
  } else {
    return res.status(400).json({
      message: 'Hãy nhập bổ sung CNND hoặc CCCD !',
    });
  }
};
