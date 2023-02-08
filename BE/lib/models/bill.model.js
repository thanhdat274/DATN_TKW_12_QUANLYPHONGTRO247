const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const houseSchema = mongoose.Schema(
  {
    idRoom: {
      type: ObjectId,
      ref: 'Room',
    },
    idHouse: {
      type: ObjectId,
      ref: 'House',
    },
    idAuth: {
      type: ObjectId,
      ref: 'House',
    },
    address: {
      type: String,
    },
    houseName: {
      type: String,
    },
    roomName: {
      type: String,
    },
    // beginRent: {
    //     type: Date,

    // },
    memberName: {
      type: String,
    },
    // formDate: {
    //     type: Date,

    // },
    // toDate: {
    //     type: Date,

    // },
    year: {
      type: String,
    },
    month: {
      type: String,
    },
    paymentStatus: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    debt: {
      type: Number,
      default: 0,
      min: 0,
    },
    // sumAmount: {
    //     type: Number,

    // },
    // mountYear: {
    //     type: String,

    // },
    invoiceService: [
      {
        amount: Number,
        serviceName: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Bill', houseSchema);
