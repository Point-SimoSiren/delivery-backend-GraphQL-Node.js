const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  address: {
    type: String,
    required: true,
    minlength: 7
  },
  phone: {
    type: String,
    required: true,
    minlength: 7
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
})

module.exports = mongoose.model('User', schema)