angular.module('userService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Users', ['$http','$q', function($http, $q) {
		return {
			search : function(keyword) {
				return $http.post('/search', keyword);
			},
			addFriend : function(friends) {
				return $http.post('/requestFriend', friends);
			},
			acceptFriend : function(friends) {
				return $http.post('/acceptFriend', friends);
			},
			updateSession : function(user) {
				return $http.post('/updateSession',user)
			}
		}
	}]);



