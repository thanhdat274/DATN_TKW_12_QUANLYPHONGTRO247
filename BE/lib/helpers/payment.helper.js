const User = require('../models/user.model');

export const getInfoSecret = async (req, res, next) => {
  try {
    await User.findById(req.body.idUser, (err, data) => {
      if (err || !data) {
        return res.status(400).json({ message: 'Có lỗi sảy ra!' });
      } else {
        console.log(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};
