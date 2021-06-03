// example.js

var mongoose = require('mongoose');
//var dbUrl = /* DB_CONNECTION_STRING */;
var dbUrl = 'mongodb+srv://new_user1:new_user1@clustertest1.d69an.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

var studentSchema = mongoose.Schema({
  name: {type:String, required:true},
  age: {type:Number, required:true}
});
var Student = mongoose.model('student',studentSchema);

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);
var db = mongoose.connection;

db.once("open",function () {

  Student.create({name:"June",age:20},function(error,student){
     console.log("Student.create:",student);

     Student.find({},function(error,students){
        console.log("Student.find:",students);
     });
     
  })

});