const House = require('../models/house.model');
const Payment = require('../models/payment.model');
const Bill = require('../models/bill.model');

const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:3000/manager/ternant/payment/return-payment';

export const getInfoPaymentOfHouse = async (req, res) => {
  try {
    await House.findById(req.params.idHouse, (err, data) => {
      if (err || !data) {
        return res.status(400).json({
          message: 'Không tìm thấy thông tin thanh toán của nhà này!',
        });
      } else {
        return res.status(200).json({
          data: data.paymentInformation,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

export const getPaymentMethodOfHouse = async (req, res, next) => {
  try {
    await House.findById(req.params.idHouse, (err, docs) => {
      if (err || !docs) {
        return res.status(400).message({
          message: 'Không thể thanh toán!',
        });
      } else {
        if (docs.paymentInformation.TmnCode && docs.paymentInformation.HashSecret) {
          req.info = docs.paymentInformation;
          next();
        } else {
          return res.status(400).json({ message: 'Chủ nhà chưa cập nhật thông tin thanh toán!' });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

export const CreateBillPayment = async (req, res) => {
  var ipAddr = '127.0.0.1';

  var dateFormat = require('dateformat');

  var tmnCode = req.info.TmnCode;
  var secretKey = req.info.HashSecret;
  var vnpUrl = vnp_Url;
  var returnUrl = vnp_ReturnUrl;

  var date = new Date();

  var createDate = dateFormat(date, 'yyyymmddHHmmss');
  var orderId = dateFormat(date, 'HHmmss');
  var amount = req.body.amount;
  var bankCode = req.body.bankCode;

  var orderInfo = req.body.orderDescription;
  var orderType = req.body.orderType;
  var locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  console.log('vnpUrl', vnpUrl);
  return res.status(200).json({
    redirect: vnpUrl,
  });
};

export const CheckReturnPayment = async (req, res) => {
  var vnp_Params = req.body;

  var secureHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  vnp_Params = sortObject(vnp_Params);

  var secretKey = req.info.HashSecret;

  var querystring = require('qs');

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    const { vnp_OrderInfo: dataPayment } = req.body;

    try {
      const newDataPayment = dataPayment.split(',');

      const newPayment = new Payment({
        idHouse: newDataPayment[4],
        idRoom: newDataPayment[3],
        month: newDataPayment[0],
        year: newDataPayment[1],
        value: newDataPayment[2],
        content: `Phòng ${newDataPayment[5]} đã thanh toán số tiền là ${newDataPayment[2]} cho hóa đơn tháng ${newDataPayment[0]} năm ${newDataPayment[1]} `,
      });

      await newPayment.save();
      if (newDataPayment[6]) {
        await Bill.findByIdAndUpdate(
          newDataPayment[6],
          { paidAmount: newDataPayment[2], paymentStatus: 2 },
          async (err, docs) => {
            if (docs) {
              await Bill.findOneAndUpdate(
                {
                  idRoom: newDataPayment[3],
                  month: newDataPayment[0] == 12 ? '1' : (Number(newDataPayment[0]) + 1).toString(),
                  year: newDataPayment[0] == 12 ? (Number(newDataPayment[1]) + 1).toString() : newDataPayment[1],
                },
                { debt: 0 },
              );
            }
          },
        );
      }
    } catch (error) { }

    return res.status(200).json({
      message: 'Thanh toán thành công!',
      // code: '97',
    });
  } else {
    return res.status(200).json({
      message: 'Mã xác thực thanh toán không đúng , xin vui lòng kiểm tra lại!',
      // code: '97',
    });
  }
};

export const getListBill = async (req, res) => {
  try {
    await Payment.find({ idHouse: req.params.idHouse }, (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Không thể tìm kiếm danh sách thanh toán!',
        });
      } else {
        return res.status(200).json({
          data: data && data.reverse(),
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

export const filterBillPayment = async (req, res) => {
  try {
    const { month, year, idRoom } = req.body;

    await Payment.find({ month: month, year: year, idRoom: idRoom }, (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Lọc không thành công!',
        });
      } else {
        return res.status(200).json({
          data: data && data.reverse(),
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};
