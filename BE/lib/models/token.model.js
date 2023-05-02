const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const tokenSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            required: true,
            ref: "User"
        },
        token: {
            type: String,
            required: true
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: {
                expires: 86400000
            }
        }
    }

);

module.exports = mongoose.model('Token', tokenSchema);
