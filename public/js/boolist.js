var iconv = require('iconv-lite');
var sleep = require('sleep');

// mysql
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql!!",
    database: "gremi"
});

// fileSystem
var fs = require('fs');

// 요청
var request = require('request');
var cheerio = require("cheerio");

//매물 초기화
exports.booinit = function (){
    var deleteQuery = "DELETE FROM mm_url";
    conn.query(deleteQuery);

    var deleteQuery2 = "DELETE FROM mm_detail";
    conn.query(deleteQuery2);

    var incinitQuery = "ALTER TABLE mm_url AUTO_INCREMENT=1";
    conn.query(incinitQuery);

    var incinitQuery2 = "ALTER TABLE mm_detail AUTO_INCREMENT=1";
    conn.query(incinitQuery2);
}

//부동산114 매물
exports.boolist = function (pg,startpg) {

    var str = "강남구";
    var buf = iconv.encode(str, "EUC-KR");
    var goo = buf.toString('hex').replace(/([a-f0-9]{2})/g, "%$1");
    var url = 'http://www.r114.com/z/real/m_gu.asp?pg='+ pg +'&startpg=' + startpg +'&only=0&m_=5&g_=&type_g=A&type_cd=01%5E&addr1=%BC%AD%BF%EF%C6%AF%BA%B0%BD%C3&addr2=' + goo + '&SF_PKVal=0&SF_Size=0&rNumber=2802&type_t=1&type_m=m&type=m&searchok='

    request({
        url: url,
        encoding: 'binary'
    },
        function (error, response, strcontents = new Buffer(body, 'binary')) {
            if (error) throw error;
            console.log(strcontents);
            var $ = cheerio.load(strcontents);

            var postElements = $("table.rowTb_new");
            postElements.each(function () {

                for (i = 0; i < 50; i++) {
                    var postTitle = iconv.decode($(this).find("a.blue").eq(i).text(), 'euc-kr');
                    var postUrl = $(this).find("a.blue").eq(i).attr("href");

                    if (postTitle == '') {
                        break;
                    }
                    //console.log(postUrl);

                    var insertQuery = "INSERT INTO mm_url (url) VALUES (?)";
                    var insertQueryParams = [postUrl];
                    conn.query(insertQuery, insertQueryParams);
                }

                // var searchQuery = "SELECT * FROM mm_url";
                // //var searchQueryParams = [l];
                // conn.query(searchQuery, function (err, result, field) {
                //     for (k = 0; k < 50; k++) {

                //         var url2 = 'http://www.r114.com/z/real/' + result[k]['url'];
                //         request({
                //             url: url2,
                //             encoding: 'binary'
                //         },
                //             function (error2, response2, strcontents2 = new Buffer(body2, 'binary')) {
                //                 if (error2) throw error2;

                //                 var $ = cheerio.load(strcontents2);

                //                 var postElements2 = $("body #wrap div.new_container div.cont_area_renewal");
                //                 //console.log(postElements2);
                //                 postElements2.each(function () {
                //                     var mm_number_area = iconv.decode($(this).find("div.mm_number_area p strong").text(), 'euc-kr');
                //                     var mm_day = iconv.decode($(this).find("span.val").text(), 'euc-kr').trim();
                //                     var building_name = iconv.decode($(this).find("div.main_name dl dt").text(), 'euc-kr').trim();
                //                     var building_pyeong = iconv.decode($(this).find("div.main_name dd").text(), 'euc-kr');
                //                     var building_price = iconv.decode($(this).find("dl.price01 dd span").text(), 'euc-kr').trim();
                //                     var building_quote = iconv.decode($(this).find("dl.price02 dd span").text(), 'euc-kr').trim();
                //                     var building_detail_high = iconv.decode($(this).find("div.mm_cont_top td").eq(0).text(), 'euc-kr').trim().replace(/(\s*)/g, "");
                //                     var building_detail_room = iconv.decode($(this).find("div.mm_cont_top td").eq(2).text(), 'euc-kr').trim().replace(/(\s*)/g, "");

                //                     for (m = 9; m < 20; m++) {
                //                         var building_detail_address = iconv.decode($(this).find("div.mm_cont_top td").eq(m).text(), 'euc-kr').trim().split("(");
                //                         if (building_detail_address[1] != null) {

                //                             var building_detail_address2 = building_detail_address[1].split(":");
                //                             if (building_detail_address2[0] == "도로명") {
                //                                 var building_detail_address3 = building_detail_address2[1];
                //                             }
                //                         }
                //                     }
                //                     var building_address = building_detail_address3.replace(/(\))/g, "");
                //                     // console.log(mm_number_area);
                //                     // console.log(mm_day);
                //                     // console.log(building_name);
                //                     // console.log(building_pyeong);
                //                     // console.log(building_price);
                //                     // console.log(building_quote);
                //                     // console.log(building_detail_high);
                //                     // console.log(building_detail_room);
                //                     console.log(building_detail_address3);
                //                     var insertQuery = "INSERT INTO mm_detail (mm_number_area, mm_day, building_name, building_pyeong, building_price, building_quote, building_detail_high, building_detail_room, building_detail_address) VALUES (?,?,?,?,?,?,?,?,?)";
                //                     var insertQueryParams = [mm_number_area, mm_day, building_name, building_pyeong, building_price, building_quote, building_detail_high, building_detail_room, building_address];
                //                     conn.query(insertQuery, insertQueryParams);

                //                 });
                //             });
                //     }
                // });
            });
        });
}