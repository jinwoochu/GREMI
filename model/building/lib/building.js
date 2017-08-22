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


//집 등록register
exports.register = function(req, res) {

    var lat = req.body.lat;
    var lng = req.body.lng;
    var country = req.body.country;
    var state = req.body.state;
    var city = req.body.city;
    var street = req.body.street;
    var price = req.body.price;

    var contract_address = req.body.contract_address;
    var status = req.body.status;
    

    // console.log(contract_address)


    // var images = req.body.images;

    // for (var attr in req.body) {
    //     if (attr[0] != "b") continue;
    //     images.push(attr)
    // }

    // console.log(req.body);

    var read_sql = 'SELECT * FROM buildings where country="'+country+'" AND state="'+state+'" AND city="'+city+'" AND street="'+street+'" AND NOT status=2';
    con.query(read_sql, function(err, result, field) {
        if (err) throw err;
            console.log(result)
            if(result.length==0){ 
                 // 해당 빌딩 정보 등록
                var insert_sql =
                    "INSERT INTO buildings (lat, lng, country, state, city, street, price, contract_address,status) VALUES (?,?,?,?,?,?,?,?)";
                var values = [lat, lng, country, state, city, street, price, contract_address];
                con.query(insert_sql, values, function(err2, result2, field2) {
                    if (err2) {
                        throw err2;
                        response = makeResponse(0, "등록 오류", {});
                        res.json(response);
                    }
                    else {
                        response = makeResponse(1, "", {});
                        res.json(response);
                    }
                });
            }
            else{
                response = makeResponse(0, "계약이 끝나지 않은 중복된 주소의 건물입니다.", {});
                res.json(response);
            }
    });
}

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
        response = makeResponse(1, "", {});
        res.json(response);
        console.log("수정 성공")
    })
}

exports.detail_building = function(req, res) {
    var select_building_id = req.params.building_id;
    var read_sql =
        " SELECT * FROM buildings where id=" + select_building_id;
    con.query(read_sql, function(err, result, field) {
        if (err) throw err;
        res.render('detail_building.html', { "building": result });
        console.log(result)
    })

}


exports.search = function(req, res) {
    var ne_x = req.query.northeast_lng
    var ne_y = req.query.northeast_lat
    var sw_x = req.query.southwest_lng
    var sw_y = req.query.southwest_lat
        // console.log(ne_x)
        // console.log(ne_y)
        // console.log(sw_x)
        // console.log(sw_y)

    var read_sql = "select * from buildings where " + sw_x + "<lng and lng<" + ne_x + " and " + sw_y + "<lat and lat<" + ne_y;

    con.query(read_sql, function(err, result, field) {
        if (err) {
            throw err;
            response = makeResponse(0, "검색에 실패했습니다.", {});
            res.json(response);
        }

        // console.log(result[0])
        response = makeResponse(1, "", { 'buildingInfos': result });
        console.log(response)
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