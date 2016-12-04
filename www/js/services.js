angular.module('starter.services', [ 'ionic' ])

.service('usuario', function($rootScope, $q, db) {
	return {
		login : function() {
			var d = $q.defer();
			db.recuperarUsuario().then(function(obj) {
				$rootScope.usuario = obj;
				d.resolve();
			}, function() {
				d.reject();
			});
			return d.promise;
		},
		logout : function() {
			db.apagarBanco();
		}
	};
});
