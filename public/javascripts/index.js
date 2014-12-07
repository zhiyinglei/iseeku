$(document).ready(function(){

    var socket = io.connect();
    socket.on('require_update_session', function(data){
    	//alert(local_user);

		var delay=1000;//1 seconds
		    setTimeout(function(){
				$.ajax({
					url: '/updateSession/',
					type: 'POST',
					dataType: 'json',
					data: {user_name: local_user  },		
					success: function(result) {
						//alert("success");	
					},
					error: function(err){
						//alert("error???");
					}
				});	
		    },delay);



    }); 


});