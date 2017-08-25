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

//집 등록
exports.register = function(req, res) {
  var data = req.body;
  var email = req.signedCookies.email;

  var searchQuery = "SELECT * FROM buildings WHERE country=? AND state=? AND city=? AND street=? AND NOT status=2";
  var searchQueryParams = [data.country, data.state, data.city, data.street];

  con.query(searchQuery, searchQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "계약이 끝나지 않은 중복된 주소의 건물입니다.", {});
      res.json(response);
      return;
    }

    if (result.length == 0) {
      var insertQuery = "INSERT INTO buildings (lat, lng, country, state, city, street, price, email) VALUES (?,?,?,?,?,?,?,?)";
      var insertQueryParams = [data.lat, data.lng, data.country, data.state, data.city, data.street, data.price, email];

      con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
        if (err2) {
          response = makeResponse(0, "실패1", {});
          res.json(response);
          return;
        } else {
          var buildingId = result2.insertId;
          var imageDirPath = './public/building_images/' + buildingId;

          if (!fs.existsSync(imageDirPath)) {
            fs.mkdirSync(imageDirPath);
          }

          if (req.files.images) {
            var buildingImages = req.files.images;

            for (var i = 0; i < buildingImages.length; i++) {
              var imagePath = imageDirPath + '/' + buildingImages[i].name;

              (function(i, imagePath) {
                buildingImages[i].mv(imagePath, function(err) {
                  if (err) {
                    response = makeResponse(0, "실패2", {});
                    res.json(response);
                    return;
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


// 사용자가 올린 빌딩을 관리자가 확인하고 등록시켜주는 곳
exports.confirmBuilding = function(req, res) {
    var searchQuery = "UPDATE buildings SET status=1, tx_id=?, dt=NOW() WHERE b_id=?";
    var searchQueryParams = [req.body.tx_id, req.body.b_id];

    con.query(searchQuery, searchQueryParams, function(err, result, field) {
      if (err) {
        response = makeResponse(0, "컨펌 실패", {});
        res.json(response);
        return;
      }
      response = makeResponse(1, "", {});
      res.json(response);
    });
  }
  //------------------------------------------------------

//범위 내의 집 검색
exports.search = function(req, res) {
  var buildingList = [];
  var building = [];

  var ne_x = req.query.northeast_lng;
  var ne_y = req.query.northeast_lat;
  var sw_x = req.query.southwest_lng;
  var sw_y = req.query.southwest_lat;

  var selectQuery = "SELECT b.b_id, b.country, b.state, b.city, b.street, b.lat, b.lng, b.price, sum(c.invest_amount) AS fundraising_amount, count(distinct(c.email)) AS participant_count FROM buildings AS b, b_buyer_log AS c, (SELECT * FROM buildings WHERE ? <= lng AND lng <= ? AND ? <= lat AND lat <= ? AND status = 1) AS a WHERE b.b_id=a.b_id AND c.b_id=b.b_id GROUP BY b.b_id;"
  var selectQueryParams = [sw_x, ne_x, sw_y, ne_y];

  con.query(selectQuery, selectQueryParams, function(err, rows, fields) {
    if (err) {
      response = makeResponse(0, "검색에 실패했습니다.", {});
      res.json(response);
      return;
    } else {
      console.log(rows);
      for (var i = 0; i < rows.length; i++) {
        var imageDirPath = './public/building_images/' + rows[i]['b_id'];

        rows[i]['images'] = [];

        fs.readdirSync(imageDirPath).forEach(file => {
          rows[i]['images'].push('/building_images/' + rows[i]['b_id'] + '/' + file);
        });
      }

      response = makeResponse(1, "", { buildings: rows });
      res.json(response);
    }
  });
};


//등록된 빌딩을 사용자가 투자하는 곳
exports.investment = function(req, res) {
  var data = req.body;
  var email = req.signedCookies.email;
  var insertQuery = "INSERT INTO b_buyer_log (b_id, tx_id, invest_amount, stake, email) VALUES (?,?,?,?,?)";
  var insertQueryParams = [data.b_id, data.tx_id, data.invest_amount, data.stake, email];

  console.log(data.b_id, data.tx_id, data.invest_amount, data.stake, email);

  con.query(insertQuery, insertQueryParams, function(err, result, field) {
    if (err) {
      response = makeResponse(0, "실패1", {});
      res.json(response);
      return;
    } else {
      response = makeResponse(1, '', {});
      res.json(response);
    }
  });
};

//집정보 수정
// exports.edit = function(req, res) {

//   var lat = req.body.lat;
//   var lng = req.body.lng;
//   var country = req.body.country;
//   var state = req.body.state;
//   var city = req.body.city;
//   var street = req.body.street;
//   var price = req.body.price;

//   var selectBuildingId = req.params.building_id;

//   var editSql = 'UPDATE buildings SET lat="' + lat +
//   '", lng="' + lng +
//   '", country="' + country +
//   '", state="' + state +
//   '", city="' + city +
//   '", street="' + street +
//   '", price="' + price +
//   '" where b_id=' + selectBuildingId;
//   con.query(editSql, function(err, result, field) {
//     if (err) {
//       throw err;
//       response = makeResponse(0, "수정에 실패했습니다", {});
//     } else {
//       console.log("수정 성공");
//       response = makeResponse(1, "", {});
//       res.json(response);
//     }
//   });
// }




//집상세정보
exports.detailBuilding = function(req, res) {
  var buildingId = req.params.building_id;
  var selectQuery = 'SELECT * FROM buildings WHERE b_id=?';
  var selectQueryParams = [buildingId];

  con.query(selectQuery, selectQueryParams, function(err, result, field) {
    if (err) {
      throw err;
    }

    if (result.length != 0) {
      var imageDirPath = './public/building_images/' + buildingId;

      result[0]['images'] = [];

      fs.readdirSync(imageDirPath).forEach(file => {
        result[0]['images'].push('/building_images/' + buildingId + '/' + file);
      });

      res.render('detailBuilding.html', { "building": result[0] });
      return;
    }
    res.redirect('/building');

  });
}


//집등록 취소
exports.delete = function(req, res) {
  var email = req.signedCookies.email;
};


//관리자가 사용자가 올린 confirm되지 않은 빌딩리스트를 보는 곳
exports.getListOfUnconfirmedBuilding = function(req, res) {
  var sql = "SELECT b.b_id, b.country, b.state, b.city, b.street, b.price, b.lat, b.lng ,u.wallet_address FROM buildings AS b LEFT JOIN users AS u ON b.email=u.email WHERE status=0";

  con.query(sql, function(err, result, field) {
    if (err) {
      throw err;
    }
    res.render('adminBuilding.html', { "buildings": result });
  });
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