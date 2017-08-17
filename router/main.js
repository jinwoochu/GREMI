// 사용자 정의 모델
var userdb = require('../model/user');


module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('home.html', { vari: "test" })
  });

  app.get('/app', function(req, res) {
    res.render('app.html');
  });

  app.get('/map', function(req, res) {
    res.render('map.html');
  });


  app.get('/user_list', function(req, res) {
    userdb.list(req, res);
  });

}