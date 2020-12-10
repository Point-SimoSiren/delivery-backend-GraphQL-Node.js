const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    delivered: {
        type: Boolean,
        required: true
    },
    deliveredAt: {
        type: String,
        required: false
    },
    orderedAt: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }
    ],
})

module.exports = mongoose.model('Order', schema)