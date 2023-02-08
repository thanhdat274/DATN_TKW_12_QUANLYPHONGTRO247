import { errorHandler } from '../helpers/dbErrorsHandler';
const Room = require('../models/room.model');
const nodemailer = require('nodemailer');
const Booking = require('../models/booking.model');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

const emailSMTP = process.env.EMAIL_SMTP;
const passEmail = process.env.KEY_EMAIL;

const smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailSMTP,
    pass: passEmail,
  },
});
let handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('./lib/templates/'),
  extName: '.html',
};
smtpTransport.use('compile', hbs(handlebarsOptions));

export const create = async (req, res) => {
  const { idRoom, idHouse, fullName, email, cardNumber, phoneNumber, bookMoney, expectTime } = req.body;
  const data = new Booking({
    idRoom,
    idHouse,
    fullName,
    email,
    cardNumber,
    phoneNumber,
    bookMoney,
    expectTime,
  });

  await Booking.find({ idHouse: idHouse, idRoom: idRoom }, async (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: 'Có lỗi sảy ra !',
      });
    }

    if (docs.length) {
      return res.status(400).json({
        message: 'Phòng này đã có người đặt cọc !',
      });
    } else {
      await data.save((err, docs) => {
        if (err) {
          return res.status(400).json({
            message: 'Đặt phòng trước không thành công !',
          });
        } else {
          return res.status(200).json({
            message: 'Đặt cọc phòng thành công !',
            data: docs,
          });
        }
      });
    }
  });
};

export const listBookingByHouse = async (req, res) => {
  await Booking.find({ idHouse: req.params.idHouse }, (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: 'Có lỗi trong lúc lấy danh sách !',
      });
    } else {
      return res.status(200).json({
        data: docs,
      });
    }
  });
};

export const showDetailBooking = async (req, res) => {
  await Booking.findById(req.params.idBooking, (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: 'Có lỗi sảy ra !',
      });
    }
    if (!docs) {
      return res.status(400).json({
        message: 'Không có thông tin của người đặt trước!',
      });
    } else {
      return res.status(200).json({
        data: docs,
      });
    }
  });
};

export const updateBooking = async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.idBooking, { ...req.body }, (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: errorHandler(err),
      });
    } else {
      return res.status(200).json({
        message: 'Cập nhật đặt cọc phòng thành công!',
        docs: docs,
      });
    }
  });
};

export const AcceptTakeRoom = async (req, res) => {
  console.log('req.body', req.body);
  const { phoneNumber, cardNumber, deposit } = req.body;
  const { fullName, email, cardNumber: cardNumberOfData } = req.dataBooking;

  const newDataOfRoom = {
    emailOfAuth: email,
    listMember: [
      {
        memberName: fullName,
        cardNumber: cardNumber || cardNumberOfData,
        status: true,
        phoneNumber: req.dataBooking.phoneNumber ? req.dataBooking.phoneNumber : phoneNumber,
      },
    ],
    contract: {
      infoTenant: {
        name: fullName,
        cardNumber: cardNumber || cardNumberOfData,
        phoneNumber: req.dataBooking.phoneNumber ? req.dataBooking.phoneNumber : phoneNumber,
        deposit: Number(deposit),
      },
    },
  };
  await Room.findByIdAndUpdate(req.body.idRoom, { ...newDataOfRoom }, async (err, docs) => {
    if (err || !docs) {
      return res.status(400).json({
        message: 'Tiếp nhận người dùng không thành công!',
      });
    } else {
      const data = {
        to: email,
        from: emailSMTP,
        template: 'accept-take-room',
        subject: 'Tiếp nhận phòng trọ',
        context: {
          name: fullName,
          codeRoom: docs.subName,
          nameRoom: docs.name,
          linkFE: process.env.BASE_FE,
        },
      };

      smtpTransport.sendMail(data);

      await Booking.findByIdAndRemove(req.body.idBooking);

      return res.status(200).json({
        data: docs,
        message: 'Tiếp nhận người dùng thành công!',
      });
    }
  });
};

export const removeBooking = async (req, res) => {
  await Booking.findByIdAndRemove(req.params.idBooking, (err, docs) => {
    if (err || !docs) {
      return res.status(400).json({
        message: 'Xóa đặt cọc không thành công!',
      });
    } else {
      return res.status(200).json({
        message: 'Xóa đặt cọc thành công!',
      });
    }
  });
};
