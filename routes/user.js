var pg = require('pg');
var express = require('express');
var router = express.Router();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');


// connect odem
// var config = require('./config.js');
// var connect = config.database;
var connect = 'postgres://tsephbbjgpmaka:mH6kFB2sIc2zOYpdVgQ_CYYzu0@ec2-54-163-251-104.compute-1.amazonaws.com:5432/d115c9p8d0kjh1';
require('pg').defaults.ssl = true;
var client = new pg.Client(connect);
client.connect();
client.on('error', function(error) {
  console.log(error);
});  
///// THONG TIN CA NHAN
router.get('/', function(req, res, next) {
	req.session.lastPage = '/user';
    if(req.session.loggedIn) {
    	var table = req.session.type;
        if(req.session.type!='boss')
    		client.query('SELECT * FROM ' +table+ ' where username=$1',[req.session.username], function(err, result){
    	        if(err) return console.log("Can't SELECT FROM TABLE");
    	        var str = result.rows;
    	        var t = '';
    	        var data  = JSON.stringify(result.rows);
    	        if(table == 'benhnhan') t = 'benh-nhan';
    	        else if(table == 'bacsi') t = 'bac-si';
    	        else if(table == 'admin') t = 'admin';
                console.log(t);
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
        else 
            res.render('user/'+t,{
                data: 'Bạn là admin',
                title: "Thông tin cá nhân",
                logined: req.session.loggedIn,
                username: req.session.username,
                type: req.session.type
            });
   }
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});
router.get('/benh-nhan/:mabn', function(req, res, next) {
    var mabn = req.params.mabn ;
    req.session.lastPage = '/user/benh-nhan/'+mabn;
    if(req.session.loggedIn) {
        client.query('SELECT * FROM benhnhan where mabn=$1',[mabn], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('user/thong-tin-tai-khoan',{
                    data: data,
                    title: "Thông tin tài khoản",
                    logined: req.session.loggedIn,
                    username: req.session.username,
                    type: req.session.type
                });
            else res.end("CAN'T GET LINK");
        })
    }
    else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});
router.get('/bac-si/:mabs', function(req, res, next) {
    var mabn = req.params.mabs ;
    req.session.lastPage = '/user/bac-si/'+mabs;
    if(req.session.loggedIn) {
        client.query('SELECT * FROM bacsi where mabs=$1',[mabs], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('user/thong-tin-tai-khoan',{
                    data: data,
                    title: "Thông tin tài khoản",
                    logined: req.session.loggedIn,
                    username: req.session.username,
                    type: req.session.type
                });
            else res.end("CAN'T GET LINK");
        })
    }
    else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
       
});

////////////////////////////////////////////////// KHACK
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
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});
// khach -> cap nhat thong tin -> benh nhan
router.post('/update-khach', function (req, res) {
	var ngaysinh = req.body.ngaysinh ;
    var thangsinh = req.body.thangsinh ;
    var namsinh = req.body.namsinh ;
    if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
    if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
    var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

    req.session.type = 'benhnhan';
	res.redirect('/user/dang-ki-kham-benh');

    client.query('INSERT INTO benhnhan values($1, $2, $3, $4, $5, $6, $7, $8) ',
	[req.body.mabn, req.body.hoten, s, req.body.gioitinh, 
	req.body.diachi, req.body.dienthoai, '0', req.session.username]);  

    client.query('UPDATE users set type=$1 where id=$2',
            ['benhnhan', req.session.username]
        );
    
});

/////////////////////////////////////////////////////////////////////////////////// BENH NHAN
router.post('/update-benh-nhan', function (req, res) {
	req.session.lastPage = '/user';
	var ngaysinh = req.body.ngaysinh ;
    var thangsinh = req.body.thangsinh ;
    var namsinh = req.body.namsinh ;
    if(ngaysinh < 10 )  ngaysinh = '0' + ngaysinh;
    if(thangsinh < 10 ) thangsinh = '0' + thangsinh;
    var s = ngaysinh + '/' + thangsinh +'/' + namsinh;

    res.redirect('/user/ho-so');

    client.query('UPDATE benhnhan SET hoten = $2, ngaysinh = $3, gioitinh = $4, diachi = $5, dienthoai = $6 WHERE mabn = $1',
            [req.body.mabn, req.body.hoten, s, req.body.gioitinh, req.body.diachi, '0'+ req.body.dienthoai]
        );  

    client.query('UPDATE users set type=$1 where id=$2',
            ['benhnhan', req.session.username]
        );

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
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});

router.post('/dang-ki-kham-benh', function(req, res, next) {
	req.session.lastPage = '/user/dang-ki-kham-benh';
    if(req.session.loggedIn && req.session.type =='benhnhan') {
    	res.redirect('/user/ho-so');
    	client.query('select max(makb), count(*) from khambenh',function(err, result){
    		var max;
            var ngaydangki = new Date();
    		if(!result.rowCount) max=0;
    		else max = result.rows[0].max+1;

    		client.query('INSERT INTO khambenh(makb, mabn, trieuchung, trangthai, ngaydangki) values($1, $2, $3, $4, $5)',
   			[max, req.body.mabn, req.body.content, 0, ngaydangki]);	
    	});   		
   }
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});

///////////////////////////////////////////////////////////////// BAC SI
router.get('/benh-nhan-dang-cho', function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-cho';
    if(req.session.loggedIn && loai23(req.session.type)) {
        res.render('user/benh-nhan-dang-cho',{
	        title: "Bệnh nhân chờ khám bệnh",
	        logined: req.session.loggedIn,
	        username: req.session.username,
	        type: req.session.type
	    });
   }
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});

router.post('/nhan-dang-ki-kham-benh',  function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-cho';
	var ngaynhankham = new Date();
    if(req.session.loggedIn && req.session.type == 'bacsi') {
    	console.log(req.body);
		client.query('UPDATE khambenh set mabs=$1, map=$2, ngaynhankham=$3, trangthai=1 where makb=$4',
        [req.body.mabs, req.body.map, ngaynhankham, req.body.makb], function(){
			res.redirect(req.session.lastPage);
		});

        client.query('UPDATE benhnhan set trangthai=1 WHERE mabn =$1',[req.body.mabn]);
        client.query('UPDATE phong    set trangthai=1 WHERE map  =$1',[req.body.map]);
        client.query('UPDATE bacsi    set trangthai = trangthai+1 WHERE mabs =$1',[req.body.mabs]);
	}
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
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
	else if(req.session.type=='boss') {
        res.render('user/benh-nhan-dang-kham',{
            mabs: 'khongco',
	        title: "Bệnh nhân đang khám bệnh",
	        logined: true,
	        username: req.session.username,
	        type: req.session.type
	    });
	}
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});

router.post('/kham-benh',  function(req, res, next) {
	req.session.lastPage = '/user/benh-nhan-dang-kham';
    if(req.session.loggedIn && req.session.type == 'bacsi') {
    	var tongGia, count;
    	if(req.body.gia5 != 'NaN') {
    		tongGia = req.body.gia5;
    		count = 5; 
    	} else if(req.body.gia4 != 'NaN') {
    		tongGia = req.body.gia4;
    		count = 4;
    	} else if(req.body.gia3 != 'NaN') {
    		tongGia = req.body.gia3;
    		count = 3;
    	} else if(req.body.gia2 != 'NaN') {
    		tongGia = req.body.gia2;
    		count = 2;
    	} else if(req.body.gia1 != 'NaN') {
    		tongGia = req.body.gia1;
    		count = 1;
    	} 
        // kham benh xong nhung chua xuat vien
		client.query('UPDATE khambenh set trangthai=2 WHERE makb=$1',[req.body.makb], function(){
			res.redirect(req.session.lastPage);
		});
		// giam trang thai bac si di -1
    	client.query('UPDATE bacsi set trangthai = trangthai - 1 WHERE mabs =$1',[req.body.mabs]);

    	client.query('UPDATE khambenh set mab=$1, ngaykham=$2, noidungkham=$3, tienthuoc=$4 WHERE makb =$5',[
    		req.body.mab, req.body.ngaykham, req.body.noidungkham, 
            tongGia, req.body.makb
    	], function(){
    		if(count == 1){
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat1, req.body.soluong1, req.body.gia1, req.body.makb ]);
	    	} else if(count == 2) {
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat1, req.body.soluong1, req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat2, req.body.soluong2, req.body.gia2 - req.body.gia1, req.body.makb ]);
	    	} else if(count == 3) {
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat1, req.body.soluong1, req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat2, req.body.soluong2, req.body.gia2 - req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat3, req.body.soluong3, req.body.gia3 - req.body.gia2, req.body.makb ]);
	    	} else if(count == 4) {
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat1, req.body.soluong1, req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat2, req.body.soluong2, req.body.gia2 - req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat3, req.body.soluong3, req.body.gia3 - req.body.gia2, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat4, req.body.soluong4, req.body.gia4 - req.body.gia3, req.body.makb ]);
	    	} else if(count == 5) {
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat1, req.body.soluong1, req.body.gia1, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat2, req.body.soluong2, req.body.gia2, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat3, req.body.soluong3, req.body.gia3 - req.body.gia2, req.body.makb ]);
				client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat4, req.body.soluong4, req.body.gia4 - req.body.gia3, req.body.makb ]);
	    		client.query('INSERT INTO donthuoc values ($1, $2, $3, $4)', [req.body.mat5, req.body.soluong5, req.body.gia5 - req.body.gia4, req.body.makb ]);
	    	}
    	})
	}
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
    }
});

router.get('/benh-nhan-da-kham', function(req, res, next) {
    req.session.lastPage = '/user/benh-nhan-da-kham';
    if(req.session.loggedIn && loai23(req.session.type)) {
        if(req.session.type == 'bacsi') {
            client.query('SELECT mabs FROM bacsi where username=$1',[req.session.username], function(err, result){
                var mabs = result.rows[0].mabs;
                if(err) return console.log("Can't SELECT FROM TABLE");
                
                res.render('user/benh-nhan-da-kham',{
                    mabs: mabs,
                    title: "Bệnh nhân đã khám bệnh",
                    logined: req.session.loggedIn,
                    username: req.session.username,
                    type: req.session.type
                });
            })
        }
        else if(req.session.type=='boss') {
            res.render('user/benh-nhan-da-kham',{
                mabs: 'khongco',
                title: "Bệnh nhân đang khám bệnh",
                logined: req.session.loggedIn,
                username: req.session.username,
                type: req.session.type
            });
        }
    }
   else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
   }
    
});

///////// HO SO BENH AN
router.get('/ho-so', function(req, res, next) {
    req.session.lastPage = '/user/ho-so';
    if(req.session.loggedIn && req.session.type == 'benhnhan') {
            client.query('SELECT * from benhnhan WHERE username = $1',[req.session.username], function(err, result){
            if(err) return console.log("Can't SELECT FROM benhnhan");
            var str = result.rows;
            var data  = JSON.stringify(result.rows);
            if(str) 
                res.render('user/ho-so',{
                    data: data,
                    title: "Hồ sơ",
                    logined: true,
                    username: req.session.username,
                    type: req.session.type
                });
            else res.end("CAN'T GET LINK");
        })
    }
    else {
        req.session.loggedIn = false;
        req.session.username = null;
        req.session.type = 'khach';
        res.render('login-register/login',{
            title: "Login",
            logined: req.session.loggedIn,
            username: req.session.username,
            type: req.session.type
        });
   }
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

