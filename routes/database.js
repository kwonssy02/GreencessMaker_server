var express = require('express');
var router = express.Router();
require('../dbconnection')();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: '코메라: 냄새맡는 카메라' });
});
*/


// 물 준 기록 post
const postWateringHistoryURL = ("/postWateringHistory");
const postWateringHistoryQuery = ("INSERT INTO WateringHistory (deviceId, hour, minute, amount, date) SELECT deviceId, hour, minute, amount, NOW() FROM WateringInfo WHERE deviceId = ?");

router.post(postWateringHistoryURL, postWateringHistory);
function postWateringHistory(req, res, next) {

    const deviceId = req.body.deviceId;
    const queryParams = [deviceId];
    //console.log(queryParams);

    connection.query(postWateringHistoryQuery, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
}


// 물 준 기록 조회
const getWateringHistoriesURL = ("/getWateringHistories/:deviceId");
const getWateringHistoriesQUERY = ("SELECT deviceId, hour, minute, amount, date FROM WateringHistory WHERE deviceId = ? ORDER BY date DESC");

router.get(getWateringHistoriesURL, getWateringHistories);
function getWateringHistories(req, res, next) {
    const deviceId = req.params.deviceId;
    const queryParams = [deviceId];
    //console.log(queryParams);
    connection.query(getWateringHistoriesQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        
        res.json(rows);
        
    });
}

// 아이디별 기기 리스트 조회
const getDevicesByUserIdURL = ("/getDevicesByUserId/:userId");
const getDevicesByUserIdQUERY = ("SELECT deviceId, deviceName, connected FROM Devices WHERE deviceId IN (SELECT deviceId FROM DeviceMatching WHERE userId = ?) ORDER BY deviceName DESC");

router.get(getDevicesByUserIdURL, getDevicesByUserId);
function getDevicesByUserId(req, res, next) {
    const userId = req.params.userId;
    const queryParams = [userId];
    //console.log(queryParams);
    connection.query(getDevicesByUserIdQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        
        res.json(rows);
        
    });
}

// 기기id로 기기 정보 조회
const getDeviceInfoByDeviceIdURL = ("/getDeviceInfoByDeviceId/:deviceId");
const getDeviceInfoByDeviceIdQUERY = ("SELECT deviceId, deviceName, temperature, humidity, light, waterHeight, connected FROM Devices WHERE deviceId = ?");

router.get(getDeviceInfoByDeviceIdURL, getDeviceInfoByDeviceId);
function getDeviceInfoByDeviceId(req, res, next) {
    const deviceId = req.params.deviceId;
    const queryParams = [deviceId];
    //console.log(queryParams);
    connection.query(getDeviceInfoByDeviceIdQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        
        res.json(rows);
        
    });
}

// 라즈베리파이에서 기기의 현재 상태 업데이트
// 업데이트 후 변경된 알람정보 가져와야함..
const updateDeviceInfoURL = ("/updateDeviceInfo");
const updateDeviceInfoQUERY = ("UPDATE Devices SET temperature = ?, humidity = ?, light = ?, waterHeight = ? WHERE deviceId = ?");

router.post(updateDeviceInfoURL, updateDeviceInfo);
function updateDeviceInfo(req, res, next) {
    const deviceId = req.body.deviceId;
    const temperature = req.body.temperature;
    const humidity = req.body.humidity;
    const light = req.body.light;
    const waterHeight = req.body.waterHeight;
    const queryParams = [temperature, humidity, light, waterHeight, deviceId];
    //console.log(queryParams);

    connection.query(updateDeviceInfoQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
}


// 물 주기 알람 조회
// input  : deviceId
// output : deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute, status
const selectWateringInfoURL = ("/selectWateringInfo/:deviceId");
const selectWateringInfoQUERY = ("SELECT deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute, status FROM WateringInfo WHERE deviceId = ? ORDER BY insertedDate DESC");

router.get(selectWateringInfoURL, selectWateringInfo);
function selectWateringInfo(req, res, next) {
    const deviceId = req.params.deviceId;
    const queryParams = [deviceId];
    //console.log(queryParams);
    connection.query(selectWateringInfoQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        
        res.json(rows);
        
    });
}

/*
// 물 주기 알람 등록 - 초기엔 ON 상태
// input  : waterId, deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute
// output : 없음

const insertWateringInfoURL = ("/insertWateringInfo");
const insertWateringInfoQUERY = ("INSERT INTO WateringInfo (waterId, deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute, status, insertedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())");
const getNewWaterIdQUERY = ("SELECT max(waterId)+1 as waterId from WateringInfo");

router.post(insertWateringInfoURL, insertWateringInfo);
function insertWateringInfo(req, res, next) {

    // 트랜잭션 시작
    connection.beginTransaction(function(err) {
        if (err) {
            throw err;
        }

        // 새로운 waterId 가져오기
        connection.query(getNewWaterIdQUERY, function(err, rows, fields) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            }

            const waterId = rows[0].waterId;
            const deviceId = req.body.deviceId;
            const mon = req.body.mon;
            const tue = req.body.tue;
            const wed = req.body.wed;
            const thur = req.body.thur;
            const fri = req.body.fri;
            const sat = req.body.sat;
            const sun = req.body.sun;
            const amount = req.body.amount;
            const hour = req.body.hour;
            const minute = req.body.minute;

            const queryParams = [waterId, deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute];
            console.log(queryParams);

            connection.query(insertWateringInfoQUERY, queryParams, function(err, rows, fields) {
                if (err || rows.affectedRows == 0) {
                    console.error(err);
                    res.sendStatus(500);
                }

                //성공시 commit
                connection.commit(function (err) {
                    if (err) {
                        console.error(err);
                        connection.rollback(function () {
                           console.error('rollback error');
                           throw err;
                        });
                    }// if err
                    res.sendStatus(200);
 
                 });
            });
        });
        
    });
    
}
*/

// 물 주기 알람 수정 - ON 상태로 자동으로 바꿔줌
// input  : deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute
// output : 없음

const modifyWateringInfoURL = ("/modifyWateringInfo");
const modifyWateringInfoQUERY = ("UPDATE WateringInfo SET mon = ?, tue = ?, wed = ?, thur = ?, fri = ?, sat = ?, sun = ?, amount = ?, hour = ?, minute = ?, status = 1, modifiedDate = NOW() WHERE deviceId = ?");

router.post(modifyWateringInfoURL, modifyWateringInfo);
function modifyWateringInfo(req, res, next) {
    
    const deviceId = req.body.deviceId;
    const mon = req.body.mon;
    const tue = req.body.tue;
    const wed = req.body.wed;
    const thur = req.body.thur;
    const fri = req.body.fri;
    const sat = req.body.sat;
    const sun = req.body.sun;
    const amount = req.body.amount;
    const hour = req.body.hour;
    const minute = req.body.minute;

    const queryParams = [mon, tue, wed, thur, fri, sat, sun, amount, hour, minute, deviceId];
    console.log(queryParams);

    connection.query(modifyWateringInfoQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            console.error(err);
            res.sendStatus(500);
        }
        res.sendStatus(200);
    });
}

/*
// 물 주기 알람 삭제
// input  : waterId, deviceId
// output : 없음

const deleteWateringInfoURL = ("/deleteWateringInfo");
const deleteWateringInfoQUERY = ("DELETE FROM WateringInfo WHERE waterId = ? AND deviceId = ?");

router.post(deleteWateringInfoURL, deleteWateringInfo);
function deleteWateringInfo(req, res, next) {
    
    const waterId = req.body.waterId;
    const deviceId = req.body.deviceId;

    const queryParams = [waterId, deviceId];
    console.log(queryParams);

    connection.query(deleteWateringInfoQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            console.error(err);
            res.sendStatus(500);
        }
        res.sendStatus(200);
    });
}
*/


// 물 주기 알림 status 변경(on/off)
// input  : deviceId, status(0 or 1)
// output : 없음

const changeWateringInfoStatusURL = ("/changeWateringInfoStatus");
const changeWateringInfoStatusQUERY = ("UPDATE WateringInfo SET status = ? WHERE deviceId = ?");

router.post(changeWateringInfoStatusURL, changeWateringInfoStatus);
function changeWateringInfoStatus(req, res, next) {
    
    const deviceId = req.body.deviceId;
    const status = req.body.status;

    const queryParams = [status, deviceId];
    console.log(queryParams);

    connection.query(changeWateringInfoStatusQUERY, queryParams, function(err, rows, fields) {
        if (err || rows.affectedRows == 0) {
            console.error(err);
            res.sendStatus(500);
        }

        res.sendStatus(200);
    });
}


// device에서 찍은 이미지 리스트 조회
// input  : deviceId
// output : deviceId, imageId
const getImagesByDeviceIdURL = ("/getImagesByDeviceId/:deviceId");
const getImagesByDeviceIdQUERY = ("SELECT deviceId, imageId FROM Images WHERE deviceId = ? ORDER BY imageId DESC");

router.get(getImagesByDeviceIdURL, getImagesByDeviceId);
function getImagesByDeviceId(req, res, next) {
    const deviceId = req.params.deviceId;
    const queryParams = [deviceId];
    //console.log(queryParams);
    connection.query(getImagesByDeviceIdQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        
        res.json(rows);
        
    });
}

module.exports = router;