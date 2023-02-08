const Room = require('../models/room.model');
const BillService = require('../models/billService.model');
const _ = require('lodash');

export const getListContractExpiration = async (req, res, next) => {
  try {
    let dataConExp = [];

    const dataNow = new Date();

    await Room.find({ idHouse: req.params.idHouse }, async (err, data) => {
      if (data) {
        await data.map((item) => {
          const endDate = new Date(item.contract.endTime);
          const newMatch = endDate - dataNow;
          const timeEndContract = newMatch / 1000 / 60 / 60 / 24;
          if (timeEndContract <= 30) {
            dataConExp.push(item);
          }
        });
      }
    });

    setTimeout(async () => {
      req.dataConExp = dataConExp;
      next();
    }, 500);
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const getAllStatusRoom = async (req, res) => {
  try {
    await Room.find({ idHouse: req.params.idHouse }, async (error, rooms) => {
      if (rooms) {
        const roomNotReady = rooms.filter((item) => item.status == false);
        const roomReadyUsing = rooms.filter((item) => item.status == true && item.listMember.length);
        const roomReadyEmpty = rooms.filter((item) => item.status == true && !item.listMember.length);
        const numberMemberInHouse = roomReadyUsing.reduce((prev, curr) => prev + curr.listMember.length, 0);
        const countRoomsNotUsing = rooms.filter((item) => !item.listMember.length).length;

        return res.status(200).json({
          roomNotReady: {
            count: roomNotReady.length,
            list: roomNotReady,
          },
          roomReadyUsing: {
            count: roomReadyUsing.length,
            list: roomReadyUsing,
          },
          roomReadyEmpty: {
            count: roomReadyEmpty.length,
            list: roomReadyEmpty,
          },
          numberMemberInHouse,
          countRoomsNotUsing,
          listRoomContractExpiration: req.dataConExp,
        });
      }
      if (error || !rooms) {
        return res.status(400).json({
          message: 'Không có dữ liệu',
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const getAllBillServiceByYear = async (req, res) => {
  try {
    if (!req.params.year || req.params.year < 1) {
      return res.status(400).json({
        message: 'Năm không hợp lệ!',
      });
    }
    if (!req.params.name) {
      return res.status(400).json({
        message: 'Tên dịch vụ không hợp lệ!',
      });
    }
    await BillService.find(
      { idHouse: req.params.idHouse, name: req.params.name, year: req.params.year },
      (err, docs) => {
        if (docs) {
          function generateTestArray(data) {
            const result = [];
            for (let i = 1; i < 13; ++i) {
              result.push(
                data
                  .filter((perfectitem) => i == perfectitem.month)
                  .reduce((prev, curr) => prev + curr.outputValue, 0) -
                  data
                    .filter((perfectitem) => i == perfectitem.month)
                    .reduce((prev, curr) => prev + curr.inputValue, 0) >
                  0
                  ? data
                      .filter((perfectitem) => i == perfectitem.month)
                      .reduce((prev, curr) => prev + curr.outputValue, 0) -
                      data
                        .filter((perfectitem) => i == perfectitem.month)
                        .reduce((prev, curr) => prev + curr.inputValue, 0)
                  : 0,
              );
            }
            return result;
          }

          return res.status(200).json({
            data: generateTestArray(docs),
          });
        } else {
          return res.status(400).json({
            message: err,
          });
        }
      },
    );
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const getBillServiceByYear = async (req, res) => {
  try {
    await BillService.find({ idRoom: req.params.idRoom, name: req.params.name, year: req.params.year }, (err, docs) => {
      if (docs) {
        function generateTestArray(data) {
          const result = [];

          for (let i = 1; i < 13; ++i) {
            result.push(
              data.filter((perfectitem) => i == perfectitem.month).reduce((prev, curr) => prev + curr.outputValue, 0) >
                0
                ? data
                    .filter((perfectitem) => i == perfectitem.month)
                    .reduce((prev, curr) => prev + curr.outputValue, 0) -
                    data
                      .filter((perfectitem) => i == perfectitem.month)
                      .reduce((prev, curr) => prev + curr.inputValue, 0)
                : 0,
            );
          }
          const SumValue = result.reduce((a, b) => a + b, 0);

          return { result: result, sum: SumValue };
        }

        return res.status(200).json({
          data: generateTestArray(docs),
        });
      } else {
        return res.status(400).json({
          message: err,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const getDetailBillServiceByMonthYear = async (req, res) => {
  try {
    await BillService.findOne(
      { idRoom: req.params.idRoom, name: req.params.name, month: req.params.month, year: req.params.year },
      (err, docs) => {
        if (err) {
          return res.status(400).json({
            message: 'Lỗi ',
          });
        }
        if (!docs) {
          return res.status(200).json({
            data: { inputValue: 0, outputValue: 0 },
          });
        } else {
          return res.status(200).json({
            data: { inputValue: docs.inputValue, outputValue: docs.outputValue },
          });
        }
      },
    );
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

export const getStatisHomePage = async (req, res) => {
  return res.status(200).json({
    data: {
      countRoom: req.countRoom,
      countHouse: req.countHouse,
      countUser: req.countUser,
    },
  });
};

export const StatisticalPayment = async (req, res) => {
  return res.status(200).json({
    data: {
      fullPayment: req.FullPayment,
      allPayment: req.AllPayment,
    },
  });
};
