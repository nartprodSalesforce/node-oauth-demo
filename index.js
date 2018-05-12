const express = require('express');
const hbs = require('hbs'); //handbars backage for formating templates on the page
const fs = require('fs');
const port=  process.env.PORT || 5000;  //dynamic port assignment
var redirect;
var  client_id;
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
    const sforg = req.query.sforg; 
    client_id = req.query.client_id; 
    redirect = req.query.redirect; 
    const url = 'https://'  + sforg + '/services/oauth2/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=http://' + redirect + '&state=mystate2';

    console.log('salesforce org: ' +  sforg);
    console.log('consumer client_id ' +  client_id);
    console.log('redirect ' +  redirect);
    console.log('url ' +  url);
    //
    /*
    res.render('oauth.hbs',{
        pageTitle: 'OAuth Page'

    });*/
    res.redirect(url);
});
app.get('/abc2',function (req, res){
  console.log('in /abc2');
  console.log('Back From salesforce connected app in /abc2');
  //req is the URL . we need to get the token from req and  create url in res to send to salesforce
  //  process response 
  console.log(req.url);
  //var access_token = (req.url.split("&")[0]).split("=")[1];
  var access_token = req.query.code;
  var req_state = req.query.state;
  console.log('access_token ' + access_token);
  console.log('req_state ' + req_state);
  var post_data = querystring.stringify({
    'grant_type': 'authorization_code',
    'client_id': client_id,
    'client_secret': '7730318269731011462',
    'redirect_uri': 'http://'+ redirect,
    'code': access_token
  });
  var post_options = {
    host: 'login.salesforce.com',
    port: '443',
    path: '/services/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };
  var post_req = https.request(post_options, function (res2) {
    res2.setEncoding('utf8');
    res2.on('data', function (chunk) {

      console.log('Response: ' + chunk);
      var parsed = JSON.parse(chunk);
      console.log('id: ' + parsed.id);
      console.log('issued_at: ' + parsed.issued_at);
      console.log('instance_url: ' + parsed.instance_url);
      console.log('signature: ' + parsed.signature);
      console.log('issued_at: ' + parsed.issued_at);
      console.log('access_token: ' + parsed.access_token);
      console.log('token_type: ' + parsed.token_type);
      console.log('scope: ' + parsed.scope);
      
      res.end('we are done. parsed response id = ' + parsed.id + '  ' +
                'issued_at = ' + parsed.issued_at + ' ' + 
                'instance_url = ' + parsed.instance_url + ' ' + 
                'signature = ' + parsed.signature + ' ' + 
                'access_token = ' + parsed.access_token + ' ' + 
                'token_type = ' + parsed.token_type + ' ' + 
                'scope = ' + parsed.scope + ' ');
    });

  });
  post_req.write(post_data);
  post_req.end();
  console.log('/abc2 at end');
});

//Listen for request on the port
app.listen(port,()=>{
    console.log(`server is up on port ${port}`);
}); //port on localhost for listenning
