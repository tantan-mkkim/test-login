//TODO: t_member(회원) 의 테이블이 root@localhost 에서만 보임, webi@localhost 에서도 보이도록 테이블권한 수정 필요
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //body-parser module를 bodyPaser 변수에 담음
var methodOverride = require('method-override');
var flash = require('connect-flash'); //일회성 메시지들을 웹 브라우저에 나타낼 때 사용하는 middleware
var session = require('express-session');
var passport = require('./config/passport');
var pool = require('./config/database'); //mysql pool
var app = express();

// DB setting
// TODO: MYSQL setting and mongoose code delete
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
//mongoose.connect(process.env.MONGO_DB);
/* var dbUrl = 'mongodb+srv://new_user1:new_user1@clustertest1.d69an.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; //환경변수 등록 안 했을 경우
mongoose.connect(dbUrl);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
}); */

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
//.. 아래 설정을 해야 웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성 됨
app.use(bodyParser.json()); // json 형식의 데이터를 받는다는 설정
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated(); //req.isAuthenticated()는 passport에서 제공하는 함수, true/false로 return
  res.locals.currentUser = req.user; //passport에서 추가하는 항목으로 로그인이 되면 session으로 부터 user를 deserialize하여 생성, res.locals에 담겨진 변수는 ejs에서 바로 사용가능
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts')); //posts route를 index.js에 추가
app.use('/users', require('./routes/users'));

// Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
  //console.log(process.env);
});
