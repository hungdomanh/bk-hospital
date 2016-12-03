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
  	if(table=='users') res.end('^_^')
  	else
		client.query('SELECT * from ' +table, function(err, result) {
		   if(err) return console.log("Can't SELECT FROM TABLE");
		   res.send(result.rows);
		});
});

router.get('/dangkikhambenh', function(req, res){
	client.query('SELECT makb, mabn, hoten, trieuchung, khambenh.trangthai, ngaydangki from khambenh left join benhnhan using(mabn) where khambenh.trangthai=0 order by makb', function(err, result){
	   if(err) return console.log("Can't SELECT FROM khambenh-dangkikhambenh");
	   res.send(result.rows);
	});
});

router.get('/dangchokhambenh', function(req, res){
	client.query('SELECT makb, mabn, hoten, trieuchung, khambenh.trangthai, ngaydangki from khambenh left join benhnhan using(mabn) where khambenh.trangthai=0 order by makb', function(err, result){
	   if(err) return console.log("Can't SELECT FROM dangchokhambenh");
	   res.send(result.rows);
	});
});

router.get('/nhandangkikhambenh/:username', function(req, res){
	var username = req.params.username;
	client.query('SELECT mabs, trangthai from bacsi where username=$1',[username], function(err, result){
	   if(err) return console.log("Can't SELECT FROM bacsi-nhandangkikhambenh");
	   res.send(result.rows);
	});
});

router.get('/benhnhandangkham/:mabs', function(req, res){
	var mabs = req.params.mabs;
	client.query('SELECT makb, mabn, hoten, map, phong, trieuchung, khambenh.trangthai, ngaydangki, ngaynhankham from khambenh left join phong using(map) left join benhnhan using(mabn) where khambenh.trangthai=1 and mabs=$1 order by makb',[mabs], function(err, result){
	   if(err) return console.log("Can't SELECT FROM khambenh-benhnhandangkham");
	   res.send(result.rows);
	});
});

router.get('/benhnhandangkham-admin', function(req, res){
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong, trieuchung, khambenh.trangthai, ngaydangki, ngaynhankham from khambenh left join phong using(map) left join benhnhan using(mabn) left join bacsi using(mabs) where khambenh.trangthai=1 order by makb', function(err, result){
	   if(err) return console.log("Can't SELECT FROM benhnhandangkham");
	   res.send(result.rows);
	});
});
// benh nhan dang kham
router.get('/benh-thuoc', function(req, res){
	client.query('SELECT * from benh left join thuoc using(mat) order by mab', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-thuoc");
	   res.send(result.rows);
	});
});
// don thuoc benh nhan da kham
router.get('/don-thuoc-benh-nhan-da-kham/:makb', function(req, res){
	var makb = req.params.makb;
	client.query('SELECT donthuoc.mat, thuoc.thuoc, donthuoc.soluong, donthuoc.gia from donthuoc left join thuoc using(mat) where makb=$1',[makb], function(err, result){
		if(err) return console.log("Can't SELECT FROM don-thuoc-benh-nhan-da-kham");
		res.send(result.rows);
	});
});

router.get('/benh-nhan-da-kham', function(req, res) {
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, noidungkham from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where khambenh.trangthai>1 order by makb', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-da-kham");
	   res.send(result.rows);
	   console.log(result.rows);
	});
});

// phong trong
router.get('/phong', function(req, res){
	client.query('SELECT * from phong where trangthai = 0', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM phong trong");
	   res.send(result.rows);
	});
});
// ho so 
router.get('/ho-so/:mabn', function(req, res){
	var mabn = req.params.mabn;
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, noidungkham, trieuchung from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where mabn = $1 and benhnhan.trangthai=1 order by makb',[mabn], function(err, result) {
	   if(err) return console.log("Can't SELECT FROM ho so");
	   res.send(result.rows);
	});
});











module.exports = router;

