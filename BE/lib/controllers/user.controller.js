import User from '../models/user.model';

export const checkIdUser = (req, res, next) => {
  if (!req.params.userId) {
    return res.status(400).json({
      message: 'Thiếu parameter',
    });
  }

  if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      message: 'id người dùng không đúng định dạng',
    });
  } else {
    next();
  }
};

exports.userById = (req, res, next, id) => {
  User.findById(id, (error, user) => {
    if (error || !user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }
    req.profile = user;
    next();
  });
};
export const read = async (req, res) => {
  await User.findById(req.params.userId, (err, data) => {
    if (err || !data) {
      return res.status(400).json({
        message: 'Người dùng không tồn tại',
      });
    } else {
      return res.status(200).json({
        data,
      });
    }
  });
};

export const update = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { ...req.body }, (err, docs) => {
    if (err) {
      return res.status(400).json({
        message: 'Người dùng không tồn tại',
      });
    } else {
      return res.status(200).json({
        message: 'Cập nhật thông tin người dùng thành công',
        docs,
      });
    }
  });
};
