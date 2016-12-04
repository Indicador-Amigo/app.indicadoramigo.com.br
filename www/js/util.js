// Funções utilitárias para logging
(function(scope) {
	scope.info = function(id, obj) {
		writeLogObj("info", id);
		writeLogObj("info", obj);
	};
	scope.warn = function(id, obj) {
		writeLogObj("warn", id);
		writeLogObj("warn", obj);
	};
	scope.error = function(id, obj) {
		writeLogObj("error", id);
		writeLogObj("error", obj);
	};
	scope.ionicAlert = function($ionicPopup, tit, msg) {
		$ionicPopup.alert({
			title : tit,
			template : msg,
			okText : 'Ok',
			okType : 'button-positive'
		});
	};
	function writeLogObj(type, obj) {
		var t = typeof (obj);
		if (t == "string" || t == "number") {
			writeLogMsg(type, obj);
		} else if (t == "object") {
			for ( var i in obj) {
				writeLogMsg(type, obj[i], i);
			}
		}
	}
	function writeLogMsg(type, val, key) {
		var msg = key ? key + ": " + val : val;
		if (type == "info") {
			console.info(msg);
		} else if (type == "warn") {
			console.warn(msg);
		} else if (type == "error") {
			console.error(msg);
		}
	}
})(window);
