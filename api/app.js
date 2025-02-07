if(process.env.NODE_ENV === 'production') {
  require('dotenv').config();
}
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

const cors = require('cors'); 

//---------------------------------//

const https = require('https');
const fs = require('fs');

// Sertifikaları yükle
const sslOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

// Express rotaları
app.get('/', (req, res) => {
  res.send('Merhaba, HTTPS çalışıyor!');
});

// HTTPS Sunucusunu başlat
https.createServer(sslOptions, app).listen(3001, () => {
  console.log('HTTPS sunucusu https://localhost:3001 adresinde çalışıyor');
});


//---------------------------------//




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend'in çalıştığı port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use('/api', require('./routes/index'));
require('./jobs/overdueLoansChecker');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
