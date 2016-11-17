var pg = require('pg');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var env = require('dotenv').config({silent: true});

// connect 
var connect = process.env.connectString;
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
    req.session.lastPage = '/';
	res.render('home',{
		title: "BK-Hospital",
		logined: req.session.loggedIn,
        username: req.session.username,
		type: req.session.type
	});

});
///////////////////////////////////////////////////////////////////////////// THONG TIN
// TIN TUC /////////////////////////////
router.get('/thong-tin/tin-tuc', function(req, res) {
    res.render('thong-tin/tin-tuc',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
// CHINH_SACH CHAT LUONG ///////////////
router.get('/thong-tin/chinh-sach-chat-luong', function(req, res) {
    res.render('thong-tin/chinh-sach-chat-luong',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
// CO SO VAT CHAT   ///////////////////
router.get('/thong-tin/co-so-vat-chat', function(req, res) {
    res.render('thong-tin/co-so-vat-chat',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
});
// BAN GIAM DOC   /////////////////////
router.get('/thong-tin/ban-giam-doc', function(req, res) {
    res.render('thong-tin/ban-giam-doc',{
        title: "BK",
        logined: req.session.loggedIn,
        username: req.session.username,
        type: req.session.type
    });
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
                                type: 'khack'
                            });
                    });
                }
            }
            if(test == 0)   {
                res.render('login-register/login',{
                    title: "TRY Login",
                    logined: false,
                    username: null,
                    type: 'khack'
                });
            }
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
            type: 'khack'
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
    req.session.lastPage = '/bac-si';
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
            type: 'khack'
        });
});


// BENH  can them khoa dieu tri 
router.get('/benh',  function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.loggedIn) {
        client.query('SELECT mab, mat, benh, makdt, thuoc FROM benh right join thuoc using (mat) order by mab', function(err, result){
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
router.post('/add-benh', function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.type=='boss' && req.body.mab && req.body.mat
        && req.body.benh && req.body.makdt){
        var mab = req.body.mab ;
        var benh = req.body.benh ;
        var mat = req.body.mat ;
        var makdt = req.body.makdt ;

        res.redirect('/benh');
        client.query('INSERT INTO benh VALUES($1, $2, $3, $4)',
            [mab, benh, mat, makdt]
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
router.post('/edit-benh', function(req, res) {
    req.session.lastPage = '/benh';
    if(req.session.type=='boss' && req.body.mab && req.body.mat
        && req.body.benh && req.body.makdt){
        var mab = req.body.mab ;
        var benh = req.body.benh ;
        var mat = req.body.mat ;
        var makdt = req.body.makdt ;

        res.redirect('/benh');
        client.query('INSERT INTO benh VALUES($1, $2, $3, $4)',
            [mab, benh, mat, makdt]
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
            type: 'khack'
        });
});



// BENH AN /////////////////////////////
router.get('/benh-an',  function(req, res) {
    req.session.lastPage = '/benh-an';
    if(loai23(req.session.type)) {
    client.query('select maba, benhnhan.hoten as benhnhan, bacsi.hoten as bacsi, phong.phong, benh.benh, ngayvao, ngayra from benhan left join benhnhan using (mabn) left join bacsi using (mabs) left join phong using (map) left join benh using (mab) ', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
             res.render('list/benh-an', {
                data: data, 
                title: 'Bệnh Án',
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
            type: 'khack'
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
        client.query('INSERT INTO benhnhan VALUES($1, $2, $3, $4, $5, $6, $7)',
            [mabn, hoten, s, gioitinh, diachi, dienthoai, trangthai]
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
router.post('/edit-benh-nhan', function(req, res) {
    req.session.lastPage = '/benh-nhan';
    if(req.session.type=='boss' && req.body.mabn && req.body.trangthai 
        && req.body.hoten && req.body.gioitinh && req.body.diachi 
        && req.body.dienthoai && req.body.ngaysinh){
        var mabn = req.body.mabn ;
        var hoten = req.body.hoten ;
        var gioitinh = req.body.gioitinh ;
        var diachi = req.body.diachi ;
        var trangthai = req.body.trangthai;
        var dienthoai = '0' + req.body.dienthoai;
        var ngaysinh = req.body.ngaysinh ;
        var thangsinh = req.body.thangsinh ;
        var namsinh = req.body.namsinh ;
        if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
        if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
        var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

        res.redirect('/benh-nhan');
        client.query('UPDATE benhnhan SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, dienthoai = $6, trangthai = $7 WHERE mabn = $1',
            [mabn, hoten, s, gioitinh, diachi, dienthoai, trangthai]
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
            type: 'khack'
        });
});


// DON THUOC /////////////////////////////
router.get('/don-thuoc',  function(req, res) {
   req.session.lastPage = '/don-thuoc';
   if(loai23(req.session.type)) {
      client.query('select madt, benhnhan.hoten as benhnhan, bacsi.hoten as bacsi, thuoc.thuoc, soluong, benh.benh, phong.phong, donthuoc.gia from donthuoc left join benhnhan using (mabn) left join bacsi using (mabs) left join thuoc using (mat) left join phong using (map) left join benh using (mab) ', function(err, result){
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
            type: 'khack'
        });
});
// HOA DON /////////////////////////////
router.get('/hoa-don',  function(req, res) {
    req.session.lastPage = '/hoa-don';
    if(loai23(req.session.type)) {
    client.query('select mabn, benhnhan.hoten, benh.benh, tienthuoc, tienphong, tienkhambenh, tongchiphi, ngaycap from hoadon left join benhnhan using (mabn) left join benh using (mab)', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
             res.render('list/don-thuoc', {
                data: data, 
                title: 'Hóa Đơn',
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
        res.redirect('/khoa'); 
        client.query('UPDATE khoadieutri SET khoa = $1 WHERE mak = $2',[khoa, mak]);
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

// KHAM BENH /////////////////////////////
router.get('/kham-benh',  function(req, res) {
    req.session.lastPage = '/hoa-don';
    if(loai23(req.session.type)) {
    client.query('select makb, benhnhan.hoten as benhnhan, bacsi.hoten as bacsi, phong.phong, benh.benh, thuoc.thuoc, ngaykham, noidung, khambenh.gia from khambenh left join benhnhan using (mabn) left join bacsi using (mabs) left join thuoc using (mat) left join phong using (map) left join benh using (mab)', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
             res.render('list/kham-benh', {
                data: data, 
                title: 'Khám Bệnh',
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
            type: 'khack'
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
            type: 'khack'
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
        client.query('INSERT INTO phong VALUES($1, $2, $3, $4)',
             [map, phong, gia1ngaydem, trangthai]
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
            type: 'khack'
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
            type: 'khack'
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
            type: 'khack'
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
        client.query('INSERT INTO thuoc VALUES($1, $2, $3, $4)',
            [mat, thuoc, donvi, gia]
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
            type: 'khack'
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




