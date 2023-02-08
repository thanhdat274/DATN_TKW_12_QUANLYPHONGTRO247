const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const BookSchema = mongoose.Schema(
  {
    idRoom: {
      type: ObjectId,
      ref: 'Room',
    },
    idHouse: {
      type: ObjectId,
      ref: 'House',
    },
    fullName: {
      type: String,
      trim: true,
      require,
    },
    email: {
      type: String,
      trim: true,
      require,
    },
    cardNumber: {
      type: String,
      trim: true,
      require: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      require,
    },
    bookMoney: {
      type: Number,
      require,
    },
    expectTime: {
      type: String,
      require,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Book', BookSchema);
