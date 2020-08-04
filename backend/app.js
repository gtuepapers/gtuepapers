const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require("cors")
const requestHandler = require("./requestHandler")
const timeout = require("connect-timeout")

const app = express()
app.use(logger('dev'))
app.use(timeout('5m'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use("/json/", express.static("./python-scrapper/json/"))

requestHandler(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json("Ohhh! What you asking for??🤯️")
})

module.exports = app