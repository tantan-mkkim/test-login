var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');

// Index
router.get('/', function(req, res){
/* DB사용부분 주석처리
  Post.find({})
    .populate('author')
    .sort('-createdAt') //object를 넣는 경우 {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 
    .exec(function(err, posts){ //.exec함수 앞에 DB에서 데이터를 어떻게 찾을지, 어떻게 정렬할지 등등을 함수로 표현하고, exec안의 함수에서 해당 data를 받아와서 할일을 정하는 구조
      if(err) return res.json(err);
      res.render('posts/index', {posts:posts});
    });*/

    res.render('posts/loginSuccess');

  });

// New
router.get('/new', util.isLoggedin, function(req, res){
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('posts/new', { post:post, errors:errors });
});

// create
router.post('/', util.isLoggedin, function(req, res){
  req.body.author = req.user._id;
  Post.create(req.body, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new');
    }
    res.redirect('/posts');
  });
});

// show
router.get('/:id', function(req, res){
  Post.findOne({_id:req.params.id})
    .populate('author')
    .exec(function(err, post){
      if(err) return res.json(err); //에러가 있다면 에러를 json형태로 웹브라우저에 표시
      res.render('posts/show', {post:post}); //에러가 없다면 검색 결과를 받아 views/posts/show.ejs를 render(페이지를 다이나믹하게 제작)
    });
});

// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var post = req.flash('post')[0];
  var errors = req.flash('errors')[0] || {};
  if(!post){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/edit', { post:post, errors:errors });
      });
  }
  else {
    post._id = req.params.id;
    res.render('posts/edit', { post:post, errors:errors });
  }
});

// update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now(); //post를 수정하는 경우 수정된 날짜를 updateAt에 기록
  Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/'+req.params.id+'/edit');
    }
    res.redirect('/posts/'+req.params.id);
  });
});

// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  Post.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/posts');
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}
