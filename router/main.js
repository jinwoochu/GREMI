// 사용자 정의 모델
var userdb = require('../model/user');
var building = require('../model/building');

module.exports = function(app) {
  app.get('/test', function(req, res) {
    res.render('home.html', { vari: "test" })
  });

  app.get('/', function(req, res) {
    res.render('app.html');
  });

  app.get('/investment', function(req, res) {
    res.render('investment.html');
  });

  app.get('/user_list', function(req, res) {
    userdb.list(req, res);
  });
}