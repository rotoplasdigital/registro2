'use strict';

angular.module('myApp.view1', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider)
            {
                $routeProvider.when('/registro/:param1', {
                    templateUrl: 'view1/view1.html',
                    controller: 'View1Ctrl'
                });
                $routeProvider.when('/registro/', {
                    templateUrl: 'view1/view1.html',
                    controller: 'View1Ctrl'
                });
            }])

        .controller('View1Ctrl', ['$scope', '$http', '$location', '$routeParams', '$route', 'MyService', 'zipcodesDirective', function ($scope, $http, $location, $routeParams, $route, MyService, zipcodesDirective)
            {
                var produccion = true;
                if (produccion)
                {
                    OpenPay.setId('');
                    OpenPay.setApiKey('');
                }
                else
                {
                    OpenPay.setId('');
                    OpenPay.setApiKey('');
                    OpenPay.setSandboxMode(true);
                }

                $scope.rol = 2;
                $scope.registro = {};
                $scope.registro.vendedor = 0;

                $scope.checkout = false;
                $scope.vendedores = [];

                $scope.logeado = true;
                var deviceSessionId = OpenPay.deviceData.setup("processCard", "deviceIdHiddenFieldName");
                $scope.suges = [];

                $scope.registro.solicitudUSuario = {
                    ClienteId: 0,
                    TarjetaId: 0,
                    FacturacionId: 0,
                    DireccionId: 0,
                    deviceSessionId: null,
                    facturacionUnica: false,
                    direccionUnica: false,
                    existe: false
                }

                $scope.cargando = false;
                $scope.promoValida = false;
                $scope.textoBoton = "Generar Pago";

                $http({
                    url: './back/clientes.php',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Login-Ajax-call": 'true'
                    },
                    data: 'action=traerVendedores'
                })
                        .success(function (res)
                        {

                            // console.log(res);
                            if (res.success == true)
                            {
                                $scope.vendedores = res.root;

                            }
                            else
                            {

                            }
                        });

                $http({
                    url: './back/productos.php',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Login-Ajax-call": 'true'
                    },
                    data: 'action=traerProductos'
                })
                        .success(function (res)
                        {

                            // console.log(res);
                            if (res.success == true)
                            {
                                $scope.catalogo = res.root;

                            }
                            else
                            {

                            }
                        });

                $scope.logearse = function ()
                {
                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=logearseVendedor&email=' + $scope.correo + '&password=' + $scope.contrasena
                    })
                            .success(function (res)
                            {


                                if (res.success == true)
                                {
                                    if (res.root[0].rol == 1)
                                    {
                                        $scope.suges = $scope.catalogo;
                                    }
                                    $scope.logeado = true;
                                    $scope.registro.vendedor = res.root[0].id;
                                    $scope.rol = res.root[0].rol;
                                }
                                else
                                {
                                    alert(res.messageText);

                                }
                            });
                };

                $scope.zipcode = zipcodesDirective;

                // console.log("$scope.zipcode", $scope.zipcode);

                $scope.promociones = [];

                if ($routeParams.param1)
                {
                    // console.log($routeParams.param1);
                    try
                    {
                        var find = "'";
                        var re = new RegExp(find, 'g');

                        $scope.registro = JSON.parse(($routeParams.param1).replace(re, '"'));
                    }
                    catch (err)
                    {
                        console.log(err);
                        $('#errorModal').modal('show');
                    }

                }

                if (!$scope.registro.suscripciones)
                    $scope.registro.suscripciones = [];

                if (!$scope.registro.cliente)
                    $scope.registro.cliente = {
                        nombre: null,
                        apellido: null,
                        email: null,
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
                    data: 'action=getPromociones'
                })
                        .success(function (res)
                        {

                            if (res.success == true)
                            {
                                $scope.promociones = res.root;

                                $scope.promociones.forEach(function (promo)
                                {
                                    promo.productos = JSON.parse(promo.productos);
                                });
                                // console.log("$scope.promociones", $scope.promociones);

                            }
                            else
                            {

                            }
                        });

                $.fn.spin = function (opts)
                {

                    this.each(function ()
                    {

                        var $this = $(this),
                                data = $this.data();



                        if (data.spinner)
                        {
                            data.spinner.stop();

                            delete data.spinner;

                        }

                        if (opts !== false)
                        {

                            data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);

                        }

                    });

                    return this;

                };

                $scope.hacerCheckout = function ()
                {
                    $scope.checkout = true;
                    setTimeout(function ()
                    {
                        $('html, body').animate({
                            scrollTop: $("#datosBasicos").offset().top
                        }, 500);
                    }, 200);
                }

                $scope.sacarSuma = function (argument)
                {
                    var sum = 0;
                    for (var i = $scope.registro.suscripciones.length - 1; i >= 0; i--)
                    {
                        sum += $scope.generarPrecio($scope.registro.suscripciones[i]);
                    }
                    return sum;
                }

                $scope.agregarSuscripcion = function (producto)
                {
                    var productoDos = angular.copy(producto);
                    productoDos.instalacion = {};
                    productoDos.instalacion.codigoPostal = ($scope.sugZipCode);
                    productoDos.compraUnica = 0;
                    $scope.registro.suscripciones.push(productoDos);
                    setTimeout(function ()
                    {
                        $('html, body').animate({
                            scrollTop: $("#carrScroll").offset().top
                        }, 500);
                    }, 200);
                };

                $scope.agregarCompra = function (producto)
                {
                    var productoDos = angular.copy(producto);
                    productoDos.instalacion = {};
                    productoDos.instalacion.codigoPostal = ($scope.sugZipCode);
                    productoDos.compraUnica = 1;
                    $scope.registro.suscripciones.push(productoDos);
                    setTimeout(function ()
                    {
                        $('html, body').animate({
                            scrollTop: $("#carrScroll").offset().top
                        }, 500);
                    }, 200);
                };

                $scope.quitarProducto = function (id)
                {
                    $scope.registro.suscripciones.splice(id, 1);
                };

                $scope.buscarNombre = function (id)
                {
                    return $scope.catalogo.find(function (el)
                    {
                        return el.idProducto == id;
                    }).nombre;
                };

                $scope.buscarImagen = function (id)
                {
                    return $scope.catalogo.find(function (el)
                    {
                        return el.idProducto == id;
                    }).imagen;
                };

                $scope.buscarPrecio = function (id)
                {
                    return $scope.catalogo.find(function (el)
                    {
                        return el.idProducto == id;
                    }).precio;
                };

                $scope.buscarPrecioCompra = function (id)
                {
                    return $scope.catalogo.find(function (el)
                    {
                        return el.idProducto == id;
                    }).precioCompra;
                };

                $scope.buscar = function (id)
                {
                    return $scope.catalogo.find(function (el)
                    {
                        return el.idProducto == id;
                    });
                };

                $(document).on('click', '.compra', function ()
                {

                    $('html, body').animate({
                        scrollTop: $("#carrScroll").offset().top
                    }, 500);
                });

                $scope.validarPromocion = function ()
                {
                    // console.log($scope.promociones);
                    // $timeout(function () {
                    // 	$scope.promoValida = false;
                    // 	console.log("funciona");
                    // }, 1000);

                    setTimeout(action => {
                        $scope.promoValida = false;
                    }, 1000);

                    var promo = $scope.promociones.find(function (el)
                    {
                        return el.codigo == $scope.registro.codigoPromocion;
                    });
                    if (promo)
                    {
                        promo.productos.forEach(function (idProducto)
                        {
                            $scope.registro.suscripciones.forEach(function (producto)
                            {
                                if (!producto.promociones)
                                {
                                    producto.promociones = [];
                                }
                                if (producto.idProducto == idProducto.idProducto)
                                {
                                    var val = 0;
                                    producto.promociones.forEach(function (pro)
                                    {
                                        if (pro == promo)
                                        {
                                            val = 1;
                                        }
                                        if (pro.tipo == promo.tipo)
                                        {

                                            if (pro.tipo == 1)
                                            {
                                                if (Number(pro.usos) < Number(promo.usos))
                                                {
                                                    producto.promociones = producto.promociones.filter(function (element)
                                                    {
                                                        return element.id != pro.id;
                                                    });
                                                    producto.promociones.push(promo);

                                                }
                                            }
                                            if (pro.tipo == 2)
                                            {
                                                if (Number(pro.descuento) < Number(promo.descuento))
                                                {
                                                    producto.promociones = producto.promociones.filter(function (element)
                                                    {
                                                        return element.id != pro.id;
                                                    });
                                                    producto.promociones.push(promo);
                                                }
                                            }
                                            if (pro.tipo == 3)
                                            {
                                                if (Number(pro.descuento) * Number(pro.usos) < Number(promo.descuento) * Number(promo.usos))
                                                {
                                                    producto.promociones = producto.promociones.filter(function (element)
                                                    {
                                                        return element.id != pro.id;
                                                    });
                                                    producto.promociones.push(promo);
                                                }
                                            }
                                            if (pro.tipo == 4)
                                            {
                                                if (Number(pro.descuento) * Number(pro.usos) < Number(promo.descuento) * Number(promo.usos))
                                                {
                                                    producto.promociones = producto.promociones.filter(function (element)
                                                    {
                                                        return element.id != pro.id;
                                                    });
                                                    producto.promociones.push(promo);
                                                }
                                            }

                                            val = 1;
                                        }
                                    });

                                    /*
                                     * Promocionas por compras
                                     */
                                    if (!val)
                                        if (producto.compraUnica == 0)
                                        {
                                            //RENTA
                                            producto.promociones.push(promo);
                                        }
                                        else
                                        {
                                            $scope.promoPurchaseFail = true;
                                            $scope.timeoutWarnPromoPurchase();
                                            if (promo.tipo != 1 && promo.tipo != 3)
                                            {
                                                //producto.promociones.push(promo);
                                            }
                                        }
                                }
                            })
                        })
                        // console.log("$scope.registro.suscripciones", $scope.registro.suscripciones);
                    }
                    else
                    {
                        $scope.promoValida = true;
                    }
                };

                $scope.delWarnPromoPurchase = function ()
                {
                    $scope.promoPurchaseFail = false;
                }

                $scope.timeoutWarnPromoPurchase = function ()
                {
                    window.setTimeout(function ()
                    {
                        $scope.delWarnPromoPurchase();
                    }, 3000);
                    $scope.apply();
                }

                $scope.quitarError = function ()
                {
                    $scope.promoValida = false;

                }

                $scope.traerDireccion = function (producto)
                {
                    if (producto.codigoPostal)
                    {
                        var data = {
                            postalcode: producto.codigoPostal,
                            country: 'MX',
                            username: 'soychelero'
                        };
                        $http({
                            url: 'https://secure.geonames.org/postalCodeLookupJSON?postalcode=' + data.postalcode + '&country=MX&username=soychelero',
                            method: 'GET'
                        })
                                // dataType: 'jsonp',
                                // headers: {"Access-Control-Allow-Origin":"*"}
                                .success(function (res)
                                {
                                    console.log(res);
                                    producto.estado = res.postalcodes[0].adminName1;
                                    producto.ciudad = res.postalcodes[0].adminName3;
                                    producto.municipio = res.postalcodes[0].adminName2;
                                    producto.colonia = res.postalcodes[0].placeName;
                                });
                    }

                }


                $scope.quitarPromo = function (producto, promo)
                {
                    producto.promociones = producto.promociones.filter(function (element)
                    {
                        return element.id != promo.id;
                    });
                }

                $scope.isMismaDireccion = function ()
                {
                    // console.log("entro");
                    if ($scope.mismaDireccion)
                    {
                        // console.log("entro if");
                        $scope.registro.solicitudUSuario.direccionUnica = true;
                        $scope.direccionUnica = true;
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            $scope.registro.suscripciones[i].instalacion = angular.copy($scope.registro.suscripciones[0].instalacion);
                        }
                    }
                };

                $scope.isMismaFacturacion = function ()
                {

                    if ($scope.mismaFacturacion)
                    {
                        $scope.registro.solicitudUSuario.facturacionUnica = true;
                        $scope.facturacionUnica = true;
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            $scope.registro.suscripciones[i].facturacion = angular.copy($scope.registro.suscripciones[0].facturacion);
                        }
                    }

                };

                $scope.isIgualInstalacion = function ()
                {

                    if ($scope.igualInstalacion)
                    {
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            $scope.registro.suscripciones[i].facturacion = angular.copy($scope.registro.suscripciones[0].instalacion);
                        }
                    }

                };

                $scope.mismaDireccionLongitud = function ()
                {
                    if ($scope.mismaDireccion)
                    {
                        return 1;
                    }
                    return $scope.registro.suscripciones.length;
                };

                $scope.mismaFacturacionLongitud = function ()
                {
                    if ($scope.mismaFacturacion)
                    {
                        return 1;
                    }
                    return $scope.registro.suscripciones.length;
                };

                $scope.isRequiereFacturacion = function ()
                {

                    if ($scope.requiereFacturacion)
                    {

                        return true;
                    }
                    else
                    {
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            $scope.registro.suscripciones[i].facturacion = null;
                        }
                        return false;
                    }
                };

                $scope.successCard = function (res)
                {
                    $scope.registro.tarjeta = {};
                    $scope.registro.tarjeta.nombre = res.data.card.holder_name;
                    $scope.registro.tarjeta.numero = res.data.card.card_number;
                    $scope.registro.tarjeta.marca = res.data.card.brand;
                    $scope.registro.tarjeta.vigencia = res.data.card.expiration_month + "/" + res.data.card.expiration_year;
                    $scope.registro.tarjeta.token = res.data.id;
                    $scope.registro.tarjeta.session = deviceSessionId;
                    $scope.registro.solicitudUSuario = {};
                    $scope.registro.solicitudUSuario.direccionUnica = ($scope.direccionUnica) ? $scope.direccionUnica : null;
                    $scope.registro.solicitudUSuario.facturacionUnica = ($scope.facturacionUnica) ? $scope.facturacionUnica : null;


                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=addRegistro&registro=' + JSON.stringify($scope.registro)
                    })
                            .success(function (res)
                            {

                                if (res.Resultado.success == true)
                                {
                                    $scope.agendarInstalacion(res);
                                    //$('#orden').modal('show');
                                    $('#preview1').spin(false);
                                    $scope.cargando = false;
                                    //$scope.registraVentaZoho(res);
                                    /**
                                     *  Registro de ventas en Zoho
                                     */
                                    $scope.registraVentaZoho(res);
                                    /**
                                     * Registrar facturacion electronica
                                     */
                                    //$scope.solicitarFacturacion(res.Resultado.idTransaccion);
                                    /**
                                     * HTTP POST
                                     */
                                    $http({
                                        url: './back/clientes.php',
                                        method: 'POST',
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            "X-Login-Ajax-call": 'true'
                                        },
                                        data: 'action=sendEmails&cliente=' + $scope.registro.cliente.nombre + " " + $scope.registro.cliente.apellido + "&email=" + $scope.registro.cliente.email + "&productos=" + JSON.stringify($scope.registro.suscripciones)
                                    }).success(function (res)
                                    {
                                        // console.log(res);
                                        if (res.success == true)
                                        {
                                        }
                                        else
                                        {
                                        }
                                    });
                                    for (var i = $scope.registro.suscripciones.length - 1; i >= 0; i--)
                                    {
                                        $scope.registro.suscripciones[i].primerPago = $scope.generarPrecio($scope.registro.suscripciones[i]);
                                    }
                                }
                                else
                                {

                                    $scope.RequestError = res.Request;
                                    $("#errorRequestModal").modal("show");
                                    $scope.textoBoton = "Generar Pago";
                                    $('#preview1').spin(false);
                                    $scope.cargando = false;
                                }
                            });
                }
                ;

                $scope.generarPrecio = function (producto)
                {
                    var precio = 0;

                    var listaDescuentos = [];
                    var listaIncrementos = [];
                    var saldoRentas = [];
                    var saldoCompras = [];
                    var descuentoMaximo = 0;


                    if (!producto.promociones || producto.promociones.length === 0)
                    {
                        //Entra este bloque en caso de que no haya Promociones disponibles;
                        if (producto.compraUnica)
                        {
                            precio = parseFloat(producto.precioCompra);
                        }
                        else
                        {
                            precio = parseFloat(producto.precio);
                        }
                    }
                    else
                    {
                        var rentaProducto = parseFloat(producto.precio);
                        var calculado = 0;
                        producto.promociones.forEach(function (promo)
                        {
                            if (promo.tipo == "1")
                            {
                                listaDescuentos.push(promo.descuento);
                            }
                            if (promo.tipo == "3" || promo.tipo == "2")
                            {
                                listaDescuentos.push(promo.descuento);
                            }
                            if (promo.tipo == "4")
                            {
                                listaIncrementos.push(promo.descuento);
                            }

                        });

                        descuentoMaximo = Math.max(...listaDescuentos);



                        if (listaIncrementos.length > 0 && listaDescuentos.length == 0)
                        {
                            precio = rentaProducto + ((listaIncrementos.pop() / 100) * rentaProducto);
                        }

                        if (listaIncrementos.length == 0 && listaDescuentos.length > 0)
                        {
                            precio = rentaProducto - ((descuentoMaximo / 100) * rentaProducto);
                        }

                        if (listaIncrementos.length > 0 && listaDescuentos.length > 0)
                        {
                            calculado = rentaProducto + ((listaIncrementos.pop() / 100) * rentaProducto);
                            precio = calculado - ((descuentoMaximo / 100) * calculado);
                        }
                    }
                    //console.log(precio);
                    return precio;
                }

                $scope.errorCard = function (res)
                {
                    $scope.RequestError = res.data.description;
                    $("div#RequestError").html("<p>" + res.data.description + "</p>");
                    $("#errorRequestModal").modal("show");
                    $scope.textoBoton = "Generar Pago";
                    $('#preview1').spin(false);
                    $scope.cargando = false;
                    $scope.onerror();
                    $("#sendPayment").prop('disabled', false);
                };

                $scope.onerror = function ()
                {
                    //$("div#RequestError").html("");
                    $scope.textoBoton = "Generar Pago";
                    $('#preview1').spin(false);
                    $scope.errorTexto = "Datos de Pago erroneos";
                    $scope.errorTarjeta = true;
                    $scope.cargando = false;
                }

                $scope.clearError = function ()
                {
                    $("div#RequestError").html("<p></p>");
                    $scope.RequestError = "";
                }

                $scope.hacerPedido = function ()
                {

                    $scope.errorTarjeta = false;
                    $scope.textoBoton = "Cargando...";
                    $('#preview1').spin();
                    $scope.cargando = true;

                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=validarCorreo&correo=' + $scope.registro.cliente.email
                    })
                            .success(function (res)
                            {
                                if (res.Existe == false)
                                {
                                    OpenPay.token.extractFormAndCreate($('#processCard'), $scope.successCard, $scope.errorCard);
                                }
                                else
                                {

                                    $scope.errorTexto = "Ese correo ya esta en uso; Para comprar otro producto favor de comunicarte con uno de nuestros acesores";
                                    $scope.errorTarjeta = true;
                                    $scope.textoBoton = "Generar Pago";

                                    $('#preview1').spin(false);
                                    $scope.cargando = false;
                                    $('#inputCorreo').focus();
                                }

                            });
                };


                //Aqui se buscan los Zipcodes que estan en la Directiva de Fabrica con los ZipCodes
                $scope.buscarZipCode = function (code)
                {

                    if (code.length > 5)
                    {
                        var sug = $scope.zipcode.find(function (el)
                        {
                            return el.code == code;
                        })

                        if (sug === undefined)
                        {
                            //$("#errorModalCP").modal("show");
                            $scope.cphasError = true;
                        }

                    }

                    if (code.length == 5)
                    {
                        var sug = $scope.zipcode.find(function (el)
                        {
                            return el.code == code;
                        })

                        if (sug === undefined)
                        {
                            //$("#errorModalCP").modal("show");
                            $scope.cphasError = true;
                        }

                    }


                    if (sug)
                    {

                        // console.log(sug.sugerencias);
                        $scope.cphasError = false;

                        setTimeout(function ()
                        {
                            $('html,body').animate({
                                scrollTop: $("#sellSection").offset().top
                            }, 500);
                            $scope.$apply();
                        }, 500);

                        return $scope.suges = sug.sugerencia;
                    }


                    if ($scope.rol == 1)
                    {
                        $scope.suges = $scope.catalogo;

                    }
                    else
                    {
                        $scope.suges = [];

                    }

                    // $scope.suges = [{idProducto: 2},{idProducto: 3},{idProducto: 4},{idProducto: 5},{idProducto: 6},{idProducto: 7}];

                };

                $scope.recargar = function ()
                {
                    $route.reload();
                }

                $scope.agendarInstalacion = function (resp)
                {


                    //var url = $scope.agendarUrlZona;
                    var codigosPostalesAgendas;
                    var items = [];
                    var suscripciones = resp.Request.suscripciones;
                    var contenido = "";

                    suscripciones.forEach(function (reg, i)
                    {
                        items.push(reg.instalacion.codigoPostal);
                        codigosPostalesAgendas = Array.from(new Set(items))
                    });

                    codigosPostalesAgendas.forEach(function (cp, id)
                    {
                        var parametros = $scope.zipcode.find(function (el)
                        {
                            return el.code == cp;
                        })
                        var url = "";
                        var getParams = "&firstName=" + resp.Request.cliente.nombre + "&lastName=" + resp.Request.cliente.apellido + "&phone=" + resp.Request.cliente.telefono + "&email=" + resp.Request.cliente.email + "&field:4710367=" + null + "&field:4709507=" + resp.Request.suscripciones[0].Subcripcionid;
                        if (parametros.calendario)
                        {
                            url = parametros.calendario;
                        }
                        else
                        {
                            url = "https://rotoplas.as.me/schedule.php?"
                        }

                        contenido = "Código Postal: " + cp;
                        contenido += "<iframe width='100%' id='" + id + "' src='" + url + getParams + "' height='570px' frameBorder='1'></iframe>";
                        contenido += "<br>";
                        $("#agendaBody").append(contenido);
                    });
                    $("#agenda").modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                }

                $scope.callSuccess = function ()
                {

                    setTimeout(function ()
                    {
                        $('#orden').modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                    }, 500);
                }

                $scope.registraVentaZoho = function (resp)
                {
                    $http({
                        url: "./back/ZohoIntegracion.php",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: "action=insertarVentas&data=" + JSON.stringify(resp)
                    }).success(res => {
                        console.log(res)
                    });
                }

                $scope.desplazar = function ()
                {
                    $('html,body').animate({
                        scrollTop: $("#sellSection").offset().top
                    }, 2000);
                }

                $scope.movetoSell = function ()
                {
                    $('html,body').animate({
                        scrollTop: $("#sellSection").offset().top
                    }, 2000);
                }

                $scope.autoLoadFunctions = function ()
                {
                    $("#brandingCRS").carousel();
                }

                $scope.autoLoadFunctions();

                $scope.solicitarFacturacion = function ($idTransaccion)
                {
                    $http({
                        url: "./back/Facturacion.php",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: "action=generarFactura&idTransaccion=" + $idTransaccion
                    }).success(res => {
                        console.log(res)
                    });
                }

            }]);


