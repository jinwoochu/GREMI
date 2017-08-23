//코인스택쨔응
var CoinStack = require('coinstack-sdk-js')

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
  var password = req.body.password;
  var country = req.body.country;
  var wallet_address=req.body.wallet_address;

// console.log(wallet_address)
// console.log(password)

//암호화 
const cipher = crypto.createCipher('aes-256-cbc', '열쇠');
let secret_password = cipher.update(password, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
secret_password += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

// console.log(secret_password)

var exists_email = false;

var read_sql = " SELECT * FROM USERS";
con.query(read_sql, function(err, result, field) {
  if (err) throw err;
    for (var i = 0; i < result.length; i++) { // 등록된 이메일이 있는지 체크함.
      if (result[i].email === email) exists_email = true;
    }

    if (exists_email) { //등록된 이메일 있으면 등록실패
      response = makeResponse(0, "이미 등록된 아이디입니다.", {});
      res.json(response);
    } else { // 등록 성공시
      var insert_sql =
      "INSERT INTO USERS (email, password,country,wallet_address) VALUES (?,?,?,?)";
      var values = [email, secret_password, country,wallet_address];
      con.query(insert_sql, values, function(err2, result2, field2) {
        if (err2) {
          throw err2; 
        }

        response = makeResponse(1, "", { 'key': email });
        res.cookie('email', email, {signed:true});
        console.log(response)
        res.json(response);
      });
    }
  });
}

exports.isLogined = function(req, res, next) {
  if(req.signedCookies.email === undefined) {
    res.redirect('/');
  } else {
    next();
  }
}

exports.login = function(req, res) {
  var email = req.body.email;
  var origin_password = req.body.password;

  const cipher = crypto.createCipher('aes-256-cbc', '열쇠');
  let secret_password = cipher.update(origin_password, 'utf8', 'base64'); 
  secret_password += cipher.final('base64'); 

  var read_sql =
  'SELECT email,password FROM USERS where email="' + email + '" and password="' + secret_password+'"';

  con.query(read_sql, function(err, result, field) {
    if(err){
      throw err
      response = makeResponse(0, "로그인에 실패했습니다.", {});
      res.json(response);
    }else{
      if(result.length == 0) {
        response = makeResponse(0, "로그인에 실패했습니다.", {});
        res.json(response);
      } else {
        console.log("유저 로그인 성공");
        response = makeResponse(1, "", { 'key': email });
        res.cookie('email', email, {signed:true});
        res.json(response);
      }
    }
  });
};

// var mapping_func = function(email, address, p_key) {
//   var mapping_sql =
//     "INSERT INTO MAPPING (email,myaddress, private_key) VALUES (?,?,?)";
//   var values = [email, address, p_key];
//   con.query(mapping_sql, values, function(err3, result3, field3) {
//     if (err3) throw err3;
//     console.log("맵핑 성공");
//   });
// };


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