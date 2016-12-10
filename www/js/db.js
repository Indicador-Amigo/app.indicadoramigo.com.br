var sqlCreateTables = [
        "CREATE TABLE IF NOT EXISTS usuario ("
		+ "id_usuario integer NOT NULL primary key,"
		+ "nome text NOT NULL, email text NOT NULL,"
		+ "perfil text NOT NULL, cpf text, rg text, celular text,"
		+ "data_nascimento date, endereco text,"
		+ "numero text, complemento text, bairro text,"
		+ "cidade text, uf text, cep text, banco text,"
		+ "agencia text, tipo_conta text, conta text)",
		
		"CREATE TABLE IF NOT EXISTS indicacao ("
		+ "id_indicacao integer primary key, "
		+ "id_captador integer not null, "
		+ "data_cadastro datetime not null, "
		+ "nome text not null, "
		+ "telefone text not null, "
		+ "email text not null, "
		+ "periodo_contato text not null, "
		+ "renda numeric not null, "
		+ "valor_credito numeric not null, "
		+ "prazo_consorcio integer not null, "
		+ "valor_parcela numeric not null, "
		+ "situacao text not null, "
		+ "transmitida integer not null default 0)"
];
var sqlInsertUsuario = "insert into usuario(id_usuario, nome, email, perfil, cpf, rg,"
		+ " celular, data_nascimento, endereco, numero, complemento, bairro,"
		+ " cidade, uf, cep, banco, agencia, tipo_conta, conta)"
		+ " values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

angular.module("db", [ "ngCordova" ])
.run(function($ionicPlatform, $cordovaSQLite) {
	$ionicPlatform.ready(function() {
		console.warn("SQLite Setup");
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
		var db = $cordovaSQLite.openDB({
			name : "indicadoramigo.db",
			iosDatabaseLocation : "default"
		});
		for (var i = 0; i < sqlCreateTables.length; i++) {
			$cordovaSQLite.execute(db, sqlCreateTables[i]).then(function() {
			}, function(msg) {
				error("createdb", msg);
			});
		}
	});
}).factory("db", function($cordovaSQLite, $ionicPlatform, $q) {
	function config() {
		return {
			name : "indicadoramigo.db",
			iosDatabaseLocation : "default"
		};
	}
	return {
		// Apagar o banco de dados
		// Usar na função logout
		apagarBanco : function() {
			$cordovaSQLite.deleteDB(config());
		},
		// Recupera o usuário autenticado no sistema
		recuperarUsuario : function() {
			var d = $q.defer();
			var query = "select * from usuario";
			$ionicPlatform.ready(function() {
				console.warn("recuperarUsuario");
				var db = $cordovaSQLite.openDB(config());
				$cordovaSQLite.execute(db, query).then(function(result) {
					if (result.rows.length > 0) {
						d.resolve(result.rows.item(0));
					} else {
						d.reject();
					}
				}, function(msg) {
					error("recuperarUsuario", msg);
					d.reject();
				});
			});
			return d.promise;
		},
		// Grava o usuário autenticado no sistema
		gravarUsuario : function(dados) {
			var d = $q.defer();
			$ionicPlatform.ready(function() {
				console.warn("gravarUsuario");
				var db = $cordovaSQLite.openDB(config());
				$cordovaSQLite.execute(db, "delete from usuario");
				var args = [dados.id_usuario,
				            dados.nome,
				            dados.email,
				            dados.perfil,
				            dados.cpf,
				            dados.rg,
				            dados.celular,
				            dados.data_nascimento,
				            dados.endereco,
				            dados.numero,
				            dados.complemento,
				            dados.bairro,
				            dados.cidade,
				            dados.uf,
				            dados.cep,
				            dados.banco,
				            dados.agencia,
				            dados.tipo_conta,
				            dados.conta
				];
				$cordovaSQLite.execute(db, sqlInsertUsuario, args).then(function() {
					d.resolve();
				}, function(msg) {
					error("gravarUsuario", msg);
					d.reject();
				});
			});
			return d.promise;
		},
		// Conta o número de indicações por status (transmitida/não transmitida)
		contarIndicacoesPorStatus: function(transmitida) {
			var d = $q.defer();
			$ionicPlatform.ready(function() {
				console.warn("contarIndicacoesPorStatus");
				var db = $cordovaSQLite.openDB(config());
				var sql = "select count(*) as total from indicacao where transmitida = "
					+ (transmitida ? 1 : 0);
				$cordovaSQLite.execute(db, sql).then(function(result) {
					d.resolve(result.rows.item(0).total);
				}, function(msg) {
					error("contarIndicacoesPorStatus", msg);
					d.reject();
				});
			});
			return d.promise;
		},
		// Lista as indicações por status (transmitida/não transmitida)
		listarIndicacoesPorStatus: function(transmitida) {
			var d = $q.defer();
			$ionicPlatform.ready(function() {
				console.warn("listarIndicacoesPorStatus");
				var db = $cordovaSQLite.openDB(config());
				var sql = "select * from indicacao where transmitida = " + (transmitida ? 1 : 0)
					+ " order by id_indicacao desc limit 10";
				$cordovaSQLite.execute(db, sql).then(function(result) {
					var arr = [];
					for (var i = 0; i < result.rows.length; i++) {
						arr[i] = result.rows.item(i);
					}
					d.resolve(arr);
				}, function(msg) {
					error("contarIndicacoesPorStatus", msg);
					d.reject();
				});
			});
			return d.promise;
		},
		// Salva uma indicação
		salvarIndicacao: function(dados) {
			var d = $q.defer();
			$ionicPlatform.ready(function() {
				console.warn("salvarIndicacao");
				var db = $cordovaSQLite.openDB(config());
				var sql = "insert into indicacao(id_captador, data_cadastro, nome, telefone, email, "
					+ "periodo_contato, renda, valor_credito, prazo_consorcio, valor_parcela, "
					+ "situacao, transmitida) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				var args = [dados.idCaptador,
				            new Date(),
				            dados.nome,
				            dados.telefone,
				            dados.email,
				            dados.periodoContato,
				            parseFloat(dados.renda),
				            parseFloat(dados.valorCredito),
				            parseFloat(dados.prazoConsorcio),
				            parseFloat(dados.valorParcela),
				            "N",
				            0
				];
				$cordovaSQLite.execute(db, sql, args).then(function(result) {
					d.resolve(result.insertId);
				}, function(msg) {
					error("salvarIndicacao", msg);
					d.reject();
				});
			});
			return d.promise;
		},
		// Marca uma indicação como transmitida
		marcarIndicacaoTransmitida: function(id) {
			var d = $q.defer();
			$ionicPlatform.ready(function() {
				console.warn("marcarIndicacaoTransmitida");
				var db = $cordovaSQLite.openDB(config());
				var sql = "update indicacao set transmitida = ? where id_indicacao = ?";
				var args = [1, id];
				$cordovaSQLite.execute(db, sql, args).then(function(result) {
					d.resolve();
				}, function(msg) {
					error("marcarIndicacaoTransmitida", msg);
					d.reject();
				});
			});
			return d.promise;
		}
	};
});
