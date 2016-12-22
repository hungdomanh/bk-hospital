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

// router.get('/benh-nhan-da-kham', function(req, res) {
// 	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, noidungkham from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where khambenh.trangthai>1 order by makb', function(err, result) {
// 	   if(err) return console.log("Can't SELECT FROM benh-nhan-da-kham");
// 	   res.send(result.rows);
// 	   console.log(result.rows);
// 	});
// });
router.get('/benhnhandakham/:mabs', function(req, res) {
	var mabs = req.params.mabs;
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, trieuchung, noidungkham from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where khambenh.trangthai>1 and mabs=$1 order by makb',[mabs], function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-da-kham");
	   res.send(result.rows);
	});
});

router.get('/benhnhandakham-admin', function(req, res) {
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, trieuchung, noidungkham from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where khambenh.trangthai>1 order by makb', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-da-kham");
	   res.send(result.rows);
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
	console.log(mabn);
	client.query('SELECT makb, mabn, benhnhan.hoten as benhnhan, mabs, bacsi.hoten as bacsi, map, phong.phong, phong.gia1ngaydem, mab, benh.benh, ngaydangki, ngaynhankham, ngaykham, ngayravien, tienthuoc, tienphong, tongchiphi, khambenh.trangthai, noidungkham, trieuchung from khambenh left join benhnhan using(mabn) left join bacsi using(mabs) left join phong using(map) left join benh using(mab) where mabn = $1 order by makb',[mabn], function(err, result) {
	   if(err) return console.log("Can't SELECT FROM ho so");
	   res.send(result.rows);
	   console.log(result.rows);
	});
});
///////////// Tien
// sum(tienphong), sum(tienthuoc), sum(tongchiphi), avg(tongchiphi)
router.get('/chi-phi/tong-so-tien-thu-duoc', function(req, res){
	client.query('select sum(tienphong) as tienphong, sum(tienthuoc) as tienthuoc, sum(tongchiphi) as tongchiphi, ROUND(avg(tongchiphi), 3) as trungbinh from khambenh', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM tong-so-tien-thu-duoc");
	   res.send(result.rows);
	});
});
// benh-nhan-kham-nhieu-hon-1-lan, lan kham nhieu tien nhat
router.get('/chi-phi/benh-nhan-kham-nhieu-hon-1-lan', function(req, res){
	client.query('select * from (select mabn, count(*), max(tongchiphi) from khambenh where trangthai>0 group by mabn) as t left join benhnhan using (mabn) where count >1', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-kham-nhieu-hon-1-lan");
	   res.send(result.rows);
	});
});
// thuoc-uong-nhieu-nhat
router.get('/chi-phi/thuoc-uong-nhieu-nhat', function(req, res){
	client.query('with t as (select * from thuoc right join (select mat,sum(soluong) from donthuoc left join thuoc using(mat) group by mat) as t using(mat)) select * from t where sum in (select max(sum) from t) order by mat', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM thuoc-uong-nhieu-nhat");
	   res.send(result.rows);
	});
});
// bac-si-kham-nhieu-benh-nhan-nhat
router.get('/chi-phi/bac-si-kham-nhieu-benh-nhan-nhat', function(req, res){
	client.query('with t as (select * from bacsi join (select mabs, count(*) from khambenh group by mabs) as m using(mabs)) select * from t where count in (select max(count) from t) order by mabs', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM bac-si-kham-nhieu-benh-nhan-nhat");
	   res.send(result.rows);
	});
});
// bac-si-dang-lam-viec
router.get('/chi-phi/bac-si-dang-lam-viec', function(req, res){
	client.query('SELECT count(*) from bacsi where trangthai > 0', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM bac-si-dang-lam-viec");
	   res.send(result.rows);
	});
});
// bac-si-dang-trong
router.get('/chi-phi/bac-si-dang-trong', function(req, res){
	client.query('SELECT count(*) from bacsi where trangthai = 0', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM bac-si-dang-trong");
	   res.send(result.rows);
	});
});
// benh-nhan-dang-cho
router.get('/chi-phi/benh-nhan-dang-cho', function(req, res){
	client.query('SELECT count(*) from khambenh where trangthai = 0', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-dang-cho");
	   res.send(result.rows);
	});
});
// benh-nhan-dang-kham
router.get('/chi-phi/benh-nhan-dang-kham', function(req, res){
	client.query('SELECT count(*) from khambenh where trangthai = 1', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-dang-kham");
	   res.send(result.rows);
	});
});
// benh-nhan-chua-xuat-vien
router.get('/chi-phi/benh-nhan-chua-xuat-vien', function(req, res){
	client.query('SELECT count(*) from khambenh where trangthai = 2', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-chua-xuat-vien");
	   res.send(result.rows);
	});
});
// benh-nhan-da-xuat-vien
router.get('/chi-phi/benh-nhan-da-xuat-vien', function(req, res){
	client.query('SELECT count(*) from khambenh where trangthai = 3', function(err, result) {
	   if(err) return console.log("Can't SELECT FROM benh-nhan-da-xuat-vien");
	   res.send(result.rows);
	});
});

// hoi-dap-khoa
router.get('/hoi-dap-khoa', function(req, res){
	 client.query('select * from hoidap left join (select count(*), mahd from comment group by mahd order by mahd) as t using (mahd)', function(err, result){
	   if(err) return console.log("Can't SELECT FROM hoi-dap-khoa");
	   res.send(result.rows);
	});
});










module.exports = router;

