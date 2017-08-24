var SynJS = require('synjs');

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

//집 등록 (돌아는 가나 수정필요) ---------------------------
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

      console.log(insertQueryParams);

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

exports.confirmBuilding = function(req, res) {
  var sql = "UPDATE buildings SET status = 1 WHERE b_id = " + req.body.b_id;

  con.query(sql, function(err, result, field) {
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

  var query = "SELECT * FROM buildings WHERE ? <= lng AND lng <= ? AND ? <= lat AND lat <= ? AND status = 1";
  var queryParams = [sw_x, ne_x, sw_y, ne_y];
  

  con.query(query, queryParams, function(err, rows, fields) {
    if (err) {
      response = makeResponse(0, "검색에 실패했습니다.", {});
      res.json(response);
      return ;
    } else {
      console.log(rows);

      for (var i = 0; i < rows.length; i++) {
        var imageDirPath = './public/building_images/' + rows[i]['b_id'];

        rows[i]['images'] = [];

        fs.readdirSync(imageDirPath).forEach(file => {
          rows[i]['images'].push('/building_images/' + rows[i]['b_id'] + '/' + file);
        });
      }

      response = makeResponse(1, "", {buildings: rows});
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
  var selectBuildingId = req.params.building_id;
  var readSql =
  " SELECT * FROM buildings where b_id=" + selectBuildingId;
  con.query(readSql, function(err, result, field) {
    if (err) throw err;

    var imageSql =
    " SELECT * FROM building_images where b_id=" + selectBuildingId;
    con.query(imageSql, function(err2, result2, field2) {

      var imageArr = [];

      for (var i = 0; i < result2.length; i++) {
        imageArr[i] = result2[i].path;
      }
      res.render('detailBuilding.html', { "building": result[0], "images": imageArr });

    });
  });
}


//집등록 취소
exports.delete = function(req, res) {
  var email = req.signedCookies.email;
  // console.log(req.body);
  // console.log(email);
};

exports.getListOfUnconfirmedBuilding = function(req, res) {
  var sql = "select b.b_id, b.country, b.state, b.city, b.street, b.price, b.lat, b.lng ,u.wallet_address from buildings as b left join users as u on b.email = u.email where status = 0;";

  con.query(sql, function(err, result, field) {
    if (err) throw err;
    res.render('adminBuilding.html', { "buildings": result });
    console.log(result.length);
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


