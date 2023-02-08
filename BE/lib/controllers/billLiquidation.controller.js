import Room from '../models/room.model';
import BillLiquidation from '../models/billLiquidation.model';

export const saveBillLiquidation = async (req, res) => {
  try {
    const { idRoom, idHouse, idAuth, invoiceService, listMember, contract, deposit } = req.body;

    const formatData = new BillLiquidation({
      idRoom: idRoom,
      idHouse: idHouse,
      idAuth: idAuth,
      payment: {
        paymentStatus: 0,
        paidAmount: 0,
        debt: 0,
        invoiceService,
        deposit: deposit,
      },
      detailRoom: {
        listMember: listMember,
        contract: contract,
      },
    });

    await formatData.save(async (err, docs) => {
      if (err) {
        return res.status(400).json({
          message: 'Thanh lý không thành công !',
        });
      } else {
        await Room.findByIdAndUpdate(idRoom, { listMember: [], contract: {}, emailOfAuth: '' }, (err, newData) => {
          if (err) {
            return res.status(400).json({
              message: 'Thanh lý không thành công !',
            });
          } else
            return res.status(200).json({
              message: 'Thanh lý thành công !',
            });
          {
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: 'Thanh lý thành công !',
    });
  }
};

export const getListBillLiqui = async (req, res) => {
  try {
    const { idHouse } = req.params;
    await BillLiquidation.find({ idHouse }, (err, data) => {
      if (err) {
        return res.status(400).json({
          message: 'Không thể truy vấn được!',
        });
      } else {
        return res.status(200).json({
          data,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Có lỗi sảy ra!',
    });
  }
};

export const updateBillLiqui = async (req, res) => {
  try {
    const { idHouse } = req.params;
    await BillLiquidation.findByIdAndUpdate(idHouse, { ...req.body }, (err, newData) => {
      if (err) {
        return res.status(400).json({
          message: 'Không thể truy vấn được!',
        });
      } else {
        return res.status(200).json({
          newData,
          message: 'Cập nhật thành công!',
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: 'Có lỗi sảy ra!',
    });
  }
};
