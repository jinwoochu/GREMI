// xmlparser
var parser = require('xml-parser');

// request 
var request = require('request');


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
    } else {
      var insertQuery = "INSERT INTO users (email, password,country,wallet_address) VALUES (?,?,?,?)";
      var insertQueryParams = [email, password, country, walletAddress];

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

  var selectQuery = "SELECT * FROM users WHERE email=?";
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
        res.render('profile.html', { "profile": result });
      }
    }
  });
}


// 코인 환율 보여주기 
exports.expectCoin = function(req, res) {

  var email = req.signedCookies.email;
  var data = req.query;
  console.log(data);
  // console.log(data);

  //요청 페이지의 내용을 받아온다.
  request('http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote', function(error, response, body) {

    var obj = parser(body);
    //환율 정보 
    var UsdToKrw = obj.root.children[1].children[0].children[1].content;
    var UsdToEur = obj.root.children[1].children[63].children[1].content;

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

  });
}


exports.chargeCoin = function(req, res) {
  var email = req.signedCookies.email;
  var data = req.body;
  console.log(email);
  console.log(data);

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