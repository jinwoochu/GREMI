// 사용자 정의 모델
var userdb = require('../model/user');
var building = require('../model/building');

module.exports = function(app) {

  // app.get('/test', function(req, res) {
  //   res.render('home.html', { vari: "test" })
  // });


  //메인
  app.get('/', function(req, res) {
    res.render('app.html');
  });

  //뉴스피드
  app.get('/news_feed', function(req, res) {
    res.render('news_feed.html');
  });

  //프로필
  app.get('/profile', function(req, res) {
    res.render('profile.html');
  });

  //집
  app.get('/building', function(req, res) {
    res.render('building.html');
  });

  //여행가기
  app.get('/traveling', function(req, res) {
    res.render('traveling.html');
  });

  //로그아웃 
  app.get('/logout', function(req, res) {
    res.render('app.html');
  });
}