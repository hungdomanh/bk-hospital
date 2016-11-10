var express = require('express');
var router = express.Router();
var pg = require('pg');

///connect 
var connect = 'postgres://tsephbbjgpmaka:mH6kFB2sIc2zOYpdVgQ_CYYzu0@ec2-54-163-251-104.compute-1.amazonaws.com:5432/d115c9p8d0kjh1';
require('pg').defaults.ssl = true;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Wellcome to Admin Page');
});

router.get('/list/bac-si',  function(req, res, next) {
	
  pg.connect(connect, function(err, client, done){
    if(err) {
        return console.log("Can not connect postgresql");
    }
    client.query('SELECT * FROM bacsi', function(err, result){
        if(err) return console.log("Can't SELECT FROM TABLE");

        var str = result.rows;
        // console.log(str);
        if(str)  res.render('list/bacsi', {data: str});
        else res.send("CAN'T GET LINK");
        done();
    });  
});
});

module.exports = router;

