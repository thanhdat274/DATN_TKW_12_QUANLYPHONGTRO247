const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const billLiquidationSchema = mongoose.Schema(
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
      ref: 'User',
    },
    payment: {
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
      invoiceService: [
        {
          amount: Number,
          serviceName: String,
        },
      ],
      deposit: {
        type: Number,
        default: 0,
      },
    },
    detailRoom: {
      listMember: {
        type: Array,
      },
      contract: {
        type: Array,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BillLiquidation', billLiquidationSchema);
