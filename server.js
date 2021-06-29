require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const multer = require("multer")
const path = require("path")
// Models
const Image = require("./models/image")

const app = express()
const port = process.env.PORT || 8080
const mongoURL = process.env.MONGO_URL
const isProduction = process.env.NODE_ENV === 'production'

const options = () => {
  const object = {}

  if (isProduction) {
    object.auth = {
      user: process.env.MONGO_USER,
      password: process.env.MONGO_PASSWORD
    }
    object.authSource = process.env.MONGO_AUTH_DB
  }
  object.keepAlive = true
  object.keepAliveInitialDelay = 300000
  object.useNewUrlParser = true
  object.useCreateIndex = true
  object.useUnifiedTopology = true

  return object
}

mongoose.connect(mongoURL, options(), (error) => {
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

const routes = ['dataset', 'generated']
routes.forEach(route => {
  // route get request
  app.get(`/${route}`, (req, res) => {
    try {
      Image.find({ type: route }, (err, data) => {
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
  // route post request
  app.post(`/${route}`, upload.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'avatar', maxCount: 1
  }]), (req, res, next) => {
    const image = req.files.image[0]
    const avatar = req.files.avatar[0]

    const obj = {
      type: route,
      title: req.body.title,
      caption: req.body.caption,
      account: req.body.account,
      date: new Date().toISOString(),
      avatar: {
        data: path.join('/uploads/' + avatar.filename),
        contentType: avatar.mimetype
      },
      image: {
        data: path.join('/uploads/' + image.filename),
        contentType: image.mimetype
      }
    }

    // post handler for uploading images
    Image.create(obj, (err, item) => {
      if (err) {
        console.log(err)
      } else {
        res.status(200).send(obj)
      }
    })
  })
});

app.listen(port)
