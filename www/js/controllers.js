angular.module('starter.controllers', ['ionic', 'starter.services'])

.config(function($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $state, $http, usuario, db, transmissao) {
	// Executar ao exibir a view
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		// Login
		if (data.stateName != "app.login" && data.stateName != "app.cadastro") {
			usuario.login().then(function() {
				console.warn("Usuário: " + $scope.usuario.nome);
				transmissao.iniciar();
				// Contadores da home
				if (data.stateName == "app.home") {
					$scope.dados = {
							totalPendentes: 0,
							totalRecentes: 0
					};
					db.contarIndicacoesPorStatus(0).then(function(total) {
						$scope.dados.totalPendentes = total;
					});
					$http.post(URL_API + "/resumo.php", $.param({id_usuario: $scope.usuario.id_usuario})).then(function(response) {
						$scope.dados.totalRecentes = response.data.recentes;
					});
				}
			}, function() {
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

.controller('LoginCtrl', function($scope, $ionicPopup, $ionicLoading, $http, $state, db, transmissao) {
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
					$state.go("app.home", {}, {location:true, reload: true});
				}, function() {
					$ionicPopup.alert({
						title : 'Erro',
						template : 'Ocorreu um erro inesperado.',
						okText : 'Ok',
						okType : 'button-positive'
					});
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-positive'
				});
			}
		}, function(msg) {
			error("login", msg);
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-positive'
			});
		});
	};
	
	$scope.cadastrar = function() {
		$state.go("app.cadastro");
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
		conta: ""
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
					template : 'Seu cadastro foi efetuado. Confira seu email para ativar.',
					okText : 'Ok',
					okType : 'button-positive'
				}).then(function() {
					$state.go("app.login");
				});
			} else {
				$ionicPopup.alert({
					title : 'Erro',
					template : response.data.erros[0],
					okText : 'Ok',
					okType : 'button-positive'
				});
			}
		}, function(error) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-positive'
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
		cep: ""
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
					cep: dados.cep
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
					okType : 'button-positive'
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
					okType : 'button-positive'
				});
			}
		}, function(error) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title : 'Erro',
				template : 'Ocorreu um erro inesperado.',
				okText : 'Ok',
				okType : 'button-positive'
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
		if ($scope.form.email.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Email é obrigatório.");
			return;
		} else if (!$scope.form.email.match(/^[a-z0-9]+([._-][a-z0-9]+)*@[a-z0-9]+([._-][a-z0-9]+)*\.[a-z]{2,5}$/i)) {
			ionicAlert($ionicPopup, "Erro", "O email é inválido.");
			return;
		}
		if (!$scope.form.periodoContato.match(/^[MTN]$/)) {
			ionicAlert($ionicPopup, "Erro", "O campo Período de Contato é obrigatório.");
			return;
		}
		/*if ($scope.form.renda.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Renda é obrigatório.");
			return;
		} else if (!$scope.form.renda.match(/^[0-9]+$/)) {
			ionicAlert($ionicPopup, "Erro", "O valor da renda é inválido. Insira somente dígitos.");
			return;
		}
		if ($scope.form.valorCredito.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Valor do Crédito é obrigatório.");
			return;
		} else if (!$scope.form.valorCredito.match(/^[0-9]+$/)) {
			ionicAlert($ionicPopup, "Erro", "O valor do crédito é inválido. Insira somente dígitos.");
			return;
		}
		if ($scope.form.prazoConsorcio.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Prazo do Consórcio é obrigatório.");
			return;
		} else if (!$scope.form.prazoConsorcio.match(/^[0-9]+$/)) {
			ionicAlert($ionicPopup, "Erro", "O prazo do consórcio é inválido. Insira somente dígitos.");
			return;
		}
		if ($scope.form.valorParcela.length == 0) {
			ionicAlert($ionicPopup, "Erro", "O campo Valor da Parcela é obrigatório.");
			return;
		} else if (!$scope.form.valorParcela.match(/^[0-9]+$/)) {
			ionicAlert($ionicPopup, "Erro", "O valor da parcela é inválido. Insira somente dígitos.");
			return;
		}*/
		if (!$scope.form.renda
				&& !$scope.form.valorCredito
				&& !$scope.form.prazoConsorcio
				&& !$scope.form.valorParcela) {
			ionicAlert($ionicPopup, "Erro", "Informe pelo menos uma opção da parte financeira.");
			return;
		}
		$ionicPopup.confirm({
			title : 'Confirmação',
			template : 'Deseja efetivar a indicação?',
			cancelText : 'Cancelar',
			cancelType : 'button-positive',
			okText : 'Ok',
			okType : 'button-positive'
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
