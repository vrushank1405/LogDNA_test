// Get required modules
var convert        = require('./helpers/convert');
var convert_routes = require('./routes/convert');
var express        = require('express');
var app            = express();

// Set routes
app.use('/convert',convert_routes);

module.exports = app;
