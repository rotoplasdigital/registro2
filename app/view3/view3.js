'use strict';

angular.module('myApp.view3', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider)
            {
                $routeProvider.when('/registroInterno/:param1', {
                    templateUrl: 'view3/view3.html',
                    controller: 'View3Ctrl'
                });
                $routeProvider.when('/registroInterno/', {
                    templateUrl: 'view3/view3.html',
                    controller: 'View3Ctrl'
                });
            }])

        .controller('View3Ctrl', ['$scope', '$http', '$location', '$routeParams', '$route', 'MyService', 'zipcodesDirective', function ($scope, $http, $location, $routeParams, $route, MyService, zipcodesDirective)
            {

                $scope.logeado = false;


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
                $scope.hasSale = false;
                $scope.getSession = function ()
                {
                    var userEmail = localStorage.getItem("userEmail");
                    var userId = localStorage.getItem("userId");
                    var userName = localStorage.getItem("userName");
                    var dateTimeLog = localStorage.getItem("dateTimeLog");
                    $scope.type = localStorage.getItem("type");
                    var d = new Date();
                    var f = new Date(dateTimeLog);
                    var horaActual = d.getHours();
                    var horaSesion = f.getHours();
                    $scope.userName = localStorage.getItem("userName");
                    var difMin = horaActual - horaSesion;
                    if (userEmail)
                    {
                        if (difMin < 0)
                        {
                            $scope.logeado = false;
                        }
                        else
                        {
                            if (difMin < 4)
                            {
                                $scope.logeado = true;
                            }
                            else
                            {
                                $scope.logeado = false;
                            }
                        }



                    }

                };
                $scope.getSession();
                $scope.checkout = false;
                $scope.vendedores = [];
                // $scope.logeado = false;
                var deviceSessionId = OpenPay.deviceData.setup("processCard", "deviceIdHiddenFieldName");
                $scope.suges = [];
                $scope.registro = {};
                $scope.registro.Usuario = {
                    Direcciones: "",
                    Id: 0,
                    Type: "",
                    correoElectronico: localStorage.getItem("userEmail")
                };
                $scope.cargando = false;
                $scope.promoValida = false;
                $scope.textoBoton = "Generar Pago";
                $scope.registro.solicitudUSuario = {
                    ClienteId: "",
                    TarjetaId: "",
                    FacturacionId: "",
                    DireccionId: "",
                    deviceSessionId: deviceSessionId,
                    facturacionUnica: false,
                    direccionUnica: false,
                    existe: false
                }

                $http({
                    url: './back/productos.php',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Login-Ajax-call": 'true'
                    },
                    data: 'action=traerProductos'
                }).success(function (res)
                {
                    if (res.success === true)
                    {
                        $scope.catalogo = res.root;
                    }

                });
                $http({
                    url: './back/clientes.php',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Login-Ajax-call": 'true'
                    },
                    data: 'action=traerVendedores'
                }).then(res => {
                    if (res.status === 200)
                    {
                        if (res.data.success === true)
                        {
                            $scope.vendedores = res.data.root;
                        }
                        $scope.registro.vendedor = localStorage.getItem("userId");
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
                    }).success(function (res)
                    {


                        if (res.success == true)
                        {
                            if (res.root[0].rol == 1)
                            {
                                $scope.suges = $scope.catalogo;
                            }
                            $scope.logeado = true;
                            $scope.registro.vendedor = res.root[0].id;
                            $scope.rol = parseInt(res.root[0].rol);
                            // Añadimos para mantener la sesion despues de activo
                            var d = new Date();
                            var fechaLogin = d.toISOString();
                            localStorage.setItem("dateTimeLog", fechaLogin);
                            localStorage.setItem("type", res.root[0].type);
                            localStorage.setItem("userEmail", res.root[0].email);
                            localStorage.setItem("userId", res.root[0].id);
                            localStorage.setItem("userName", res.root[0].name);
                            localStorage.setItem("idRol", res.root[0].rol);
                            $route.reload();
                        }
                        else
                        {
                            alert(res.messageText);
                        }
                    });
                };
                $scope.zipcode = zipcodesDirective;
                // console.log("$scope.zipcode", $scope.zipcode);

                /*
                 * Aqui cachamos todo los parametros que vamos a recibir via GET enviados por ZohoCRM
                 * 
                 */

                $scope.promociones = [];
                if ($routeParams.param1)
                {

                    //console.log($routeParams.param1);
                    try
                    {
                        var requestString = $routeParams.param1;
                        requestString = requestString.replace("+", "");
                        var regex = new RegExp("\'", "g");
                        requestString = requestString.replace(regex, "\"");
                        var dataRequest = JSON.parse(requestString);
                        console.log(dataRequest);
                        //$scope.registro = dataRequest;

                        $scope.registro.cliente = {
                            nombre: dataRequest.cliente.nombre,
                            apellido: dataRequest.cliente.apellido,
                            email: dataRequest.cliente.email,
                            telefono: dataRequest.cliente.telefono,
                            tipoTelefono: dataRequest.cliente.tipoTelefono,
                            telefono2: dataRequest.cliente.telefono2,
                            tipoTelefono2: dataRequest.cliente.tipoTelefono2,
                            zohoId: dataRequest.cliente.zohoId
                        };
                        $scope.registro.cliente.zohoId = String(dataRequest.cliente.zohoId);
                        console.log(dataRequest.cliente.zohoId);
                        console.log(String(dataRequest.cliente.zohoId));
                        console.log($scope.registro.cliente);
                    }
                    catch (err)
                    {
                        // console.log(err);
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
                        tipoTelefono2: null,
                        zohoId: null
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

                $scope.isZipUnique = function ()
                {
                    if ($scope.registro.suscripciones.length < 2)
                    {
                        return false;
                    }
                    else
                    {


                        // registro.suscripciones.length > 1
                        var zip = [];
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            zip.push($scope.registro.suscripciones[i].instalacion.codigoPostal);
                        }

                        function countUnique(iterable)
                        {
                            return new Set(iterable).size;
                        }
                        return (countUnique(zip) > 1) ? false : true;
                    }

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
                };
                $scope.agregarCompra = function (producto)
                {
                    var productoDos = angular.copy(producto);
                    productoDos.instalacion = {};
                    productoDos.instalacion.codigoPostal = ($scope.sugZipCode);
                    productoDos.compraUnica = 1;
                    $scope.registro.suscripciones.push(productoDos);
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
                /*
                 +---------------------------------------------------------------------------------------
                 |	Busqueda por claven en objeto.
                 +---------------------------------------------------------------------------------------
                 */
                $scope.direccionXid = function (code)
                {
                    var data = $scope.DireccionesCliente;
                    return data.filter(
                            function (data)
                            {
                                return data.DireccionId == code
                            }
                    );
                }

                $scope.facturacionXid = function (code)
                {
                    var data = $scope.FactuacionCliente;
                    return data.filter(
                            function (data)
                            {
                                return data.FacturacionId == code
                            }
                    );
                }

                $scope.targetaXId = function (code)
                {
                    var data = $scope.TarjetaCliente;
                    return data.filter(
                            function (data)
                            {
                                return data.TarjetaId == code
                            }
                    );
                }

                $scope.validarPromocion = function ()
                {
                    // console.log($scope.promociones);
                    $scope.promoValida = false;
//                    var promo = $scope.promociones.find(function (el)
//                    {
//                        return el.codigo == $scope.registro.codigoPromocion;
//                    });
                    var promo;
                    $http({
                        url: './back/Promociones.class.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=getPromocion&codigoPromocion=' + $scope.registro.codigoPromocion
                    }).success(resp => {
                        promo = resp.data;
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

                                                if (pro.tipo == "1")
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
                                                if (pro.tipo == "2")
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
                                                if (pro.tipo == "3")
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
                                                if (pro.tipo == "4")
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
//                                            else
//                                            {
//                                                $scope.promoPurchaseFail = true;
//                                                $scope.timeoutWarnPromoPurchase();
//                                                if (promo.tipo != 1 && promo.tipo != 3)
//                                                {
//                                                    //producto.promociones.push(promo);
//                                                }
//                                            }
                                    }
                                })
                            })
                            // console.log("$scope.registro.suscripciones", $scope.registro.suscripciones);
                            $scope.calcularPromociones();
                        }
                        else
                        {
                            $scope.calcularPromociones();
                            $scope.promoValida = true;
                        }

                    });
                };
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

                        $scope.calcularPromociones();
                        return element.id !== promo.id;
                    });
                }

                $scope.isMismaDireccion = function ()
                {
                    // console.log("entro");
                    if ($scope.mismaDireccion)
                    {
                        // console.log("entro if");
                        $scope.registro.solicitudUSuario.direccionUnica = true;
                        for (var i = 0; i < $scope.registro.suscripciones.length; i++)
                        {
                            $scope.registro.suscripciones[i].instalacion = angular.copy($scope.registro.suscripciones[0].instalacion);
                        }

                        function countUnique(iterable)
                        {
                            return new Set(iterable).size;
                        }


                    }
                };
                $scope.isMismaFacturacion = function ()
                {

                    if ($scope.mismaFacturacion)
                    {
                        $scope.registro.solicitudUSuario.facturacionUnica = true;
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
                // Funciones de Requeridos

                $scope.requiereTarjetaCredito = function (id)
                {
                    $scope.registro.tarjeta = {};
                    if ($scope.requiereTarjeta)
                    {
                        return true;
                    }
                    else
                    {

                        $scope.registro.tarjeta.nombre = null;
                        $scope.registro.tarjeta.numero = null;
                        $scope.registro.tarjeta.marca = null;
                        $scope.registro.tarjeta.vigencia = null;
                        $scope.registro.tarjeta.token = null;
                        $scope.registro.tarjeta.session = null;
                        return false;
                    }
                }


                $scope.successCard = function (res)
                {
                    $scope.registro.tarjeta = {};
                    $scope.registro.tarjeta.nombre = res.data.card.holder_name;
                    $scope.registro.tarjeta.numero = res.data.card.card_number;
                    $scope.registro.tarjeta.marca = res.data.card.brand;
                    $scope.registro.tarjeta.vigencia = res.data.card.expiration_month + "/" + res.data.card.expiration_year;
                    $scope.registro.tarjeta.token = res.data.id;
                    $scope.registro.tarjeta.session = deviceSessionId;
                    $scope.registro.vendedor = localStorage.getItem("userId");
                    $scope.registro.tipoCliente = "Residencial";
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
                                    var d = new Date(res.Request.fecha);
                                    var fechaOrden = d.toLocaleDateString();
                                    for (var i = $scope.registro.suscripciones.length - 1; i >= 0; i--)
                                    {
                                        $scope.registro.suscripciones[i].primerPago = $scope.generarPrecio($scope.registro.suscripciones[i]);
                                    }
                                    $scope.registraVentaZoho(res);
                                    $http({
                                        url: './back/clientes.php',
                                        method: 'POST',
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            "X-Login-Ajax-call": 'true'
                                        },
                                        data: 'action=sendEmails&cliente=' + $scope.registro.cliente.nombre + " " + $scope.registro.cliente.apellido + "&email=" + $scope.registro.cliente.email + "&productos=" + JSON.stringify(res.Request.suscripciones) + "&oc=" + res.Request.ordenCompra + "&referencia=" + res.Request.referencia + "&fecha=" + fechaOrden + "&subcripcion=" + res.Request.SubcripcionId
                                    })
                                            .success(function (res)
                                            {
                                                if (res.success == true)
                                                {
                                                }
                                                else
                                                {
                                                }
                                            });
                                }
                                else
                                {
                                    $scope.textoBoton = "Generar Pago";
                                    $('#preview1').spin(false);
                                    $scope.cargando = false;
                                    $scope.RequestError = res.Request;
                                    $("#errorRequestModal").modal("show");
                                }
                            });
                };
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



                $scope.calcularPromociones = function ()
                {
                    /**
                     * 
                     * @description Realiza el calculo de promociones ingresados a los productos 
                     */
                    var montoSum = [];
                    var montoRes = [];
                    var montosSinPromo = [];
                    var montosCompra = [];
                    var sumPrecioCompra = 0;
                    var montosSum = 0;
                    var montosRes = 0;
                    var montosTot = 0;
                    var listaDescuentos = [];
                    var listaIncrementos = [];
                    var total = 0;
                    var descuentoMayor = 0;
                    var promo = false;
                    var suscripciones = $scope.registro.suscripciones;
                    var totalaPagar = 0;
                    suscripciones.forEach(s => {
                        if (s.compraUnica === 0)
                        {
                            var montoInicial = parseFloat(s.precio);
                            montosSinPromo.push(montoInicial);
                            if (s.promociones && s.promociones.length > 0)
                            {
                                promo = true;
                                var promociones = s.promociones;
                                if (promociones)
                                {
                                    promociones.forEach(pr => {
                                        if (pr.tipo === "1")
                                        {
                                            var descuento = parseFloat(pr.descuento);
                                            listaDescuentos.push(descuento);
                                        }

                                        if (pr.tipo === "3" || pr.tipo === "2")
                                        {
                                            var descuento = parseFloat(pr.descuento);
                                            listaDescuentos.push(descuento);
                                        }
                                        if (pr.tipo === "4")
                                        {
                                            var descuento = parseFloat(pr.descuento);
                                            listaIncrementos.push(descuento);
                                        }
                                    });
                                }
                            }
                            else
                            {
                                promo = false;
                            }
                        }
                        else
                        {
                            var montoInicial = parseFloat(s.precioCompra);
                            montosCompra.push(montoInicial);
                        }
                    });
                    if (promo == true)
                    {


                        if (listaDescuentos.length > 0 && listaIncrementos.length == 0)
                        {
                            var sinPromo = 0;
                            descuentoMayor = Math.max(...listaDescuentos);
                            montosSinPromo.forEach(sums => {
                                sinPromo += sums;
                            });

                            total = sinPromo - ((descuentoMayor / 100) * sinPromo);

                        }

                        if (listaDescuentos.length == 0 && listaIncrementos.length > 0)
                        {
                            var sinPromo = 0;
                            montosSinPromo.forEach(sums => {
                                sinPromo += sums;
                            });
                            var primer = listaIncrementos.pop();
                            total = sinPromo + ((primer / 100) * sinPromo);
                        }

                        if (listaDescuentos.length > 0 && listaIncrementos.length > 0)
                        {
                            var primer = listaIncrementos.pop();
                            var sinPromo = 0;
                            montosSinPromo.forEach(sums => {
                                sinPromo += sums;
                            });
                            var totalIncremento = sinPromo + ((primer / 100) * sinPromo);
                            descuentoMayor = Math.max(...listaDescuentos);
                            total = totalIncremento - ((descuentoMayor / 100) * totalIncremento);
                        }


                        montosCompra.forEach(calc => {
                            sumPrecioCompra += calc;
                        });

                        totalaPagar = total + ((sumPrecioCompra > 0) ? sumPrecioCompra : 0);

                    }
                    else
                    {
                        var montoPrecioCompra = 0;
                        montosCompra.forEach(calc => {
                            montoPrecioCompra += calc;
                        });

                        var sinPromo = 0;
                        montosSinPromo.forEach(sums => {
                            sinPromo += sums;
                        });
                        totalaPagar = sinPromo + montoPrecioCompra;

                    }

                    return totalaPagar;

                };


                $scope.errorCard = function (resp)
                {
                    $("div#RequestError").html("<p>" + resp.data.description + "</p>");


                    $scope.RequestError = resp.data.description;

                    $("#errorRequestModal").modal("show");
                    $scope.textoBoton = "Generar Pago";
                    $('#preview1').spin(false);
                    $scope.cargando = false;
                    $scope.onerror();
                };
                $scope.onerror = function ()
                {
                    //$("div#RequestError").html("<p></p>");
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

                /* 
                 +--------------------------------------------------------------------------------------------------------------
                 |	AQUI SE REALIZA LA PETICION PARA REALIZAR LA SUSCRIPCION DEL CLIENTE
                 +--------------------------------------------------------------------------------------------------------------
                 */
                $scope.hacerPedido = function ()
                {

                    //$scope.errorTarjeta = false;
                    //$scope.textoBoton = "Cargando...";
                    $('#preview1').spin();
                    $scope.cargando = true;
                    /* 
                     +--------------------------------------------------------------------------------------------------------------
                     |	SOLICITUD DE EXISTENCIA DE CORREO ELECTRONICO
                     +--------------------------------------------------------------------------------------------------------------
                     */
                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=validarCorreo&correo=' + $scope.registro.cliente.email
                    }).then(resp => {

                        if (resp.data.Existe)
                        {
                            $scope.registro.solicitudUSuario.ClienteId = resp.data.Usuario.id;
                            $scope.validarTargeta();
                            //$scope.errorTexto = "Este usuario ya ha sido registrado anteriormente";
                            //$scope.errorTarjeta = true;
                            $scope.textoBoton = "Generar Pago";
                            //$('#preview1').spin(false);
                            //$scope.cargando = false;
                            //$('#inputCorreo').focus();

                        }
                        else
                        {
                            //successCard
                            //OpenPay.token.extractFormAndCreate($('#processCard'), $scope.agregarSuscripcionCliente, $scope.errorCard);
                            OpenPay.token.extractFormAndCreate($('#processCard'), $scope.successCard, $scope.errorCard);
                        }

                    });
                };
                $scope.buscarZipCode = function (code)
                {
                    var tipo = localStorage.getItem("type");
                    var sug = $scope.zipcode.find(function (el)
                    {
                        return el.code == code;
                    })

                    if (tipo === 'admin')
                    {
                        if (sug)
                        {
                            $scope.suges = $scope.catalogo;
                        }
                        else
                        {
                            $scope.suges = [];
                        }

                    }
                    else
                    {
                        if (sug)
                        {
                            $scope.agendarUrlZona = sug.calendario;
                            return $scope.suges = sug.sugerencia;
                        }
                        else
                        {
                            $scope.suges = [];
                        }
                    }


                    // $scope.suges = [{idProducto: 2},{idProducto: 3},{idProducto: 4},{idProducto: 5},{idProducto: 6},{idProducto: 7}];
                };
                $scope.recargar = function ()
                {
                    $route.reload();
                }


                $scope.logout = function ()
                {
                    $scope.logeado = false;
                    localStorage.setItem("userEmail", null);
                    localStorage.setItem("userId", null);
                    localStorage.setItem("userName", null);
                    localStorage.setItem("dateTimeLog", null);
                    localStorage.setItem("type", null);
                }

                $scope.ClienteRegistrado = function ()
                {
                    /* 
                     +--------------------------------------------------------------------------------------------------------------
                     |	SOLICITUD DE EXISTENCIA DE CORREO ELECTRONICO
                     +--------------------------------------------------------------------------------------------------------------
                     */
                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=validarCorreo&correo=' + $scope.registro.cliente.email
                    }).then(resp => {
                        if (resp.data.Existe)
                        {
                            $scope.errorTexto = "Acabas de capturar un correo de un cliente actual, por lo que el formulario se actualizo con sus datos actuales.";
                            $scope.errorTarjeta = true;
                            $scope.registro.solicitudUSuario.existe = true;
                            $scope.registro.cliente.nombre = resp.data.Usuario.nombre;
                            $scope.registro.cliente.apellido = resp.data.Usuario.apellido;
                            $scope.registro.cliente.email = resp.data.Usuario.email;
                            $scope.registro.cliente.telefono = resp.data.Usuario.telefono;
                            $scope.registro.cliente.tipoTelefono = resp.data.Usuario.tipoTelefono;
                            $scope.registro.cliente.telefono2 = resp.data.Usuario.telefono2;
                            $scope.registro.cliente.tipoTelefono2 = resp.data.Usuario.tipoTelefono2;
                            $scope.registro.solicitudUSuario.ClienteId = resp.data.Usuario.id;
                            $scope.DatosClienteRegistrado(resp.data.Usuario.id, $scope.sugZipCode);
                        }
                        else
                        {
                            $scope.registro.solicitudUSuario.existe = false;
                            $scope.errorTexto = "No se ha encontrado ningun usuario con este correo electrónico.";
                            $scope.errorTarjeta = true;
                        }
                    });
                }
                /* 
                 +--------------------------------------------------------------------------------------------------------------
                 |	SOLICITUD DE EXISTENCIA DE CORREO ELECTRONICO
                 +--------------------------------------------------------------------------------------------------------------
                 */

                $scope.DatosClienteRegistrado = function (ClienteId, codigoPostal)
                {
                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=conseguirInfoClienteXid&ClienteId=' + ClienteId + '&codigoPostal=' + codigoPostal
                    }).then(resp => {
                        var data = resp.data;
                        //Habilitar los datos de Direccion
                        $scope.DireccionesCliente = data.Domicilio;
                        $scope.FactuacionCliente = data.Facturacion;
                        $scope.TarjetaCliente = data.Credito;
                    });
                }

                $scope.direccionExistenteSeleccionada = function ()
                {
                    if ($scope.registro.direccion.id)
                    {

                        if ($scope.registro.direccion.id != "0")
                        {
                            var direccion = $scope.direccionXid($scope.registro.direccion.id);
                            $scope.registro.suscripciones[0].instalacion = direccion[0]; //
                            $scope.registro.solicitudUSuario.DireccionId = $scope.registro.direccion.id
                            //suscripcion.instalacion.codigoPostal // sugZipCode
                        }
                        else
                        {
                            $scope.registro.suscripciones[0].instalacion.codigoPostal = $scope.sugZipCode;
                        }
                    }
                }

                $scope.facturacionExistenteSeleccionada = function ()
                {
                    var factura = $scope.facturacionXid($scope.suscripcion.facturacion.FacturacionId);
                    $scope.registro.suscripciones[0].facturacion = factura[0];
                    $scope.registro.suscripciones[0].facturacion.razonSocial = factura[0].RazonSocial;
                    $scope.registro.solicitudUSuario.FacturacionId = $scope.suscripcion.facturacion.FacturacionId;
                }

                $scope.tarjetaexistenteRegistrada = function ()
                {


                    $scope.registro.solicitudUSuario.TarjetaId = $scope.targetaId;
                    if ($scope.targetaId != 0 || $scope.targetaId != "" || $scope.targetaId !== undefined)
                    {
                        $http({
                            url: './back/clientes.php',
                            method: "post",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "X-Login-Ajax-call": 'true'
                            },
                            data: 'action=traerDatosTarjetaCliente&clienteId=' + $scope.registro.solicitudUSuario.ClienteId + '&tarjetaId=' + $scope.registro.solicitudUSuario.TarjetaId
                        }).success(res => {
                            $scope.registro.tarjeta.nombre = res.nombre;
                            $scope.registro.tarjeta.numero = res.numero;
                            $scope.registro.tarjeta.marca = res.marca;
                            $scope.registro.tarjeta.vigencia = res.vigencia;
                            $scope.registro.tarjeta.token = res.tokenCard;
                            $scope.registro.tarjeta.session = res.sessionDevice;
                        });
                        $scope.requiereTarjeta = false;
                    }
                    if ($scope.targetaId == "0" || $scope.targetaId == "")
                    {
                        $scope.requiereTarjeta = true;
                    }

                }

                $scope.validarTargeta = function ()
                {
                    if ($scope.targetaId == 0 || $scope.targetaId == "" || $scope.targetaId == undefined)
                    {
                        OpenPay.token.extractFormAndCreate($('#processCard'), $scope.agregarSuscripcionCliente, $scope.errorCard);
                    }
                    else
                    {
                        $scope.agregarSuscripcionCliente(false);
                    }
                }

                $scope.agregarSuscripcionCliente = function (res)
                {
                    if (res)
                    {
                        $scope.registro.tarjeta.nombre = res.data.card.holder_name;
                        $scope.registro.tarjeta.numero = res.data.card.card_number;
                        $scope.registro.tarjeta.marca = res.data.card.brand;
                        $scope.registro.tarjeta.vigencia = res.data.card.expiration_month + "/" + res.data.card.expiration_year;
                        $scope.registro.tarjeta.token = res.data.id;
                        $scope.registro.tarjeta.session = deviceSessionId;
                    }
                    else
                    {
                        $scope.tarjetaexistenteRegistrada();
                    }


                    $scope.registro.solicitudUSuario.facturacionUnica = ($scope.mismaFacturacion) ? true : false;
                    $scope.registro.Usuario.Direcciones = $scope.mismaDireccion;
                    // Parametros Adicionales 
                    $scope.registro.Usuario.Id = localStorage.getItem("userId");
                    $scope.registro.Usuario.Type = localStorage.getItem("type");
                    $scope.registro.Usuario.facturacion = $scope.requiereFacturacion;
                    $http({
                        url: './back/clientes.php',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "X-Login-Ajax-call": 'true'
                        },
                        data: 'action=agregarSuscripcionCliente&registro=' + JSON.stringify($scope.registro)
                    }).success(resp => {
                        if (resp.Resultado.success == true)
                        {
                            $scope.cargando = true;
                            var d = new Date(resp.Request.fecha);
                            var fechaOrden = d.toLocaleDateString();
                            $scope.agendarInstalacion(resp);
                            //$('#orden').modal('show');
                            $('#preview1').spin(false);
                            $scope.cargando = false;
                            for (var i = $scope.registro.suscripciones.length - 1; i >= 0; i--)
                            {
                                $scope.registro.suscripciones[i].primerPago = $scope.generarPrecio($scope.registro.suscripciones[i]);
                            }
                            /**
                             *  Registro de ventas en Zoho
                             */
                            $scope.registraVentaZoho(resp);
                            /**
                             * Registrar facturacion electronica
                             */
                            //$scope.solicitarFacturacion(resp.Resultado.idTransaccion);
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
                                data: 'action=sendEmails&cliente=' + $scope.registro.cliente.nombre + " " + $scope.registro.cliente.apellido + "&email=" + $scope.registro.cliente.email + "&productos=" + JSON.stringify(resp.Request.suscripciones) + "&oc=" + null + "&referencia=" + resp.Request.referencia + "&fecha=" + fechaOrden + "&subcripcion=" + resp.Resultado.id
                            }).success(function (res)
                            {
                                if (res.success == true)
                                {
                                }
                                else
                                {
                                }
                            });
                        }
                        else
                        {

                            $scope.textoBoton = "Generar Pago";
                            $('#preview1').spin(false);
                            $scope.cargando = false;
                            $scope.RequestError = resp.Request;
                            $("#errorRequestModal").modal("show");
                        }
                    });
                }

                $scope.showHiddenArea = function ()
                {
                    console.log("showing");
                    $scope.hasSale = true;
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
                        var getParams = "&firstName=" + resp.Request.cliente.nombre + "&lastName=" + resp.Request.cliente.apellido + "&phone=" + resp.Request.cliente.telefono + "&email=" + resp.Request.cliente.email + "&field:4710367=" + resp.Request.Usuario.correoElectronico + "&field:4709507=" + resp.Request.suscripciones[0].Subcripcionid;
                        if (parametros.calendario)
                        {
                            url = parametros.calendario;
                        }
                        else
                        {
                            url = "https://rotoplas.as.me/schedule.php?"
                        }
                        // $scope.callSuccess();
                        // Envio
//                        var win = window.open(url + getParams, '_blank');
//                        win.focus();

                        contenido = "Código Postal: " + cp;
                        contenido += "<iframe class='acuityFrame' src='" + url + getParams + "'></iframe>";
                        contenido += "<br>";
                        $("#agendaSectionBody").append(contenido);
                    });
                    $scope.hasSale = true;
//                    $("#agenda").modal({
//                        backdrop: 'static',
//                        keyboard: false
//                    });
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
