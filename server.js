var express = require('express');
var lazy = require('lazy');
var fs = require('fs');
var ejs = require('ejs');

var app = express();
app.use('/styles',express.static(__dirname+'/styles'));

var pMap = new Object();
var pArray = new Array();

new lazy(fs.createReadStream('./conf/server.conf')).lines.forEach(function(line){
    var keyvalue = line.toString().split(' ');
    if ( keyvalue.length > 1) {
        pMap[keyvalue[0]] = keyvalue[1];
        pArray.push(keyvalue);
    }
});


app.get('/',function(req,res){
    res.render('index.ejs',{subpages: pArray});
})

app.get('/:pname',function(req,res){
    if (pMap.hasOwnProperty(req.params.pname)){
        res.render(pMap[req.params.pname]);
    }
    else{
        res.setHeader('Content-Type','text/plain');
        res.send(404,'Page nexiste pas encore');
    }
});

app.use(function(req,res,next){
    res.setHeader('Content-Type','text/plain');
    res.send(404,'Page Introuvable');
});

app.listen(8080);
