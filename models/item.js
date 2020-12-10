const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  package: {
    type: String,
    required: true,
    minlength: 3
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 7
  },
  manufacturer: {
    type: String,
    required: true,
    minlength: 3
  },
  category:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
})

module.exports = mongoose.model('Item', schema)