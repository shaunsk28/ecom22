var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars');
var app = express();
const jwt=require('jsonwebtoken')
const Swal = require('sweetalert');
const ConnectMongoDBSession=require('connect-mongodb-session')
var db=require('./config/connection')
var session=require('express-session')
const mongoDbsession=new ConnectMongoDBSession(session)
var Handlebars=require('handlebars');
const crypto = require('crypto');
const Razorpay=require('razorpay')
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { Connect } = require('twilio/lib/twiml/VoiceResponse');

const helpers = require('handlebars-helpers')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',helpers:{inc:(value, options)=>{
  return parseInt(value) + 1;
}}}))
 app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public/admin-assets")));

// app.use(nocache());
app.use(session({name : 'codeil',secret : 'something',resave :false,saveUninitialized: true,
store:new mongoDbsession({
  uri:"mongodb://localhost:27017",
  collection:"session"
})
,cookie:{maxAge:(1000 * 60 * 100)} }))
db.connect((err)=>{
  if(err)
  console.log("Connection Error"+err);
  else
  console.log("Connected to  Database ");
})
app.use('/', userRouter);
app.use('/admin', adminRouter);
Handlebars.registerHelper('eq', helpers.eq);
Handlebars.registerHelper("multiply",function(price,quantity){
  return Math.round(price*quantity*100)/100
});
Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i)
      accum += block.fn(i);
  return accum;
});
Handlebars.registerHelper('for', function(from, to, incr, block) {
  var accum = '';
  for(var i = from; i < to; i += incr)
      accum += block.fn(i);
  return accum;
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  
  res.render('error');
});

module.exports = app;

