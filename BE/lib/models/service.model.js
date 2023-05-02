const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const serviceSchema = mongoose.Schema({
  idHouse: {
    type: ObjectId,
    ref: 'House',
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  label: {
    type: String,
  },
  price: {
    type: Number,
    require: true,
  },
  unit: {
    type: String,
    require: true,
  },
  type: {
    type: Boolean,
    //   nếu trả theo tháng là true , k là false
    default: false,
    require: false,
  },
  doNotDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Service', serviceSchema);
