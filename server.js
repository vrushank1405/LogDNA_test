// Get required modules
var app = require('./app');
var config = require('./config/config');

// Configure web server
app.set('port', config.WEB_SERVER_PORT);

// Start Web server
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
