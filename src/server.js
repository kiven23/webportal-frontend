var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var axios = require('axios');
 
server.listen(3232);
 
io.on('connection', function (socket) {
      socket.on('refresh', function (data) {
        socket.broadcast.emit("refresh", data);
      });
     
});