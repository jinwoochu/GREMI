// 사용자 정의 모델
var userdb = require('./model/user');
var building = require('./model/building');

// express router
var express = require('express'),
  path = require("path"),
  app = express(),
  router = require('./router/main')(app);

//파일 업로드
const fileUpload = require('express-fileupload');
app.use(fileUpload());

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

app.post('/user_register', function(req, res) {
  userdb.register(req, res);
});

app.post('/login', function(req, res) {
  userdb.login(req, res);
});

app.post('/building_search', function(req, res) {
  //TODO
});

app.post('/building_register', function(req, res) {
  building.register(req, res);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.sampleFile;
  // Use the mv() method to place the file somewhere on your server 
  sampleFile.mv('building_images/test.jpg', function(err) {
    if (err) return res.status(500).send(err);
    res.send('File uploaded!');
  });
});

app.post('/building_edit', function(req, res) {
  // TODO
});

app.listen(3000, function() {
  console.log("Server listening on http://localhost:3000");
})