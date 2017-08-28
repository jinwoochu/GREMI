// fileSystem
var fs = require('fs');

// xmlparser
var parser = require('xml-parser');

var contract = require('../../contract');

// request 
var request = require('request');
//요청 페이지의 내용을 받아온다.
var UsdToKrw;
var UsdToEur;
request('http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote', function(error, response, body) {

  var obj = parser(body);
  //환율 정보 
  UsdToKrw = obj.root.children[1].children[0].children[1].content;
  UsdToEur = obj.root.children[1].children[63].children[1].content;
});

// crypto!!
const crypto = require('crypto');


// mysql
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql!!",
  database: "gremi"
});

// 메모리 아이디 받을 용도로 사용한다.
var memId;




//회원가입 
exports.register = function(req, res) {

  var email = req.body.email;
  var password = getSecretPassword(req.body.password);
  var country = req.body.country;
  var walletAddress = req.body.wallet_address;

  var selectQuery = "SELECT * FROM users WHERE email=?";
  var selectQueryParams = [email];

  con.query(selectQuery, selectQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "회원가입에 실패했습니다.", {});
      res.json(response);
      return;
    }

    if (result.length != 0) {
      response = makeResponse(0, "이미 등록된 아이디입니다.", {});
      res.json(response);
      return;
    } else { // default 이미지 경로 지정 

      var randomNum = makeRandom(1, 5);
      var userDefaultImagePath = "/default_images/" + randomNum + ".jpg";
      var insertQuery = "INSERT INTO users (email, password,country,wallet_address, profile_image) VALUES (?,?,?,?,?)";
      var insertQueryParams = [email, password, country, walletAddress, userDefaultImagePath];

      con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
        if (err2) {
          response = makeResponse(0, "회원가입에 실패했습니다.", {});
          res.json(response);
          return;
        }

        response = makeResponse(1, "", {});
        res.cookie('email', email, { signed: true });
        res.cookie('wallet_address', walletAddress, { signed: false });
        res.json(response);
      });
    }
  });
}


//유저 프로필 이미지 등록
exports.profileImageUpload = function(req, res) {
  var email = req.signedCookies.email;

  // 디렉토리생성
  var profileDirPath = './public/profile_images/' + email;
  if (!fs.existsSync(profileDirPath)) {
    fs.mkdirSync(profileDirPath);
  }

  var profileImage = req.files.profile_image;
  var profileImagePath = profileDirPath + '/' + profileImage.name;

  profileImage.mv(profileImagePath, function(err) {
    if (err) {
      response = makeResponse(0, "이미지 업로드 실패", {});
      res.json(response);
      return;
    }

    // db에 등록된 이미지 path 
    var imagePath = profileImagePath.replace('/public', "");
    var updateQuery = "UPDATE users SET profile_image=? WHERE email=?";
    var updateQueryParams = [imagePath, email];

    con.query(updateQuery, updateQueryParams, function(err, result, field) {
      if (err) {
        response = makeResponse(0, "이미지 등록 실패", {});
        res.json(response);
        return;
      }
      response = makeResponse(1, "", { "path": imagePath });
      res.json(response);
    });
  });
}


// 프로필's new memory text upload
exports.memoryText = function(req, res) {

  var email = req.signedCookies.email;
  var data = req.body;

  var insertQuery = "INSERT INTO memory (title, start_date, end_date, memo, email) VALUES (?,?,?,?,?)";
  var insertQueryParams = [data.title, data.start_date, data.end_date, data.memo, email];

  con.query(insertQuery, insertQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "알맞은 날짜를 입력해 주세요.", {});
      res.json(response);
      return;
    }

    memId = result.insertId;
    // 파일 디렉토리 생성
    var memoryImageDir = './public/memory_images/' + memId;
    if (!fs.existsSync(memoryImageDir)) {
      fs.mkdirSync(memoryImageDir);
    }

    response = makeResponse(1, "", {});
    res.json(response);
  });
}



exports.memoryImages = function(req, res) {

  var memoryId = memId;
  var imageDirPath = './public/memory_images/' + memoryId;

  var iPath = [];
  if (req.files.images) {
    var memoryImages = req.files.images;

    for (var i = 0; i < memoryImages.length; i++) {
      var imagePath = imageDirPath + '/' + memoryImages[i].name;
      iPath.push(imagePath);
      (function(i, imagePath) {
        memoryImages[i].mv(imagePath, function(err) {
          if (err) {
            response = makeResponse(0, "실패2", {});
            res.json(response);
            return;
          }
        });
      })(i, imagePath);
    }
  }
  response = makeResponse(1, '', { "imagesPath": iPath });
  res.json(response);
}







// 로그인되어있는지 , 쿠키 확인 
exports.isLogined = function(req, res, next) {
  if (req.signedCookies.email === undefined) {
    res.redirect('/');
  } else {
    next();
  }
}

// 로그인 체킹 로직
exports.login = function(req, res) {
  var email = req.body.email;
  var password = getSecretPassword(req.body.password);

  var selectQuery = 'SELECT wallet_address FROM users WHERE email=? AND password=?';
  var selectQueryParams = [email, password];

  con.query(selectQuery, selectQueryParams, function(err, result, field) {
    if (err) {
      throw err;
      response = makeResponse(0, "로그인에 실패했습니다.", {});
      res.json(response);
    } else {
      if (result.length == 0) {
        response = makeResponse(0, "로그인에 실패했습니다.", {});
        res.json(response);
      } else {
        response = makeResponse(1, "", {});
        res.cookie('email', email, { signed: true });
        res.cookie('wallet_address', result[0].wallet_address, { signed: false });
        res.json(response);
      }
    }
  });
};

// 해당 email 주소를 가진 user 정보를 profile.html에 던져야한다.
exports.getProfile = function(req, res) {
  var email = req.signedCookies.email;

  var selectQuery = "SELECT wallet_address, profile_image, g_coin FROM users WHERE email=?";
  var selectQueryParams = [email];

  con.query(selectQuery, selectQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "Errer", {});
      res.json(response);
      return;
    } else {
      if (result.length == 0) {
        response = makeResponse(0, "쿠키 조작하지마세요", {});
        res.json(response);
      } else {
        res.render('profile.html', { "profile": result[0] });
      }
    }
  });
}


// 코인 살때 환율 보여주기 
exports.expectCoin = function(req, res) {

  var email = req.signedCookies.email;
  var data = req.query;
  if (data.type === undefined || data.money === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
    return;
  } else if (data.type == "krw") { //한화 일때
    console.log(data.money / UsdToKrw);
    response = makeResponse(1, "", { "expectCoin": data.money / UsdToKrw });
    res.json(response);
  } else if (data.type == "eur") { // 유로화 일때
    console.log(data.money / UsdToEur);
    response = makeResponse(1, "", { "expectCoin": data.money / UsdToEur });
    res.json(response);
  } else { // 달러일때
    console.log(data.money);
    response = makeResponse(1, "", { "expectCoin": data.money });
    res.json(response);
  }
}


// 코인 사기 (통화 --> 코인)
exports.buyCoin = function(req, res) {
  var email = req.signedCookies.email;
  var data = req.body;
  var coin = 0;

  if (data.type === undefined || data.money === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
    return;
  } else if (data.type == "krw") { //한화 일때
    coin = data.money / UsdToKrw;
  } else if (data.type == "eur") { // 유로화 일때
    coin = data.money / UsdToEur;
  } else { // 달러일때
    coin = data.money;
  }

  var selectQuery = "SELECT g_coin, wallet_address FROM users WHERE email=?";
  var selectQueryParams = [email];

  con.query(selectQuery, selectQueryParams, function(err, result, field) {
    var request = {
      'walletAddress': result[0].wallet_address,
      'value': coin
    };

    contract.depositCoin(request, function(txId) {
      var insertQuery = "INSERT INTO exchange_log (email, exchange_type, currency_type, currency_amount, g_coin, tx_id) VALUES (?,?,?,?,?,?)";
      var insertQueryParams = [email, 0, data.type, data.money, coin, txId];

      console.log(insertQueryParams);

      con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
        if (err2) {
          response = makeResponse(-1, "알수없는에러", {});
          res.json(response);
          return;
        }
        console.log((result[0].g_coin - 0) + (coin - 0));
        updateGCoin((result[0].g_coin - 0) + (coin - 0), email, res);
      });
    });

  });
}

// 코인 팔기 (코인 --> 통화) 수수료 0.15% 받음.
exports.sellCoin = function(req, res) {
  var email = req.signedCookies.email;
  var data = req.body;
  var exchangeType = 1;
  var meney = 0;

  if (data.type === undefined || data.coin === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
    return;
  } else if (data.type == "krw") { //한화 일때
    money = data.coin * UsdToKrw * 0.9985;

  } else if (data.type == "eur") { // 유로화 일때
    money = data.coin * UsdToEur * 0.9985;
  } else { // 달러일때
    money = data.coin * 0.9985;
  }

  var readQuery = "SELECT g_coin, wallet_address FROM users WHERE email=?";
  var readQueryParams = [email];

  con.query(readQuery, readQueryParams, function(err, result, field) {
    if (result[0].g_coin - data.coin < 0) {
      response = makeResponse(-1, "코인이 부족합니다.", {});
      res.json(response);
      return -1;
    }

    var request = {
      'walletAddress': result[0].wallet_address,
      'password': data.password,
      'value': data.coin
    };

    contract.widthrawCoin(request, function(txId) {

      console.log(txId);

      var insertQuery = "INSERT INTO exchange_log (email, exchange_type, currency_type, currency_amount, g_coin, tx_id) VALUES (?,?,?,?,?,?)";
      var insertQueryParams = [email, 1, data.type, money, data.coin, txId];

      con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
        if (err2) {
          response = makeResponse(-1, "알수없는에러", {});
          res.json(response);
          return;
        }
        updateGCoin(result[0].g_coin - data.coin, email, res);
      });
    });
  });
}

// 코인 팔때 환율 보여주기 수수료 0.15% 받음 
exports.expectMoney = function(req, res) {
  var data = req.query;

  if (data.type === undefined || data.coin === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
  } else if (data.type == "krw") { //한화 일때
    console.log(data.coin * UsdToKrw);
    response = makeResponse(1, "", { "expectMoney": data.coin * UsdToKrw * 0.9985 });
    res.json(response);
  } else if (data.type == "eur") { // 유로화 일때
    console.log(data.coin * UsdToEur);
    response = makeResponse(1, "", { "expectMoney": data.coin * UsdToEur * 0.9985 });
    res.json(response);
  } else { // 달러일때
    console.log(data.coin);
    response = makeResponse(1, "", { "expectMoney": data.coin * 0.9985 });
    res.json(response);
  }
}

exports.travel = function(req, res) {
  var data = req.body;
  var email = req.signedCookies.email;
  var request = {
    'walletAddress': req.cookies.wallet_address,
    'password': data.password,
    'value': data.price,
    'campaignId': data.buildingId
  };

  contract.revenueContribute(request, function(txId) {
    var insertQuery = "INSERT INTO travel (b_id, start_date, end_date, price, email, tx_id) VALUES (?,?,?,?,?,?)";
    var insertQueryParams = [data.buildingId, data.start_date, data.end_date, data.price, email, txId];

    con.query(insertQuery, insertQueryParams, function(err, result, field) {
      if (err) {
        response = makeResponse(1, "알수없는에러", {});
        res.json(response);
        return;
      }
      response = makeResponse(0, "", {});
      res.json(response);
    });
  });
};

// 해당 유저의 모든 입출금 내역 보기.
exports.viewExchangeLog = function(req, res) {
  var email = req.signedCookies.email;
  var readQuery = "SELECT exchange_type,dt,currency_type,currency_amount,g_coin,tx_id FROM exchange_log WHERE email = ?";
  var readQueryParams = email;

  con.query(readQuery, readQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "로그 출력 실패", {});
      res.json(response);
      return;
    }
    response = makeResponse(1, "", { "log": result });
    res.json(response);
  });
}

// confirm된 빌딩 목록을 모두 반환해서 사용자들이 여행가고싶을때 선택할 수 있도록 함.
exports.travelSearch = function(req, res) {
  // res.send("ggg");
  var ne_x = req.query.northeast_lng;
  var ne_y = req.query.northeast_lat;
  var sw_x = req.query.southwest_lng;
  var sw_y = req.query.southwest_lat;

  var selectQuery = "SELECT b_id, country, state, city, street, lat, lng, price FROM buildings WHERE ? <= lng AND lng <= ? AND ? <= lat AND lat <= ? AND status = 2";
  var selectQueryParams = [sw_x, ne_x, sw_y, ne_y];

  con.query(selectQuery, selectQueryParams, function(err, rows, fields) {
    if (err) {
      response = makeResponse(0, "검색에 실패했습니다.", {});
      res.json(response);
      return;
    } else {
      for (var i = 0; i < rows.length; i++) {
        var imageDirPath = './public/building_images/' + rows[i]['b_id'];

        rows[i]['images'] = [];

        fs.readdirSync(imageDirPath).forEach(file => {
          rows[i]['images'].push('/building_images/' + rows[i]['b_id'] + '/' + file);
        });
      }
      // console.log(rows);
      response = makeResponse(1, "", { buildings: rows });
      res.json(response);
    }
  });
}

//패스워드 암호화 함수
function getSecretPassword(password) {
  var cipher = crypto.createCipher('aes-256-cbc', '열쇠');
  var secretPassword = cipher.update(password, 'utf8', 'base64');
  return secretPassword + cipher.final('base64');
}

// 리스폰스 만드는 함수
function makeResponse(status, errorMessage, data) {
  var response = {
    status: status,
    error_message: errorMessage
  };

  for (var key in data) {
    response[key] = data[key];
  }
  return response;
}

// G_coin update함수
function updateGCoin(coin, email, res) {
  var updateQuery = "UPDATE users SET g_coin=? WHERE email=?";
  var updateQueryParams = [coin, email];

  con.query(updateQuery, updateQueryParams, function(err2, result2, field2) {
    if (err2) {
      response = makeResponse(0, "작업 실패", {});
      res.json(response);
      return;
    }
    response = makeResponse(1, "", { 'coin': coin });
    res.json(response);
  });
}

// 랜덤 함수(정수)
function makeRandom(min, max) {
  var RandVal = Math.random() * (max - min) + min;
  return Math.floor(RandVal);
}