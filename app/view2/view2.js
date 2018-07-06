'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/registroAdminPrueba/:param1', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
  $routeProvider.when('/registroAdminPrueba/', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope','$http','$location', '$routeParams', '$route','MyService','zipcodesDirective', function($scope,$http,$location, $routeParams, $route, MyService, zipcodesDirective) {

		OpenPay.setId('');
		OpenPay.setApiKey('');
		// OpenPay.setSandboxMode(true);
		var deviceSessionId = OpenPay.deviceData.setup("processCard", "deviceIdHiddenFieldName");
		$scope.promoValida = false;
  	$scope.checkout = false;

		
		$scope.suges = [
		{
			nombre: "PURIFICADOR DE ALTA CAPACIDAD",
			precio: 400,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 3,
			imagen: "./assets/purificador_de_alta_capacidad.png"
		},{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE OSMOSIS INVERSA",
			precio: 1102,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 8,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE CARBÓN ACTIVADO",
			precio: 928,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 7,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "PURIFICADOR DE CARBÓN ACTIVADO CON PLATA COLOIDAL",
			precio: 199,
			precioCompra: 2400,
			cantidad: 1,
			idProducto: 2,
			imagen: "./assets/purificador_de_carbono-activado-con-planta-coloidal.png"
		},
		{
			nombre: "PURIFICADOR DE ÓSMOSIS INVERSA",
			precio: 349,
			precioCompra: 5500,
			cantidad: 1,
			idProducto: 4,
			imagen: "./assets/purificador_de_osmosis.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR BAJO TARJA",
			precio: 299,
			precioCompra: 4800,
			cantidad: 1,
			idProducto: 5,
			imagen: "./assets/purificador_y_alcalinizador_bajo_tarja.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR SOBRE TARJA",
			precio: 399,
			precioCompra: 7200,
			cantidad: 1,
			idProducto: 6,
			imagen: "./assets/purificador_y_alcalinizador_sobre_tarja.png"
		}
	];
		$scope.registro = {};
		$scope.cargando = false;
		$scope.textoBoton = "Generar Pago";
		$scope.catalogo = [
		{
			nombre: "PURIFICADOR DE ALTA CAPACIDAD",
			precio: 400,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 3,
			imagen: "./assets/purificador_de_alta_capacidad.png"
		},{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE OSMOSIS INVERSA",
			precio: 1102,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 8,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE CARBÓN ACTIVADO",
			precio: 928,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 7,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "PURIFICADOR DE CARBÓN ACTIVADO CON PLATA COLOIDAL",
			precio: 199,
			precioCompra: 2400,
			cantidad: 1,
			idProducto: 2,
			imagen: "./assets/purificador_de_carbono-activado-con-planta-coloidal.png"
		},
		{
			nombre: "PURIFICADOR DE ÓSMOSIS INVERSA",
			precio: 349,
			precioCompra: 5500,
			cantidad: 1,
			idProducto: 4,
			imagen: "./assets/purificador_de_osmosis.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR BAJO TARJA",
			precio: 299,
			precioCompra: 4800,
			cantidad: 1,
			idProducto: 5,
			imagen: "./assets/purificador_y_alcalinizador_bajo_tarja.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR SOBRE TARJA",
			precio: 399,
			precioCompra: 7200,
			cantidad: 1,
			idProducto: 6,
			imagen: "./assets/purificador_y_alcalinizador_sobre_tarja.png"
		}
	];

	$scope.zipcode = zipcodesDirective;
	$scope.logeado = false;

	$scope.promociones = [];
	$scope.vendedores = [];

	if ($routeParams.param1){
		// console.log($routeParams.param1);
		try {
			var find = "'";
			var re = new RegExp(find, 'g');

			$scope.registro = JSON.parse(($routeParams.param1).replace(re,'"'));
		} catch (err) {
			console.log(err);
			alert("Información enviada invalida");
		}

	}

	if (!$scope.registro.suscripciones)
		$scope.registro.suscripciones = [];

	if (!$scope.registro.cliente)
	$scope.registro.cliente = {
		nombre: null,
	  apellido: null,
	  email:  null,
	  telefono: null,
	  tipoTelefono: null,
	  telefono2: null,
	  tipoTelefono2: null
	};

			var opts = {
		  lines: 13, // The number of lines to draw
		  length: 7, // The length of each line
		  width: 4, // The line thickness
		  radius: 10, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 60, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  left: 'auto' // Left position relative to parent in px
		};

		$scope.descuento = 0;

		$http({
			 url: './back/clientes.php',
	     method: 'POST',
	     headers: {
	        "Content-Type": "application/x-www-form-urlencoded",
	        "X-Login-Ajax-call": 'true'
	    	},
	     data: 'action=getPromociones'})
	     .success( function(res) {

	     		// console.log(res);
	     		if (res.success == true) {
	     			$scope.promociones = res.root;
	     			
	     		} else {

	     		}
	     });

	     $http({
			 url: './back/clientes.php',
	     method: 'POST',
	     headers: {
	        "Content-Type": "application/x-www-form-urlencoded",
	        "X-Login-Ajax-call": 'true'
	    	},
	     data: 'action=traerVendedores'})
	     .success( function(res) {

	     		// console.log(res);
	     		if (res.success == true) {
	     			$scope.vendedores = res.root;
	     			
	     		} else {

	     		}
	     });

	 $.fn.spin = function(opts) {

    this.each(function() {

      var $this = $(this),

          data = $this.data();

 

      if (data.spinner) {
      data.spinner.stop();

        delete data.spinner;

      }

      if (opts !== false) {

        data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);

      }

    });

    return this;

  };

   $scope.hacerCheckout = function(){
  	$scope.checkout = true;
  	setTimeout(function () {
      $('html, body').animate({
        scrollTop: $("#datosBasicos").offset().top
    		}, 500);
    }, 200);
  }

  $scope.sacarSuma = function (argument) {
  	var sum = 0;
  	for (var i = $scope.registro.suscripciones.length - 1; i >= 0; i--) {
  		if (!$scope.registro.suscripciones[i].precioCompra)
  			sum += ($scope.buscarPrecio($scope.registro.suscripciones[i].idProducto) - ($scope.buscarPrecio($scope.registro.suscripciones[i].idProducto)*($scope.descuento/100)));
  		if ($scope.registro.suscripciones[i].precioCompra)
  			sum += $scope.buscarPrecioCompra($scope.registro.suscripciones[i].idProducto);
  	}
  	return sum;
  }

  $scope.agregarCompra = function(producto) {
		var productoDos = angular.copy(producto);
		productoDos.instalacion = {};
		productoDos.instalacion.codigoPostal = Number($scope.sugZipCode);
		productoDos.compraUnica = 1;
		$scope.registro.suscripciones.push(productoDos);
	};
	
	$scope.buscarPrecioCompra = function (id) {
		return $scope.catalogo.find(function(el) {
			return el.idProducto == id;
		}).precioCompra;
	};

  $scope.logearse = function() {
  	$http({
			 url: './back/clientes.php',
	     method: 'POST',
	     headers: {
	        "Content-Type": "application/x-www-form-urlencoded",
	        "X-Login-Ajax-call": 'true'
	    	},
	     data: 'action=logearse&email='+$scope.correo+'&password='+$scope.contrasena})
	     .success( function(res) {

	     		if (res.success == true) {
	     			$scope.logeado = true;
	     		$scope.registro.vendedor = res.root[0].id;
	     			
	     		} else {
	 					alert(res.messageText);

	     		}
	     });
  };

	$scope.agregarSuscripcion = function(producto) {
		var productoDos = angular.copy(producto);
		productoDos.instalacion = {};
		productoDos.instalacion.codigoPostal = Number($scope.sugZipCode);
		$scope.registro.suscripciones.push(productoDos);
	};

	$scope.quitarProducto = function(id) {
		$scope.registro.suscripciones.splice(id,1);
	};

	$scope.buscarImagen = function (id) {
		return $scope.catalogo.find(function(el) {
			return el.idProducto == id;
		}).imagen;
	};

	$scope.buscarNombre = function (id) {
		return $scope.catalogo.find(function(el) {
			return el.idProducto == id;
		}).nombre;
	};

	$scope.buscarPrecio = function (id) {
		return $scope.catalogo.find(function(el) {
			return el.idProducto == id;
		}).precio;
	};

	$scope.buscar = function (id) {
		return $scope.catalogo.find(function(el) {
			return el.idProducto == id;
		});
	};

		$(document).on('click', '.compra', function () {
		console.log("entro");
    $('html, body').animate({
        scrollTop: $("#carrScroll").offset().top
    }, 500);
});

	$scope.isIgualInstalacion = function () {

		if ($scope.igualInstalacion) {
			for (var i = 0; i<$scope.registro.suscripciones.length; i++){
				$scope.registro.suscripciones[i].facturacion = angular.copy($scope.registro.suscripciones[0].instalacion);
				$scope.registro.suscripciones[i].facturacion.notas = "";
			}
		}

	};

	$scope.validarPromocion = function() {
		// console.log($scope.promociones);
		var promo = $scope.promociones.find(function(el){
			return el.codigoPromocion == $scope.registro.codigoPromocion;
		});
		if (promo){
			$scope.diasPrueba = promo.diasPrueba;

			return $scope.descuento = promo.descuento;
		}
		$scope.promoValida = true;
		$scope.diasPrueba = 0;
		return $scope.descuento = 0;
	};

	$scope.isMismaDireccion = function () {
		// console.log("entro");
		if ($scope.mismaDireccion) {
		// console.log("entro if");

			for (var i = 0; i<$scope.registro.suscripciones.length; i++){
				$scope.registro.suscripciones[i].instalacion = angular.copy($scope.registro.suscripciones[0].instalacion);
			}
		} 
	};

	$scope.isMismaFacturacion = function () {

		if ($scope.mismaFacturacion) {
			for (var i = 0; i<$scope.registro.suscripciones.length; i++){
				$scope.registro.suscripciones[i].facturacion = angular.copy($scope.registro.suscripciones[0].facturacion);
			}
		}

	};

	$scope.mismaDireccionLongitud = function () {
		if ($scope.mismaDireccion) {
			return 1;
		}
		return $scope.registro.suscripciones.length;
	};

	$scope.mismaFacturacionLongitud = function () {
		if ($scope.mismaFacturacion) {
			return 1;
		}
		return $scope.registro.suscripciones.length;
	};

	$scope.isRequiereFacturacion = function() {

		if ($scope.requiereFacturacion){
			
			return true;
		}
		else {
			for (var i = 0; i<$scope.registro.suscripciones.length; i++){
				$scope.registro.suscripciones[i].facturacion = null;
			}
			return false;
		}
	};

	$scope.successCard = function(res) {
		$scope.registro.tarjeta = {};
		$scope.registro.tarjeta.nombre = res.data.card.holder_name;
		$scope.registro.tarjeta.numero = res.data.card.card_number;
		$scope.registro.tarjeta.marca = res.data.card.brand;
		$scope.registro.tarjeta.vigencia = res.data.card.expiration_month+"/"+res.data.card.expiration_year;
		$scope.registro.tarjeta.token = res.data.id;
		$scope.registro.tarjeta.session = deviceSessionId;
		$http({
			 url: './back/clientes.php',
	     method: 'POST',
	     headers: {
	        "Content-Type": "application/x-www-form-urlencoded",
	        "X-Login-Ajax-call": 'true'
	    	},
	     data: 'action=addRegistro&registro='+JSON.stringify($scope.registro)})
	     .success( function(res) {

	     		// console.log(res);
	     		if (res.success == true) {
	     			$('#orden').modal('show'); 
	     			$('#preview1').spin(false);
						$scope.cargando = false;

	     			$http({
							 url: './back/clientes.php',
					     method: 'POST',
					     headers: {
					        "Content-Type": "application/x-www-form-urlencoded",
					        "X-Login-Ajax-call": 'true'
					    	},
					     data: 'action=sendEmails&cliente='+$scope.registro.cliente.nombre+" "+$scope.registro.cliente.apellido+"&email="+$scope.registro.cliente.email+"&suscripciones="+JSON.stringify($scope.registro.suscripciones)})
					     .success( function(res) {

					     		// console.log(res);
					     		if (res.success == true) {

					     			
					     		} else {

					     		}
					     });
	     		} else {
	 					alert(res);
	 					$scope.textoBoton = "Generar Pago";
	 					$('#preview1').spin(false);
	 					$scope.cargando = false;
	     		}
	     });
	};

	$scope.errorCard = function(res) {
		// console.log(res);
		$scope.errorTexto = res.message;
		$scope.errorTarjeta = true;
		$scope.textoBoton = "Generar Pago";

    $('#preview1').spin(false);
		$scope.cargando = false;


	};
	$scope.hacerPedido = function() {
		$scope.errorTarjeta = false;
		$scope.textoBoton = "Cargando...";
		$('#preview1').spin();
		$scope.cargando = true;

		OpenPay.token.extractFormAndCreate($('#processCard'), $scope.successCard, $scope.errorCard);
	};

	$scope.buscarZipCode = function(code){
		var sug = $scope.zipcode.find(function(el) {
			return el.code == code;
		})
		if (sug){
			// console.log(sug.ncias);
			return $scope.suges = sug.sugerencia;
		}
		$scope.suges = [
		{
			nombre: "PURIFICADOR DE ALTA CAPACIDAD",
			precio: 400,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 3,
			imagen: "./assets/purificador_de_alta_capacidad.png"
		},{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE OSMOSIS INVERSA",
			precio: 1102,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 8,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "DISPENSADOR DE AGUA FRIA Y CALIENTE DE CARBÓN ACTIVADO",
			precio: 928,
			precioCompra: 0,
			cantidad: 1,
			idProducto: 7,
			imagen: "./assets/dispensador_agua_fria_caliente.jpg"
		},
		{
			nombre: "PURIFICADOR DE CARBÓN ACTIVADO CON PLATA COLOIDAL",
			precio: 199,
			precioCompra: 2400,
			cantidad: 1,
			idProducto: 2,
			imagen: "./assets/purificador_de_carbono-activado-con-planta-coloidal.png"
		},
		{
			nombre: "PURIFICADOR DE ÓSMOSIS INVERSA",
			precio: 349,
			precioCompra: 5500,
			cantidad: 1,
			idProducto: 4,
			imagen: "./assets/purificador_de_osmosis.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR BAJO TARJA",
			precio: 299,
			precioCompra: 4800,
			cantidad: 1,
			idProducto: 5,
			imagen: "./assets/purificador_y_alcalinizador_bajo_tarja.png"
		},
		{
			nombre: "PURIFICADOR Y ALCALINIZADOR SOBRE TARJA",
			precio: 399,
			precioCompra: 7200,
			cantidad: 1,
			idProducto: 6,
			imagen: "./assets/purificador_y_alcalinizador_sobre_tarja.png"
		}
	];
		// $scope.suges = [{idProducto: 2},{idProducto: 3},{idProducto: 4},{idProducto: 5},{idProducto: 6},{idProducto: 7}];
	}; 

	$scope.recargar = function() { 
		$route.reload();
	}



}]);