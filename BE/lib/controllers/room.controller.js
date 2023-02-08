import Room from '../models/room.model';
const Service = require('../models/service.model');
const BillService = require('../models/billService.model');
const Booking = require('../models/booking.model');
const Bill = require('../models/bill.model');
const History = require('../models/history.model');
const cron = require('cron');

import { errorHandler } from '../helpers/dbErrorsHandler';

import _ from 'lodash';

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const nodemailer = require('nodemailer');
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

export const listRoom = async (req, res) => {
  try {
    if (!req.params.idHouse || !req.params.idAuth) {
      return res.status(400).json({
        message: 'Phải điền đầy đủ thông tin bắt buộc',
      });
    }

    await Room.find({ idHouse: req.params.idHouse }, (error, room) => {
      if (room) {
        const listRoomUsing = room.filter((item) => item.listMember.length);
        const listRoomNotReady = room.filter((item) => item.status == false);
        const listRoomEmptyMember = room.filter((item) => item.status == true && !item.listMember.length);

        return res.status(200).json({
          data: room,
          listRoomUsing,
          listRoomNotReady,
          listRoomEmptyMember,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong!',
    });
  }
};

export const getRoomBySubName = async (req, res) => {
  try {
    await Room.findOne({ subName: req.params.subname }, (err, data) => {
      if (err || !data) {
        return res.status(400).json({
          message: 'Phòng không tồn tại',
        });
      } else {
        return res.status(200).json({
          data: data,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong!',
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    if (!req.params.idRoom.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Có lỗi sảy ra',
      });
    }
    if (req.params.idRoom.match(/^[0-9a-fA-F]{24}$/)) {
      await Room.findById(req.params.idRoom, (err, data) => {
        if (err) {
          return res.status(400).json({
            message: 'Có lỗi sảy ra',
          });
        }
        if (data == null) {
          return res.status(400).json({
            message: 'Phòng không tồn tại',
          });
        } else {
          return res.status(200).json({
            data: data,
          });
        }
      });
    } else {
      return res.status(400).json({
        message: 'Thiếu parameter',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong!',
    });
  }
};

export const addRoom = async (req, res) => {
  try {
    const data = new Room({
      name: req.body.name,
      status: req.body.status,
      maxMember: req.body.maxMember,
      idAuth: req.body.idAuth,
      idHouse: req.body.idHouse,
      address: req.body.address,
      price: req.body.price,
      area: req.body.area,
      subName: req.nameRoom,
    });
    const addAllBillService = async (idRoom, nameRoom) => {
      await Service.find({ idHouse: req.body.idHouse }, async (err, data) => {
        const d = new Date();
        if (data) {
          const formatMonthUp = (Dmonth) => {
            if (Dmonth == 12) {
              return 1;
            }
            if (Dmonth < 12) {
              return Dmonth + 1;
            }
          };
          const formatYearUp = (year) => {
            if (d.getMonth() == 12) {
              return year + 1;
            }
            if (d.getMonth() < 12) {
              return year;
            }
          };
          // const setNewMont
          await data.map(async (item) => {
            const inputValue = 0;
            const outputValue = 0;
            const data = new BillService({
              idRoom: idRoom,
              nameRoom: nameRoom,
              idHouse: req.body.idHouse,
              name: item.name,
              month: formatMonthUp(d.getMonth()),
              year: formatYearUp(d.getFullYear()),
              inputValue,
              outputValue,
              price: item.price,
              unit: item.unit,
              amount: (outputValue - inputValue) * item.price,
            });
            const dataNextMonth = new BillService({
              idRoom: idRoom,
              nameRoom: nameRoom,
              idHouse: req.body.idHouse,
              name: item.name,
              month: formatMonthUp(d.getMonth() + 1),
              year: formatYearUp(d.getFullYear()),
              inputValue,
              outputValue,
              price: item.price,
              unit: item.unit,
              amount: (outputValue - inputValue) * item.price,
            });
            try {
              await data.save();
              await dataNextMonth.save();
            } catch (error) {
              return res.status(400).json({ message: 'Có lỗi sảy ra' });
            }
          });
        }
      });
    };
    const addService = async (idHouse) => {
      await Service.find({ idHouse: idHouse }, async (err, docs) => {
        const newData = docs.filter((item) => {
          return item.name !== 'dien' && item.name !== 'nuoc';
        });
        let length = newData.length;
        for (let i = 0; i < length; i++) {
          data.service.push(newData[i]);
        }

        await data.save(async (err, data) => {
          if (data) {
            const dataHistory = new History({
              idHouse: data.idHouse,
              model: 'Room',
              title: 'Thêm phòng',
              content: `<p>Thêm phòng: ${data.name}</p>`,
            });
            await dataHistory.save();
            addAllBillService(data._id, data.name);
            return res.status(200).json({
              message: 'Đã tạo phòng thành công!',
              data,
            });
          }
          if (err) {
            return res.status(400).json({ err: err, message: ' Tạo phòng không thành công' });
          }
        });
      });
    };
    addService(data.idHouse);
  } catch (error) {
    return res.status(500).json({ err: error, message: ' Tạo phòng không thành công' });
  }
};

export const updateRoom = async (req, res) => {
  try {
    await Room.findById(req.body.idRoom, async (err, docs) => {
      if (docs) {
        if (req.params.idRoom) {
          await Room.findByIdAndUpdate(req.params.idRoom, { ...req.body }, async (err, docs) => {
            if (err) {
              return res.status(400).json({
                message: errorHandler(err),
              });
            } else {
              if (req.body.name) {
                await BillService.find({ idRoom: req.body.idRoom }, (err, data) => {
                  if (data) {
                    data.map(
                      async (item) => await BillService.findByIdAndUpdate(item._id, { nameRoom: req.body.name }),
                    );
                  }
                });
              }
              const dataHistory = new History({
                idHouse: docs.idHouse,
                model: 'Room',
                title: 'Sửa phòng',
                content: `
                          <p>Sửa tên phòng: ${docs.name} thành ${req.body.name}</p>
                          <p>Sửa giá phòng: ${docs.price} thành ${req.body.price}</p>
                          <p>Sửa số người ở tối đa: ${docs.maxMember} thành ${req.body.maxMember}</p>
                         `,
              });
              await dataHistory.save();
              return res.status(200).json({
                message: 'Cập nhật phòng thành công',
                docs: docs,
              });
            }
          });
        } else {
          return res.status(400).json({
            message: 'Thiếu parameter',
          });
        }
      } else {
        return res.status(400).json({
          message: 'Cập nhật phòng không thành công',
          docs: docs,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Cập nhật phòng không thành công',
      err: error,
    });
  }
};

export const removeById = async (req, res) => {
  try {
    if (req.params.idRoom) {
      await Room.findByIdAndRemove(req.params.idRoom, async (err, docs) => {
        if (err) {
          return res.status(400).json({
            message: 'Phòng không tồn tại',
          });
        } else {
          const dataHistory = new History({
            idHouse: docs.idHouse,
            model: 'Room',
            title: 'Xóa phòng',
            content: `<p>Xóa phòng: ${docs.name}</p>`,
          });
          await dataHistory.save();
          await BillService.deleteMany({ idRoom: req.params.idRoom });
          await Service.deleteMany({ idRoom: req.params.idRoom });
          await Booking.deleteMany({ idRoom: req.params.idRoom });
          await Bill.deleteMany({ idRoom: req.params.idRoom });

          return res.status(200).json({
            message: 'Xóa phòng thành công',
            docs: docs,
          });
        }
      });
    } else {
      return res.status(400).json({
        message: 'Thiếu parameter',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Xóa phòng không thành công!',
      err: error,
    });
  }
};

export const getNameRoom = async (req, res) => {
  try {
    await Room.findById(req.params.idRoom, (err, data) => {
      if (err || !data) {
        return res.status(400).json({ message: 'Phòng không tồn tại' });
      } else {
        return res.status(200).json({ name: data.name });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Phòng không tồn tại' });
  }
};

export const addMember = async (req, res) => {
  try {
    const idRoom = req.params.idRoom;
    if (idRoom) {
      await Room.findById(idRoom, (err, data) => {
        if (err || !data) {
          return res.status(400).json({ message: 'Phòng không tồn tại' });
        } else {
          const { memberName, cardNumber, phoneNumber } = req.body.listMember;
          if (!memberName || !cardNumber || !phoneNumber) {
            return res.status(400).json({ message: 'Chưa nhập đủ dữ liệu' });
          } else {
            Room.findOneAndUpdate({ _id: idRoom, status: true }, { $push: req.body }, async (err, data) => {
              if (err || !data) {
                return res.status(400).json({ message: 'Không thể thêm' });
              }
              const dataHistory = new History({
                idHouse: data.idHouse,
                model: 'Room',
                title: 'Thêm thành viên',
                content: `<p>Thêm thành viên ${req.body.listMember.memberName} vào phòng ${data.name}</p>`,
              });
              await dataHistory.save();
              return res.status(200).json({ data: data, message: 'Thêm thành viên thành công' });
            });
          }
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Thêm phòng không thành công!' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const idRoom = req.params.idRoom;
    if (idRoom) {
      await Room.findById(idRoom, (err, data) => {
        if (err || !data) {
          return res.status(400).json({ message: 'Phòng không tồn tại' });
        } else {
          const { _id, memberName, cardNumber, phoneNumber } = req.body;
          if (!_id || !memberName || !cardNumber || !phoneNumber) {
            return res.status(400).json({ message: 'Nhập đủ dữ liệu để xóa' });
          } else {
            Room.updateOne({ _id: idRoom }, { $pullAll: { listMember: [req.body] } }, async (err) => {
              if (err) {
                return res.status(400).json({ message: 'Xóa thành viên không thành công!' });
              }

              const dataHistory = new History({
                idHouse: data.idHouse,
                model: 'Room',
                title: 'Xoá thành viên',
                content: `<p>Xoá thành viên ${req.body.memberName} khỏi phòng ${data.name}</p>`,
              });
              await dataHistory.save();
              return res.status(200).json({ message: 'Xóa thành viên thành công' });
            });
          }
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Xóa thành viên không thành công!' });
  }
};

export const updateCodeRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.body.idRoom, { subName: req.body.codeRoom }, async (err, docs) => {
      if (err || !docs) {
        return res.status(400).json({
          message: 'Cập nhật mã đăng nhập người dùng không thành công!',
        });
      } else {
        if (docs.emailOfAuth) {
          const data = {
            to: docs.emailOfAuth,
            from: emailSMTP,
            template: 'change-code-room',
            subject: 'Tiếp nhận phòng trọ',
            context: {
              nameRoom: docs.name,
              codeRoom: docs.subName,
              linkFE: process.env.BASE_FE,
            },
          };

          await smtpTransport.sendMail(data);
        }
        const dataHistory = new History({
          idHouse: docs.idHouse,
          model: 'Room',
          title: 'Cập nhật mã người dùng',
          content: `<p>Cập nhật mã người dùng phòng: ${docs.name}</p>`,
        });
        await dataHistory.save();
        return res.status(200).json({
          message: 'Cập nhật mã người dùng thành công!',
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Cập nhật mã đăng nhập người dùng không thành công!',
    });
  }
};

export const updateInfoMember = async (req, res) => {
  try {
    const { id, memberName, phoneNumber, cardNumber, status } = req.body;
    await Room.findById(req.params.idRoom, async (err, docs) => {
      if (!docs || err) {
        return res.status(400).json({
          message: 'Phòng không tồn tại!',
        });
      } else {
        const { listMember: tempListMember } = { ...docs.toJSON() };

        const newArr = tempListMember.map((obj) => {
          if (obj._id == id) {
            return { ...obj, memberName, phoneNumber, cardNumber, status };
          }

          return obj;
        });

        await Room.findByIdAndUpdate(req.params.idRoom, { listMember: newArr }, async (err, docs) => {
          if (!docs || err) {
            return res.status(400).json({
              message: 'Cập nhật thành viên không thành công!',
            });
          } else {
            const dataHistory = new History({
              idHouse: docs.idHouse,
              model: 'Room',
              title: 'Sửa thông tin thành viên',
              content: `<p>Sửa thông tin thành viên ${newArr[0].memberName} của phòng ${docs.name}</p>`,
            });
            await dataHistory.save();
            return res.status(200).json({
              message: 'Cập nhật thành viên thành công!',
            });
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Cập nhật thành viên không thành công!',
    });
  }
};

export const reviewAfterLiquidation = async (req, res) => {
  try {
    const d = new Date();
    let month = d.getMonth();
    let yearNow = d.getFullYear();

    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth() + 1;
    const numberDay = d.getDate();

    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const reviewServiceWater = await BillService.findOne({
      name: 'nuoc',
      month: month + 1,
      year: yearNow,
      idHouse: req.body.idHouse,
      idRoom: req.body.idRoom,
    });

    const reviewServiceElect = await BillService.findOne({
      name: 'dien',
      month: month + 1,
      year: yearNow,
      idHouse: req.body.idHouse,
      idRoom: req.body.idRoom,
    });

    const reviewRoom = await Room.findById(req.body.idRoom);

    const roomData = await Promise.all([reviewRoom])
      .then((result) => {
        const { service } = result[0];

        const tempData = service
          ? service
              .map((item) => {
                if (item.status) {
                  return { serviceName: item.label, amount: item.price };
                }
              })
              .filter(function (el) {
                return el != null;
              })
          : [];
        const resultDataRoom = tempData.concat({ serviceName: 'Tiền thuê nhà', amount: result[0].price });

        return resultDataRoom;
      })
      .catch((err) => {
        return [];
      });

    const serviceData = await Promise.all([reviewServiceWater, reviewServiceElect])
      .then((result) => {
        return result.map((itemResult) => {
          return {
            serviceName: itemResult.name == 'dien' ? 'Tiền Điện' : 'Tiền Nước',
            amount:
              itemResult.outputValue - itemResult.inputValue > 0
                ? (itemResult.outputValue - itemResult.inputValue) * itemResult.price
                : 0,
          };
        });
      })
      .catch((err) => {});

    const finallyData = roomData.concat(serviceData).filter(function (el) {
      return el != null;
    });
    return res.status(200).json(finallyData);
  } catch (error) {}
};
export const liquidationRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(
      req.body.idRoom,
      { listMember: [], contract: { additional: [], imageContract: [] }, emailOfAuth: '', subName: req.nameRoom },
      (err, docs) => {
        if (err || !docs) {
          return res.status(400).json({
            message: 'Thanh lý hợp đồng không thành công!',
          });
        } else {
          return res.status(200).json({
            message: 'Thanh lý hợp đồng thành công!',
          });
        }
      },
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Cập nhật thành viên không thành công!',
    });
  }
};

export const changeValueContract = async () => {
  const dataNow = new Date();
  await Room.find({}, async (err, data) => {
    if (data) {
      await data.map(async (item) => {
        const mydate = new Date(item.contract.endTime);
        const newMatch = mydate - dataNow;
        const timeEndContract = newMatch / 1000 / 60 / 60 / 24;
        if (item.contract) {
          if (timeEndContract > 15 && timeEndContract <= 16) {
            const data = {
              to: item.emailOfAuth || '',
              from: emailSMTP,
              template: 'contract-expiration',
              subject: 'Hết hạn hợp đồng',
              context: {
                name: item.contract.infoTenant.name || '',
                date: 15,
              },
            };
            await smtpTransport.sendMail(data);
          }
          if (timeEndContract > 30 && timeEndContract <= 31) {
            if (item.emailOfAuth) {
              const data = {
                to: item.emailOfAuth || '',
                from: emailSMTP,
                template: 'contract-expiration',
                subject: 'Hết hạn hợp đồng',
                context: {
                  name: item.contract.infoTenant.name || '',
                  date: 30,
                },
              };
              await smtpTransport.sendMail(data);
            }
          }
        }
      });
    }
  });
};

const job = new cron.CronJob({
  cronTime: '00 00 7 * * 0-6', // Chạy Jobs vào 7h hằng đêm
  onTick: function () {
    changeValueContract();
    console.log('Cron jub runing...');
  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh', // Lưu ý set lại time zone cho đúng
});

job.start();

export const CreateNewDataInNewRoom = async (req, res, next) => {
  try {
    const { idOldRoom, idNewRoom, dataMember } = req.body;

    await Room.findById(idNewRoom, async (err, data) => {
      if (err) {
        return res.status(400).json({ message: 'Chuyển đổi không thành công !' });
      }
      if (data.maxMember < dataMember.length + data.listMember.length) {
        return res.status(400).json({ message: 'Tổng số người lớn hơn giới hạn người hiện tại của phòng!' });
      } else {
        const { listMember: tempListMember } = { ...data.toJSON() };
        const newDataListMember = [...tempListMember, ...dataMember];
        await Room.findByIdAndUpdate(idNewRoom, { listMember: newDataListMember }, (err, dataUpdate) => {
          if (err || !data) {
            return res.status(400).json({ message: 'Chuyển đổi không thành công !' });
          } else {
            next();
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const changeMemberToNewRoom = async (req, res) => {
  try {
    const { idOldRoom, idNewRoom, dataMember } = req.body;

    await Room.findByIdAndUpdate(idOldRoom, { listMember: [] }, (err, data) => {
      if (err || !data) {
        return res.status(400).json({ message: 'Chuyển đổi không thành công !' });
      } else {
        return res.status(200).json({ message: 'Chuyển đổi thành công !' });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const removeOldDataMemberInOldRoom = async (req, res, next) => {
  try {
    const { idOldRoom, idNewRoom, dataMember } = req.body;

    // console.log('idOldRoom', idOldRoom);
    await Room.findById(idOldRoom, async (err, docs) => {
      if (err || !docs) {
        return res.status(400).json({ message: 'Chuyển đổi không thành công !1' });
      } else {
        const { listMember } = docs;
        const tempListMember = listMember;
        await Room.findByIdAndUpdate(
          idOldRoom,
          {
            listMember: tempListMember.filter(function (value) {
              return value._id != dataMember._id;
            }),
          },
          (err, data) => {
            if (err || !data) {
              return res.status(400).json({ message: 'Chuyển đổi không thành công !2' });
            } else {
              next();
            }
          },
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const changeOneMemberToNewRoom = async (req, res) => {
  try {
    const { idOldRoom, idNewRoom, dataMember } = req.body;
    let newDataMember = {
      cardNumber: dataMember.cardNumber,
      memberName: dataMember.memberName,
      phoneNumber: dataMember.phoneNumber,
    };
    await Room.findById(idNewRoom, async (err, data) => {
      if (err || !data) {
        return res.status(400).json({ message: 'Chuyển đổi không thành công !3' });
      } else {
        const { listMember, maxMember } = { ...data.toJSON() };
        newDataMember.status = listMember.length == 0 ? true : false;
        if (maxMember == listMember.length) {
          return res.status(400).json({ message: 'Phòng đã đủ người , không thể chuyển vào !' });
        } else {
          await Room.findByIdAndUpdate(idNewRoom, { listMember: [...listMember, newDataMember] }, (err, docs) => {
            if (err || !docs) {
              return res.status(400).json({ message: 'Chuyển đổi không thành công !4' });
            } else {
              return res.status(200).json({ message: 'Chuyển đổi thành công' });
            }
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};
