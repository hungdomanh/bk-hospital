// var express = require('express');
// var router = express.Router();
// var pg = require('pg');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var session = require('express-session');



// req.session.loggedIn = true;
// ///connect 
// var connect = 'postgres://tsephbbjgpmaka:mH6kFB2sIc2zOYpdVgQ_CYYzu0@ec2-54-163-251-104.compute-1.amazonaws.com:5432/d115c9p8d0kjh1';
// require('pg').defaults.ssl = true;
// var client = new pg.Client(connect);
// client.connect();
// client.on('error', function(error) {
//       console.log(error);
// });  

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.render('index', {title: 'Admin'});
    
// });

// router.get('/bac-si',  function(req, res, next) {
  
//     client.query('SELECT * FROM bacsi', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('bacsi', {data: str, title: 'Bác Sĩ'});
//         else res.send("CAN'T GET LINK");
//     });  
// });

// router.get('/benh',  function(req, res, next) {
  
//     client.query('SELECT * FROM benh', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         if(str)  res.render('benh', {data: str, title: 'Bệnh'});
//         else res.send("CAN'T GET LINK");
//     });  
// });

// router.get('/benh-an',  function(req, res, next) {
    
//     res.redirect('benhan');

//     pg.connect(connect, function(err, client, done){
//         if(err) {
//             return console.log("Can not connect postgresql");
//         }
//         client.query('SELECT * FROM benhan', function(err, result){
//             if(err) return console.log("Can't SELECT FROM TABLE");

//             var str = result.rows;
//             // console.log(str);
//             if(str)  res.render('benhan', {data: str, title: 'Bệnh Án'});
//             else res.send("CAN'T GET LINK");
//         });  
//     });
// });

// router.get('/benh-nhan',  function(req, res, next) {
    
//     client.query('SELECT * FROM benhnhan', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('benhnhan', {data: str, title: 'Bệnh Nhân'});
//         else res.send("CAN'T GET LINK");
//     });  
// });


// router.get('/don-thuoc',  function(req, res, next) {
    
  
//     client.query('SELECT * FROM donthuoc', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('donthuoc', {data: str, title: 'Đơn Thuốc'});
//         else res.send("CAN'T GET LINK");
//     });  
// });


// router.get('/hoa-don',  function(req, res, next) {
    
  
//     client.query('SELECT * FROM hoadon', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('hoadon', {data: str, title: 'Hóa Đơn'});
//         else res.send("CAN'T GET LINK");
//     });  
// });


// router.get('/list/khoa',  function(req, res, next) {
  
//     client.query('SELECT * FROM khoadieutri', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         // res.writeHead(200, {'Content-Type': 'text/plain'});
//         var data  = JSON.stringify(result.rows);
//         if(str)  res.render('list/khoa', {data: data, title: 'Khoa'});
//         else res.end("CAN'T GET LINK");
//     });  
// });



// router.get('/list/phong',  function(req, res, next) {
    
  
//     client.query('SELECT * FROM phong', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('list/phong', {data: str, title: 'Phòng'});
//         else res.send("CAN'T GET LINK");
//     });  
// });



// router.get('/list/thuoc',  function(req, res, next) {
    
  
//     client.query('SELECT * FROM thuoc', function(err, result){
//         if(err) return console.log("Can't SELECT FROM TABLE");

//         var str = result.rows;
//         // console.log(str);
//         if(str)  res.render('list/thuoc', {data: str, title: 'Thuốc'});
//         else res.send("CAN'T GET LINK");
//     });  
// });



// module.exports = router;

