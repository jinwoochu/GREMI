// 사용자 정의 모델
var userdb = require('./model/user');

// express router
var express = require('express'),
  path = require("path"),
  app = express(),
  router = require('./router/main')(app);

var bodyParser = require('body-parser');

app.engine('html', require('ejs').renderFile);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")))

app.post('/user_register', function(req, res) {
  userdb.register(req, res);
});

app.post('/user_login', function(req, res) {
  userdb.login(req, res);
})


app.listen(3000, function() {
  console.log("Server listening on http://localhost:3000");
})