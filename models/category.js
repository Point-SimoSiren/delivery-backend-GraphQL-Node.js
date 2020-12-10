const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    description: {
        type: String
    },
})

module.exports = mongoose.model('Category', schema)