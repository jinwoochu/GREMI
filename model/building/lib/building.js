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

  var query = "SELECT * FROM buildings WHERE ? <= lng AND lng <= ? AND ? <= lat AND lat <= ? AND status = 1";
  var queryParams = [sw_x, ne_x, sw_y, ne_y];
  
  "SELECT * FROM buildings WHERE 126.92577122233729 <= lng AND lng <= 126.9303309776626 AND 37.486790035434474 <= lat AND lat <= 37.489131146223265 AND status = 1";

  con.query(query, queryParams, function(err, rows, fields) {
    if (err) {
      response = makeResponse(0, "검색에 실패했습니다.", {});
      res.json(response);
      return ;
    } else {
      console.log(rows);
      var Web3 = require('web3');
      var web3 = new Web3();
      var provider = new web3.providers.HttpProvider('http://61.75.63.149:8545');
      web3.setProvider(provider);

      var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"seller","type":"address"},{"name":"buyer","type":"address"}],"name":"sellfunder","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"funders_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"total","type":"uint256"}],"name":"distribution","outputs":[{"name":"revenue_","type":"uint256"},{"name":"revenue_result","type":"uint256"},{"name":"addr_","type":"address"},{"name":"amount_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"fund_","type":"address"},{"name":"amount_","type":"uint256"},{"name":"num","type":"uint256"},{"name":"funda_","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"returncontribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];

      var contractAddress = "0x6663caeeef1d0035deb1b77fffa72fc289331446";
      console.log(web3.eth);
      // var crowd = web3.eth.contract(abi).at(contractAddress);

      // var result = crowd.checkGoalReached.call(campaignID, {
      //   from: "0x072fc66f7505db74e9dc242afd2df8a861271d4a"
      // });

      // // 목표 1
      // // 투자인원 2
      // // 투자금액 3
      // console.log(result);


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

exports.investment = function(req, res) {
  var data = req.body;
  var email = req.signedCookies.email;
  var insertQuery = "INSERT INTO b_buyer_log (b_id, tx_id, invest_amount, stake, email) VALUES (?,?,?,?,?)";
  var insertQueryParams = [data.b_id, data.tx_id, data.invest_amount, data.stake, email];

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

    if(result.length != 0) {
      var imageDirPath = './public/building_images/' + buildingId;

      result[0]['images'] = [];

      fs.readdirSync(imageDirPath).forEach(file => {
        result[0]['images'].push('/building_images/' + buildingId + '/' + file);
      });

      res.render('detailBuilding.html', { "building": result[0]});
      return;
    } 
    res.redirect('/building');
    
  });
}


//집등록 취소
exports.delete = function(req, res) {
  var email = req.signedCookies.email;
};

exports.getListOfUnconfirmedBuilding = function(req, res) {
  var sql = "SELECT b.b_id, b.country, b.state, b.city, b.street, b.price, b.lat, b.lng ,u.wallet_address FROM buildings AS b LEFT JOIN users AS u ON b.email=u.email WHERE status=0";

  con.query(sql, function(err, result, field) {
    if (err) {
      throw err;
    }
    res.render('adminBuilding.html', { "buildings": result });
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