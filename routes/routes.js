//var routes = require('../routes');
var user = require('../controllers/user');
var index = require('../controllers/index');


module.exports = function (app) {

	//var reg = require('./routes/reg');
	//app.get('/', routes.index);

	//app.get('/users', user.list);

	app.get('/', index.index);

	app.get('/reg', user.checkNotLogin);
	app.get('/reg', user.regForm);
	app.post('/reg', user.checkNotLogin);
	app.post('/reg', user.reg_post);

	app.get('/logout', user.checkLogin);
	app.get('/logout', user.logout);

	app.get('/login', user.checkNotLogin);
	app.get('/login', user.login);
	app.post('/login', user.checkNotLogin);
	app.post('/login', user.login_post);

	app.post('/search', user.checkLogin);
	app.post('/search', user.search);

	app.post('/requestFriend', user.checkLogin);
	app.post('/requestFriend', user.friend_request);

	app.post('/displayFriend', user.checkLogin);
	app.post('/displayFriend', user.displayFriend);

	app.post('/acceptFriend', user.checkLogin);
	app.post('/acceptFriend', user.acceptFriend);

	app.post('/updateSession', user.checkLogin);
	app.post('/updateSession', user.updateSession);

};