/**
 * Created by brian on 2/23/16.
 */
console.log('Loading...');
var fs = require('fs');
var socketIO = require('socket.io');
var express = require('express');
var mongoDao = require('./mongoDao');
var cassandraDao = require('./cassandraDao');
var redisDao = require('./redisDao');
//var mysqlDao = require('./mysqlDao');

//modules below are express middleware
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

app.use(bodyParser.json());

app.use(logger('dev'));

app.use(compression());

app.use(allowCrossDomain);

app.use('/', redisDao);


//traditional webserver stuff for serving static files
var WEB = __dirname + '/web';
app.use(favicon(WEB + '/favicon.ico'));
app.use(express.static(WEB, {maxAge: '12h'}));
app.get('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).sendFile(WEB + '/404Error.png');
});

var port = process.env.port || 8080;
var server = app.listen(port);
var io = socketIO(server);

// Socket connect
io.on('connection', function(socket){
    console.log('a user connected');

    // Chat received
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    // Disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

function gracefulShutdown(){
    console.log("\nStarting shutdown...");
    server.close(function(){
        //connection.end(); // MySql
        console.log('Shutdown complete.');
    });
}

process.on('SIGTERM', function(){
    gracefulShutdown();
});

process.on('SIGINT', function(){
    gracefulShutdown();
});


console.log(`Listening on port ${port}`);
