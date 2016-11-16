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
const postWateringHistoryQuery = ("INSERT INTO WateringHistory (deviceId, hour, minute, amount, date) SELECT deviceId, hour, minute, amount, NOW() FROM WateringInfo WHERE waterId = ? AND deviceId = ?");

router.post(postWateringHistoryURL, postWateringHistory);
function postWateringHistory(req, res, next) {
    const waterId = req.body.waterId;
    const deviceId = req.body.deviceId;
    const queryParams = [waterId, deviceId];
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
const getDevicesByUserIdQUERY = ("SELECT deviceId, deviceName FROM Devices WHERE deviceId IN (SELECT deviceId FROM DeviceMatching WHERE userId = ?) ORDER BY deviceName DESC");

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
const getDeviceInfoByDeviceIdQUERY = ("SELECT deviceId, deviceName, temperature, humidity, light, waterHeight FROM Devices WHERE deviceId = ?");

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


// 물 주기 알람 등록 -- 미완료
const insertWateringInfoURL = ("/insertWateringInfo");
const insertWateringInfoQUERY = ("INSERT INTO WateringInfo (waterId, deviceId, mon, tue, wed, thur, fri, sat, sun, amount, hour, minute, insertedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
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

// 물 주기 알람 수정


// 물 주기 알람 삭제


// 일회성 물주기 데이터 등록

/*
//index.ejs 홈
router.get(homeURL, home);
function home(req, res, next) {
    var data = {};
    data['title'] = '코메라: 냄새맡는 카메라';
    connection.query(selectPostsQuery, function(err, rows, fields) {
        if(err) {
            throw err;
        }
        data['posts'] = rows;
		
		connection.query(selectCommentsQuery, function(err, rows, fields) {
        	if(err) {
                throw err;
        	}
        	//res.send(rows);
        	data['comments'] = rows;
        	res.render('index', data);
    	});
    });

}

router.post(addCommentURL, addComment);
function addComment(req, res, next) {
    const imageId = req.body.imageId;
    const author = req.body.author;
    const content = req.body.content;
    const queryParams = [imageId, author, content];
    //console.log(queryParams);
    connection.query(addCommentQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
		const queryParams2 = [imageId];
		connection.query(selectCommentsByImageIdQuery, queryParams2, function(err, rows, fields) {
                if(err) {
                        throw err;
                }
                res.json(rows);
        });
    });
}

router.get(selectMorePostsURL, selectMorePosts);
function selectMorePosts(req, res, next) {
    const imageId = req.params.imageId;    
    const queryParams = [imageId];  
    var result = {};
    connection.query(selectMorePostsQuery, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        result["posts"] = rows;
        const queryParams2 = [imageId];
        connection.query(selectMoreCommentsQuery, queryParams2, function(err, rows2, fields) {
                if(err) {
                        throw err;
                }
                result["comments"] = rows2;
                res.json(result);
        });
    });
}

//index.ejs 홈
router.get(setLocationURL, setLocation);
function setLocation(req, res, next) {
    var data = {};
    data['title'] = '코메라 센서 위치 수정';
    connection.query(selectLocationsQuery, function(err, rows, fields) {
        if(err) {
            throw err;
        }
        data['locations'] = rows;
        
        res.render('setLocation', data);
    });

}

router.post(updateLocationURL, updateLocation);
function updateLocation(req, res, next) {
    const sensorId = req.body.sensorId;
    const loc = req.body.loc;
    const queryParams = [loc, sensorId];
    //console.log(queryParams);
    connection.query(updateLocationQUERY, queryParams, function(err, rows, fields) {
        if(err) {
                throw err;
        }
        res.redirect(setLocationURL);
    });
}

//index.ejs 홈
router.get(getDateURL, getDateTime);
function getDateTime(req, res, next) {
    
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();
    year %= 100;

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    // res.writeHead(200, {'Content-Type': 'text/html'});
    var result = {};
    result["time"] = year+""+month+""+day;
    res.json(result);
    

}
*/
module.exports = router;