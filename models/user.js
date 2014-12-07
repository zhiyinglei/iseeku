var mongodb = require('./db');
function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.friends = [];
	this.pending_friend = [];
	this.request_friend = [];
};
module.exports = User;
User.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var user = {
		name: this.name,
		password: this.password,
		friends: this.friends,
		pending_friend: this.pending_friend,
		request_friend: this.request_friend,
	};
	mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			// 读取 users 集合
			db.collection('users', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					// 为 name 属性添加索引
					collection.ensureIndex('name', {unique: true},function(err){});
					// 写入 user 文档
					collection.insert(user, {safe: true}, function(err, user) {
							mongodb.close();
							callback(err, user);
					});
			});
	});
};

User.get = function get(username, callback) {
	console.log("mongodb openning ==========!");             ///////////////////////////////////////////////////
	mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			// 读取 users 集合
			db.collection('users', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					// 查找 name 属性为 username 的文档
					collection.findOne({name: username}, function(err, doc) {
							mongodb.close();
							if (doc) {
								// 封装文档为 User 对象
								//var user = new User(doc);
								//user.request_friend = doc.request_friend;
								console.log("i am in user.get " + doc.request_friend);
								callback(err, doc);
							} else {
								callback(err, null);
							}
					});
			});
	});
};


User.friendRequest = function friendRequest(friendName, userName, callback) {
	//console.log(userName);
	//console.log(friendName);
	mongodb.open(function(err, db){
		if (err) {
			//console.log("i am in friendRequest  i am in openning");
			return callback(err);
		}
		db.collection('users', function(err, collection) {
				if (err) {
					console.log("err");
					mongodb.close();
					return callback(err);
				}
				//update request_friend field for requesting user 
				var query = {"name":  userName};
				//console.log(query);
				collection.update(query,
					{$addToSet: {request_friend: friendName}}, 
					function(err) {
						//mongodb.close();
						if (err) {
							mongodb.close();
							callback(err, null);
						}




						//update pending_friend field for requested
						var query = {"name":  friendName};
						//console.log(query);
						collection.update(query,
							{$addToSet: {pending_friend: userName}}, 
							function(err) {
								mongodb.close();
								if (err) {
									console.log("err");
									//mongodb.close();
									callback(err, null);
								}
								//callback();
								//var comment = {'commentId': commentId, 'time': Date()};
								callback(err,null);
								//console.log("no err");
							}
							
						);




					}
					
				);

				// //update pending_friend field for requested
				// var query = {"name":  friendName};
				// //console.log(query);
				// collection.update(query,
				// 	{$addToSet: {pending_friend: userName}}, 
				// 	function(err) {
				// 		mongodb.close();
				// 		if (err) {
				// 			console.log("err");
				// 			//mongodb.close();
				// 			callback(err, null);
				// 		}
				// 		//callback();
				// 		//var comment = {'commentId': commentId, 'time': Date()};
				// 		callback(err,null);
				// 		//console.log("no err");
				// 	}
					
				// );
		});
	});
};


User.acceptFriend = function acceptFriend(friendName, userName, callback) {
	//console.log(userName);
	//console.log(friendName);
	mongodb.open(function(err, db){
		if (err) {
			//console.log("i am in acceptFriend  models i am in openning");
			return callback(err, null);
		}
		db.collection('users', function(err, collection) {
				if (err) {
					console.log("err");
					mongodb.close();
					return callback(err,null);
				}
				//update friend field from  user         1==
				var query = {"name":  userName};
				//console.log(query);
				collection.update(query,
					{$addToSet: {friends: friendName}}, 
					function(err) {
						//mongodb.close();
						if (err) {
							mongodb.close();
							callback(err, null);
						}

						//delete Pending_friend field from  user     2==
						collection.update(query,
							{$pull: {pending_friend: friendName}}, 
							function(err) {
								//mongodb.close();
								if (err) {
									mongodb.close();
									callback(err, null);
								}

								//update friend field for friend       3==
								var query = {"name":  friendName};
								//console.log(query);
								collection.update(query,
									{$addToSet: {friends: userName}}, 
									function(err) {
										//mongodb.close();
										if (err) {
											console.log("err");
											mongodb.close();
											callback(err, null);
										}
										//console.log("no err");


										//delete request_friend field from  user   4==
										collection.update(query,
											{$pull: {request_friend: userName}}, 
											function(err) {
												//mongodb.close();
												if (err) {
													mongodb.close();
													callback(err, null);
												}
												//	return the userObject.        5===
												collection.findOne({name: userName}, function(err, doc) {
														mongodb.close();
														console.log("mongodb already close!");             ////////////////////////
														if (doc) {
															// 封装文档为 User 对象
															//var user = new User(doc);
															//user.request_friend = doc.request_friend;
															//console.log("i am in user.get " + doc.request_friend);
															callback(err, doc);
														} else {
															callback(err, null);
														}
												});




											}
										);



									}
									
								);



							}
						);



					}
				);

				// //delete Pending_friend field from  user 
				// collection.update(query,
				// 	{$pull: {pending_friend: friendName}}, 
				// 	function(err) {
				// 		//mongodb.close();
				// 		if (err) {
				// 			mongodb.close();
				// 			callback(err, null);
				// 		}
				// 	}
				// );

				// //update friend field for friend
				// var query = {"name":  friendName};
				// //console.log(query);
				// collection.update(query,
				// 	{$addToSet: {friends: userName}}, 
				// 	function(err) {
				// 		//mongodb.close();
				// 		if (err) {
				// 			console.log("err");
				// 			mongodb.close();
				// 			callback(err, null);
				// 		}
				// 		//console.log("no err");
				// 	}
					
				// );

				// //delete request_friend field from  user 
				// collection.update(query,
				// 	{$pull: {request_friend: userName}}, 
				// 	function(err) {
				// 		//mongodb.close();
				// 		if (err) {
				// 			mongodb.close();
				// 			callback(err, null);
				// 		}
				// 	}
				// );


				// collection.findOne({name: userName}, function(err, doc) {
				// 		mongodb.close();
				// 		console.log("mongodb already close!");             ///////////////////////////////////////////////////
				// 		if (doc) {
				// 			// 封装文档为 User 对象
				// 			//var user = new User(doc);
				// 			//user.request_friend = doc.request_friend;
				// 			//console.log("i am in user.get " + doc.request_friend);
				// 			callback(err, doc);
				// 		} else {
				// 			callback(err, null);
				// 		}
				// });


		});
	});
};