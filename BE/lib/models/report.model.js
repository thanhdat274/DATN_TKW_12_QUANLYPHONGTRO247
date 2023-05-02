const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const reportSchema = mongoose.Schema(
    {
        idRoom: {
            type: ObjectId,
            ref: 'Room',
        },
        idHouse: {
            type: ObjectId,
            ref: 'House',
        },
        roomName: {
            type: String,
        },
        content: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model('Report', reportSchema);
