//CALL THE PACKAGE
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');


//APP CONFIGURATION
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

//configure our app to handle cors require
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

//log all request to the console
app.use(morgan('dev'));

//connect to database
mongoose.connect(config.database, function(err) {
  if (err) console.log('Koneksi gagal!');
});

//set static files location
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/app'));

// = = = = = = = = = = = //
//ROUTES
// = = = = = = = = = = = //

//MAIN CATCHALL ROUTE
//SEND USERS TO FRONTEND
//HAS REGISTERED AFTER API ROUTES
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
})

//API ROUTES
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

//START THE SERVER
app.listen(config.port);
console.log('Server running at http://localhost:' + config.port);
