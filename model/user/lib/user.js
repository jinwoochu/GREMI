// fileSystem
var fs = require('fs');

// xmlparser
var parser = require('xml-parser');

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
      console.log(userDefaultImagePath);
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
        console.log(response);
        res.json(response);
      });
    }
  });
}


//유저 프로필 이미지 등록
exports.profileImageUpload = function(req, res) {
  // var email = req.signedCookies.email;
  var email = req.body.email;

  // console.log(image);
  // console.log(email);

  // 디렉토리생성
  var profileDirPath = './public/profile_images/' + email;
  if (!fs.existsSync(profileDirPath)) {
    fs.mkdirSync(profileDirPath);
  }

  var profileImage = req.files.profileImage;
  var profileImagePath = profileDirPath + '/' + profileImage.name;

  profileImage.mv(imagePath, function(err) {
    if (err) {
      response = makeResponse(0, "이미지 업로드 실패", {});
      res.json(response);
      return;
    }
    response = makeResponse(1, "", {});
    res.json(response);
  });

  // var updateQuery = "UPDATE users SET profile_image=? WHERE u_id=?";
  // var updateQueryParams = [, email];

  // con.query(updateQuery, updateQueryParams, function(err, result, field) {
  //   if (err) {
  //     response = makeResponse(0, "이미지 등록 실패", {});
  //     res.json(response);
  //     return;
  //   }
  //   response = makeResponse(1, "", {});
  //   res.json(response);
  // });

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
        console.log("유저 로그인 성공");
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


// 코인 환율 보여주기 
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

  if (data.type === undefined || data.money === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
    return;
  } else if (data.type == "krw") { //한화 일때
    insertExchangeLog(data.money / UsdToKrw, 0, email, data);
    updateGCoin(data.money / UsdToKrw, email, res);
  } else if (data.type == "eur") { // 유로화 일때
    insertExchangeLog(data.money / UsdToEur, 0, email, data);
    updateGCoin(data.money / UsdToEur, email, res);
  } else { // 달러일때
    insertExchangeLog(data.money, 0, email, data);
    updateGCoin(data.money, email, res);
  }
}

// 코인 팔기 (코인 --> 통화) 수수료 0.15% 받음.
exports.sellCoin = function(req, res) {
  var email = req.signedCookies.email;
  var data = req.body;

  if (data.type === undefined || data.money === undefined) {
    response = makeResponse(0, "입력 에러", {});
    res.json(response);
    return;
  } else if (data.type == "krw") { //한화 일때
    insertExchangeLog((data.money / UsdToKrw) * 1.15, 1, email, data, res);
    updateGCoin((data.money / UsdToKrw) * -1.15, email, res);
  } else if (data.type == "eur") { // 유로화 일때
    insertExchangeLog((data.money / UsdToEur) * 1.15, 1, email, data, res);
    updateGCoin((data.money / UsdToEur) * -1.15, email, res);
  } else { // 달러일때
    insertExchangeLog(data.money * 1.15, 1, email, data, res);
    updateGCoin(data.money * -1.15, email, res);
  }
}


// 해당 유저의 모든 입출금 내역 보기.
exports.viewExchangeLog = function(req, res) {
  var email = req.signedCookies.email;
  var readQuery = "SELECT exchange_type,dt,currency_type,currency_amount,g_coin,tx_id FROM exchange_log WHERE email = ?";
  var readQueryParams = email;

  console.log(email);
  console.log(readQueryParams);

  con.query(readQuery, readQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "로그 출력 실패", {});
      res.json(response);
      return;
    }
    response = makeResponse(1, "", { "log": result[0] });
    res.json(response);
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
  var readQuery = "SELECT g_coin FROM users WHERE email=?";
  var readQueryParams = [email];
  var previousCoin;
  con.query(readQuery, readQueryParams, function(err, result, field) {
    previousCoin = result[0].g_coin;

    var updateQuery = "UPDATE users SET g_coin=? WHERE email=?";
    var updateQueryParams = [(coin - 0 + previousCoin), email];

    var validation = (coin - 0 + previousCoin);
    // console.log(validation);
    if (validation < 0) {
      return -1;
    }

    con.query(updateQuery, updateQueryParams, function(err2, result2, field2) {
      if (err2) {
        response = makeResponse(0, "작업 실패", {});
        res.json(response);
        return;
      }
      response = makeResponse(1, "", {});
      res.json(response);
    });
  });
}


function insertExchangeLog(coin, exchange_type, email, data, res) {

  console.log(coin);
  console.log(email);
  console.log(exchange_type);
  console.log(data);

  var readQuery = "SELECT g_coin FROM users WHERE email=?";
  var readQueryParams = [email];
  var previousCoin;
  con.query(readQuery, readQueryParams, function(err, result, field) {
    previousCoin = result[0].g_coin;

    // console.log("이전 코인:" + previousCoin)
    var validation;
    if (exchange_type == 1) {
      validation = (-coin - 0 + previousCoin);
    }
    // console.log(validation);
    if (validation < 0) {
      response = makeResponse(-1, "코인이 부족합니다.", {});
      res.json(response);
      return -1;
    }

    var insertQuery = "INSERT INTO exchange_log (email, exchange_type, currency_type, currency_amount, g_coin) VALUES (?,?,?,?,?)";
    var insertQueryParams = [email, exchange_type, data.type, data.money, coin];

    con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
      if (err2) {
        console.log("로그 입력실패");
        return;
      }
      console.log("로그 입력성공");
    });
  });
}


// 랜덤 함수(정수)
function makeRandom(min, max) {
  var RandVal = Math.random() * (max - min) + min;
  return Math.floor(RandVal);
}