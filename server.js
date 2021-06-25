require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
// Models
const Image = require("./models/image")

const app = express()
const port = process.env.PORT || 8080
const mongoURL = process.env.MONGO_URL

const options = {
  user: process.env.NODE_ENV === 'production' ? process.env.MONGO_USER : null,
  password: process.env.NODE_ENV === 'production' ? process.env.MONGO_PASSWORD : null,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}

mongoose.connect(mongoURL, options, (error) => {
  (!error) ? console.log('Connected to MongoDB') : console.log(error)
})

app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// set up multer for storing uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// get handler for retrieving images
app.get("/images", (req, res) => {
  try {
    Image.find((err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.status(200).send(data)
      }
    })
  } catch (error) {
    console.log(error)
  }
})

// post handler for uploading images
app.post("/images", upload.single("image"), (req, res, next) => {
  const obj = {
    title: req.body.title,
    caption: req.body.caption,
    date: new Date().toISOString(),
    image: {
      data: path.join('/uploads/' + req.file.filename),
      contentType: 'image/png'
    }
  }

  Image.create(obj, (err, item) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send(obj)
    }
  })
})


app.listen(port)