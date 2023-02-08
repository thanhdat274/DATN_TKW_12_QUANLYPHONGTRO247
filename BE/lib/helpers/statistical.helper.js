const Room = require('../models/room.model');
const House = require('../models/house.model');
const User = require('../models/user.model');
const Bill = require('../models/bill.model');

function generateTestArray(data) {
  const result = [];
  for (let i = 1; i < 13; ++i) {
    result.push(
      data.filter((perfectitem) => {
        return i == perfectitem.month;
      }),
    );
  }
  return result;
}

function funSumValue(data) {
  const result = [];
  for (let i = 0; i < 12; ++i) {
    result.push(
      data[i].reduce((prev, curr) => prev + curr.invoiceService.reduce((prevC, currC) => prevC + currC.amount, 0), 0),
    );
  }
  return result;
}

export const getCountHouseAndRoom = async (req, res, next) => {
  try {
    await House.find({}, (err, docs) => {
      if (err) {
        req.countHouse = 0;
      } else {
        req.countHouse = docs.length;
      }
    });
  } catch (error) {
    req.countHouse = 0;
  }

  try {
    await Room.find({}, (err, docs) => {
      if (err) {
        req.countRoom = 0;
      } else {
        req.countRoom = docs.length;
      }
    });
  } catch (error) {
    req.countRoom = 0;
  }

  try {
    await User.find({}, (err, docs) => {
      if (err) {
        req.countUser = 0;
      } else {
        req.countUser = docs.length;
      }
    });
  } catch (error) {
    req.countUser = 0;
  }

  next();
};

export const getDataFullPayment = async (req, res, next) => {
  await Bill.find({ idHouse: req.params.idHouse, year: req.params.year, paymentStatus: 2 }, (err, docs) => {
    if (docs) {
      req.FullPayment = funSumValue(generateTestArray(docs));
      next();
    } else {
      req.FullPayment = 0;
      next();
    }
  });
};

export const getAllBillData = async (req, res, next) => {
  await Bill.find({ idHouse: req.params.idHouse, year: req.params.year }, (err, docs) => {
    if (docs) {
      req.AllPayment = funSumValue(generateTestArray(docs));
      next();
    } else {
      req.AllPayment = 0;
      next();
    }
  });
};
