var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = express.Router();

server.listen(8081);
// console.log('aaaaaaa');
io.on('connection', function (socket) {
	console.log('aaa');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

module.exports = router;