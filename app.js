
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// Need to comment out the below line, or it will cause follow error: 
// The TypeError: Cannot read property 'user' of undefined , at exports.checkNotLogin (/home/skoal/node.js/iseeu - Copy/routes/reg.js:27:27)
//app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


///////////////////////    order of the code is very important          start        
// routes must after database and cookie, session         

//////////////////// 1. connect to database //////////                          
var MongoStore = require('connect-mongo')(express)       
var settings = require('./settings'); 


///////////////////  2. set cookie and session:   
app.use(express.cookieParser());         
app.use(express.session({            
  secret: settings.cookieSecret,         
  store: new MongoStore({            
    db: settings.db                     //db: db.client
  })                      
}));      
////////////// use before routes 
var localUser = {content:null};
app.use(function(req, res, next){					                           
  res.locals.user = req.session.user;
  localUser.content = res.locals.user;
  next();						                                                
});	



///////////////////   3. need to add flash                                                 
var flash = require('connect-flash');
app.use(flash()); 

/////////////////     4. routes  
require('./routes/routes.js')(app);

//////////////////////    order of the code is very important          end       


///////////////////// socket.io /////////////////

var sessions = {};
var io = require('socket.io').listen(server);
require(__dirname+"/controllers/socketHanddler.js")(io, sessions,localUser);








