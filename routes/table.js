var pg = require('pg');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');


// connect 
// var config = require('./config.js');
// var connect = config.database;
var connect = 'postgres://tsephbbjgpmaka:mH6kFB2sIc2zOYpdVgQ_CYYzu0@ec2-54-163-251-104.compute-1.amazonaws.com:5432/d115c9p8d0kjh1';
require('pg').defaults.ssl = true;
var client = new pg.Client(connect);
client.connect();
client.on('error', function(error) {
  console.log(error);
});  



router.get('/show/:table', function(req, res){
  	var table =  req.params.table;
	client.query('SELECT * from ' +table, function(err, result) {
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   res.send(result.rows);
	});
});



router.get('/dangkikhambenh', function(req, res){
	client.query('SELECT madkkb, mabn, hoten, mieuta, dangkikhambenh.trangthai from dangkikhambenh left join benhnhan using(mabn) where dangkikhambenh.trangthai=0 order by madkkb', function(err, result){
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   res.send(result.rows);
	});
});

router.get('/dangchokhambenh', function(req, res){
	client.query('SELECT madkkb, mabn, hoten, mieuta, dangkikhambenh.trangthai from dangkikhambenh left join benhnhan using(mabn) where dangkikhambenh.trangthai=0 order by madkkb', function(err, result){
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   res.send(result.rows);
	});
});

router.get('/benhnhandangkham/:mabs', function(req, res){
	var mabs = req.params.mabs;
	client.query('SELECT madkkb, mabn, hoten, map, phong, mieuta, dangkikhambenh.trangthai from dangkikhambenh left join phong using(map) left join benhnhan using(mabn) where dangkikhambenh.trangthai=1 and mabs=$1 order by madkkb',[mabs], function(err, result){
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   res.send(result.rows);
	});
});

router.get('/maxmakhambenh', function(req, res){
	client.query('SELECT max(makb), count(*) from khambenh', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   if(result.rows.count)   res.send(result.rows[0].max);
	   else res.send('-1');
	});
});




router.get('/phong', function(req, res){
	client.query('SELECT * from phong where trangthai = 0', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM TABLE");
	   res.send(result.rows);
	});
});














module.exports = router;

