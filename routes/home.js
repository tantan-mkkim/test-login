var express = require('express');
//var fs = require('fs');
var router = express.Router();
var passport = require('../config/passport');
var pool = require('../config/database'); //mysql pool
const { exists } = require('../models/User');

// Home
router.get('/', function (req, res) {
  
  //test code
  pool.query('SELECT CAM_CODE AS solution FROM t_cam', function (error, results, fields){
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    //console.log(pool);
  });
  
  
  res.render('home/welcome');
});
router.get('/about', function (req, res) {
  res.render('home/about');
});

// Login
router.get('/login', function (req, res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};

  res.render('home/login', {
    username: username,
    errors: errors
  });
});

// Post Login
router.post('/login',
  function (req, res, next) {
    var errors = {};
    var isValid = true;

    if (!req.body.username) {
      isValid = false;
      errors.username = 'Username is required!';
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = 'Password is required!';
    }

    if (isValid) {
      next();
    }
    else {
      req.flash('errors', errors); //req.flash(키,값)으로 해당키에 값을 설정 -> req.flash(키)로 해당 키에 대한 값 가져오기
      res.redirect('/login');
    }
  },
  //passport의 로긴을 위한 인증 부분
   passport.authenticate('local-login', {
     successRedirect : '/posts',
     failureRedirect : '/login'
   }
   )
     /*function (req, res) {
    var paramId = req.body.username || req.query.username;
    var paramPassword = req.body.password || req.query.password;

    authUser(paramId, paramPassword, function (err, rows) {
      if (err) {
        console.error('Login Error : ' + err.stack);
        req.flash('errors', errors);
        res.redirect('/login');
      }

      if (rows) {

        res.redirect('/posts');
        // else
        //     res.render('webi',{user:req.session.user,rows:null});

      } else {
        //req.flash('username', username);
        req.flash('errors', {login:'The username or password is incorrect.'});
        res.redirect('/login');
       }
    });
  }*/
);

/*var authUser = function(name, password, callback){

   fs.readFile('./auth.json', 'utf8', function (err, result) {
    if (err) return console.log(err);
    
    console.log(result);
    user = JSON.parse(result);
    if (name == user.name && password == user.password) {
      callback(null, user);
    } else {
      callback(err, null);
    };
  });
};*/

// Logout
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
