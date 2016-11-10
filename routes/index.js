var cool = require('cool-ascii-faces'),
    accepts = require('accepts'),
    os = require('os'),
    fs = require('fs'),
    pg = require('pg');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/cool', function(request, response) {
  response.send(cool());
});

router.get("/time/:id", function(request, response) {
  var str = request.params.id;
    var unix, natural, d, m, y;
    
    if(findMonth(str)) {
        m = findMonth(str);
        d = findDate(str);
        y = findYear(str);
        natural = str;
        unix = Math.round(new Date(m+'/'+d+'/'+y).getTime()/1000.0);
    
        response.send("{\"unix\":" + unix.toString() + ", \"natural\":\"" +natural+ "\"}");
    }
    else if(parseInt(str).toString().length == str.length) {
        unix = str;
        var date = new Date(parseInt(str) * 1000);
        d = date.getDate();
        m = date.getMonth();
        y = date.getFullYear();
        natural = getMonthString(m) + " "+d.toString()+", "+y.toString();
        
        response.send("{\"unix\":" + unix + ", \"natural\":\"" +natural+ "\"}");
    }
    else response.send("{\"unix\":null,\"natural\":null}");
});

router.get('/whoami', function(request, response) {
    var ips = request.connection.remoteAddress;
    var ip = ips.substring(7, ips.length);
    var lang = accepts(request).languages();
    var ope = os.hostname() +" _ "+ os.type() + " _ " + os.arch ()+ " _ "+ os.platform();

    response.send("{\"ipaddress\":\"" +ip+ "\"," + "\"language\":\"" +lang+ "\"," + "\"software\":\"" +ope+"\"}");
});

var connect = "postgres://vrzxpnoodqlmra:pCCwZQKvcuadmxcam1UrD7h4lL@ec2-54-83-27-147.compute-1.amazonaws.com:5432/dp550l8ksho63?ssl=require";
require('pg').defaults.ssl = true;

router.get('/new/:link*', function(request, response) {
    var link = request.url.slice(5);
    var number = parseInt(1000+ 9000*Math.random());
    
    pg.connect(connect,function(err, client, done){
        if(err) {
            return console.log("errrrrrrrrrrrrrrrrrrrrrrrrrro");
        }
        client.query('INSERT INTO fccurlshort(link, number) VALUES($1, $2);', [link, number]);  
        response.send("{\"original_url\":\""+link+"\",\"short_url\":\"https://api-app-hungdo.herokuapp.com/"+number+"\"}");
        done();
    });
});

router.get('/open/:nb', function(request, response) {
    var nb = request.params.nb;
    
    pg.connect(connect, function(err, client, done){
        if(err) {
            return console.log("Can not connect postgresql");
        }
        client.query('SELECT link FROM fccurlshort where number=$1', [nb], function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows[0];
            if(str) response.render('open', {link: str.link});
            else response.send("CAN'T GET LINK");
            done();
        });  
    });

});


router.get('/list', function(request, response) {
    pg.connect(connect, function(err, client, done){
        if(err) {
            return console.log("Can not connect postgresql");
        }
        client.query('SELECT * FROM fccurlshort', function(err, result){
            if(err) return console.log("Can't SELECT FROM TABLE");

            var str = result.rows;
            if(str) response.render('list', {data: str});
            else response.send("CAN'T GET LINK");
            done();
        });  
    });
})


module.exports = router;



var M = ['January','February','March','April','May','June','July','August','September','October','November','December']

function findMonth(string) {
    for(var i=0; i<M.length; i++) {
        if(string.search(M[i]) >= 0)    return i+1;
    }
    return 0;
}

function findDate(string) {
    var n = string.search(',');
    if(n >= 0)    {
        var d = string[n-2] + string[n-1]
        var date = parseInt(d);
        return date;
    }
    else return 0;
}

function findYear(string) {
    var n = string.search(',');
    var yString = string.substring(n, string.length);
    var n19 = yString.indexOf("19"),
        n20 = yString.indexOf("20");

    if(n19 > -1)    {
        var nn19 = parseInt('19' + yString[n19+2] + yString[n19+3]);
        if(nn19 > 1970) return nn19;
        else if(n20 > -1)  {
            var nn20 = parseInt('20' + yString[n20+2] + yString[n20+3]);
            if(nn20 < 2038) return nn20;
            else return -1;
        }
    }
    else if(n20 > -1)  {
        var nn20 = parseInt('20' + yString[n20+2] + yString[n20+3]);
        if(nn20 < 2038) return nn20;
        else return -1;
    }
    else return -1;
}

function getMonthNumber(string) {
    for(var i=0; i<M.length; i++) {
        if(string == M[i])  return i+1;
    }
}

function getMonthString(number) {
    return M[number];
}