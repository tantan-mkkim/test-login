var express = require('express');
//var fs = require('fs');
var router = express.Router();
var passport = require('../config/passport');
var pool = require('../config/database'); //mysql pool
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

// Post Login : form 에 입력한 정보를 post 방식으로 받는 라우터 코드 설정
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
   })
);

// Logout
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
