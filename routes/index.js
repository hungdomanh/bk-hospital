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
	res.render('home',{
		title: "BK-Hospital",
		logined: req.session.loggedIn,
        username: req.session.username,
		type: req.session.type
	});

});
///////////////////////////////////////////////////////////////////////////// THONG TIN
// TIN TUC
router.get('/thong-tin/tin-tuc', function(req, res) {
    res.render('thong-tin/tin-tuc');
});
// CHINH_SACH CHAT LUONG
router.get('/thong-tin/chinh-sach-chat-luong', function(req, res) {
    res.render('thong-tin/chinh-sach-chat-luong');
});
// CO SO VAT CHAT   
router.get('/thong-tin/co-so-vat-chat', function(req, res) {
    res.render('thong-tin/co-so-vat-chat');
});
// BAN GIAM DOC
router.get('/thong-tin/ban-giam-doc', function(req, res) {
    res.render('thong-tin/ban-giam-doc');
});
/////////////////////////////////////////////////////////////////////////////  LOGIN - REGISTER
router.get('/login', function(req, res) {
	if(!req.session.loggedIn) {
        req.session.type = 'khack';
        res.render('login-register/login', {
        	title: "Login", 
        	logined: req.session.loggedIn,
            username: null,
        	type: req.session.type
        });
    }
	else {
		res.redirect('/');
	}
});
router.post('/login', function(req, res) {
	if(req.body.username && req.body.password){
		var username = req.body.username;
		var password = req.body.password;
        client.query('SELECT * FROM users where id=$1',[username], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            if(result.rows[0].pass==password)  {
                req.session.loggedIn = true;
                req.session.type = result.rows[0].type;
                req.session.username = username;

                res.render('home',{
                    title: "BK-Hospital",
                    logined: req.session.loggedIn,
                    username: username,
                    type: req.session.type
                });
            }
            else
                res.render('login-register/login',{
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
    res.render('home',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
router.get('/register', function (req, res) {
    req.session.loggedIn = false;
    req.session.username = null;
    req.session.type = 'khack';

    client.query('SELECT id FROM users', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");
        var str = result.rows;
        var data  = JSON.stringify(result.rows);
        if(str) 
         res.render('login-register/register', {
            data: data, 
            title: 'Đăng kí',
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type

        });
        else res.end("CAN'T GET LINK");
    });  
});
router.post('/register-submit', function(req, res) {
    if(req.body.username && req.body.password && req.body.email){
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;

        client.query("INSERT INTO users (id, pass, email, type) VALUES ($1, $2, $3, \'khach\');",[username, password, email]);
        res.redirect('/login');
        res.render('login',{ 
            title: "SUCCESS",
            logined: false,
            username: null,
            type: 'khack'
        });
    };
});
///////////////////////////////////////////////////////////////////////////// DANH SACH
// BAC SI
router.get('/bac-si',  function(req, res) {
    if(req.session.loggedIn) {
        client.query('SELECT * FROM bacsi right join khoadieutri using (mak) order by mabs', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('list/bac-si', {
                    data: data, 
                    title: 'Bác Sĩ',
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
            type: 'khack'
        });
});
router.post('/add-bac-si', function(req, res) {
    if(req.session.type=='boss' && req.body.mabs && req.body.mak 
        && req.body.hoten && req.body.gioitinh && req.body.diachi 
        && req.body.kinhnghiem && req.body.ngaysinh && req.body.thangsinh 
        && req.body.namsinh){
        var mabs = req.body.mabs ;
        var mak = req.body.mak ;
        var hoten = req.body.hoten ;
        var gioitinh = req.body.gioitinh ;
        var diachi = req.body.diachi ;
        var kinhnghiem = req.body.kinhnghiem ;
        var trangthai = 0;
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

        res.redirect('/bac-si');
        client.query('INSERT INTO bacsi VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [mabs, hoten, s, gioitinh, diachi, mak, kinhnghiem, trangthai]
        );
        
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });
});
router.post('/edit-bac-si', function(req, res) {
    console.log(req.body.trangthai);
    if(req.session.type=='boss' && req.body.mabs && req.body.mak 
        && req.body.hoten && req.body.gioitinh && req.body.diachi 
        && req.body.kinhnghiem && req.body.ngaysinh && req.body.thangsinh 
        && req.body.namsinh && req.body.trangthai){
        var mabs = req.body.mabs ;
        var mak = req.body.mak ;
        var hoten = req.body.hoten ;
        var gioitinh = req.body.gioitinh ;
        var diachi = req.body.diachi ;
        var kinhnghiem = req.body.kinhnghiem ;
        var trangthai =  req.body.trangthai;
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;
        res.redirect('/bac-si');
        client.query('UPDATE bacsi SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, mak = $6, kinhnghiem = $7, trangthai = $8 WHERE mabs = $1',
            [mabs, hoten, s, gioitinh, diachi, mak, kinhnghiem, trangthai]
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });
});
router.post('/delete-bac-si', function(req, res) {
    if(req.session.type=='boss') {
        res.redirect('/bac-si');
        client.query('DELETE FROM bacsi WHERE mabs=$1 ',[req.body.mabs], function(err, result){
            if(err) {
                console.log(err);
            }
        });
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khack'
        });
});


// BENH
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
    if(req.session.loggedIn) {
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
    }
    else 
        res.render('login-register/login',{
            title: "Login",
            logined: false,
            username: null,
            type: 'khack'
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
router.post('/delete-khoa', function(req, res) {
    if(req.session.type=='boss') {
        res.redirect('/khoa');
        client.query('DELETE FROM khoadieutri WHERE mak=$1 ',[req.body.mak], function(err, result){
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





///////////////////////////////////////////////////////////////////////////// FUNCTION
function loai0(type) {
    if(type=='khach' || type == null) return true;
    else return false;
}
function loai1(type) {
    if(type=='benhnhan') return true;
    else return false;
}
function loai2(type) {
    if(type=='bacsi' ) return true;
    else return false;
}
function loai3(type) {
    if(type=='boss') return true;
    else return false;
}
function loai12(type) {
    if(type=='benhnhan' || type == 'bacsi') return true;
    else return false;
}
function loai23(type) {
    if(type=='bacsi' || type == 'boss') return true;
    else return false;
}



module.exports = router;




