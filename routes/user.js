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
/* GET users listing. */
router.get('/', function(req, res, next) {
	req.session.lastPage = '/user';
    if(req.session.loggedIn) {
    	var table = req.session.type;
		client.query('SELECT * FROM ' +table+ ' where username=$1',[req.session.username], function(err, result){
	        if(err) return console.log("Can't SELECT FROM TABLE");
	        var str = result.rows;
	        var t = '';
	        var data  = JSON.stringify(result.rows);
	        if(table == 'benhnhan') t = 'benh-nhan';
	        else if(table == 'bacsi') t = 'bac-si';
	        else if(table == 'admin') t = 'admin';
	        if(str) 
	            res.render('user/'+t,{
	                data: data,
			        title: "Thông tin cá nhân",
			        logined: req.session.loggedIn,
			        username: req.session.username,
			        type: req.session.type
			    });
	        else res.end("CAN'T GET LINK");
		})
   }
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});


router.get('/cap-nhat-thong-tin', function(req, res, next) {
	req.session.lastPage = '/';
    if(req.session.loggedIn) {
   		if(req.session.type == 'khach') {
   			client.query('SELECT * FROM benhnhan order by mabn', function(err, result){
	            if(err) return console.log("Can't SELECT FROM TABLE");
	            var str = result.rows;
	            var data  = JSON.stringify(result.rows);
	            if(str) 
	                res.render('user/khach',{
		                data: data,
				        title: "Thông tin",
				        logined: true,
				        username: req.session.username,
				        type: 'khach'
				    });
	            else res.end("CAN'T GET LINK");
       		})
   		}
   }
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});

router.post('/update-khach', function (req, res) {
	var ngaysinh = req.body.ngaysinh ;
    var thangsinh = req.body.thangsinh ;
    var namsinh = req.body.namsinh ;
    if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
    if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
    var s = ngaysinh + '/' + thangsinh +'/' + namsinh;


    client.query('INSERT INTO benhnhan values($1, $2, $3, $4, $5, $6, $7, $8) ',
	[req.body.mabn, req.body.hoten, s, req.body.gioitinh, 
	req.body.diachi, req.body.dienthoai, '1', req.session.username]);  

    client.query('UPDATE users set type=$1 where id=$2',
            ['benhnhan', req.session.username]
        );
    req.session.type = 'benhnhan';
	res.redirect('/user/dang-ki-kham-benh');
});

/////////////////////////////////////////////////// BENH NHAN
router.post('/update-benh-nhan', function (req, res) {
	var ngaysinh = req.body.ngaysinh ;
    var thangsinh = req.body.thangsinh ;
    var namsinh = req.body.namsinh ;
    if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
    if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
    var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

    client.query('UPDATE benhnhan SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, dienthoai = $6 WHERE mabn = $1',
            [req.body.mabn, req.body.hoten, s, req.body.gioitinh, req.body.diachi, '0'+ req.body.dienthoai]
        );  

    client.query('UPDATE users set type=$1 where id=$2',
            ['benhnhan', req.session.username]
        );

    req.session.type = 'benhnhan';
    res.redirect('/user/dang-ki-kham-benh');
});
//////// DANG KI KHAM BENH
router.get('/dang-ki-kham-benh', function(req, res, next) {
	req.session.lastPage = '/user/dang-ki-kham-benh';
    if(req.session.loggedIn && req.session.type =='benhnhan') {
   		client.query('SELECT * FROM benhnhan where username=$1',[req.session.username], function(err, result){
	        if(err) return console.log("Can't SELECT FROM TABLE");
	        var str = result.rows;
	        var data  = JSON.stringify(result.rows);
	        if(str) 
	            res.render('user/dang-ki-kham-benh',{
	                data: data,
			        title: "Đăng kí khám bệnh",
			        logined: req.session.loggedIn,
			        username: req.session.username,
			        type: req.session.type
			    });
	        else res.end("CAN'T GET LINK");
		})

   }
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});

router.post('/dang-ki-kham-benh', function(req, res, next) {
	req.session.lastPage = '/user/dang-ki-kham-benh';
    if(req.session.loggedIn && req.session.type =='benhnhan') {
    	res.redirect('/');
    	client.query('select max(madkkb), count(*) from dangkikhambenh',function(err, result){
    		var max;
    		if(!result.rows[0].count) max=0;
    		else max = result.rows[0].max+1;
    		client.query('INSERT INTO dangkikhambenh(madkkb, mabn, mieuta, trangthai) values($1, $2, $3, $4)',
   			[max, req.body.mabn, req.body.content, '0']);	
    	});   		
   }
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});


///////// HO SO BENH AN
router.get('/ho-so-benh-an', function(req, res, next) {
	req.session.lastPage = '/user/ho-so-benh-an';
    if(req.session.loggedIn && req.session.type == 'benhnhan') {
			client.query('SELECT * from benhan left join benhnhan using(mabn) left join benh using(mab) left join bacsi using(mabs) left join phong using(map) where benhnhan.username = $1',[req.body.username], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('user/ho-so-benh-an',{
	                data: data,
			        title: "Hồ sơ bệnh án",
			        logined: true,
			        username: req.session.username,
			        type: req.session.type
			    });
            else res.end("CAN'T GET LINK");
   		})
	}
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});



///////////////////////////////////////////////////////////////// BAC SI
router.get('/benh-nhan-dang-cho', function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-cho';
    if(req.session.loggedIn && req.session.type =='bacsi') {
        res.render('user/benh-nhan-dang-cho',{
	        title: "Bệnh nhân chờ khám bệnh",
	        logined: req.session.loggedIn,
	        username: req.session.username,
	        type: req.session.type
	    });
   }
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});

router.post('/nhan-dang-ki-kham-benh',  function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-cho';
	console.log(req.body);
    if(req.session.loggedIn && req.session.type == 'bacsi') {
    	
    	client.query('UPDATE benhnhan set trangthai=1 WHERE mabn =$1',[req.body.mabn]);
    	client.query('UPDATE phong    set trangthai=1 WHERE map  =$1',[req.body.map]);
		client.query('SELECT mabs, trangthai from bacsi WHERE username=$1',[req.session.username], function(err, result){
			var mabs = result.rows[0].mabs;
			var trangthaiBS = result.rows[0].trangthai;
			if(trangthaiBS)
				client.query('UPDATE bacsi set trangthai = $1 WHERE mabs =$2',[trangthaiBS+1, mabs]);
			client.query('UPDATE dangkikhambenh set mabs=$1, trangthai=$2, map=$3 where madkkb=$4',[mabs, 1, req.body.map, req.body.madkkb]);
			res.redirect(req.session.lastPage);
		});
	}
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});

router.get('/benh-nhan-dang-kham', function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-kham';
    if(req.session.loggedIn && req.session.type == 'bacsi') {

		client.query('SELECT mabs FROM bacsi where username=$1',[req.session.username], function(err, result){
			var mabs = result.rows[0].mabs;
        	if(err) return console.log("Can't SELECT FROM TABLE");
        	
            res.render('user/benh-nhan-dang-kham',{
                mabs: mabs,
		        title: "Bệnh nhân đang khám bệnh",
		        logined: true,
		        username: req.session.username,
		        type: req.session.type
		    });
        })
		
	}
   else 
   	res.render('login-register/login',{
        title: "Login",
        logined: false,
        username: null,
        type: 'khach'
    });
});















module.exports = router;

