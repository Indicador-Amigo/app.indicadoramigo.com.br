angular.module('starter.controllers', ['ionic', 'starter.services'])

.config(function($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $ionicHistory, $state, $http, usuario, db, transmissao) {
	// Executar ao exibir a view
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		$scope.currentState = $state.$current;
		
		// Login
		if (data.stateName != "app.login" && data.stateName != "app.cadastro" && data.stateName != "app.recuperarSenha") {
			usuario.login().then(function() {
				console.warn("Usuário: " + $scope.usuario.nome);
				transmissao.iniciar();
				// Contadores da home
				if (data.stateName == "app.home") {
					$scope.dados = {
							totalPendentes: 0,
							totalRecentes: 0,
							indConfirmadas: 0,
							valConfirmadas: 0
					};
					db.contarIndicacoesPorStatus(0).then(function(total) {
						$scope.dados.totalPendentes = total;
					});
					$http.post(URL_API + "/resumo.php", $.param({id_usuario: $scope.usuario.id_usuario})).then(function(response) {
						$scope.dados.totalRecentes = response.data.recentes;
						$scope.dados.indConfirmadas = response.data.indConfirmadas;
						$scope.dados.valConfirmadas = response.data.valConfirmadas;
					});
				}
			}, function() {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go("app.login");
			});
		}
	});
	
	// Logout
	$scope.sair = function() {
		usuario.logout();
		ionic.Platform.exitApp();
	};
})

.controller('LoginCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, db, transmissao) {
	$scope.form = {
		email: "",
		senha: ""
	};

	$scope.autenticar = function() {
		console.warn("Autenticando: " + $scope.form.email);
		$ionicLoading.show({
			template: '<p>Autenticando...</p><ion-spinner></ion-spinner>'
        });
		var sUrl = URL_API + "/login.php";
		var dados = $.param($scope.form);
		$http({
			method: 'POST',
			url: sUrl,
			data: dados,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function(response) {
			$ionicLoading.hide();
			if (response.data.status) {
				db.gravarUsuario(response.data).then(function() {
					transmissao.iniciar();
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("app.home", {}, {location:true, reload: true});
				}, function() {
					$ionicPopup.alert({
						title : 'Erro',
						template : 'Ocorreu um erro inesperado.',
						okText : 'Ok',
						okType : 'button-verdeIndAmig'
					});
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				});
			}
		}, function(msg) {
			error("login", msg);
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-verdeIndAmig'
			});
		});
	};
	
	$scope.cadastrar = function() {
		$state.go("app.cadastro");
	};
	
	$scope.recuperarSenha = function() {
		$state.go("app.recuperarSenha");
	};
})

.controller('RecuperarSenhaCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, db, transmissao) {
	$scope.form = {
		email: ""
	};

	$scope.validar = function() {
		$ionicLoading.show({
			template: '<p>Processando...</p><ion-spinner></ion-spinner>'
        });
		var sUrl = URL_API + "/recuperarSenha.php";
		var dados = $.param($scope.form);
		$http({
			method: 'POST',
			url: sUrl,
			data: dados,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function(response) {
			$ionicLoading.hide();
			if (response.data.status) {
				$ionicPopup.alert({
					title : 'Verifique Seu Email',
					template : response.data.mensagem,
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				});
			}
		}, function(msg) {
			error("login", msg);
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-verdeIndAmig'
			});
		});
	};
})

.controller('CadastroCtrl', function($scope, $ionicPopup, $ionicLoading, $http, $state, db) {
	$scope.form = {
		nome: "",
		email: "",
		perfil: "C", // Fixo - Captador
		cpfCnpj: "",
		rg: "",
		telefone: "",
		dataNascimento: null,
		endereco: "",
		numero: "",
		complemento: "",
		bairro: "",
		cidade: "",
		uf: "",
		cep: "",
		banco: "",
		agencia: "",
		tipoConta: "",
		conta: "",
		senha: "",
		confirmSenha: "",
		idRevenda: null
	};
	
	$scope.cadastrar = function() {
		$ionicLoading.show({
			template: '<p>Processando...</p><ion-spinner></ion-spinner>'
        });
		var sUrl = URL_API + "/cadastro.php";
		var dados = $.param($scope.form);
		$http.post(sUrl, dados).then(function(response) {
			$ionicLoading.hide();
			if (response.data.status) {
				$ionicPopup.alert({
					title : 'Sucesso',
					template : 'Seu cadastro foi efetuado. Faça o login para usar o aplicativo.',
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				}).then(function() {
					$state.go("app.login");
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				});
			}
		}, function(error) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-verdeIndAmig'
			});
		});
	};
})

.controller('PerfilCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, db) {
	$scope.form = {
		idUsuario: 0,
		nome: "",
		email: "",
		perfil: "C", // Fixo - Captador
		cpfCnpj: "",
		rg: "",
		telefone: "",
		dataNascimento: null,
		endereco: "",
		numero: "",
		complemento: "",
		bairro: "",
		cidade: "",
		uf: "",
		cep: "",
		banco: "",
		agencia: "",
		tipoConta: "",
		conta: "",
		senhaAtual: "",
		novaSenha: "",
		confirmeNovaSenha: "",
		idRevenda: null
	};
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		if (data.stateName == "app.perfil") {
			db.recuperarUsuario(1).then(function(dados) {
				$scope.form = {
					idUsuario: dados.id_usuario,
					nome: dados.nome,
					email: dados.email,
					perfil: dados.perfil,
					cpfCnpj: dados.cpf,
					rg: dados.rg,
					telefone: dados.celular,
					dataNascimento: new Date(dados.data_nascimento),
					endereco: dados.endereco,
					numero: dados.numero,
					complemento: dados.complemento,
					bairro: dados.bairro,
					cidade: dados.cidade,
					uf: dados.uf,
					cep: dados.cep,
					idRevenda: dados.id_revenda,
					banco: dados.banco,
					agencia: dados.agencia,
					tipoConta: dados.tipo_conta,
					conta: dados.conta,
					senhaAtual: "",
					novaSenha: "",
					confirmeNovaSenha: ""
				};
			});
		}
	});
	
	$scope.alterar = function() {
		$ionicLoading.show({
			template: '<p>Processando...</p><ion-spinner></ion-spinner>'
        });
		var sUrl = URL_API + "/alterarCadastro.php";
		var dados = $.param($scope.form);
		$http.post(sUrl, dados).then(function(response) {
			$ionicLoading.hide();
			if (response.data.status) {
				db.atualizarUsuario($scope.form);
				$ionicPopup.alert({
					title : 'Sucesso',
					template : 'Seu cadastro foi atualizado.',
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				}).then(function() {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("app.home", {}, {location:true, reload: true});
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-verdeIndAmig'
				});
			}
		}, function(error) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-verdeIndAmig'
			});
		});
	};
})

.controller('CaptacaoListCtrl', function($scope, $ionicPopup, $ionicLoading, $http, $state, db) {
	$scope.dados = {
		listaEnviadas: []
	};
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		if (data.stateName == "app.captacaoList") {
			db.listarIndicacoesPorStatus(1).then(function(dados) {
				$scope.dados.listaEnviadas = dados;
			});
		}
	});
})

.controller('CaptacaoEditCtrl', function($scope, $ionicPopup, $ionicLoading, $http, $state, db) {
	$scope.form = {
		idCaptador: $scope.usuario.id_usuario,
		nome: "",
		telefone: "",
		email: "",
		periodoContato: "",
		renda: "",
		valorCredito: "",
		prazoConsorcio: "",
		valorParcela: ""
	};
	$scope.salvar = function() {
		if ($scope.form.nome.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Nome é obrigatório.");
			return;
		}
		if ($scope.form.telefone.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Telefone é obrigatório.");
			return;
		} else if (!$scope.form.telefone.match(/^\(?[0-9]{2}\)?\s?[0-9]{4,5}\-?[0-9]{4}$/)) {
			ionicAlert($ionicPopup, "Erro", "O telefone é inválido.");
			return;
		}
		if ($scope.form.email.length > 0 
				&& !$scope.form.email.match(/^[a-z0-9]+([._-][a-z0-9]+)*@[a-z0-9]+([._-][a-z0-9]+)*\.[a-z]{2,5}$/i)) {
			ionicAlert($ionicPopup, "Erro", "O email é inválido.");
			return;
		}
		if (!$scope.form.periodoContato.match(/^[MTN]$/)) {
			ionicAlert($ionicPopup, "Erro", "O campo Período de Contato é obrigatório.");
			return;
		}
		$ionicPopup.confirm({
			title : 'Confirmação',
			template : 'Deseja efetivar a indicação?',
			cancelText : 'Cancelar',
			cancelType : 'button-verdeIndAmig',
			okText : 'Ok',
			okType : 'button-verdeIndAmig'
		}).then(function(res) {
			if (!res) 
				return;
			// Salvar no banco local
			db.salvarIndicacao($scope.form).then(function(id) {
				console.warn("Id: # " + id);
				// Limpar form
				$scope.form.nome = "";
				$scope.form.telefone = "";
				$scope.form.email = "";
				$scope.form.periodoContato = "";
				$scope.form.renda = "";
				$scope.form.valorCredito = "";
				$scope.form.prazoConsorcio = "";
				$scope.form.valorParcela = "";
				// Voltar
				$state.go("app.captacaoList");
			}, function() {
				ionicAlert($ionicPopup, "Erro", "Ocorreu um erro ao salvar os dados.");
			});
		});
	};
})

.controller('ExtratoCtrl', function($scope, $ionicPopup, $ionicLoading, $http) {
	$scope.listaPagas = [];
	$scope.listaDisponiveis = [];
	
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		if (data.stateName == "app.extrato") {
			$ionicLoading.show({
				template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
	        });
			$http.post(URL_API + "/extrato.php", $.param({id_usuario: $scope.usuario.id_usuario})).then(function(response) {
				$scope.listaPagas = response.data.pagas;
				$scope.listaDisponiveis = response.data.disponiveis;
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	});
})

.controller('ReversaListCtrl', function($scope, $ionicPopup, $ionicLoading, $http) {
	$scope.lista = [];
	
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		if (data.stateName == "app.reversaList") {
			$ionicLoading.show({
				template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
	        });
			var url = URL_API + "/reversaList.php";
			$http.post(url, $.param({id_usuario: $scope.usuario.id_usuario})).then(function(response) {
				$scope.lista = response.data.lista;
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	});
})

.controller('ReversaEditCtrl', function($scope, $stateParams, $ionicPopup, $ionicLoading, $ionicHistory, $http) {
	$scope.reversa = {};
	
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		if (data.stateName == "app.reversaEdit") {
			$ionicLoading.show({
				template: '<p>Carregando...</p><ion-spinner></ion-spinner>'
	        });
			var url = URL_API + "/reversaList.php";
			var dados = $.param({
				id_usuario: $scope.usuario.id_usuario,
				id_reversa: $stateParams.idReversa
			});
			$http.post(url, dados).then(function(response) {
				if (response.data.lista.length == 1) {
					$scope.reversa = response.data.lista[0];
				} else {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("app.reversaList", {}, {location:true, reload: true});
				}
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	});
	
	$scope.alterar = function(codSit) {
		var dscSit;
		switch (codSit) {
		case "P":
			dscSit = "Pendente";
			break;
		case "R":
			dscSit = "Recusada";
			break;
		case "C":
			dscSit = "Confirmada";
			break;
		default:
			return;
		}
		$ionicPopup.confirm({
			title : 'Confirmação',
			template : 'A indicação será alterada para ' + dscSit + '.',
			cancelText : 'Cancelar',
			cancelType : 'button-verdeIndAmig',
			okText : 'Ok',
			okType : 'button-verdeIndAmig'
		}).then(function(res) {
			if (!res)
				return;
			$ionicLoading.show({
				template: '<p>Processando...</p><ion-spinner></ion-spinner>'
	        });
			var url = URL_API + "/reversaEdit.php";
			var dados = $.param({
				id_usuario: $scope.usuario.id_usuario,
				id_reversa: $stateParams.idReversa,
				situacao: codSit
			});
			$http.post(url, dados).then(function(response) {
				if (response.data.status) {
					$ionicHistory.goBack();
				} else {
					$ionicPopup.alert({
						title : 'Erro',
						template : response.data.erro,
						okText : 'Ok',
						okType : 'button-verdeIndAmig'
					});
				}
			}).finally(function() {
				$ionicLoading.hide();
			});
		});
	};
})
