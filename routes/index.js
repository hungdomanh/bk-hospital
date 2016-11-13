var pg = require('pg');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// connect 
var connect = 'postgres://tsephbbjgpmaka:mH6kFB2sIc2zOYpdVgQ_CYYzu0@ec2-54-163-251-104.compute-1.amazonaws.com:5432/d115c9p8d0kjh1';
require('pg').defaults.ssl = true;
var client = new pg.Client(connect);
client.connect();
client.on('error', function(error) {
  console.log(error);
});  


var type = 'khach';

// HOME PAGE
router.get('/', function(req, res) {
    if(!req.session.loggedIn) req.session.loggedIn = false;
    if(!req.session.type)     req.session.type = 'khack';
	res.render('index',{
		title: "BK-Hospital",
		logined: req.session.loggedIn,
        username: req.session.username,
		type: req.session.type
	});

});
// TIN TUC
router.get('/tin-tuc', function(req, res) {
    res.render('tin-tuc');
});
// CHINH_SACH CHAT LUONG
router.get('/chinh-sach-chat-luong', function(req, res) {
    res.render('chinh-sach-chat-luong');
});
// CO SO VAT CHAT   
router.get('/co-so-vat-chat', function(req, res) {
    res.render('co-so-vat-chat');
});
// BAN GIAM DOC
router.get('/ban-giam-doc', function(req, res) {
    res.render('ban-giam-doc');
});


router.get('/login', function(req, res) {
	if(!req.session.loggedIn) {
        req.session.type = 'khack';
        res.render('login', {
        	title: "Login", 
        	logined: req.session.loggedIn,
            username: null,
        	type: req.session.type
        });
    }
	else {
		res.redirect('/');
		// console.log("sdfdfsdfsdfsdfsdfsdfsd");
	}
});

router.post('/login', function(req, res) {

	if(req.body.username && req.body.password){

		var username = req.body.username;
		var password = req.body.password;
        client.query('SELECT * FROM users where id=$1',[username], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            console.log(result.rows[0]);
            if(result.rows[0].pass==password)  {
                req.session.loggedIn = true;
                req.session.type = result.rows[0].type;
                req.session.username = username;

                res.render('index',{
                    title: "BK-Hospital",
                    logined: req.session.loggedIn,
                    username: username,
                    type: req.session.type
                });
            }
            else
                res.render('login',{
                    title: "TRY Login",
                    logined: false,
                    username: null,
                    type: 'khack'
                });
        });  
		
    };

});

router.get('/logout', function (req, res) {
    req.session.loggedIn = false;
    req.session.username = null;
    req.session.type = 'khack';

    res.render('index',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});


router.get('/bac-si',  function(req, res) {
  
    client.query('SELECT * FROM bacsi', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/bacsi', {data: str, title: 'Bác Sĩ'});
        else res.send("CAN'T GET LINK");
    });  
});

router.get('/benh',  function(req, res) {
  
    client.query('SELECT * FROM benh', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        if(str)  res.render('list/benh', {data: str, title: 'Bệnh'});
        else res.send("CAN'T GET LINK");
    });  
});

router.get('/benh-an',  function(req, res) {

    pg.connect(connect, function(err, client, done){
        if(err) {
            return console.log("Can not connect postgresql");
        }
        client.query('SELECT * FROM benhan', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows;
            // console.log(str);
            if(str)  res.render('list/benhan', {data: str, title: 'Bệnh Án'});
            else res.send("CAN'T GET LINK");
        });  
    });
});

router.get('/benh-nhan',  function(req, res) {
    
    client.query('SELECT * FROM benhnhan', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/benhnhan', {data: str, title: 'Bệnh Nhân'});
        else res.send("CAN'T GET LINK");
    });  
});


router.get('/don-thuoc',  function(req, res) {
  
    client.query('SELECT * FROM donthuoc', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/donthuoc', {data: str, title: 'Đơn Thuốc'});
        else res.send("CAN'T GET LINK");
    });  
});

router.get('/hoa-don',  function(req, res) {
  
    client.query('SELECT * FROM hoadon', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/hoadon', {data: str, title: 'Hóa Đơn'});
        else res.send("CAN'T GET LINK");
    });  
});
// KHOA
router.get('/khoa',  function(req, res) {
    client.query('SELECT * FROM khoadieutri order by mak', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        var data  = JSON.stringify(result.rows);
        if(str) //res.end("req.session.loggedIn");
         res.render('list/khoa', {
        	data: data, 
        	title: 'Khoa',
        	logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type

        });
        else res.end("CAN'T GET LINK");
    });  
});

router.post('/add-khoa', function(req, res) {
    if(req.session.type=='boss' && req.body.mak && req.body.khoa){
        var mak = req.body.mak;
        var khoa = req.body.khoa;
        client.query('INSERT INTO khoadieutri VALUES($1, $2)',[mak, khoa])
        res.redirect('/khoa');
    }
    else 
        res.render('login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });
});

router.post('/edit-khoa', function(req, res) {
     if(req.session.type=='boss' && req.body.mak && req.body.khoa){
        var mak = req.body.mak;
        var khoa = req.body.khoa;
        client.query('UPDATE khoadieutri SET khoa = $1 WHERE mak = $2',[khoa, mak])
        res.redirect('/khoa');
    }
    else 
        res.render('login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });

});


router.get('/delete-khoa/:id', function(req, res) {
    if(req.session.type=='boss') {
        res.redirect('/khoa');
        client.query('DELETE FROM khoadieutri WHERE mak=$1 ',[req.params.id], function(err, result){
            if(err) {
                console.log(err);
            }
        });
    }
    else 
        res.render('login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });
});


// PHONG
router.get('/phong',  function(req, res) {
    
    client.query('SELECT * FROM phong', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.end("sdfsdfsdf");
        	//res.render('list/phong', {data: str, title: 'Phòng'});
        else res.send("CAN'T GET LINK");
    });  
});

router.get('/thuoc',  function(req, res) {
    
    client.query('SELECT * FROM thuoc', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/thuoc', {data: str, title: 'Thuốc'});
        else res.send("CAN'T GET LINK");
    });  
});






module.exports = router;




