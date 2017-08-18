// 사용자 정의 모델
var userdb = require('./model/user');
var building = require('./model/building');

// express router
var express = require('express'),
  path = require("path"),
  app = express(),
  router = require('./router/main')(app);

//static폴더
app.use(express.static(path.join(__dirname, "/public")))

//ejs 렌더링
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//회원가입
app.post('/user_register', function(req, res) {
  userdb.register(req, res);
});

//로그인
app.post('/login', function(req, res) {
  userdb.login(req, res);
});

//집등록
app.post('/building', function(req, res) {
  building.register(req, res);
});


app.post('/building_edit', function(req, res) {
  // TODO
});

app.listen(3000, function() {
  console.log("Server listening on http://localhost:3000");
})