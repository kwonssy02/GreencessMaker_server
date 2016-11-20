var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = express.Router();

require('../dbconnection')();

server.listen(8081);
// console.log('aaaaaaa');
io.on('connection', function (socket) {
	console.log('client connected');

	socket.on('join', function (deviceId) {
		// console.log('device ' + socket.name + ' connected');
		socket.name = deviceId;
		updateDeviceConnected(socket.name, 1);
	});

	socket.on('updateDeviceInfo', function (deviceInfo) {
		updateDeviceInfo(deviceInfo);
	});

	socket.on('disconnect', function(){
        // console.log( socket.name + ' has disconnected from the chat.' + socket.id);
        updateDeviceConnected(socket.name, 0);
    });

    socket.on('image', function(data) {
        var dir = './public/images/';
        var buffer = data["buffer"];
        // console.log('image received: ' + buffer);
        
        fs.writeFile(dir + socket.name + '.png', buffer, 'binary', function(err){
            if(err)
                console.log(err);
            else
                console.log(socket.name + '.png image saved');
        });
    });
});

module.exports = router;



// 라즈베리파이에서 기기의 현재 상태 업데이트
// 업데이트 후 변경된 알람정보 가져와야함..
const updateDeviceInfoQUERY = ("UPDATE Devices SET temperature = ?, humidity = ?, light = ?, waterHeight = ? WHERE deviceId = ?");

function updateDeviceInfo(deviceInfo) {
    const deviceId = deviceInfo.deviceId;
    const temperature = deviceInfo.temperature;
    const humidity = deviceInfo.humidity;
    const light = deviceInfo.light;
    const waterHeight = deviceInfo.waterHeight;
    const queryParams = [temperature, humidity, light, waterHeight, deviceId];
    //console.log(queryParams);

    connection.query(updateDeviceInfoQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            console.log('failed');
        } else {
            console.log('success');
        }
    });
}



// 기기 접속 정보 업데이트
const updateDeviceConnectedQUERY = ("UPDATE Devices SET connected = ? WHERE deviceId = ?");

function updateDeviceConnected(deviceId, connected) {
    const queryParams = [connected, deviceId];
    console.log(queryParams);

    connection.query(updateDeviceConnectedQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            console.log('device 접속정보 update failed');
        } else {
            console.log('device 접속정보 update success');
        }
    });
}




