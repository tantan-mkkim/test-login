//--------------------------------------------------------------------------------------------------------------
//PassportJS local strategy with either a json file of user accounts
//--------------------------------------------------------------------------------------------------------------
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
//var User = require('../models/User');
var User = require('../data/users'); // load up the users json data


// serialize & deserialize User
passport.serializeUser(function (user, done) {
  done(null, user.username); //done() : 인증이 성공하면 passport에게 사용자의 정보를 전달
});
passport.deserializeUser(function (id, done) {
  //mongoose db code
  // User.findOne({_id:id}, function(err, user) {
  //   done(err, user);
  // });
  
  // Write a logic to find this particular user from the json data using username
  fs.readFile('./data/users.json', 'utf8', function (err, userjson) {
    if (err) return done(err);

    console.log('deserializeUser():' + userjson);
    var user = JSON.parse(userjson).members;

    var i = 0;
    while(i < user.length){
      if (id == user[i].username)
        return done(null, user[i]);
      i++;
    };
    return done({}); //done(err,null);?


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
    function (req, username, password, done) { // callback with username and password from our form

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
    }
  )
);

/* var authUser = function(username, password, callback){

  fs.readFile('./data/users.json', 'utf8', function (err, result) {
   if (err) return console.log(err);
   
   console.log('authUser(): '+result);
   user = JSON.parse(result);
   if (username == user.username && password == user.password) {
     callback(null, user);
   } else {
     callback(err, null);
   };
 });
}; */

module.exports = passport;
