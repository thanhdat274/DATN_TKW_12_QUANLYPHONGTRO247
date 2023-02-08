const Report = require('../models/report.model');

const createReport = async (req, res) => {
  const { idRoom, idHouse, roomName, content } = req.body;
  const data = new Report({
    idRoom: idRoom,
    idHouse: idHouse,
    roomName: roomName,
    content: content,
  });
  if (!content) {
    return res.status(400).json({ message: 'Mời nhập nội dung' });
  } else {
    await data.save((err, data) => {
      try {
        if (err) {
          return res.status(400).json({ message: 'Có lỗi xảy ra' });
        } else {
          return res.status(200).json({ message: 'Thành công', data: data });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Có lỗi xảy ra' });
      }
    });
  }
};

const readReportHouse = async (req, res) => {
  await Report.find({ idHouse: req.params.id }, (err, data) => {
    try {
      if (err || data.length == 0) {
        return res.status(200).json({ message: 'Chưa có thông báo!' });
      } else {
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
  });
};

const readReportRoom = async (req, res) => {
  await Report.find({ idRoom: req.params.id }, (err, data) => {
    try {
      if (err || data.length == 0) {
        return res.status(200).json({ message: 'Chưa có thông báo!' });
      } else {
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
  });
};

const updateReport = async (req, res) => {
  await Report.findOneAndUpdate({ _id: req.params.id }, req.body, (err, data) => {
    try {
      if (err || !data) {
        return res.status(400).json({ message: 'Có lỗi xảy ra' });
      } else {
        return res.status(200).json({ message: 'Thành công', data: data });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
  });
};

const removeReport = async (req, res) => {
  await Report.findByIdAndRemove(req.params.id, (err, data) => {
    try {
      if (err || !data) {
        return res.status(400).json({ message: 'Xóa thông báo không thành công!' });
      } else {
        return res.status(200).json({ message: 'Xóa thông báo thành công!' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
  });
};

const countReportNotComp = async (req, res) => {
  await Report.find({ idHouse: req.params.idHouse, status: false }, (err, docs) => {
    if (docs) {
      return res.status(200).json({ count: docs.length });
    } else {
      return res.status(400).json({ message: 'Có lỗi xảy ra' });
    }
  });
};

module.exports = { createReport, readReportHouse, updateReport, readReportRoom, removeReport, countReportNotComp };
