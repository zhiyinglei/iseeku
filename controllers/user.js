/*
 * GET register page.
 */
var mongodb = require('../models/db.js');
var crypto = require('crypto');
var User = require('../models/user.js');



exports.regForm = function (req, res) {
    res.render('reg', { title:'User Register', msg:req.flash()});
};


exports.reg_post = function (req, res) {
    if (req.body['password-repeat'] != req.body['password']) {
         req.flash('error', 'Two password do not agree');
         return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
         name: req.body.username,
         password: password,
    });

    User.get(newUser.name, function(err, user) {
         console.log("hello world22222");
         if (user)
             err = 'Username already exists.';
         if (err) {
             console.log("hello world222221111" + err);
             req.flash('error', err);
             return res.redirect('/reg');
         }
         newUser.save(function(err) {
             console.log("hello world333333");
             if (err) {
                 req.flash('error', err);
                 return res.redirect('/reg');
             }
             req.session.user = newUser;
             req.flash('success', 'Register success');
             res.redirect('/');
         });
    });
};

exports.checkLogin = function(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'please login first');
		return res.redirect('/login');
	}
	next();
}

exports.checkNotLogin = function(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'already login');
		return res.redirect('/');
	}
	next();
}

exports.logout = function (req, res){
    req.session.user = null;
    req.flash('success', 'logout success');
    res.redirect('/');
};

exports.login = function (req, res) {
    res.render('login', { title:'User Login', msg:req.flash()});
};



exports.login_post = function (req, res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        User.get(req.body.username, function(err, user) {
                if (!user) {
                    req.flash('error', 'User not exsit');
                    return res.redirect('/login');
                }
                if (user.password != password) {
                    req.flash('error', 'Wrong Password');
                    return res.redirect('/login');
                }
                req.session.user = user;
                req.flash('success', 'Login success');
                res.redirect('/');
        });    
};



exports.search = function (req, res) {
    //console.log(req.body.search_key);
    User.get(req.body.search_key, 
             function(err, user) {
                console.log("i am search : " + user);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(user));
                res.end();

            });
};


exports.friend_request = function (req, res) {
    //console.log(req.body.search_key);
    User.friendRequest(req.body.friend_name, req.body.user_name, 
             function(err, doc) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(doc));
                res.end();

            });

    //console.log(req.body.search_key);
};


exports.displayFriend = function (req, res) {
    User.get(req.body.userName, 
             function(err, doc) {
                //console.log(doc.require_friend);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(doc));
                res.end();

            });

};

exports.acceptFriend = function (req, res) {
    //console.log(req.body.search_key);
    User.acceptFriend(req.body.friend_name, req.body.user_name, 
             function(err, user) {
                req.session.user = user;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(user));
                res.end();

            });

    //console.log(req.body.search_key);
};

exports.updateSession = function(req,res){
    console.log("in updateSessions: " + req.session.user.name);
    User.get(req.session.user.name, function(err, user) {
        if(user){
            req.session.user = user;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(user));
        res.end();        

    }); 

}
