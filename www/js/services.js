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
})

.service('transmissao', function($http, $interval, db) {
	function transmitir() {
		db.listarIndicacoesPorStatus(false).then(function(result) {
			for (var i = 0; i < result.length; i++) {
				var id = result[i].id_indicacao;
				console.warn("Transmitir # " + id);
				var sUrl = URL_API + "/captacao.php";
				var dados = $.param({
					idCaptador: result[i].id_captador,
					nome: result[i].nome,
					telefone: result[i].telefone,
					email: result[i].email,
					periodoContato: result[i].periodo_contato,
					renda: result[i].renda,
					valorCredito: result[i].valor_credito,
					prazoConsorcio: result[i].prazo_consorcio,
					valorParcela: result[i].valor_parcela
				});
				$http.post(sUrl, dados).then(function(response) {
					if (response.data.status) {
						// Transmitida!
						// Marcar como transmitida no banco local
						db.marcarIndicacaoTransmitida(id);
					} else {
						error("transmissao", response.data.erros);
					}
				}, function(msg) {
					// Erro ao transmitir
					error("transmissao", msg);
				});
			}
		});
	}
	return {
		iniciar: function() {
			console.warn("Iniciando serviço de transmissão");
			$interval(transmitir, 5000);
		}
	};
});
