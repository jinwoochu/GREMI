var contract = require('./model/contract');

contract.init();

// fileSystem
var fs = require('fs');

// 사용자 정의 모델
var userdb = require('./model/user');
var building = require('./model/building');

// express
var express = require('express'),
path = require("path"),
app = express(),
fileUpload = require('express-fileupload');

//파일 업로더
app.use(fileUpload());

//static폴더
app.use(express.static(path.join(__dirname, "/public")))

//ejs 렌더링
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

var cookie = require('cookie-parser');
app.use(cookie('!@#%%@#@'));

// --------------------------------------------- post,delete ------------------------------------------------ //

//회원가입
app.post('/user_register', function(req, res) {
  userdb.register(req, res);
});

//유저 프로필 이미지 등록
app.post('/profileImageUpload', function(req, res) {
  userdb.profileImageUpload(req, res);
});

// 프로필's new memory text upload
app.post('/memoryText', function(req, res) {
  userdb.memoryText(req, res);
});

// 프로필's new memory image upload
app.post('/memoryImages', function(req, res) {
  userdb.memoryImages(req, res);
});



//로그인
app.post('/login', function(req, res) {
  userdb.login(req, res);
});

//집등록
app.post('/building', function(req, res) {
  building.register(req, res);
});

//집사기 
// 잠시 보류 ^^
app.post('/building/buy/:building_id', function(req, res) {
  console.log(req.params.building_id);
  console.log(req.body.price);
});

//집정보 수정
app.post('/building/:building_id', function(req, res) {
  building.edit(req, res);
});

// 사용자가 올린 빌딩을 관리자가 확인하고 등록시켜주는 곳
app.post('/admin/building/confirm', function(req, res) {
  building.confirmBuilding(req, res);
});

// 등록된 빌딩을 사용자가 투자하는 곳 (지분 받음)
app.post('/investment', function(req, res) {
  building.investment(req, res);
});

// 지분 판매 등록
app.post('/sellStake', function(req, res) {
  userdb.sellStake(req, res);
})

// 지분 사기
app.post('/buyStake', function(req, res) {
  userdb.buyStake(req, res);
})



// 코인 살때 환율 보여주기
app.get('/expectCoin', function(req, res) {
  userdb.expectCoin(req, res);
});

// 코인 팔때 환율 보여주기
app.get('/expectMoney', function(req, res) {
  userdb.expectMoney(req, res);
});


// 코인 넣기
app.post('/buyCoin', function(req, res) {
  userdb.buyCoin(req, res);
});

// 코인 빼기
app.post('/sellCoin', function(req, res) {
  userdb.sellCoin(req, res);
});


// ------------------------------------------------------- get ------------------------------------------------ //


//test2.html g_coin으로 변경
app.get('/test2', function(req, res) {
  res.render('test2.html');
});





//메인
app.get('/', function(req, res) {
  if (req.signedCookies.email === undefined) {
    res.render('app.html');
  } else {
    res.redirect('/building');
  }
});



//프로필
app.get('/profile', userdb.isLogined, function(req, res) {
  userdb.getProfile(req, res);
});


//집
app.get('/building', userdb.isLogined, function(req, res) {
  res.render('building.html');
});


//집상세정보
app.get('/building/:building_id', function(req, res) {
  building.detailBuilding(req, res);
})

//집등록 취소
app.delete('/building/delete/:building_id', function(req, res) {
  building.delete(req, res)
})

//여행가기
app.get('/travel', function(req, res) {
  if (req.signedCookies.email === undefined) {
    res.render('app.html');
  } else {
    res.render('travel.html');
  }
});

//여행갈 수 있는 곳 검색
app.get('/travelSearch', function(req, res) {
  userdb.travelSearch(req, res);
})


//로그아웃 
app.get('/logout', function(req, res) {
  res.clearCookie("email");
  res.redirect('/');
});

//범위 내의 집 검색
app.get('/buildingSearch', function(req, res) {
  building.search(req, res);
});

app.get('/stakeSearch', function(req, res) {
  userdb.search(req, res);
});

//관리자가 사용자가 올린 confirm되지 않은 빌딩리스트를 보는 곳
app.get('/admin/building', function(req, res) {
  building.getListOfUnconfirmedBuilding(req, res)
});


app.post('/travel', function(req, res) {
  userdb.travel(req, res)
});

app.get('/asset', function(req, res) {
  building.getAsset(req, res)
});

// 해당 유저의 모든 입출금 내역 보기.
app.get('/viewExchangeLog', function(req, res) {
  userdb.viewExchangeLog(req, res);
});

app.listen(3000, function() {
  console.log("Server listening on http://localhost:3000");
});