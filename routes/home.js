var express = require('express');
var fs = require('fs');
var router = express.Router();
var passport = require('../config/passport');
const { exists } = require('../models/User');

// Home
router.get('/', function (req, res) {
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
      req.flash('errors', errors);
      res.redirect('/login');
    }
  },
  /*passport 대신 사용자 정의 함수 사용
   passport.authenticate('local-login', {
     successRedirect : '/posts',
     failureRedirect : '/login'
   }
   ));  
   */
  //사용자 정의 함수 : ID AND PASSWORD MATCHING FUNCTION
  function (req, res) {
    //req.flash('username', username);
    //req.flash('errors', {login:'The username or password is incorrect.'});

    var paramId = req.body.username || req.query.username;
    var paramPassword = req.body.password || req.query.password;

    authUser(paramId, paramPassword, function (err, rows) {
      if (err) {
        console.error('Login Error : ' + err.stack);
        req.flash('errors', errors);
        res.redirect('/login');
      }

      if (rows) {

        // var opt_unit = rows[0].CODE_SVALUE;
        // var opts = opt_unit.split('$');

        // req.session.user = {
        //     id: paramId,
        //     name: rows[0].WUSER_NAME,
        //     group: rows[0].WUSER_GROUP,
        //     level: rows[0].WUSER_LEVEL,
        //     use: rows[0].WUSER_USE,
        //     point_balance : 0,
        //     max_mcount: opts.length > 0 ? parseInt(opts[0]) : 0,
        //     max_ocount: opts.length > 1 ? parseInt(opts[1]) : 0,
        //     max_amount: opts.length > 2 ? parseInt(opts[2]) : 0,
        //     web_unit: opt_unit,
        //     authorized: true
        // };

        //console.log(req.session.user);

        // if (req.session.user.use == '0')
        //res.render('menu',{user:req.session.user,rows:null});
        res.redirect('/posts');
        // else
        //     res.render('webi',{user:req.session.user,rows:null});

      } else {
        //req.flash('username', username);
        req.flash('errors', {login:'The username or password is incorrect.'});
        res.redirect('/login');
       }
    });


  }
);

var authUser = function(name, password, callback){

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
};

// Logout
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
