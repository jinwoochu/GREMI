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


//집 등록
exports.register = function(req, res) {

  var lat = req.body.lat;
  var lng = req.body.lng;
  var country = req.body.country;
  var state = req.body.state;
  var city = req.body.city;
  var street = req.body.street;
  var price = req.body.price;

  var address = country + " " + state + " " + city + " " + street;

  // console.log(lat)
  // console.log(lng)
  // console.log(title)
  // console.log(country)
  // console.log(state)
  // console.log(city)
  // console.log(street)
  // console.log(price)


  var exists_address = false;

  var read_sql = " SELECT country, state, city, street FROM buildings";
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    for (var i = 0; i < result.length; i++) { // 등록된 이메일이 있는지 체크함.
      if (result[i].country + " " + result[i].state + " " + result[i].city + " " + result[i].street === address) {
        exists_address = true;
        break;
      }
    }

    if (exists_address) { //등록된 이메일 있으면 등록실패
      console.log("이미 등록된 빌딩입니다.")
      response = makeResponse(0, "이미 등록된 빌딩입니다.", {});
      res.json(response);

    } else { // 등록 성공시
      var insert_sql =
        "INSERT INTO buildings (lat, lng, country, state, city, street, price) VALUES (?,?,?,?,?,?,?)";
      var values = [lat, lng, country, state, city, street, price];
      con.query(insert_sql, values, function(err2, result2, field2) {
        if (err2) throw err2;
        response = makeResponse(1, "", {});
        res.json(response);
      });
    }
  });

}

//집정보 수정
exports.edit = function(req, res) {

  // var lat = req.body.lat;
  // var lng = req.body.lng;
  // var country = req.body.country;
  // var state = req.body.state;
  // var city = req.body.city;
  // var street = req.body.street;
  // var price = req.body.price;

  // console.log(lat)
  // console.log(lng)
  // console.log(country)
  // console.log(state)
  // console.log(city)
  // console.log(street)
  // console.log(price)

  var select_building_id = req.params.building_id;
  var read_sql =
    " SELECT * FROM buildings where id=" + select_building_id;
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    console.log(result)
  })
}


exports.detail_building = function(req, res) {
  var select_building_id = req.params.building_id;
  var read_sql =
    " SELECT * FROM buildings where id=" + select_building_id;
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    // res.render('detail_building.html', { "buildingObject": result });
    console.log(result)
  })

}



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