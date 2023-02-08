const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const serviceSchema = mongoose.Schema({
  idHouse: {
    type: ObjectId,
    ref: 'House',
    require: true,
  },
  idRoom: {
    type: ObjectId,
    ref: 'Room',
  },
  name: {
    type: String,
    require: true,
  },
  nameRoom: {
    type: String,
  },
  month: {
    type: Number,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  inputValue: {
    type: Number,
    default: 0,
    require: true,
  },
  outputValue: {
    type: Number,
    default: 0,
    require: true,
  },
  unit: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  amount: {
    type: Number,
    require: true,
    min: 0,
  },
});

module.exports = mongoose.model('BillService', serviceSchema);
