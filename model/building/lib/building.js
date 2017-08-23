//코인스택쨔응
var CoinStack = require('coinstack-sdk-js');

// mysql
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql!!",
  database: "gremi"
});

// fileSystem
var fs = require('fs');

// 암복호화
var crypto = require('crypto');

//집 등록register
exports.register = function(req, res) {
  var data = req.body;

  var read_sql = 'SELECT * FROM buildings where country="' + data.country+'" AND state="' + data.state + '" AND city="' + data.city + '" AND street="' + data.street + '" AND NOT status=2';

  con.query(read_sql, function(err, result, field) {
    if(err) {
      response = makeResponse(0, "계약이 끝나지 않은 중복된 주소의 건물입니다.", {});
      res.json(response);
      throw err;
    }

    if(result.length == 0) { 
      var insertSql = "INSERT INTO buildings (lat, lng, country, state, city, street, price, contract_address) VALUES (?,?,?,?,?,?,?,?)";

      var values = [data.lat, data.lng, data.country, data.state, data.city, data.street, data.price, data.contract_address];

      con.query(insertSql, values, function(err2, result2, field2) {
        if (err2) {
          response = makeResponse(0, "실패", {});
          res.json(response);
          throw err2;
        } else {
          if(req.files.images) {
            var buildingImages = req.files.images;
            var buildingId = result2.insertId;

            var imageDirPath = './public/building_images/' + buildingId;

            if (!fs.existsSync(imageDirPath)){
              fs.mkdirSync(imageDirPath);
            }


            for(var i = 0 ; i < buildingImages.length ; i++) { 
              var imagePath = imageDirPath + '/' + buildingImages[i].name;

              (function (i, imagePath) {
                buildingImages[i].mv(imagePath, function(err) {
                  if (err) {
                    response = makeResponse(0, "실패", {});
                    res.json(response);
                    return;
                  } else {
                    var insert_sql = "INSERT INTO building_images (b_id, path) VALUES (?,?)";
                    var values = [buildingId, imagePath.replace(/^\.\/public/, "")];
                    con.query(insert_sql, values, function(err3, result3, field3) {
                      if (err3) {
                        response = makeResponse(0, "실패", {});
                        res.json(response);
                        return;
                      }
                    });
                  } 
                });
              })(i, imagePath);
            }
          }

          response = makeResponse(1, '', {});
          res.json(response);
        }
      });

    } else {
      response = makeResponse(0, "실패", {});
      res.json(response);
    }
  }); 
}


var saveImages = new Promise(function (buildingId, buildingImages, imageDirPath, index) {
  // if(index == buildingImages.length) {
  //   return true;
  // } else {

  // }
})


//집정보 수정
exports.edit = function(req, res) {

  var lat = req.body.lat;
  var lng = req.body.lng;
  var country = req.body.country;
  var state = req.body.state;
  var city = req.body.city;
  var street = req.body.street;
  var price = req.body.price;

  var select_building_id = req.params.building_id;

  var edit_sql = 'UPDATE buildings SET lat="' + lat +
  '", lng="' + lng +
  '", country="' + country +
  '", state="' + state +
  '", city="' + city +
  '", street="' + street +
  '", price="' + price +
  '" where id=' + select_building_id;
  con.query(edit_sql, function(err, result, field) {
    if (err) {
      throw err;
      response = makeResponse(0, "수정에 실패했씁니당", {});
    }
    console.log("수정 성공");
    response = makeResponse(1, "", {});
    res.json(response);
  });
}

exports.detail_building = function(req, res) {
  var select_building_id = req.params.building_id;
  var read_sql =
  " SELECT * FROM buildings where id=" + select_building_id;
  con.query(read_sql, function(err, result, field) {
    if (err) throw err;
    res.render('detail_building.html', { "building": result[0] });
    console.log(result)
  });
}

exports.search = function(req, res) {
  var ne_x = req.query.northeast_lng;
  var ne_y = req.query.northeast_lat;
  var sw_x = req.query.southwest_lng;
  var sw_y = req.query.southwest_lat;

  var read_sql = "select * from buildings where " + sw_x + "<= lng and lng <= " + ne_x + " and " + sw_y + "<= lat and lat <= " + ne_y;

  con.query(read_sql, function(err, result, field) {
    if (err) {
      throw err;
      response = makeResponse(0, "검색에 실패했습니다.", {});
      res.json(response);
    }

    response = makeResponse(1, "", { 'buildingInfos': result });
    res.json(response);
  });
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