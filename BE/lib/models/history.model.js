const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const historySchema = new mongoose.Schema(
  {
    idHouse: {
      type: ObjectId,
      require: true,
      ref: 'House',
    },
    model: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('History', historySchema);
