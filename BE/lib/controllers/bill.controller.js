const Bill = require('../models/bill.model');
const Room = require('../models/room.model');
const House = require('../models/house.model');
const Service = require('../models/service.model');
const BillService = require('../models/billService.model');
const History = require('../models/history.model');
const _ = require('lodash');

function newStatus(SumValue, paidAmount) {
  if (SumValue - paidAmount == 0) {
    return 2;
  }
  if (0 < SumValue - paidAmount && SumValue - paidAmount < SumValue) {
    return 1;
  } else {
    return 0;
  }
}

const createBillRoom = async (req, res, next) => {
  let billHa = [];
  let item2 = [];
  let value = req.body.idRooms;
  for (let i = 0; i < value.length; i++) {
    let dataList = {};
    Room.findById(value[i]).exec(async (err, data) => {
      if (err || !data) {
        return res.status(400).json({
          message: 'Không tìm thấy dữ liệu',
        });
      } else {
        if (data.listMember.length !== 0) {
          const { name, idHouse, _id, price, listMember, service } = data;
          const customerIndex = _.findKey(listMember, ['status', true]);
          const customerName = customerIndex ? listMember[customerIndex].memberName : '';
          const invoiceService = { serviceName: 'Tiền Nhà', amount: price };
          _.assignIn(dataList, {
            idRoom: _id,
            roomName: name,
            month: req.body.month,
            year: req.body.year,
            memberName: customerName,
            invoiceService,
          });

          const isStatus = [];
          service.map((item) => {
            isStatus.push(item);
          });
          _.assignIn(item2, isStatus);

          await House.findById(idHouse).exec(async (err, data) => {
            if (err || !data) {
              return res.status(400).json({
                message: 'Không tìm thấy dữ liệu',
              });
            } else {
              const { name, address, _id, idAuth } = data;
              _.assignIn(dataList, { idHouse: _id, houseName: name, address: address, idAuth: idAuth });
              // ------------------------------------------------
              let service = {};
              let invoiceServices = {};
              await Service.find({ idHouse: dataList.idHouse }).exec((err, docs) => {
                try {
                  const item = docs.filter((value) => {
                    return value.name == 'nuoc' || value.name == 'dien';
                  });
                  const concat = _.concat(item2, item);
                  _.assignIn(service, { concat });

                  BillService.find({
                    idRoom: dataList.idRoom,
                    idHouse: dataList.idHouse,
                    month: req.body.month,
                    year: req.body.year,
                  }).exec(async (err, data) => {
                    const detail = data.map((detail) => {
                      return {
                        name: detail.name,
                        amount: detail.amount,
                        inputValue: detail.inputValue,
                        outputValue: detail.outputValue,
                      };
                    });
                    _.assignIn(service, { detail });

                    const result = _.merge(service.concat, service.detail);
                    const invoiceService1 = result.map((value) => {
                      let amountUse;
                      if (value.inputValue || value.outputValue) {
                        amountUse = value.outputValue - value.inputValue;
                      }
                      return {
                        serviceName: `Tiền ${value.label} `,
                        amount: !value.type ? value.price : value.price * (amountUse !== undefined ? amountUse : 0),
                      };
                    });

                    _.assignIn(invoiceServices, { invoiceService1 });
                    // ---------------------
                    const { invoiceService } = dataList;
                    const no = { invoiceService: [invoiceService] };
                    const other = _.concat(no.invoiceService, invoiceServices.invoiceService1);
                    const data2d = _.assignIn(dataList, { invoiceService: other });
                    const dataSave = new Bill(data2d);
                    await billHa.push(dataSave);
                    await billHa.map(async (itemRoom) => {
                      await Bill.findOneAndDelete(
                        {
                          idRoom: itemRoom.idRoom,
                          month: itemRoom.month,
                          year: itemRoom.year,
                        },
                        (err, docs) => {},
                      );
                    });
                  });
                } catch (err) {
                  message: err;
                }
              });
            }
          });
        } else {
          billHa = [];
        }
      }
      setTimeout(async () => {
        req.billHA = billHa;
        next();
      }, 1000);
    });
  }
};

const getBillAll = async (req, res) => {
  await Bill.find({
    idAuth: req.params.idAuth,
    idHouse: req.params.idHouse,
    year: req.params.year,
    month: req.params.month,
  }).exec((err, data) => {
    if (data.length == 0) {
      res.status(200).json({
        message: 'Không có dữ liệu',
      });
    } else {
      res.status(200).json({
        data: data,
      });
    }
  });
};

const getBillId = (req, res, next, id) => {
  Bill.findById(id).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({
        message: 'Không tìm thấy dữ liệu',
      });
    }
    req.dataBill = data;
    next();
  });
};

const getBillIdRoom = async (req, res) => {
  await Bill.find({ idRoom: req.params.idRoom, year: req.params.year, month: req.params.month }).exec((err, data) => {
    if (data.length == 0) {
      return res.status(200).json({
        message: 'Không tìm thấy dữ liệu',
      });
    } else {
      return res.status(200).json({
        data: data,
      });
    }
  });
};

const read = async (req, res) => {
  await Bill.findById(req.params.id, (err, docs) => {
    if (docs) {
      return res.status(200).json(docs);
    } else {
      return res.status(400).json({
        message: 'Không tìm thấy thông tin hóa đơn',
      });
    }
  });
};

const removeBill = (req, res) => {
  let bill = req.dataBill;
  bill.remove((err, data) => {
    if (err) {
      return res.status(400).json({
        message: 'Xóa không thành công',
      });
    }
    res.json({
      data,
      message: 'Xóa thành công',
    });
  });
};

const createBillHouse = async (req, res, next) => {
  let billHa = [];
  let item2 = [];
  await Room.find({ idHouse: req.params.idHouse }).exec((err, data) => {
    if (data.length == 0) {
      return res.status(400).json({
        message: 'Không tìm thấy dữ liệu',
      });
    } else {
      let value = _.mapValues(data, '_id');
      for (let i = 0; i < Object.keys(value).length; i++) {
        let dataList = {};
        Room.findById(value[i]).exec(async (err, data) => {
          if (err || !data) {
            return res.status(400).json({
              message: 'Không tìm thấy dữ liệu',
            });
          } else {
            if (data.listMember.length !== 0) {
              const { name, idHouse, _id, price, listMember, service } = data;
              const customerIndex = _.findKey(listMember, ['status', true]);
              const customerName = customerIndex ? listMember[customerIndex].memberName : '';
              const invoiceService = { serviceName: 'Tiền Nhà', amount: price };
              _.assignIn(dataList, {
                idRoom: _id,
                roomName: name,
                month: req.body.month,
                year: req.body.year,
                memberName: customerName,
                invoiceService,
              });
              const isStatus = [];
              service.map((item) => {
                isStatus.push(item);
              });
              _.assignIn(item2, isStatus);

              await House.findById(idHouse).exec(async (err, data) => {
                if (err || !data) {
                  return res.status(400).json({
                    message: 'Không tìm thấy dữ liệu',
                  });
                } else {
                  const { name, address, _id, idAuth } = data;
                  _.assignIn(dataList, { idHouse: _id, houseName: name, address: address, idAuth: idAuth });
                  // ------------------------------------------------
                  let service = {};
                  let invoiceServices = {};
                  await Service.find({ idHouse: dataList.idHouse }).exec((err, docs) => {
                    try {
                      const item = docs.filter((value) => {
                        return value.name == 'nuoc' || value.name == 'dien';
                      });
                      const concat = _.concat(item2, item);
                      _.assignIn(service, { concat });

                      BillService.find({
                        idRoom: dataList.idRoom,
                        idHouse: dataList.idHouse,
                        month: req.body.month,
                        year: req.body.year,
                      }).exec(async (err, data) => {
                        const detail = data.map((detail) => {
                          return {
                            name: detail.name,
                            amount: detail.amount,
                            inputValue: detail.inputValue,
                            outputValue: detail.outputValue,
                          };
                        });
                        _.assignIn(service, { detail });
                        const result = _.merge(service.concat, service.detail);
                        const invoiceService1 = result.map((value) => {
                          let amountUse;
                          if (value.inputValue || value.outputValue) {
                            amountUse =
                              value.outputValue - value.inputValue < 0 ? 0 : value.outputValue - value.inputValue;
                          }

                          return {
                            serviceName: `Tiền ${value.label} `,
                            amount: !value.type ? value.price : value.price * (amountUse !== undefined ? amountUse : 0),
                          };
                        });
                        _.assignIn(invoiceServices, { invoiceService1 });
                        // ---------------------
                        const { invoiceService } = dataList;
                        const no = { invoiceService: [invoiceService] };
                        const other = _.concat(no.invoiceService, invoiceServices.invoiceService1);

                        const data2d = _.assignIn(dataList, { invoiceService: other });
                        const dataSave = new Bill(data2d);
                        await billHa.push(dataSave);
                        await Bill.deleteMany(
                          {
                            idHouse: req.body.idHouse,
                            month: req.body.month,
                            year: req.body.year,
                          },
                          (err, data) => {},
                        );
                      });
                    } catch (err) {
                      throw new Error(err.message);
                    }
                  });
                }
              });
            } else {
              billHa = [];
            }
          }
        });
      }
      setTimeout(async () => {
        req.billHA = billHa;
        next();
      }, 1000);
    }
  });
};

const addAllBillForHouse = async (req, res) => {
  try {
    const billHa = req.newData;
    if (billHa.length !== 0) {
      await Bill.insertMany(billHa, async (err, docs) => {
        await docs.map(async (item) => {
          await Bill.findOneAndUpdate(
            {
              idRoom: item.idRoom,
              month: item.month == '12' ? '1' : (Number(item.month) + 1).toString(),
              year: item.month == '12' ? (Number(item.year) + 1).toString() : item.year,
            },
            { debt: item.invoiceService.reduce((prev, curr) => prev + curr.amount, 0) },
          );
        });
        return res.status(200).json({
          data: billHa,
        });
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: 'Không có dữ liệu!',
    });
  }
};

const updateBill = async (req, res) => {
  try {
    await Bill.findOneAndUpdate(
      { _id: req.params.id },
      {
        paymentStatus: newStatus(
          req.body.invoiceService.reduce((prev, curr) => prev + curr.amount, 0),
          req.body.paidAmount,
        ),
        ...req.body,
      },
      async (err, data) => {
        const { idRoom, paidAmount, invoiceService, month, year, debt } = req.body;
        const SumValue = invoiceService.reduce((prev, curr) => prev + curr.amount, 0) + debt;
        if (err || !data) {
          return res.status(400).json({ message: 'Không tìm thấy dữ liệu' });
        } else {
          await Bill.findOneAndUpdate(
            {
              idRoom: idRoom,
              month: month == 12 ? '1' : (Number(month) + 1).toString(),
              year: month == 12 ? (Number(year) + 1).toString() : year,
            },
            { debt: SumValue - paidAmount },
          );
          const dataHistory = new History({
            idHouse: data.idHouse,
            model: 'Bill',
            title: 'Thanh toán tiền phòng',
            content: `<p>Tên phòng: ${data.houseName}</p>
                      <p>Tháng: ${data.month}/${data.year}</p>
                      <p>Số tiền thanh toán: ${req.body.paidAmount}</p>`,
          });
          await dataHistory.save();
          return res.status(200).json({ data: data, message: 'Cập nhật thành công !' });
        }
      },
    );
  } catch (error) {
    return res.status(400).json({ message: 'Cập nhật không thành công !' });
  }
};

const updateDebtRoomForHouse = async (req, res, next) => {
  const billHa = req.billHA;
  let newData = [];
  await billHa.map(async (dataRoom) => {
    await Bill.findOne(
      {
        idRoom: dataRoom.idRoom,
        month: dataRoom.month == '1' ? '12' : (Number(dataRoom.month) - 1).toString(),
        year: dataRoom.month == '1' ? (Number(dataRoom.year) - 1).toString() : dataRoom.year,
      },
      (err, docs) => {
        if (docs == null) {
          newData.push(dataRoom);
        } else {
          newData.push({
            paymentStatus: 0,
            paidAmount: dataRoom.paidAmount,
            idRoom: dataRoom.idRoom,
            roomName: dataRoom.roomName,
            month: dataRoom.month,
            year: dataRoom.year,
            memberName: dataRoom.memberName,
            invoiceService: dataRoom.invoiceService,
            idHouse: dataRoom.idHouse,
            houseName: dataRoom.houseName,
            address: dataRoom.address,
            idAuth: dataRoom.idAuth,
            debt: docs.invoiceService.reduce((prev, curr) => prev + curr.amount, 0) + docs.debt - docs.paidAmount,
          });
        }
      },
    );
  });

  setTimeout(() => {
    req.newData = newData;
    next();
  }, 3000);
};

const updateDebtForHouse = async (req, res, next) => {
  const billHa = req.billHA;
  let newData = [];
  await billHa.map(async (dataRoom) => {
    await Bill.findOne(
      {
        idRoom: dataRoom.idRoom,
        month: dataRoom.month == '1' ? '12' : (Number(dataRoom.month) - 1).toString(),
        year: dataRoom.month == '1' ? (Number(dataRoom.year) - 1).toString() : dataRoom.year,
      },
      (err, docs) => {
        if (docs == null) {
          newData.push(dataRoom);
        } else {
          newData.push({
            paymentStatus: 0,
            paidAmount: dataRoom.paidAmount,
            idRoom: dataRoom.idRoom,
            roomName: dataRoom.roomName,
            month: dataRoom.month,
            year: dataRoom.year,
            memberName: dataRoom.memberName,
            invoiceService: dataRoom.invoiceService,
            idHouse: dataRoom.idHouse,
            houseName: dataRoom.houseName,
            address: dataRoom.address,
            idAuth: dataRoom.idAuth,
            debt: docs.invoiceService.reduce((prev, curr) => prev + curr.amount, 0) + docs.debt - docs.paidAmount,
          });
        }
      },
    );
  });

  setTimeout(() => {
    req.newData = newData;
    next();
  }, 3000);
};

export const B1InitBill = async (req, res, next) => {
  try {
    await House.findById(req.params.idHouse, async (err, dataHouse) => {
      if (err || !dataHouse) {
        return res.status(400).json({
          message: 'Có lỗi xảy ra',
        });
      } else {
        await Service.find({ idHouse: req.params.idHouse }, async (err, dataService) => {
          if (err || !dataService) {
            return res.status(400).json({
              message: 'Có lỗi xảy ra',
            });
          } else {
            await Room.find({ idHouse: req.params.idHouse, status: true }, async (err, dataRoom) => {
              if (err) {
                return res.status(400).json({
                  message: 'Có lỗi xảy ra',
                });
              }
              if (dataRoom == []) {
                return res.status(200).json({
                  data: [],
                });
              }
              if (dataRoom !== []) {
                const FormatDataRoom = await Promise.all(
                  dataRoom.map(async (item) => {
                    if (item.listMember.length) {
                      try {
                        const dataBill = await Bill.findOne({
                          idRoom: item._id,
                          month: req.body.month == '1' ? '12' : (Number(req.body.month) - 1).toString(),
                          year: req.body.month == '1' ? (Number(req.body.year) - 1).toString() : req.body.year,
                        });

                        const { listMember } = item;
                        const customerIndex = _.findKey(listMember, ['status', true]);
                        const customerName = customerIndex ? listMember[customerIndex].memberName : '';
                        // call full service

                        const otherService = item.service
                          .map((itemOtherService) => {
                            if (itemOtherService.status) {
                              return {
                                serviceName: itemOtherService.label,
                                amount: itemOtherService.price,
                              };
                            }
                          })
                          .filter(function (el) {
                            return el != null;
                          });

                        const tienNuoc = await BillService.findOne({
                          name: 'nuoc',
                          month: req.body.month,
                          year: req.body.year,
                          idHouse: req.params.idHouse,
                          idRoom: item._id,
                        });

                        const tienDien = await BillService.findOne({
                          name: 'dien',
                          month: req.body.month,
                          year: req.body.year,
                          idHouse: req.params.idHouse,
                          idRoom: item._id,
                        });

                        const dataBillService = await Promise.all([tienNuoc, tienDien])
                          .then((result) => {
                            return result.map((itemResult) => {
                              if (itemResult) {
                                console.log('itemResult', itemResult);

                                return {
                                  serviceName: itemResult.name == 'dien' ? 'Tiền Điện' : 'Tiền Nước',
                                  amount: itemResult
                                    ? itemResult.outputValue - itemResult.inputValue > 0
                                      ? (itemResult.outputValue - itemResult.inputValue) * itemResult.price
                                      : 0
                                    : 0,
                                };
                              }
                            });
                          })
                          .catch((err) => {});

                        const newBillService = dataBillService
                          .concat(otherService, {
                            serviceName: 'Tiền Nhà',
                            amount: item.price,
                          })
                          .filter(function (el) {
                            return el != null;
                          });

                        return {
                          paymentStatus: 0,
                          paidAmount: 0,
                          debt: dataBill
                            ? dataBill.invoiceService.reduce((prev, curr) => prev + curr.amount, 0) +
                              dataBill.debt -
                              dataBill.paidAmount
                            : 0,
                          name: item.name,
                          idRoom: item._id,
                          idHouse: item.idHouse,
                          price: item.idHouse,
                          idAuth: item.idAuth,
                          memberName: customerName,
                          invoiceService: newBillService || [],
                          idHouse: req.params.idHouse,
                          houseName: dataHouse.name,
                          address: dataHouse.address,
                          month: req.body.month,
                          year: req.body.year,
                          roomName: item.name,
                        };
                      } catch (e) {
                        throw err;
                      }
                    }
                  }),
                );

                await Bill.deleteMany(
                  { idHouse: req.params.idHouse, month: req.body.month, year: req.body.year },
                  async (err, dataDelete) => {
                    if (err) {
                      return res.status(400).json({ message: 'Có lỗi xảy ra' });
                    } else {
                      await Bill.insertMany(FormatDataRoom, async (err, docs) => {
                        return res.status(200).json({
                          docs,
                        });
                      });
                    }
                  },
                );
              }
            });
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

export const B2InitBill = async (req, res, next) => {
  try {
    const listRoom = req.body.idRooms;

    await Promise.all(
      listRoom.map(async (item) => {
        console.log('item', item);
        await Room.findById(item, async (err, dataRoom) => {
          if (err) {
            return res.status(400).json({
              message: 'Có lỗi xảy ra1',
            });
          }
          if (dataRoom == []) {
            return res.status(200).json({
              data: [],
            });
          }
          if (dataRoom !== []) {
            const { _id, listMember, service, price, idHouse, name, address } = dataRoom;
            const customerIndex = _.findKey(listMember, ['status', true]);
            const customerName = customerIndex ? listMember[customerIndex].memberName : '';

            const dataHouse = await House.findById(idHouse).exec();
            const dataBill = await Bill.findOne({
              idRoom: item,
              month: req.body.month == '1' ? '12' : (Number(req.body.month) - 1).toString(),
              year: req.body.month == '1' ? (Number(req.body.year) - 1).toString() : req.body.year,
            }).exec();

            const otherService = service
              .map((itemOtherService) => {
                if (itemOtherService.status) {
                  return {
                    serviceName: itemOtherService.label,
                    amount: itemOtherService.price,
                  };
                }
              })
              .filter(function (el) {
                return el != null;
              });

            const tienNuoc = await BillService.findOne({
              name: 'nuoc',
              month: req.body.month,
              year: req.body.year,
              idHouse: idHouse,
              idRoom: _id,
            });

            const tienDien = await BillService.findOne({
              name: 'dien',
              month: req.body.month,
              year: req.body.year,
              idHouse: idHouse,
              idRoom: _id,
            });

            const dataBillService =
              (await Promise.all([tienNuoc, tienDien]).then((result) => {
                return result.map((itemResult) => {
                  if (itemResult) {
                    return {
                      serviceName: itemResult.name == 'dien' ? 'Tiền Điện' : 'Tiền Nước',
                      amount: itemResult
                        ? itemResult.outputValue - itemResult.inputValue > 0
                          ? (itemResult.outputValue - itemResult.inputValue) * itemResult.price
                          : 0
                        : 0,
                    };
                  }
                });
              })) || [];

            const newBillService = dataBillService
              .concat(otherService, {
                serviceName: 'Tiền Nhà',
                amount: price,
              })
              .filter(function (el) {
                return el != null;
              });

            const resultData = new Bill({
              paymentStatus: 0,
              paidAmount: 0,
              debt: dataBill
                ? dataBill.invoiceService.reduce((prev, curr) => prev + curr.amount, 0) +
                  dataBill.debt -
                  dataBill.paidAmount
                : 0,
              idRoom: _id,
              idHouse: idHouse,
              idAuth: dataHouse.idAuth,
              memberName: customerName,
              invoiceService: newBillService,
              idHouse: idHouse,
              houseName: dataHouse.name,
              address: dataHouse.address,
              month: req.body.month,
              year: req.body.year,
              roomName: name,
            });
            await Bill.deleteOne({ idRoom: _id, month: req.body.month, year: req.body.year }, (err, data) => {
              if (err) {
              } else {
                resultData.save();
              }
            });
          }
        });
      }),
    ).finally(() => {
      setTimeout(() => {
        return res.status(200).json({ message: 'Done' });
      }, 2000);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra2' });
  }
};

module.exports = {
  createBillRoom,
  getBillAll,
  getBillId,
  read,
  removeBill,
  createBillHouse,
  updateBill,
  getBillIdRoom,
  addAllBillForHouse,
  updateDebtForHouse,
  updateDebtRoomForHouse,
  B1InitBill,
  B2InitBill,
};
