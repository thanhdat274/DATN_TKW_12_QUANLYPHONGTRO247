const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const houseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    address: {
      type: String,
      require: true,
      trim: true,
    },
    contract: {
      type: String,
    },
    idAuth: {
      type: ObjectId,
      ref: 'User',
      require: true,
    },
    paymentInformation: {
      TmnCode: {
        type: String,
      },
      HashSecret: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('House', houseSchema);
