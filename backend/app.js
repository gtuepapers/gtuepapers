const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require("cors")

const app = express()
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use("/json/", express.static("./python-scrapper/json/"))


var requestHandler = require("./requestHandler")
requestHandler(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json("Ohhh! What you asking for??🤯️")
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
module.exports = app
