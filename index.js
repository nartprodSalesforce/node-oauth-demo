const express = require('express');
const hbs = require('hbs'); //handbars backage for formating templates on the page
const fs = require('fs');
const port=  process.env.PORT || 3000;  //dynamic port assignment
var querystring = require('querystring');
var https = require('https');

var http = require('http'); //node http.agent https://nodejs.org/api/http.html#http_class_http_agent

var app = express();
//middleware configures how express app works
//create a static directory called public
//using hbs for templates
hbs.registerPartials(__dirname + '/views/partials');

//establish public static directory
app.use(express.static(__dirname + '/public'));
//Create a log on local server
app.use((req, res, next) => {
    var now = new Date().toString();
    var log  = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    fs.appendFile('server.log',log + '\n', (err) => {
        if (err){
            console.log('error. cannot write to log');
        }
    } );
    next();
});


//create a route for the Home page
app.get('/',(req,res)=> {
    res.render('home.hbs',{
        pageTitle: 'Home Page',
        welcomeMsg: 'Starting page for OAuth Demo'

    });

});
app.get('/oauth',(req,res)=>{
    var sforg = req.query.sforg; 
    var secret = req.query.secret; 
    var redirect = req.query.redirect; 
    
    console.log('salesforce org: ' +  sforg);
    console.log('consumer secret ' +  secret);
    console.log('redirect ' +  redirect);
    //
    res.render('oauth.hbs',{
        pageTitle: 'OAuth Page'

    });
    
});


//Listen for request on the port
app.listen(port,()=>{
    console.log(`server is up on port ${port}`);
}); //port on localhost for listenning
