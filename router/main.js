// 사용자 정의 모델
var userdb = require('../model/user');
var building = require('../model/building');

module.exports = function(app) {

  // app.get('/test', function(req, res) {
  //   res.render('home.html', { vari: "test" })
  // });

  app.get('/', function(req, res) {
    res.render('app.html');
  });

  app.get('/profile', function(req, res) {
    res.render('profile.html');
  });

  app.get('/investment', function(req, res) {
    res.render('investment.html');
  });

  app.get('/building_register', function(req, res) {
    res.render('building_register.html');
  });

  app.get('/logout', function(req, res) {
    res.render('app.html');
  });

  app.get('/building_cancel', function(req, res) {
    // TODO
  });

  app.get('/purchased_buildings', function(req, res) {
    // TODO
  });

  app.get('/building_search', function(req, res) {
    // TODO
  });

  app.get('/detail_investment/:building_id', function(req, res) {
    // TODO
    res.render('detail_investment.html');
  });
}