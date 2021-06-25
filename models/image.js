const mongoose = require("mongoose")

const ImageSchema = mongoose.Schema({
  title: String,
  caption: String,
  date: String,
  image: {
    data: String,
    contentType: String
  }
})

module.exports = new mongoose.model("Image", ImageSchema)