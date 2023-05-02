const History = require('../models/history.model');

const listHistories = async (req, res) => {
  await History.find({ idHouse: req.params.idHouse }, (err, data) => {
    try {
      if (err || data.length === 0) {
        return res.status(400).json({ message: 'Không có dữ liệu' });
      } else {
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      return res.status(500).json({ message: 'error server' });
    }
  });
};

module.exports = {
  listHistories,
};
