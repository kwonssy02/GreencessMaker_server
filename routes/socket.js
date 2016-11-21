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

    // 라즈베리파이 접속
	socket.on('raspberrypi-join', function (deviceId) {
		// console.log('device ' + socket.name + ' connected');
		socket.name = 'raspberrypi/' + deviceId;
		console.log(socket.name + ' joined');
		updateDeviceConnected(deviceId, 1);
	});

    // 핸드폰 접속
    socket.on('phone-join', function (userId) {
        // console.log('device ' + socket.name + ' connected');
        socket.name = 'phone/' + userId;
	   console.log(socket.name + ' joined');	
    });

    socket.on('phone-socket', function (deviceId) {
        var intervalId = setInterval(function(){
            if(socket.connected) {
                // var deviceInfo = getDeviceInfoByDeviceId(deviceId);
                const getDeviceInfoByDeviceIdQUERY = ("SELECT deviceId, deviceName, temperature, humidity, light, waterHeight FROM Devices WHERE deviceId = ?");
                const queryParams = [deviceId];
                //console.log(queryParams);
                connection.query(getDeviceInfoByDeviceIdQUERY, queryParams, function(err, rows, fields) {
                    if(err) {
                            throw err;
                    }
                    console.log('deviceInfo='+rows[0]);
                    socket.emit('DeviceInfo', rows[0]);
                });
                
            }else {
                clearInterval(intervalId);
            }
        }, 2000);
    });

    // 라즈베리파이 디바이스 정보 업데이트
	socket.on('updateDeviceInfo', function (deviceInfo) {
		updateDeviceInfo(deviceInfo);
	});

    // 접속 끊겼을 때
	socket.on('disconnect', function(){
        console.log( socket.name + ' has disconnected from the chat.' + socket.id);
        var deviceType = socket.name.split("/")[0];
        var deviceId = socket.name.split("/")[1];
        if(deviceType == 'raspberrypi') {
            updateDeviceConnected(deviceId, 0);
        }
    });

    // 라즈베리파이 이미지 저장
    socket.on('image', function(data) {
        
        var buffer = data["buffer"];
        var deviceId = socket.name.split("/")[1];
        // console.log('image received: ' + buffer);
        saveImage(deviceId, buffer);
        
    });


});

module.exports = router;


// 라즈베리파이에서 받아온 이미지 저장
const getNewImageIdQUERY = ("SELECT IFNULL(MAX(imageId), 0)+1 as imageId FROM Images WHERE deviceId = ?");
const insertImageQUERY = ("INSERT INTO Images (deviceId, imageId, date) VALUES (?, ?, NOW())");

function saveImage(deviceId, buffer) {
    const dir = './public/images/';
    const queryParams = [deviceId];
    //console.log(queryParams);

    connection.query(getNewImageIdQUERY, queryParams, function(err, rows, fields) {
        if (rows.length == 0) {
            return;
        }

        var imageId = rows[0].imageId;
        const queryParams2 = [deviceId, imageId];

        connection.query(insertImageQUERY, queryParams2, function(err, rows, fields) {
            if (err || rows.affectedRows == 0) {
                console.log('failed');
            } else {
                fs.writeFile(dir + deviceId + '-' + imageId + '.png', buffer, 'binary', function(err){
                    if(err)
                        console.log(err);
                    else
                        console.log(deviceId + '-' + imageId + '.png image saved');
                });
            }
        });
    });
}


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


/*
// 기기id로 기기 정보 조회
const getDeviceInfoByDeviceIdQUERY = ("SELECT deviceId, deviceName, temperature, humidity, light, waterHeight FROM Devices WHERE deviceId = ?");

function getDeviceInfoByDeviceId(deviceId) {
    const queryParams = [deviceId];
    //console.log(queryParams);
    connection.query(getDeviceInfoByDeviceIdQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        console.log('row='+rows[0]);
        return rows[0];
    });
}
*/

