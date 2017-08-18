//코인스택쨔응
var CoinStack = require('coinstack-sdk-js')

// mysql
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.70.95",
  user: "root",
  password: "mysql!!",
  database: "gremi"
});

// 회원목록 반환 , 나중에 쓸 예정
exports.list = function(req, res) {
  var read_sql =
    " SELECT * FROM USERS";
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    // console.log(result)
    res.render('user_list.html', { list: result })
  });
}

//회원가입
exports.register = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var country = req.body.country;

  var exists_email = false;

  var read_sql = " SELECT * FROM USERS";
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    for (var i = 0; i < result.length; i++) { // 등록된 이메일이 있는지 체크함.
      if (result[i].email === email) exists_email = true;
    }

    if (exists_email) { //등록된 이메일 있으면 등록실패
      console.log("이미 등록된 아이디입니다.");
      res.redirect('/');
    } else { // 등록 성공시
      var insert_sql =
        "INSERT INTO USERS (email, password,country) VALUES (?,?,?)";
      var values = [email, password, country];
      con.query(insert_sql, values, function(err2, result2, field2) {
        if (err2) throw err2;
        console.log("등록 성공")
      });

      // 회원등록 성공하면 bitcoin 주소도 발급받고 mapping됨
      var accessKey = "c7dbfacbdf1510889b38c01b8440b1";
      var secretKey = "10e88e9904f29c98356fd2d12b26de";
      var client = new CoinStack(accessKey, secretKey);

      var privateKey = CoinStack.ECKey.createKey();
      var myAddress = CoinStack.ECKey.deriveAddress(privateKey);

      mapping_func(email, myAddress, privateKey);

      res.redirect('/investment')
    }
  });
}


exports.login = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var read_sql =
    " SELECT * FROM USERS";
  con.query(read_sql, function(err, result, field) {
    var exists_email = false,
      right_password = false;
    if (err) throw err;
    for (var i = 0; i < result.length; i++) { // 등록된 아이디, 이메일이 있는지 체크함.
      if (result[i].email === email) {
        exists_email = true;
        if (result[i].password === password) right_password = true;
      }
    }

    if (email === "") {
      console.log("이메일을 입력해주세요")
    } else if (password === "") {
      console.log("비밀번호를 입력해주세요")
      res.redirect('/app')
    } else if (!exists_email) {
      console.log("존재 하지 않는 이메일입니다")
      res.redirect('/app')
    } else if (!right_password) {
      console.log("비밀번호가 틀립니다.")
      res.redirect('/app')
    } else {
      if (email === "admin@admin.com") { // 관리자 로그인시
        console.log("관리자 로그인 성공")
      } else { // 일반 유저
        console.log("유저 로그인 성공")
        res.redirect('/map')
      }
    }
  });
}


var mapping_func = function(email, address, p_key) {
  var mapping_sql =
    "INSERT INTO MAPPING (email,myaddress, private_key) VALUES (?,?,?)";
  var values = [email, address, p_key];
  con.query(mapping_sql, values, function(err3, result3, field3) {
    if (err3) throw err3;
    console.log("맵핑 성공")
  });
}