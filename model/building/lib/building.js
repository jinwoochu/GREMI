var contract = require('../../contract');

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

// 요청
var request = require('request');

// 암복호화
var crypto = require('crypto');

//xml2json
var convert = require('xml-js');

//서비스키
var serviceKey = "5L4kildrWUpPkfVqVmECj0uEXBJE7V8hm0KOcoC4uL2VOm4KuGqHKyj%2BTw%2FGoPXZBdgX6rKttkc8YNCveXvZag%3D%3D";



//아파트 전월세 
exports.addRealestate = function(req,res){

    var currntDate = new Date();
    var currntMonth = currntDate.getMonth();
    
    var lawdCdArray = ['11110','11140','11170','11200',
    '11215','11230','11260','11290','11305','11320','11350',
    '11380','11410','11440','11470','11500','11530','11545',
    '11560','11590','11620','11650','11680','11710','11740'
    ];
    var lawdCd = '11110';

    for(var index =4; index<=10;index++){
        // console.log(lawdCdArray[index]);
        for(var i=1;i<=currntMonth+1;i++){
                if(i<10) i="0"+i;
                var dealYmd ='2017'+i;
                // console.log(dealYmd);
                crawling(res, req, dealYmd,lawdCdArray[index]);
        }
    }
            // dealYmd = "201702";
}


function crawling(res, req, dealYmd, lawdCd){
    request('http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptRent?LAWD_CD='+lawdCd+'&DEAL_YMD='+dealYmd+'&numOfRows=117&serviceKey='+serviceKey, function (error, response, body) {
        
         
        var xml = body;
 
        var result1 = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 1})); 
        var contracts = result1.response.body.items.item;
 
        var insertQuery = "INSERT INTO apartment (construct_year, contract_year, contract_month, contract_day, law_dong, name, guarantee_amount, monthly_amount, address_number, layer, exclusive_area, lat, lng) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  
        contracts.forEach(function(element, index) {
        //   console.log('배열 요소 #' + index 
        //   + '\n건축년도:', element['건축년도']._text
        //   + '\n계약 년:', element['년']._text
        //   + '\n계약 월:', element['월']._text
        //   + '\n계약 일:', element['일']._text
        //   + '\n법정동:', element['법정동']._text.trim()
        //   + '\n아파트:', element['아파트']._text
        //   + '\n보증금액:', element['보증금액']._text.trim()
        //   + '\n월세금액:', element['월세금액']._text.trim()
        //   + '\n지번:', element['지번']._text
        //   + '\n층:', element['층']._text
        //   + '\n전용면적:', element['전용면적']._text
        //  );
         
       var insertQueryParams = [element['건축년도']._text, element['년']._text, element['월']._text,  element['일']._text, element['법정동']._text.trim(), element['아파트']._text, element['보증금액']._text.trim(), element['월세금액']._text.trim(), element['지번']._text, element['층']._text, element['전용면적']._text, 18.18, 28.28];
 
        con.query(insertQuery, insertQueryParams, function(err2, result2, field2) {
            if (err2) {
                response = makeResponse(0, "실패1", {});
                res.json(response);
                return;
            } else {
            }
         });
        });
     });
}









//집 등록
exports.register = function(req, res) {

    //이미지 등록 폴더 없으면 생성 
    if (!fs.existsSync("./public/building_images")) {
        fs.mkdirSync("./public/building_images");
    }

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
        var updateQuery = "UPDATE buildings SET status=1, tx_id=?, dt=NOW() WHERE b_id=?";
        var updateQueryParams = [req.body.tx_id, req.body.b_id];

        con.query(updateQuery, updateQueryParams, function(err, result, field) {
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
    var building = [];

    var ne_x = req.query.northeast_lng;
    var ne_y = req.query.northeast_lat;
    var sw_x = req.query.southwest_lng;
    var sw_y = req.query.southwest_lat;

    var selectQuery = "SELECT C.b_id, C.country, C.state, C.city, C.street, C.lat, C.lng, C.price, sum(C.invest_amount) AS fundraising_amount, count(distinct(C.email)) AS participant_count FROM (SELECT A.b_id, A.country, A.state, A.city, A.street, A.lat, A.lng, A.price, COALESCE(B.invest_amount, 0) AS invest_amount, B.email FROM buildings AS A LEFT JOIN b_buyer_log AS B on A.b_id=B.b_id WHERE ? <= lng AND lng <= ? AND ? <= lat AND lat <= ? AND status = 1) AS C GROUP BY C.b_id;";

    var selectQueryParams = [sw_x, ne_x, sw_y, ne_y];

    console.log(selectQuery);
    console.log(selectQueryParams);

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

            console.log(rows);
            response = makeResponse(1, "", { "buildings": rows });
            res.json(response);
        }
    });
};

//등록된 빌딩을 사용자가 투자하는 곳 (지분 받음)
exports.investment = function(req, res) {
    var data = req.body;
    var email = req.signedCookies.email;

    var priceInvestAmountQuery = 'SELECT * FROM (SELECT D.wallet_address, B.email, B.price, COALESCE(sum(A.invest_amount), 0) AS sum_amount FROM users AS D, b_buyer_log AS A, buildings AS B WHERE D.email=B.email AND A.b_id=' + data.b_id + ' AND B.b_id=A.b_id) AS C WHERE C.price > C.sum_amount;'
    console.log('invest priceInvestAmountQuery: ' + priceInvestAmountQuery);

    con.query(priceInvestAmountQuery, function(err, result, field) {
        console.log('invest reulst: ' + result);
        console.log(result.length);


        if (err || result.length == 0) {
            response = makeResponse(0, "실패1", {});
            res.json(response);
            return;
        }

        var price = result[0].price - 0;
        var sum_amount = result[0].sum_amount - 0;
        var invest_amount = data.invest_amount - 0;
        var ownerAddress = result[0].wallet_address;
        var ownerEmail = result[0].email;


        console.log(ownerEmail);
        console.log(ownerAddress);

        if (price < sum_amount + invest_amount) {
            response = makeResponse(0, "투자금이 너무많다.", {});
            res.json(response);
            return;
        }

        var buyerLogInsertQuery = "INSERT INTO b_buyer_log (b_id, tx_id, invest_amount, stake, email) VALUES (?,?,?,?,?)";
        var buyerLogInsertQueryParams = [data.b_id, data.tx_id, invest_amount, data.stake, email];

        console.log('invest buyerLogInsertQueryParams: ' + buyerLogInsertQueryParams);

        con.query(buyerLogInsertQuery, buyerLogInsertQueryParams, function(err1, result1, field1) {
            if (err1) {
                response = makeResponse(0, "실패1", {});
                res.json(response);
                return;
            }

            if (price == sum_amount + invest_amount) {
                var updateQuery = "UPDATE buildings SET status=2, dt=NOW() WHERE b_id=" + data.b_id;

                console.log('invest updateQuery: ' + updateQuery);
                con.query(updateQuery, function(err4, result4, field4) {
                    if (err4) {
                        response = makeResponse(0, "실패1", {});
                        res.json(response);
                        return;
                    }
                    var request = {
                        'campaignId': data.b_id
                    };

                    contract.checkGoalReached(request, function(err5, txId5) {
                        if (err5) {
                            response = makeResponse(0, "실패2", {});
                            res.json(response);
                            return;
                        }

                        contract.getBalance(ownerAddress, function(err6, gCoin) {
                            if (err6) {
                                response = makeResponse(0, "실패3", {});
                                res.json(response);
                                return;
                            }
                            var updateQuery = "UPDATE users SET g_coin=" + gCoin + " WHERE email='" + ownerEmail + "'";

                            console.log(updateQuery);

                            con.query(updateQuery, function(err7, result7, field7) {
                                if (err7) {
                                    response = makeResponse(0, "실패4", {});
                                    res.json(response);
                                    return;
                                }

                                response = makeResponse(1, "", {});
                                res.json(response);
                            });
                        });
                    });
                });
            } else {
                response = makeResponse(1, "", {});
                res.json(response);
            }
        });
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

exports.getAsset = function(req, res) {
    var buyLogSelectQuery = "SELECT a.*, b.* FROM b_buyer_log as a, buildings as b WHERE a.email=? and a.b_id=b.b_id;";
    var buyLogSelectQueryParams = [req.signedCookies.email];

    con.query(buyLogSelectQuery, buyLogSelectQueryParams, function(err, result, field) {
        if (err) {
            throw err;
        }

        var buildingSelectQuery = "SELECT * FROM buildings WHERE email=?";
        con.query(buildingSelectQuery, buyLogSelectQueryParams, function(err1, result1, field1) {
            if (err) {
                throw err;
            }

            response = makeResponse(1, '', { "buildings": result1, "buyerLogs": result });
            res.json(response);
        });
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