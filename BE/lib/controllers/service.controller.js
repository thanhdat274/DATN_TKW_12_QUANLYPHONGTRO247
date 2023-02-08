const House = require('../models/house.model');
const Service = require('../models/service.model');
const BillService = require('../models/billService.model');
const { toLowerCaseNonAccentVietnamese } = require('../validator');
const Room = require('../models/room.model');
const History = require('../models/history.model');

const checkHouse = async (req, res, next) => {
  await House.findById(req.body.idHouse, (err, data) => {
    if (err || !data) {
      return res.status(400).json({
        message: 'Không tìm thấy nhà',
      });
    }
    next();
  });
};

const getOneService = async (req, res) => {
  if (!req.params.idHouse || !req.params.name) {
    return res.status(400).json({
      message: 'Cần điền đầy đủ thông tin dịch vụ! Vui lòng kiểm tra lại',
    });
  }

  try {
    await Service.findOne({ idHouse: req.params.idHouse, name: req.params.name }, (err, data) => {
      if (err || !data) {
        return res.status(400).json({ message: ' Lấy thông tin dịch vụ không thành công' });
      } else {
        return res.status(200).json({ data });
      }
    });
  } catch (error) {
    return res.status(400).json({ message: ' Lấy thông tin dịch vụ không thành công' });
  }
};

const addService = async (req, res) => {
  try {
    const body = req.body;
    if (!body.idHouse || !body.label || !body.price || !body.unit) {
      return res.status(400).json({
        message: 'Cần điền đầy đủ thông tin dịch vụ! Vui lòng kiểm tra lại',
      });
    }

    if (body.price < 1) {
      return res.status(400).json({
        message: 'Giá của dịch vụ ít nhất là 1',
      });
    }
    await Service.findOne({ label: body.label, idHouse: body.idHouse }, async (err, check) => {
      if (err) {
        return res.status(400).json({ message: ' Tạo dịch vụ không thành công' });
      }
      if (check) {
        return res.status(400).json({ message: ' Dịch vụ đã tồn tại !' });
      } else {
        const service = new Service({ ...req.body, name: toLowerCaseNonAccentVietnamese(req.body.label) });
        const dataToSave = await service.save();
        await Room.find({ idHouse: body.idHouse }, async (err, docs) => {
          if (docs) {
            await docs.map(
              async (item) =>
                await Room.findByIdAndUpdate(item._id, {
                  service: [
                    ...item.service,
                    {
                      ...req.body,
                      name: toLowerCaseNonAccentVietnamese(req.body.label),
                      status: false,
                      idService: dataToSave._id,
                    },
                  ],
                }),
            );
          }
        });
        const dataHistory = new History({
          idHouse: dataToSave.idHouse,
          model: 'Service',
          title: 'Thêm dịch vụ',
          content: `<p>Thêm dịch vụ: ${dataToSave.label}</p>`,
        });
        await dataHistory.save();
        return res.status(200).json({ message: 'Tạo dịch vụ thành công', data: dataToSave });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: ' Tạo dịch vụ không thành công' });
  }
};

const getHouseByIdService = async (req, res, next) => {
  if (req.params.idService) {
    await Service.findById(req.params.idService, async (err, docs) => {
      if (err) {
        return res.status(400).json({
          message: 'Có lỗi sảy ra!',
        });
      }
      if (!docs) {
        return res.status(400).json({
          message: 'Không tìm thấy dịch vụ!',
        });
      }
      if (docs) {
        await BillService.find({ idHouse: docs.idHouse, name: docs.name }, (err, docs) => {
          if (err) {
            return res.status(400).json({
              message: 'Có lỗi sảy ra!',
            });
          }
          if (docs) {
            req.listBillServiceNeedToUpdate = docs;
            next();
          }
        });
      } else {
        return res.status(400).json({
          message: 'Có lỗi sảy ra!',
        });
      }
    });
  }
};

const editService = async (req, res) => {
  const body = req.body;
  if (body.price < 1) {
    return res.status(400).json({
      message: 'Giá của dịch vụ ít nhất là 1',
    });
  }

  if (req.params.idService) {
    await Service.findByIdAndUpdate(
      req.params.idService,
      { ...body, name: toLowerCaseNonAccentVietnamese(body.label) },
      { returnDocument: 'before' },
      async (err, docs) => {
        if (err) {
          return res.status(400).json({
            message: err,
            message: 'Sửa dịch vụ không thành công',
          });
        } else {
          req.listBillServiceNeedToUpdate.map(async (item) => {
            await BillService.findByIdAndUpdate(item._id, { price: body.price }, (err) => {
              if (err) {
                return res.status(400).json({
                  message: 'Có lỗi sảy ra!',
                });
              }
            });
          });

          const data = new History({
            idHouse: req.body.idHouse,
            model: 'Service',
            title: 'Sửa dịch vụ',
            content: `<p>Dịch vụ ${docs.label} trở thành ${req.body.label}</p> 
            <p>Với giá ${docs.price}VND trở thành ${req.body.price}VND</p> 
            <p>Đơn vị là ${docs.unit} trở thành ${req.body.unit}</p>`,
          });
          await data.save();

          // console.log('id Service', docs._id, req.body.idHouse);

          await Room.find({ idHouse: req.body.idHouse }, async (err, dataListRoom) => {
            if (dataListRoom) {
              await Promise.all(
                dataListRoom.map(async (itemLD) => {
                  try {
                    const { _id, service: tempService } = { ...itemLD.toJSON() };
                    const itemIndex = tempService.findIndex((x) => {
                      return x.idService.equals(docs._id);
                    });
                    tempService[itemIndex] = {
                      ...tempService[itemIndex],
                      label: req.body.label,
                      price: req.body.price,
                      unit: req.body.unit,
                    };

                    await Room.findByIdAndUpdate(_id, { service: tempService });
                  } catch (error) {}
                }),
              );
            }
          });

          return res.status(200).json({
            oldData: docs,
            message: 'Sửa dịch vụ thành công',
          });
        }
      },
    );
  } else {
    return res.status(400).json({
      message: 'Parameter undefind',
    });
  }
};

const listServiceByIdHouse = async (req, res) => {
  if (req.params.idHouse) {
    await Service.find({ idHouse: req.params.idHouse }, (err, data) => {
      if (err || !data) {
        return res.status(400).json({
          message: 'Xem dịch vụ nhà không thành công ',
        });
      }
      return res.status(200).json({
        data,
      });
    });
  } else {
    return res.status(400).json({
      message: 'Thiếu id nhà',
    });
  }
};

const getServiceById = async (req, res) => {
  if (req.params.idService) {
    await Service.findById(req.params.idService, (err, data) => {
      if (data) {
        return res.status(200).json({
          data,
        });
      }
      if (err || !data) {
        return res.status(400).json({
          message: 'Không tìm thấy dữ liệu dịch vụ',
        });
      } else {
        return res.status(400).json({
          message: 'Không tìm thấy dữ liệu dịch vụ',
        });
      }
    });
  } else {
    return res.status(400).json({
      message: 'Thiếu id nhà',
    });
  }
};

const removeService = async (req, res) => {
  try {
    await Room.find({ idHouse: req.params.idHouse }, (err, data) => {});
    if (req.params.idService && req.params.idHouse) {
      await Service.findByIdAndRemove(req.params.idService, async (err, docs) => {
        if (err) {
          return res.status(400).json({
            message: 'Xóa dịch vụ không thành công',
          });
        } else {
          await Room.find({ idHouse: req.params.idHouse }, async (err, data) => {
            if (data) {
              await Promise.all(
                data.map(async (itemLD) => {
                  try {
                    const { _id, service: tempService } = { ...itemLD.toJSON() };
                    const itemIndex = tempService.findIndex((x) => {
                      return x.idService.equals(req.params.idService);
                    });

                    if (itemIndex > -1) {
                      tempService.splice(itemIndex, 1);
                      await Room.findByIdAndUpdate(_id, {
                        service: tempService,
                      });
                    }
                  } catch (error) {}
                }),
              );
            }
          });
          const data = new History({
            idHouse: req.params.idHouse,
            model: 'Service',
            title: 'Xóa dịch vụ',
            content: `<p>Dịch vụ ${docs.label}</p>
            <p>Với giá ${docs.price}</p>
            <p>Đơn vị là ${docs.unit}</p>`,
          });
          await data.save();
          return res.status(200).json({
            message: 'Xóa dịch vụ thành công',
            docs: docs,
          });
        }
      });
    } else {
      return res.status(400).json({
        message: 'Thiếu id dịch vụ',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong!',
    });
  }
};

module.exports = {
  checkHouse,
  addService,
  removeService,
  listServiceByIdHouse,
  editService,
  getServiceById,
  getOneService,
  getHouseByIdService,
};
