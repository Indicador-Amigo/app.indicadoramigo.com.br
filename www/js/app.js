// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'db'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

	.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})

	.state('app.login', {
		url: '/login',
		views: {
			'menuContent': {
				templateUrl: 'templates/login.html'
			}
		}
	})

	.state('app.home', {
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html'
			}
		}
	})

	.state('app.cadastro', {
		url: '/cadastro',
		views: {
			'menuContent': {
				templateUrl: 'templates/cadastro.html'
			}
		}
	})

	.state('app.captacaoList', {
		url: '/captacaoList',
		views: {
			'menuContent': {
				controller: 'CaptacaoListCtrl',
				templateUrl: 'templates/captacaoList.html'
			}
		}
	})

	.state('app.captacaoEdit', {
		url: '/captacaoEdit',
		views: {
			'menuContent': {
				templateUrl: 'templates/captacaoEdit.html'
			}
		}
	})

	.state('app.instalacoes', {
		url: '/instalacoes',
		views: {
			'menuContent': {
				templateUrl: 'templates/instalacoes.html'
			}
		}
	})

	.state('app.instalacoesDisponiveis', {
		url: '/instalacoes/instalacoesDisponiveis',
		views: {
			'menuContent': {
				templateUrl: 'templates/instalacoesDisponiveis.html',
				controller: 'InstalacoesDisponiveisCtrl'
			}
		}
	})

	.state('app.instalacoesPendentes', {
		url: '/instalacoes/instalacoesPendentes',
		views: {
			'menuContent': {
				templateUrl: 'templates/instalacoesPendentes.html',
				controller: 'InstalacoesPendentesCtrl'
			}
		}
	})

	.state('app.instalacoesConcluidas', {
		url: '/instalacoes/instalacoesConcluidas',
		views: {
			'menuContent': {
				templateUrl: 'templates/instalacoesConcluidas.html'
			}
		}
	})

	.state('app.extrato', {
		url: '/extrato',
		views: {
			'menuContent': {
				templateUrl: 'templates/extrato.html'
			}
		}
	})

	.state('app.reversaList', {
		url: '/reversaList',
		views: {
			'menuContent': {
				templateUrl: 'templates/reversaList.html'
			}
		}
	})

	.state('app.reversaEdit', {
		url: '/reversaEdit/:idReversa',
		views: {
			'menuContent': {
				templateUrl: 'templates/reversaEdit.html'
			}
		}
	})

	.state('app.painel', {
		url: '/painel',
		views: {
			'menuContent': {
				templateUrl: 'templates/painel.html'
			}
		}
	})

	.state('app.perfil', {
		url: '/perfil',
		views: {
			'menuContent': {
				templateUrl: 'templates/perfil.html'
			}
		}
	})

	.state('app.sobre', {
		url: '/sobre',
		views: {
			'menuContent': {
				templateUrl: 'templates/sobre.html'
			}
		}
	})

	.state('app.search', {
		url: '/search',
		views: {
			'menuContent': {
				templateUrl: 'templates/search.html'
			}
		}
	})

	.state('app.playlists', {
		url: '/playlists',
		views: {
			'menuContent': {
				templateUrl: 'templates/playlists.html',
				controller: 'PlaylistsCtrl'
			}
		}
	})

	.state('app.single', {
		url: '/playlists/:playlistId',
		views: {
			'menuContent': {
				templateUrl: 'templates/playlist.html',
				controller: 'PlaylistCtrl'
			}
		}
	});

	$urlRouterProvider.otherwise('/app/home');
});
