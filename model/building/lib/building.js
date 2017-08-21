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

    var address = country + " " + state + " " + city + " " + street;
    var images = req.body.images;

    // for (var attr in req.body) {
    //     if (attr[0] != "b") continue;
    //     images.push(attr)
    // }

    console.log(req.body);

    response = makeResponse(0, "검색에 실패했습니다.", {});
    res.json(response);
        // console.log(lat)
        // console.log(lng)
        // console.log(title)
        // console.log(country)
        // console.log(state)
        // console.log(city)
        // console.log(street)
        // console.log(price)


    // var exists_address = false;

    // var read_sql = " SELECT country, state, city, street FROM buildings";
    // con.query(read_sql, function(err, result, field) {
    //     if (err) throw err;
    //     for (var i = 0; i < result.length; i++) { // 등록된 빌딩이 있는지 체크함.
    //         if (result[i].country + " " + result[i].state + " " + result[i].city + " " + result[i].street === address) {
    //             exists_address = true;
    //             break;
    //         }
    //     }

    //     if (exists_address) { //등록된 빌딩 있으면 등록실패
    //         console.log("이미 등록된 빌딩입니다.")
    //         response = makeResponse(0, "이미 등록된 빌딩입니다.", {});
    //         res.json(response);

    //     } else { // 등록 성공시

    //         // 해당 빌딩 정보 등록
    //         var insert_sql =
    //             "INSERT INTO buildings (lat, lng, country, state, city, street, price) VALUES (?,?,?,?,?,?,?)";
    //         var values = [lat, lng, country, state, city, street, price];
    //         con.query(insert_sql, values, function(err2, result2, field2) {
    //             if (err2) {
    //                 response = makeResponse(0, "빌딩 정보등록에 실패했습니다.", {});
    //                 res.json(response);
    //                 throw err2;

    //             }
    //         });

    //         // 해당 빌딩 이미지 등록
    //         var insert_sql =
    //             "INSERT INTO building_images (id, path) VALUES (?,?)";
    //         var values = [id, path];
    //         con.query(insert_sql, values, function(err3, result3, field3) {
    //             if (err3) {
    //                 response = makeResponse(1, "이미지 등록에 실패했습니다.", {});
    //                 res.json(response);
    //                 throw err3;
    //             }
    //             response = makeResponse(1, "", {});
    //             res.json(response);
    //         });
    //     }
    // });

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