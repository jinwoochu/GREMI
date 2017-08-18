//코인스택쨔응
var CoinStack = require('coinstack-sdk-js')

// mysql
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql!!",
  database: "gremi"
});

// 암복호화
var crypto = require('crypto');


// 빌딩 등록
exports.register = function(req, res) {
  var address = req.body.address;
  var price = req.body.price;
  var ex_area = req.body.ex_area;
  var con_area = req.body.con_area;
  var register_email = req.body.register_email;
  var certi_num = req.body.certi_num; // 민증 or 운전면허증
  var copy_right = req.body.copy_right; // 등기부등본
  var building_block = req.body.building_block; // 건축물대장


  // 빌딩 db 등록 

  // var exists_address = false;

  // var read_sql = " SELECT address FROM buildings";
  // con.query(read_sql, function(err, result, field) {
  //   if (err) throw err;
  //   for (var i = 0; i < result.length; i++) { // 등록된 이메일이 있는지 체크함.
  //     if (result[i].address === address) {
  //       exists_address = true;
  //       break;
  //     }
  //   }

  //   if (exists_address) { //등록된 이메일 있으면 등록실패
  //     console.log("이미 등록된 빌딩입니다.")
  //     res.redirect('/app');
  //   } else { // 등록 성공시
  //     var insert_sql =
  //       "INSERT INTO buildings (address, price, ex_area, con_area, register_email) VALUES (?,?,?,?,?)";
  //     var values = [address, price, ex_area, con_area, register_email];
  //     con.query(insert_sql, values, function(err2, result2, field2) {
  //       if (err2) throw err2;
  //       console.log("등록 성공")
  //     });

  //     res.redirect('/app')
  //   }
  // });

}