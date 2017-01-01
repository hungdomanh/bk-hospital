var pg = require('pg');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

// connect 
var connect = config.database;
var config = require('./config.js');
require('pg').defaults.ssl = true;
var client = new pg.Client(connect);
client.connect();
client.on('error', function(error) {
  console.log(error);
});  

// HOME PAGE
router.get('/', function(req, res) {
    if(!req.session.loggedIn) req.session.loggedIn = false;
    if(!req.session.type)     req.session.type = 'khach';
    req.session.lastPage = '/';
	res.render('home',{
		title: "BK-Hospital",
		logined: req.session.loggedIn,
        username: req.session.username,
		type: req.session.type
	});

});
// BAN QUAN TRI   /////////////////////
router.get('/thong-tin/ban-quan-tri', function(req, res) {
    res.render('thong-tin/ban-quan-tri',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
/// DANH SACH THONG KE
router.get('/thong-ke/khoa-dieu-tri',  function(req, res) {
    req.session.lastPage = 'thong-ke/khoa-dieu-tri';
    if(req.session.loggedIn) {
        client.query('SELECT * FROM khoadieutri order by mak', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
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
            type: 'khach'
        });
});

router.get('/thong-ke/benh-thuong-gap',  function(req, res) {
    req.session.lastPage = 'thong-ke/benh-thuong-gap';
    if(req.session.loggedIn) {
        client.query('SELECT mab, mat, benh, thuoc FROM benh right join thuoc using (mat) order by mab', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
             res.render('list/benh', {
                data: data, 
                title: 'Bệnh',
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
            type: 'khach'
        });
});

/////////////////////////////////////////////////////////////////////////////  LOGIN - REGISTER
router.get('/login', function(req, res) {
	if(!req.session.loggedIn) {
        req.session.type = 'khach';
        req.session.username = null;
        res.render('login-register/login', {
        	title: "Login", 
        	logined: req.session.loggedIn,
            username: null,
        	type: req.session.type
        });
    }
	else {
        if(!req.session.lastPage) req.session.lastPage ='/';
		res.redirect('/');
	}
});
router.post('/login', function(req, res) {
    if(!req.session.lastPage)   req.session.lastPage ='/';
	if(req.body.username && req.body.password){
		var username = req.body.username;
		var password = req.body.password;

        client.query('SELECT id FROM users order by id', function(err, result){
            var ids = result.rows;
            var test = 0;
            // var data  = JSON.stringify(result.rows);
            for(var i=0; i<ids.length; i++) {
                if(ids[i].id == username) {
                    test = 1;
                    client.query('SELECT * FROM users where id=$1',[username], function(err, result){
                        if(err) return console.log("Can't SELECT FROM TABLE");
                        if(result.rows[0].pass==password)  {
                            req.session.loggedIn = true;
                            req.session.type = result.rows[0].type;
                            req.session.username = username;
                            res.redirect(req.session.lastPage);
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
                                type: 'khach'
                            });
                    });
                }
            }
            if(test == 0)   {
                res.render('login-register/login',{
                    title: "TRY Login",
                    logined: false,
                    username: null,
                    type: 'khach'
                });
            }
        });          
    }
    else {
        res.render('login-register/login',{
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
    }
});
router.get('/logout', function (req, res) {
    req.session.loggedIn = false;
    req.session.username = null;
    req.session.type = 'khach';
    res.redirect('/');
    res.render('home',{
        title: "BK-Hospital",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
router.get('/register', function (req, res) {
    req.session.loggedIn = false;
    req.session.username = null;
    req.session.type = 'khach';

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
            type: 'khach'
        });
    };
});

///////////////////////////////////////////////////////////////////////////// DANH SACH
// BAC SI /////////////////////////////
router.get('/bac-si',  function(req, res) {
    req.session.lastPage = '/bac-si';
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
            type: 'khach'
        });
});
router.post('/add-bac-si', function(req, res) {
    req.session.lastPage = '/bac-si';
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
        client.query('INSERT INTO bacsi VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [mabs, hoten, s, gioitinh, diachi, mak, kinhnghiem, trangthai, req.body.username]
        );
        client.query('INSERT INTO users VALUES($1, $2, $3, $4, $5)',
            ['bacsi'+mabs, '12', 'bacsi', 'by admin', 'bacsi'+mabs+'@gmail.com']
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-bac-si', function(req, res) {
    req.session.lastPage = '/bac-si';
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
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;
        res.redirect('/bac-si');
        client.query('UPDATE bacsi SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, mak = $6, kinhnghiem = $7 WHERE mabs = $1',
            [mabs, hoten, s, gioitinh, diachi, mak, kinhnghiem]
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/delete-bac-si', function(req, res) {
    req.session.lastPage = '/bac-si';
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
            type: 'khach'
        });
});

// BENH  can them khoa dieu tri 
router.get('/benh',  function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.loggedIn) {
        client.query('SELECT mab, mat, benh, thuoc FROM benh right join thuoc using (mat) order by mab', function(err, result){
            if(err) return console.log("Can't SELECT FROM benh");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('list/benh', {
                    data: data, 
                    title: 'Bệnh',
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
router.post('/add-benh', function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.type=='boss' && req.body.mab && req.body.mat
        && req.body.benh){
        var mab = req.body.mab ;
        var benh = req.body.benh ;
        var mat = req.body.mat ;

        res.redirect('/benh');
        client.query('INSERT INTO benh VALUES($1, $2, $3)',
            [mab, benh, mat]
        );
    }
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-benh', function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.type=='boss' && req.body.mab && req.body.mat
        && req.body.benh ){
        var mab = req.body.mab ;
        var benh = req.body.benh ;
        var mat = req.body.mat ;

        res.redirect('/benh');
        client.query('UPDATE benh set benh=$1, mat=$2 WHERE mab = $3', [benh, mat, mab]);
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/delete-benh', function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.type=='boss') {
        res.redirect('/benh');
        client.query('DELETE FROM bacsi WHERE mab=$1 ',[req.body.mab], function(err, result){
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
            type: 'khach'
        });
});

// BENH NHAN /////////////////////////////
router.get('/benh-nhan',  function(req, res) {
    req.session.lastPage = '/benh-nhan';
    if(req.session.loggedIn) {
        client.query('SELECT * FROM benhnhan order by mabn', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('list/benh-nhan', {
                    data: data, 
                    title: 'Bệnh Nhân',
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
router.post('/add-benh-nhan', function(req, res) {
    req.session.lastPage = '/benh-nhan';
    if(req.session.type=='boss' && req.body.mabn && req.body.trangthai 
        && req.body.hoten && req.body.gioitinh && req.body.diachi 
        && req.body.dienthoai && req.body.ngaysinh && req.body.thangsinh 
        && req.body.namsinh){
        var mabn = req.body.mabn ;
        var hoten = req.body.hoten ;
        var gioitinh = req.body.gioitinh ;
        var diachi = req.body.diachi ;
        var trangthai = req.body.trangthai;
        var dienthoai = req.body.dienthoai +'0';
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;


        res.redirect('/benh-nhan');
        client.query('INSERT INTO benhnhan VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [mabn, hoten, s, gioitinh, diachi, dienthoai, trangthai, req.body.username]
        );
        client.query('INSERT INTO users VALUES($1, $2, $3, $4, $5)',
            ['benhnhan'+mabn, '12', 'benhnhan', 'by admin', 'benhnhan'+mabn+'@gmail.com']
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-benh-nhan', function(req, res) {
    req.session.lastPage = '/benh-nhan';
    if(req.session.type=='boss' && req.body.mabn 
        && req.body.hoten && req.body.gioitinh && req.body.diachi 
        && req.body.dienthoai && req.body.ngaysinh){
        var mabn = req.body.mabn ;
        var hoten = req.body.hoten ;
        var gioitinh = req.body.gioitinh ;
        var diachi = req.body.diachi ;
        var dienthoai = '0' + req.body.dienthoai;
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

        res.redirect('/benh-nhan');
        client.query('UPDATE benhnhan SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, dienthoai = $6 WHERE mabn = $1',
            [mabn, hoten, s, gioitinh, diachi, dienthoai]
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/delete-benh-nhan', function(req, res) {
    req.session.lastPage = '/benh-nhan';
    if(req.session.type=='boss') {
        res.redirect('/benh-nhan');
        client.query('DELETE FROM benhnhan WHERE mabn=$1 ',[req.body.mabn], function(err, result){
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
            type: 'khach'
        });
});

// DON THUOC /////////////////////////////
router.get('/don-thuoc',  function(req, res) {
   req.session.lastPage = '/don-thuoc';
   if(loai23(req.session.type)) {
      client.query('select hoten, mat, thuoc.thuoc, soluong, donthuoc.gia, makb from donthuoc left join thuoc using (mat) left join (select * from khambenh left join benhnhan using(mabn)) as t using(makb);', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
             res.render('list/don-thuoc', {
                data: data, 
                title: 'Đơn Thuốc',
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
            type: 'khach'
        });
});

// KHOA /////////////////////////
router.get('/khoa',  function(req, res) {
    if(req.session.loggedIn) {
        client.query('SELECT * FROM khoadieutri order by mak', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
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
            type: 'khach'
        });
});
router.post('/add-khoa', function(req, res) {
    if(req.session.type=='boss' && req.body.mak && req.body.khoa){
        var mak = req.body.mak;
        var khoa = req.body.khoa;
        client.query('INSERT INTO khoadieutri VALUES($1, $2)',[mak, khoa]);
        res.redirect('/khoa');
    }
    else 
        res.render('login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-khoa', function(req, res) {
    if(req.session.type=='boss' && req.body.mak && req.body.khoa){
        var mak = req.body.mak;
        var khoa = req.body.khoa;
        res.redirect('/khoa'); 
        client.query('UPDATE khoadieutri SET khoa = $1 WHERE mak = $2',[khoa, mak]);
    }
    else 
        res.render('login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
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
            type: 'khach'
        });
});

// PHONG /////////////////////////
router.get('/phong',  function(req, res) {
    req.session.lastPage = '/phong';
    if(req.session.loggedIn) {
        client.query('SELECT * FROM phong order by map', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('list/phong', {
                    data: data, 
                    title: 'Phòng',
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
router.post('/add-phong', function(req, res) {
    req.session.lastPage = '/phong';
    if(req.session.type =='boss' && req.body.map && req.body.phong && req.body.gia1ngaydem){
        var map         = req.body.map ;
        var phong       = req.body.phong ;
        var gia1ngaydem = req.body.gia1ngaydem ;
        var trangthai   = 0 ;

        res.redirect('/phong');
        client.query('INSERT INTO phong VALUES($1, $2, $3, $4)',
            [map, phong, gia1ngaydem, trangthai]
        );
        
    }
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-phong', function(req, res) {
    req.session.lastPage = '/phong';
    if(req.session.type =='boss' && req.body.map && req.body.phong && req.body.gia1ngaydem && req.body.trangthai){
        var map         = req.body.map ;
        var phong       = req.body.phong ;
        var gia1ngaydem = req.body.gia1ngaydem ;
        var trangthai   = req.body.trangthai ;

        res.redirect('/phong');
        client.query('UPDATE phong set phong=$1, gia1ngaydem=$2, trangthai=$3 WHERE map=$4',
             [phong, gia1ngaydem, trangthai, map]
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/delete-phong', function(req, res) {
    req.session.lastPage = '/phong';
    if(req.session.type=='boss') {
        res.redirect('/phong');
        client.query('DELETE FROM phong WHERE map=$1 ',[req.body.map], function(err, result){
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
            type: 'khach'
        });
});

// THUOC /////////////////////////
router.get('/thuoc',  function(req, res) {
    req.session.lastPage = '/thuoc';
    if(req.session.loggedIn) {
        client.query('SELECT * FROM thuoc order by mat', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('list/thuoc', {
                    data: data, 
                    title: 'Thuốc',
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
router.post('/add-thuoc', function(req, res) {
    req.session.lastPage = '/thuoc';
    if(req.session.type =='boss' && req.body.mat && req.body.thuoc && req.body.donvi && req.body.gia){
        var mat   = req.body.mat ;
        var thuoc = req.body.thuoc ;
        var donvi = req.body.donvi ;
        var gia   = req.body.gia ;

        res.redirect('/thuoc');
        client.query('INSERT INTO thuoc VALUES($1, $2, $3, $4)',
            [mat, thuoc, donvi, gia]
        );
    }
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/edit-thuoc', function(req, res) {
    req.session.lastPage = '/thuoc';
    if(req.session.type =='boss' && req.body.mat && req.body.thuoc && req.body.donvi && req.body.gia){
        var mat   = req.body.mat ;
        var thuoc = req.body.thuoc ;
        var donvi = req.body.donvi ;
        var gia   = req.body.gia ;

        res.redirect('/thuoc');
        client.query('UPDATE thuoc set thuoc=$1, donvi=$2, gia=$3 WHERE mat=$4',
            [thuoc, donvi, gia, mat]
        );
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/delete-thuoc', function(req, res) {
    req.session.lastPage = '/thuoc';
    if(req.session.type=='boss') {
        res.redirect('/thuoc');
        client.query('DELETE FROM thuoc WHERE mat=$1 ',[req.body.mat], function(err, result){
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
            type: 'khach'
        });
});
///////////////////////////////////////////////////////////////////////////// HOI DAP
router.get('/hoi-dap', function(req, res) {
    req.session.lastPage = '/hoi-dap';
    if(req.session.loggedIn) {
        client.query('select * from hoidap FULL JOIN khoadieutri on hoidap.title = khoadieutri.khoa order by hoidap.mahd', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('hoi-dap', {
                    data: data, 
                    title: 'Hỏi đáp',
                    logined: req.session.loggedIn,
                    username: req.session.username,
                    type: req.session.type

                });
            else res.end("CAN'T GET LINK");
        })
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
router.post('/add-hoi-dap', function(req, res) {
    req.session.lastPage = '/hoi-dap';
    if(req.session.loggedIn && req.body.mahd){
        var mahd = req.body.mahd;
        var title   = req.body.title ;
        var content = req.body.content ;
        var username = req.session.username ;

        res.redirect('/hoi-dap');
        client.query('INSERT INTO hoidap VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [mahd, title, content, username, new Date(), '', '', 0]
        );
    }
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});

router.post('/binh-luan-moi', function(req, res) {
    req.session.lastPage = '/hoi-dap';
    if(req.session.loggedIn && req.body.mahd){
        var mahd = req.body.mahd;
        var title   = req.body.title ;
        var content = req.body.content ;
        var username = req.session.username ;

        res.redirect('/hoi-dap');
        client.query('INSERT INTO hoidap VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [mahd, title, content, username, new Date(), '', '', 0]
        );
    }
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});

///////////////////////////////////////////////////////////////////////////// HOA DON + BENH AN
router.post('/in-hoa-don', function(req, res) {
    req.session.lastPage = '/user/benh-nhan-da-kham';
    if(req.session.type=='boss') {

        client.query('UPDATE khambenh set trangthai = 3, ngayravien=$1, tienphong=$2, tongchiphi=$3 WHERE makb  = $4',
            [req.body.ngayravien, req.body.tienphong, req.body.tongchiphi, req.body.makb], function(){
            res.redirect(req.session.lastPage);
        });
        // trang thai benh nhan
        client.query('SELECT min(trangthai), max(trangthai) from khambenh WHERE mabn =$1',[req.body.mabn], function(err, result) {
            console.log(result.rows);
            if(result.rows.min !=0 && result.rows.max !=3)
                 client.query('UPDATE benhnhan set trangthai = 1 WHERE mabn =$1',[req.body.mabn]);
            else client.query('UPDATE benhnhan set trangthai = 0 WHERE mabn =$1',[req.body.mabn]);
        });

        // dat lai phong trong
        client.query('UPDATE phong set trangthai = 0 WHERE map  = $1',[req.body.map]);
    } 
    else
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
        });
});
///////////////////////////////////////////////////////////////////////////// THONG KE TIEN
router.get('/thong-ke/chi-phi', function(req, res) {
    req.session.lastPage = '/thong-ke/chi-phi';
    if(req.session.type =='boss') {
        res.render('thong-ke/tien', {
            title: 'Thống kê',
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
    else 
        res.render('login-register/login',{ 
            title: "TRY Login",
            logined: false,
            username: null,
            type: 'khach'
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




