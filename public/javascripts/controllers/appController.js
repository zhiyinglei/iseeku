angular.module('iseeuController', [])

	.controller('appController', ['$scope','$http', 'Users', function($scope, $http, Users) {
		//set up  a listener to listen and update the session, when accepted by a friend
	    var socket = io.connect();
	    socket.on('require_update_session', function(data){
	    	//alert(local_user);
			//$http.post('/updateSession', {user_name: local_user}).
			Users.updateSession({user_name: local_user}).
			  success(function(result, status, headers, config) {
			  	//alert("success");
			  }).
			  error(function(data, status, headers, config) {
			  	//alert("error???");
			  });
	    }); 

		$scope.searchListContentShow=false;
		$scope.searchListContentSwitch="";
		$scope.friendName = "";
		$scope.friendList = "";


		$scope.search_submit_click = function() {
			//$http.post('/search', {search_key: $scope.searchFriendName}).

			Users.search({search_key: $scope.searchFriendName}).
			  success(function(result, status, headers, config) {

			    $scope.searchFriendName="";
				display_box();
				$scope.searchListContentShow=true;
				if(result == 'null' || result.name == local_user ){
					$scope.searchListContentSwitch = "0";
				}
				else{
					var friend = [result];
					$scope.friend = result;
					$scope.friendName=result.name;
					$scope.searchListContentSwitch = "1";				
				};
			  }).
			  error(function(data, status, headers, config) {
			    $scope.searchListContentSwitch = "e001";
			    //$("#searchList_content").html("Error occurs, Please try again later.(No.001)");
			  });		


		};

		$scope.addFriend_submit_click = function() {

			//$http.post('/requestFriend', {friend_name: $scope.friendName, user_name: local_user }).
			Users.addFriend({friend_name: $scope.friendName, user_name: local_user }).
			  success(function(result, status, headers, config) {
			  	//alert("success");
			  	$scope.searchListContentSwitch = "2";
			  	display_friend();
			  }).
			  error(function(data, status, headers, config) {
			  	$scope.searchListContentSwitch = "e002";
			  	//alert("error");
			  });	

		};

		$scope.accept_Friend_submit_click = function(pengingFriendName){
			//$http.post('/acceptFriend', {friend_name: pengingFriendName, user_name: local_user }).
			Users.acceptFriend({friend_name: pengingFriendName, user_name: local_user }).
			  success(function(result, status, headers, config) {
			  	//alert("success");
				display_friend();
				//alert("success");	
				var socket = io.connect('/');
				socket.emit('require_update_session', {user_name: pengingFriendName, friend_name: local_user });
			  }).
			  error(function(data, status, headers, config) {
			  	//alert("error");
			  });			
		};

		$scope.friends_click = function(){
			$scope.searchListContentShow=false;			
			display_box();			
		}


		var display_box = function() {
			display_friend();
			$("#map").hide();
			$("header").hide();
			$(".app").hide();

			$("#friendsDialog").dialog({
		  	close: function( event, ui ) {
				$("#map").show();
				$("header").show();	
				$(".app").show();  	
		  		}
			});	
		};		


		var display_friend = function() {
			$http.post('/displayFriend', {userName: local_user }).
			  success(function(result, status, headers, config) {
			  	$scope.friendList = result;

			  }).
			  error(function(data, status, headers, config) {
			  	//alert("error");
			  });	

			//alert("display friends");
		};
	



		////// Dealing with map
		////// For this part, looking at the below link for more detail 
		////// http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/

		// generate unique user id
		var userId = Math.random().toString(16).substring(2,15);
		//var socket = io.connect('/');
		var map;

		var info = $('#infobox');
		var doc = $(document);

		// custom marker's icon styles
		var tinyIcon = L.Icon.extend({
			options: {
				shadowUrl: '/images/marker-shadow.png',
				iconSize: [32, 32],
				iconAnchor:   [12, 36],
				shadowSize: [41, 41],
				shadowAnchor: [12, 38],
				popupAnchor: [0, -30]
			}
		});


		var redIcon = new tinyIcon({ iconUrl: '/images/marker-red.png' });
		var friendIcon = new tinyIcon({ iconUrl: '/images/marker-friend.png' });

		var sentData = {};

		var connects = {};
		var markers = {};
		var active = false;

		socket.on('load:coords', function(data) {
			if (!(data.id in connects)) {
				setMarker(data);
			}

			connects[data.id] = data;
				connects[data.id].updated = $.now(); // shothand for (new Date).getTime()
		});

		// check whether browser supports geolocation api
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
		} else {
			$('.map').text('Your browser is out of fashion, there\'s no geolocation!');
		}

		function positionSuccess(position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			var acr = position.coords.accuracy;

			// mark user's position
			var userMarker = L.marker([lat, lng], {
				icon: redIcon
			});

			// load leaflet map
			map = L.map('map').setView([lat, lng], 10);

			// leaflet API key tiler
			L.tileLayer('https://{s}.tiles.mapbox.com/v3/skoal.jldi6o0b/{z}/{x}/{y}.png', { maxZoom: 18, detectRetina: true }).addTo(map);

			// set map bounds
			userMarker.addTo(map);
			//alert(local_user);
			userMarker.bindPopup('You are here!').openPopup();

			var emit = $.now();
			// send coords on when user is active
			doc.on('mousemove', function() {
				active = true;

				sentData = {
					id: userId,
					name: local_user,
					active: active,
					coords: [{
						lat: lat,
						lng: lng,
						acr: acr
					}]
				};

				if ($.now() - emit > 30) {
					socket.emit('send:coords', sentData);
					emit = $.now();
				}
			});
		}

		doc.bind('mouseup mouseleave', function() {
			active = false;
		});

		// showing markers for connections
		function setMarker(data) {
			for (var i = 0; i < data.coords.length; i++) {
				var marker = L.marker([data.coords[i].lat, data.coords[i].lng], { icon: friendIcon }).addTo(map);
				marker.bindPopup('<p>' + data.name + ' is here!</p>');
				markers[data.id] = marker;
			}
		}

		// handle geolocation api errors
		function positionError(error) {
			var errors = {
				1: 'Authorization fails', // permission denied
				2: 'Can\'t detect your location', //position unavailable
				3: 'Connection timeout' // timeout
			};
			showError('Error:' + errors[error.code]);
		}

		function showError(msg) {
			info.addClass('error').text(msg);

			doc.click(function() {
				info.removeClass('error');
			});
		}

		// delete inactive users every 15 sec
		setInterval(function() {
			for (var ident in connects){
				if ($.now() - connects[ident].updated > 15000) {
					delete connects[ident];
					map.removeLayer(markers[ident]);
				}
			}
		}, 15000);












	}]);


