var express = require('express');
var lazy = require('lazy');
var fs = require('fs');
var ejs = require('ejs');
var yaml = require('js-yaml');

var app = express();
app.use('/styles',express.static(__dirname+'/styles'));

/*var pMap = new Object();*/
var pArray = new Array();
var defaultParameters = new Object();

/* yaml conf loading */
try{
    var conf = yaml.safeLoad(fs.readFileSync('./conf/server.yml','utf8'));
    console.log('Conf loaded\n');
    console.log(conf);
    createDefaultParameters();

}catch(e){
    console.log('Conf loading failed: '+e);
}

function createPArray()
{
    var pAr = conf.pages.slice();
    for ( i = 0; i < pAr.length ; i ++){
        if ( conf.hasOwnProperty(pAr[i]) && conf[pAr[i]].hasOwnProperty('page')){
            if(conf[pAr[i]].hasOwnProperty('title'))
                pArray.push([conf[pAr[i]]['title'],pAr[i]]);
            else
                pArray.push([pAr[i],pAr[i]]);
        }
    }
}

function createDefaultParameters(){
    createPArray();
    defaultParameters.subpages = pArray;
    defaultParameters.wsHeaderContents = conf.wsHeaderContents;
    defaultParameters.wsFooterContents = conf.wsFooterContents;
    defaultParameters.wsAsideContents = conf.wsAsideContents;
    defaultParameters.wsContents = conf.wsContents;
    defaultParameters.wsTitle = conf.wsTitle;
}


/*
new lazy(fs.createReadStream('./conf/server.conf')).lines.forEach(function(line){
    var keyvalue = line.toString().split(' ');
    if ( keyvalue.length > 1) {
        pMap[keyvalue[0]] = keyvalue[1];
        pArray.push(keyvalue);
    }
});
*/

app.get('/',function(req,res){
    res.render('index.ejs',defaultParameters);
})
app.get('/:pname',function(req,res){
    var p = req.params.pname;
    if (conf.hasOwnProperty(p) && conf[p].hasOwnProperty('page')){ // we have this page in conf
        var params = defaultParameters;
        if ( conf[p].hasOwnProperty('params'))
        {
            var pAr = conf[p].params.slice();
            for ( i = 0; i < pAr.length; i ++){
                if ( conf[p].hasOwnProperty(pAr[i]) )
                    params[pAr[i]]=conf[p][pAr[i]];
            }
        }
        //console.log('Passing params '+params);
        res.render(conf[p]['page'],params);
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
