module.exports = function (io, sessions,localUser) {

io.sockets.on('connection', function (socket) {

  console.log("im in socket!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log(sessions);
  //console.log(localUser);
  //console.log(lll.name);
  console.log("im in socket end !!!!!!!!!!!!!!!!!!!!!!!!!!");

  if(localUser.content){
    var sessionName = localUser.content.name;
    sessions[sessionName] = {'socket': socket, 'friendList': localUser.content.friends};
    socket.name = sessionName;
    console.log(sessions); 
  }

	console.log('user connected, socket.id is ' + socket.id );

	socket.on('disconnect', function () {
		console.log("user disconnect");
    if (!socket.name) return;
    delete sessions[socket.name];
	});

	socket.on('send:coords', function (data) {
		//socket.broadcast.emit('load:coords', data);

    var senderName = data.name;
    if(sessions[senderName]){
      for(var i in sessions[senderName].friendList){
        var friend = sessions[senderName].friendList[i];
        if (sessions[friend]){
          io.to(sessions[friend].socket.id).emit('load:coords', data);
          console.log(friend);
        }
      }        
    }


	});	

  socket.on('require_update_session', function (data) {
    console.log("require_update_session user_name -- " + data.user_name);
    console.log("require_update_session friend_name -- " + data.friend_name);

    if (sessions[data.user_name]){
      sessions[data.user_name].friendList.push(data.friend_name);
      //console.log("require_update_session friendList-- " + sessions[data.friend_name].friendList);
      io.to(sessions[data.user_name].socket.id).emit('require_update_session',{number:'for your eyes only'});
    }
    if (sessions[data.friend_name]){
      sessions[data.friend_name].friendList.push(data.user_name);
      //console.log("require_update_session friendList-- " + sessions[data.user_name].friendList);
    }

  }); 

});

};