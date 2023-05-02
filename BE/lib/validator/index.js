var check = require('express-validator');
var validationResult = require('express-validator');

exports.userSignupValidator = (req, res, next) => {
  // console.log(req);
  // req.check('name', 'Name is required').notEmpty();
  // req
  //   .check('email', 'Email must be between 3 to 32')
  //   .matches(/.+\@.+\..+/)
  //   .withMessage('Email must contains @')
  //   .isLength({
  //     min: 4,
  //     max: 32,
  //   });
  // req.check('password', 'Password is required').notEmpty();
  // req
  //   .check('password')
  //   .isLength({ min: 6 })
  //   .withMessage('Password must contain at least 6 characters')
  //   .matches(/\d/)
  //   .withMessage('Password must contain a number');

  // const errors = validationResult(req);

  // if (errors) {
  //   console.log(req);
  //   // const firstError = errors.map((error) => error.msg)[0];
  //   return res.status(400).json({ message: errors });
  // }
  next();
};

export const checkIdHouse = (req, res, next) => {
  if (!req.params.idHouse) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idHouse.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id nhà không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdRoomParam = (req, res, next) => {
  if (!req.params.idRoom) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idRoom.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id phòng không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdBill = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id bill không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdRoomBody = (req, res, next) => {
  if (!req.body.idRoom) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.body.idRoom.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id phòng không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdService = (req, res, next) => {
  if (!req.params.idService) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idService.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id dịch vụ không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdUser = (req, res, next) => {
  if (!req.params.idAuth) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idAuth.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id người dùng không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdBillService = (req, res, next) => {
  if (!req.params.idUser) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idUser.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id hóa đơn dịch vụ không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdBooking = (req, res, next) => {
  if (!req.params.idBooking) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.idBooking.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id đặt trước không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkIdBookingBody = (req, res, next) => {
  if (!req.body.idBooking) {
    return res.status(400).json({
      message: 'Thiếu id booking',
    });
  }

  if (!req.body.idBooking.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id đặt trước không đúng định dạng',
    });
  } else {
    next();
  }
};

export const checkYearParam = (req, res, next) => {
  if (!req.params.year) {
    return res.status(400).json({
      message: 'Thiếu năm để lấy dữ liệu!',
    });
  }

  if (req.params.year < 1) {
    return res.status(400).json({
      message: 'Nhập năm không hợp lệ!',
    });
  } else {
    next();
  }
};

export const checkMonthParam = (req, res, next) => {
  if (!req.params.month) {
    return res.status(400).json({
      message: 'Thiếu tháng để lấy dữ liệu!',
    });
  }

  if (req.params.year < 1) {
    return res.status(400).json({
      message: 'Nhập tháng không hợp lệ!',
    });
  } else {
    next();
  }
};

export const checkNameService = (req, res, next) => {
  if (!req.params.name) {
    return res.status(400).json({
      message: 'Thiếu tên dịch vụ!',
    });
  }

  if (req.params.name == '') {
    return res.status(400).json({
      message: 'Vui lòng nhập tên dịch vụ !',
    });
  } else {
    next();
  }
};

export const toLowerCaseNonAccentVietnamese = (str) => {
  if (str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
    str = str.replace(/\u02C6|\u0306|\u031B/g, '');
    str = str.replace(' ', '_');
    return str;
  } else {
    return '';
  }
};
