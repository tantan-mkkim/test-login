var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var fs = require('fs');

// New
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});

// create
router.post('/', function(req, res){ // "/users"에 post 요청이 오는 경우
  //Mongoose의 Model.create함수 //해당 모델의 collection에 document를 하나 생성
/*    User.create(req.body, function(err, user){ //err가 없으면 2번째 parameter인 user에 생성된 document를 저장
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  }); */

  // 회원이 users 파일에 존재하지 않을 경우 users 파일에 저장,
  // 존재할 경우 error 출력하고 sign up 화면 redirect
  fs.readFile('./data/users.json', 'utf8', function (err, usersjson) {
    
    //TODO : input data validation check


    var newuser = req.body.username;
    var users = JSON.parse(usersjson);
    //var user = JSON.parse(usersjson).members; //user 파일의 user 정보 parsing
    var user = users.members; //user 파일의 user 정보 parsing
    
    var i = 0;
    while(i < user.length){
      if(user[i].username == newuser){
        req.flash('user', req.body);
        //req.flash('errors', util.parseError(err)); //error 발생하여 주석처리 //FIXME
        return res.redirect('/users/new');
      };
      i++;
    };
    
    //new user 저장
    //[TIP]
    //You can't just append to a JSON file and expect it to merge into the array.
    //You need to read the file, parse the JSON to an array, push the new element onto the array, stringify the array, and then write that to the file.
    var newuser = {
      "username": req.body.username,
      "name": req.body.name,
      "password": req.body.password,
      "email": req.body.email
    };
    user.push(newuser); //add new user into the array
    //var newuserJson = JSON.stringify(user);
    var usersJson = JSON.stringify(users); //test code
    //console.log(usersJson);
    fs.writeFile('./data/users.json', usersJson, function(err) {
      if (err) throw err;
      console.log('Users File is changed!');
    });
    res.redirect('/');       
  });


});

// show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});

// update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({username:req.params.username})
    .select('password')
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
