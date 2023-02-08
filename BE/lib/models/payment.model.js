const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const houseSchema = mongoose.Schema(
  {
    idHouse: {
      ref: 'House',
      type: ObjectId,
      require: true,
    },
    idRoom: {
      type: String,
      require: true,
      trim: true,
    },
    content: {
      type: String,
    },
    month: {
      type: String,
      require: true,
    },
    year: {
      type: String,
      require: true,
    },
    value: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', houseSchema);
