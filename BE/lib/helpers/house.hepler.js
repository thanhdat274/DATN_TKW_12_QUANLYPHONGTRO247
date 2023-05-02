const House = require('../models/house.model');
const Room = require('../models/room.model');

export const checkHouseBefore = async (req, res, next) => {
  try {
    await Room.find({ idHouse: req.params.houseId }, (err, data) => {
      console.log('data.length', data.length);
      if (data.length || err) {
        return res.status(400).json({ message: 'Xóa nhà không thành công do trong nhà có dữ liệu' });
      } else {
        next();
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};
