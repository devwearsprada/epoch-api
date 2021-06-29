const mongoose = require("mongoose")

const ImageSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['dataset', 'generated'],
    default: 'generated'
  },
  title: String,
  caption: String,
  date: String,
  account: String,
  avatar: {
    data: String,
    contentType: String
  },
  image: {
    data: String,
    contentType: String
  }
})

module.exports = new mongoose.model("Image", ImageSchema)