//--------------------------------------------------------------------------------------------------------------
//PassportJS local strategy with either a json file of user accounts
//--------------------------------------------------------------------------------------------------------------
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
//var User = require('../models/User');
var User = require('../data/users'); // load up the users json data
var pool = require('../config/database'); //mysql pool



// serialize & deserialize User
passport.serializeUser(function (user, done) {
  console.log('[serializeUser]', user);
  done(null, user.username); //done() : 인증이 성공하면 passport에게 사용자의 정보를 전달
});
passport.deserializeUser(function (username, done) {
  //mongoose db code
  // User.findOne({_id:id}, function(err, user) {
  //   done(err, user);
  // });

  // Write a logic to find this particular user from the json data using username
  /*   fs.readFile('./data/users.json', 'utf8', function (err, userjson) {
      if (err) return done(err);
  
      console.log('deserializeUser():' + userjson);
      var user = JSON.parse(userjson).members;
  
      var i = 0;
      while(i < user.length){
        if (username == user[i].username)
          return done(null, user[i]);
        i++;
      };
      return done({}); //done(err,null);?
    }); */

  console.log('[deserializeUser]', username); // username 인자에는 serializeUser 메소드에서 보낸 user.username 값이 담김
  pool.query('SELECT * FROM T_MEMBER WHERE username=?',
    [username],
    function (err, results) {
      if (err) done(err);
      if (!results[0]) done(err);
      var user = results[0];
      done(null, user);
    });
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
    // by default, local strategy uses username and password
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    /*     function (req, username, password, done) { // callback with username and password from our form
          // Write a logic to find this particular user from the json data using username(or email)
          // validate for password
          // If not found or password incorrect return done({});
          // else return done(null, userObject);            
          var paramUsername = req.body.username || req.query.username;
          var paramPassword = req.body.password || req.query.password;
    
          fs.readFile('./data/users.json', 'utf8', function (err, userjson) {
    
            if (err) return done(err); //done() : 인증이 성공하면 passport에게 사용자의 정보를 전달
    
            var user = JSON.parse(userjson).members;
    
            //if (user && user.authenticate(password)){
            var i = 0;
            while (i < user.length) {
              if (paramUsername == user[i].username && paramPassword == user[i].password) {
                return done(null, user[i]);
              };
              i++;
             };
            //case of no matched data
            req.flash('username', paramUsername);
            req.flash('errors', { login: 'The username or password is incorrect.' });
            return done(null, false);
          });
        } */

    function (req, username, password, done) {
      var sql = 'SELECT * FROM T_MEMBER WHERE USERNAME=? AND PASSWORD=?';
      pool.query(sql, [username, password], function (err, result) {
        if (err) return done(err);

        //TODO: bcrypt 인코딩된 암호 matching 을 위한 함수 적용
        /* if(result[0] && result[0].authenticate(password)){
          return done(null, result[0]);
        }; */
        // 입력받은 ID와 비밀번호에 일치하는 회원정보가 없는 경우   
        if (result.length === 0) {
          console.log("결과 없음");
          return done(null, false, { message: 'Incorrect' });
        } else {
          console.log(result);
          var json = JSON.stringify(result[0]);
          var userinfo = JSON.parse(json);
          console.log("userinfo " + userinfo);
          return done(null, userinfo);  // result값으로 받아진 회원정보를 return해줌
        }
      })
    }

  )
);

module.exports = passport;
