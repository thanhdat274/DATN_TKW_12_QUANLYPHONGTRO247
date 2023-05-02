const User = require('../models/user.model');
const Token = require('../models/token.model');
const path = require('path');
const async = require('async');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // for authorization check
const crypto = require('crypto');
const { errorHandler } = require('../helpers/dbErrorsHandler');

const email = process.env.EMAIL_SMTP;
const pass = process.env.KEY_EMAIL;
const smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass: pass,
  },
});
let handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('./lib/templates/'),
  extName: '.html',
};
smtpTransport.use('compile', hbs(handlebarsOptions));

exports.signup = async (req, res) => {
  try {
    await User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      } else if (user) {
        return res.status(400).json({ message: 'Địa chỉ email này đã được sử dụng' });
      } else {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        await user.save(async (err) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          const token = new Token({
            userId: user._id,
            token: crypto.randomBytes(16).toString('hex'),
          });
          await token.save(async (err) => {
            if (err) {
              return res.status(500).json({ message: err.message });
            } else {
              const data = {
                to: user.email,
                from: email,
                template: 'verify-email',
                subject: 'Xác minh tài khoản',
                context: {
                  url: process.env.BASE_FE + '/auth/verify-email?email=' + user.email + '&token=' + token.token,
                  name: user.name,
                },
              };
              await smtpTransport.sendMail(data, (err) => {
                if (err) {
                  return res.status(500).json({ err: err, message: 'Có lỗi xảy ra vui lòng thử lại.' });
                }
                return res.status(200).json({
                  message:
                    'Email xác minh đã được gửi tới ' + user.email + '. Vui lòng kiểm tra email của bạn để xác minh.',
                });
              });
            }
          });
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
  }
};

exports.confirmEmail = (req, res) => {
  Token.findOne({ token: req.params.token }, (err, token) => {
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Liên kết xác minh của bạn đã hết hạn. Vui lòng nhấp vào gửi lại để xác minh email của bạn' });
    } else {
      User.findOne({ _id: token.userId, email: req.params.email }, (err, user) => {
        if (!user) {
          return res.status(401).json({ message: 'Chúng tôi không thể tìm thấy người dùng. Vui lòng đăng ký!' });
        } else if (user.isVerified) {
          return res.status(200).json({ message: 'Người dùng đã được xác minh. Vui lòng hãy đăng nhập' });
        } else {
          user.isVerified = true;
          user.save(function (err) {
            if (err) {
              return res.status(500).json({ message: err.message });
            } else {
              return res.status(200).json({ message: 'Tài khoản của bạn đã được xác minh thành công' });
            }
          });
        }
      });
    }
  });
};

exports.resendLink = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        message: 'Chúng tôi không thể tìm thấy người dùng có email đó. Đảm bảo rằng Email của bạn là chính xác',
      });
    } else if (user.isVerified) {
      return res.status(200).json({ message: 'Người dùng đã được xác minh. Vui lòng hãy đăng nhập' });
    } else {
      const token = new Token({
        userId: user._id,
        token: crypto.randomBytes(16).toString('hex'),
      });
      Token.deleteMany({ userId: user._id }, (err, data) => { });
      token.save((err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        const data = {
          to: user.email,
          from: email,
          template: 'verify-email',
          subject: 'Xác minh tài khoản',
          context: {
            url: process.env.BASE_FE + '/auth/verify-email?email=' + user.email + '&token=' + token.token,
            name: user.name,
          },
        };
        smtpTransport.sendMail(data, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Có lỗi xảy ra vui lòng thử lại.' });
          }
          return res.status(200).json({
            message: 'Email xác minh đã được gửi tới ' + user.email + '. Vui lòng kiểm tra email của bạn để xác minh.',
          });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  User.findOne({ email: data.email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Email không tồn tại. Vui lòng đăng ký' });
    }
    if (!user.authenticate(data.password)) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng. Xin thử lại' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email của bạn chưa được xác minh' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist the token as 't' in cookie with
    res.cookie('t', token, { expire: new Date() + 30 * 24 * 60 * 60 });
    const { _id, name, email, role } = user;
    user.hashed_password = undefined;
    user.salt = undefined;
    return res.status(200).json({
      token,
      user: user,
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('t');
  res.json({
    message: 'Đăng xuất thành công',
  });
};

exports.changePassword = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    } else if (!user) {
      return res.status(400).json({
        message: 'Chúng tôi không thể tìm thấy người dùng có email đó. Đảm bảo rằng Email của bạn là chính xác',
      });
    } else {
      if (!user.authenticate(req.body.oldPassword)) {
        return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
      } else {
        if (req.body.newPassword === req.body.verifyPassword) {
          user.password = req.body.newPassword;
          user.save((err) => {
            if (err) {
              return res.status(422).send({
                message: err,
              });
            } else {
              return res.status(200).json({ message: 'Thay đổi mật khẩu thành công' });
            }
          });
        } else {
          return res.status(422).send({
            message: 'Mật khẩu không trùng khớp',
          });
        }
      }
    }
  });
};

exports.forgot_password = (req, res) => {
  async.waterfall(
    [
      function (done) {
        User.findOne({ email: req.body.email }).exec((err, user) => {
          if (user) {
            done(err, user);
          } else {
            done('Người dùng không tồn tại');
          }
        });
      },
      function (user, done) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const err = '';
        done(err, user, token);
      },
      function (user, token, done) {
        User.findByIdAndUpdate(
          { _id: user._id },
          { reset_password_token: token, reset_password_expires: Date.now() + 86400000 },
          { new: true },
        ).exec((err, new_user) => {
          done(err, token, new_user);
        });
      },
      function (token, user, done) {
        const data = {
          to: user.email,
          from: email,
          template: 'forgot-password-email',
          subject: 'Hỗ trợ đổi mật khẩu!',
          context: {
            url: process.env.BASE_FE + '/auth/reset-password?token=' + token,
            name: user.name,
          },
        };
        smtpTransport.sendMail(data, function (err) {
          if (!err) {
            return res.json({ message: 'Vui lòng kiểm tra email của bạn để được hướng dẫn thêm' });
          } else {
            console.log(err);
            return done(err);
          }
        });
      },
    ],
    function (err) {
      return res.status(422).json({ message: err });
    },
  );
};

exports.reset_password = (req, res, next) => {
  User.findOne({ reset_password_token: req.body.token, reset_password_expires: { $gt: Date.now() } }).exec(
    (err, user) => {
      if (!err && user) {
        if (req.body.newPassword === req.body.verifyPassword) {
          user.password = req.body.newPassword;
          user.reset_password_token = undefined;
          user.reset_password_expires = undefined;
          user.save((err) => {
            if (err) {
              return res.status(422).send({
                message: err,
              });
            } else {
              const data = {
                to: user.email,
                from: email,
                template: 'reset-password-email',
                subject: 'Xác nhận đặt lại mật khẩu',
                context: {
                  name: user.name,
                },
              };
              smtpTransport.sendMail(data, function (err) {
                if (!err) {
                  return res.json({ message: 'Thay đổi mật khẩu thành công' });
                } else {
                  return done(err);
                }
              });
            }
          });
        } else {
          return res.status(422).send({
            message: 'Mật khẩu không trùng khớp',
          });
        }
      } else {
        return res.status(400).send({
          message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
        });
      }
    },
  );
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      message: 'Access Denied',
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role == 0) {
    return res.status(403).json({
      message: 'Admin resource! Access Denined',
    });
  }
  next();
};

exports.isAuthHouse = (req, res, next) => {
  if (req.profile.id != req.idHouse) {
    return res.status(403).json({
      message: 'Access Denined',
    });
  }
  next();
};
