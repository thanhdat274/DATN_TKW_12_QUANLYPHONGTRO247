const House = require('../models/house.model');
const Service = require('../models/service.model');
const Room = require('../models/room.model');
const Bill = require('../models/bill.model');
const BillService = require('../models/billService.model');
const _ = require('lodash');

const create = async (req, res) => {
  const uid = req.profile._id;
  const data = new House({
    name: req.body.name,
    address: req.body.address,
    idAuth: uid,
  });
  if (!uid) {
    return res.status(400).json({
      message: 'User không tồn tại',
    });
  }
  if (!data.name || !data.address) {
    return res.status(400).json({
      message: 'Nhập đầy đủ thông tin',
    });
  }
  data.save(async (err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        message: 'Không thể thêm',
      });
    } else {
      const addWaterService = new Service({
        idHouse: data._id,
        label: 'Nước',
        name: 'nuoc',
        price: 1,
        unit: 'VNĐ/Khối',
        type: true,
        doNotDelete: true,
      });

      const addElectricService = new Service({
        idHouse: data._id,
        label: 'Điện',
        name: 'dien',
        price: 1,
        unit: 'VNĐ/Số',
        type: true,
        doNotDelete: true,
      });

      await addWaterService.save();
      await addElectricService.save();

      return res.status(200).json(data);
    }
  });
};

const list = (req, res) => {
  const id = req.profile._id;
  House.find({ idAuth: id }, (err, data) => {
    if (err) {
      return res.status(400).json({ message: 'Không tìm thấy dữ liệu' });
    }
    return res.json({ data });
  });
};

const houseByID = async (req, res, next, id) => {
  await House.findById(id, (err, house) => {
    if (err || !house) {
      return res.status(400).json({
        message: 'Không tìm thấy dữ liệu',
      });
    }
    req.house = house;
    next();
  });
};

const read = (req, res) => {
  return res.json(req.house);
};

const remove = async (req, res) => {
  let house = req.house;
  await house.remove(async (err, data) => {
    if (err) {
      return res.status(400).json({
        message: 'Xóa không thành công',
      });
    } else {
      await Room.deleteMany({ idHouse: data._id });
      await Bill.deleteMany({ idHouse: data._id });
      await BillService.deleteMany({ idHouse: data._id });
      await Service.deleteMany({ idHouse: data._id });
      return res.json({
        data,
        message: 'Xóa thành công',
      });
    }
  });
};

const update = async (req, res) => {
  const data = {
    name: req.body.name,
    address: req.body.address,
  };
  if (!data.name || !data.address) {
    return res.status(400).json({
      message: 'Nhập đầy đủ thông tin',
    });
  }
  try {
    let house = req.house;
    house = _.assignIn(house, data);

    const dataToSave = await house.save();
    return res.status(200).json(dataToSave);
  } catch (error) {
    return res.status(400).json({ message: 'Hãy nhập đầy đủ thông tin' });
  }
};

const houseByIDService = (req, res, next, id) => {
  House.findById(id, (err, house) => {
    if (err || !house) {
      return res.status(400).json({
        message: 'Không tìm thấy dữ liệu',
      });
    }
    req.house = house;
    next();
  });
};
const addService = async (req, res) => {
  let house = req.house;
  house = _.concat(house.service, req.body.service);
  let data = { service: house };
  if (req.params.idHouse) {
    await House.findByIdAndUpdate(req.params.idHouse, data, (err, docs) => {
      if (err) {
        return res.status(400).json({
          message: 'Nhà không tồn tại',
        });
      } else {
        return res.status(200).json({
          message: 'Thêm dịch vụ thành công',
          docs: docs,
        });
      }
    });
  } else {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }
};

const settingPaymentForHouse = async (req, res) => {
  try {
    const { TmnCode, HashSecret } = req.body;
    await House.findByIdAndUpdate(req.params.idHouse, { paymentInformation: { TmnCode, HashSecret } }, (err, data) => {
      if (!data || err) {
        return res.status(400).json({
          message: 'Nhà không tồn tại',
        });
      } else {
        return res.status(200).json({
          message: 'Cập nhật thông tin thanh toán thành công!',
          data: data,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

module.exports = {
  create,
  list,
  houseByID,
  read,
  remove,
  update,
  addService,
  houseByIDService,
  settingPaymentForHouse,
};
