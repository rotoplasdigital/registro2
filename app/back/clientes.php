<?php

require ("credentials.php");
require ("sqlConnections.php");
require ("sendEmail.php");
require 'Suscripcion.class.php';

date_default_timezone_set("America/Mexico_City");

//Quitar en Desarrollo
error_reporting(0);

function RandomString()
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randstring = '';
    for ($i = 0; $i < 10; $i++)
    {
        $randstring = $randstring . $characters[rand(0, strlen($characters))];
    }
    return $randstring;
}

$OpenPay = getOpenpay();
session_start();



switch ($_REQUEST['action'])
{
    case "addCliente":
        addCliente(null);
        break;
    case "addRegistro":
        addRegistro($OpenPay);
        break;
    case "getClientes":
        getClientes();
        break;
    case "getCliente":
        getCliente();
        break;
    case "updateDatosBasicos":
        updateDatosBasicos();
        break;
    case "updateInstalacion":
        updateInstalacion();
        break;
    case "updateFacturacion":
        updateFacturacion();
        break;
    case "sendEmails":
        sendEmails();
        break;
    case "logearse":
        logearse();
        break;
    case "getPromociones":
        getPromociones();
        break;
    case "logearseVendedor":
        logearseVendedor();
        break;
    case "traerVendedores":
        traerVendedores();
        break;
    case "validarCorreo":
        validarCorreo();
        break;
    case "enviarRequestPostAPI":
        enviarRequestPostAPI();
        break;
    case "conseguirInfoClienteXid":
        conseguirInfoClienteXid();
        break;
    case "agregarSuscripcionCliente":
        agregarSuscripcionCliente($OpenPay);
        break;
    case "traerDatosTarjetaCliente":
        traerDatosTarjetaCliente();
        break;
    case "testApi":
        calcularPromociones();
        break;
    default:
        echo '';
        break;
}

function addCliente($cliente)
{

    if ($cliente == null)
        $cliente = json_decode($_REQUEST['cliente']);

    $query = "INSERT INTO Cliente (nombre, apellido, email, telefono, tipoTelefono, telefono2, tipoTelefono2, tipoCliente, status, token, fuente) VALUES ('" . $cliente->nombre . "','" . $cliente->apellido . "','" . $cliente->email . "','" . $cliente->telefono . "','" . $cliente->tipoTelefono . "','" . $cliente->telefono2 . "','" . $cliente->tipoTelefono2 . "','" . $cliente->tipoCliente . "','Activo','" . $customer->id . "','E-commerce' )";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

/*
  +-----------------------------------------------------------------------------------------------------------------------------------
  |   FUNCION DE VALIDACION DE CORREO ELECTRONICO
  +-----------------------------------------------------------------------------------------------------------------------------------
 */

function validarCorreo()
{
    $response = [];

    if ($_POST['correo'])
    {

        $query = "SELECT id, nombre, apellido, email, telefono,tipoTelefono, telefono2, tipoTelefono2 FROM Cliente WHERE email = '" . $_POST['correo'] . "';";
        $queryRst = executeQuery($query);

        $cliente = $queryRst['root'][0];
        if ($queryRst['records'] > 0)
        {
            $existe = true;
        } else
        {
            $existe = false;
        }

        $response = array(
            "Existe" => $existe,
            "Usuario" => array(
                "id" => $cliente['id'],
                "nombre" => $cliente['nombre'],
                "apellido" => $cliente['apellido'],
                "email" => $cliente['email'],
                "telefono" => $cliente['telefono'],
                "tipoTelefono" => $cliente['tipoTelefono'],
                "telefono2" => $cliente['telefono2'],
                "tipoTelefono2" => $cliente['tipoTelefono2']
            )
        );
    } else
    {
        $response = array(
            "Existe" => false
        );
    }

    echo json_encode($response);
}

/*
  +-----------------------------------------------------------------------------------------------------------------------------------
  |   FUNCION PRINCIPAL DE REGISTRO DE SUSCRIPCIONES, CLIENTES, FACTURACION, PRODUCTOS Y DEMAS
  +-----------------------------------------------------------------------------------------------------------------------------------
  |   *Se han detectado varios problemas para mantener la integridad de la informacion al utilizar esta funcion.
  |   -> Uno de ellos es que se guarda el cliente, aun sin haber recivido la confirmacion de creacion de la suscripcion.
 */

function addRegistro($openpay)
{
//    PC    Primer Cargo
//    CP    Compra
//    MN    Mensualidad
//    CU    Cargo Único
//    IN    Intento
//    PR    Parcialidad

    $registro = json_decode($_POST['registro']);
    setTransaccion($registro, $openpay);
}

function sendEmails()
{
    $nombre = $_REQUEST['cliente'];
    $email = $_REQUEST['email'];
    $contenido = json_decode($_REQUEST['productos'], true);
    $oc = $_REQUEST['oc'];
    $referencia = $_REQUEST['referencia'];
    $fecha = $_REQUEST['fecha'];
    $subscripcion = $_REQUEST['subscripcion'];
    sendEmailCompra($email, $nombre, $contenido, $oc, $referencia, $fecha, $subcripcion);
}

function getClientes()
{

    $query = "Select * from Cliente";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function getCliente()
{

    $query = "Select * from Cliente where id = '" . $_REQUEST['idClient'] . "'";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function updateInstalacion()
{
    $cliente = json_decode($_REQUEST['client']);

    for ($i = 0; $i < sizeof($cliente->instalacion); $i++)
    {
        $direccion = $cliente->instalacion[$i];
        $query = "UPDATE Direccion set calle = '" . $direccion->calle . "', numInt = '" . $direccion->numInt . "', numExt = '" . $direccion->numExt . "', colonia = '" . $direccion->colonia . "', municipio = '" . $direccion->municipio . "', ciudad = '" . $direccion->ciudad . "', estado = '" . $direccion->estado . "'  where Direccion.id = '" . $direccion->id . "'";

        $queryRst = executeQuery($query);
    }


    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function updateFacturacion()
{
    $cliente = json_decode($_REQUEST['client']);

    for ($i = 0; $i < sizeof($cliente->facturacion); $i++)
    {
        $direccion = $cliente->facturacion[$i];
        $query = "UPDATE Facturacion set razonSocial = '" . $direccion->razonSocial . "', RFC = '" . $direccion->RFC . "', calle = '" . $direccion->calle . "', numInt = '" . $direccion->numInt . "', numExt = '" . $direccion->numExt . "', colonia = '" . $direccion->colonia . "', municipio = '" . $direccion->municipio . "', ciudad = '" . $direccion->ciudad . "', estado = '" . $direccion->estado . "'  where Facturacion.id = '" . $direccion->id . "'";

        $queryRst = executeQuery($query);
    }


    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function updateDatosBasicos()
{
    $cliente = json_decode($_REQUEST['client']);
    $query = "UPDATE Cliente set nombre = '" . $cliente->nombre . "', apellido = '" . $cliente->apellido . "', email = '" . $cliente->email . "', tipoTelefono = '" . $cliente->tipoTelefono . "', telefono = '" . $cliente->telefono . "', tipoTelefono2 = '" . $cliente->tipoTelefono2 . "', telefono2 = '" . $cliente->telefono2 . "'  where Cliente.id = '" . $cliente->id . "'";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function getPromociones()
{

    $query = "Select * from Promocion where (vigencia IS NULL AND fechaInicial IS NULL) OR (vigencia >= CURDATE() AND fechaInicial < CURDATE()) OR (vigencia >= CURDATE() AND fechaInicial IS NULL) OR (fechaInicial < CURDATE() AND vigencia IS NULL)";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

function logearse()
{
    $queryValidar = "SELECT * FROM User WHERE email = '" . $_REQUEST['email'] . "'";
    $queryValidarRst = executeQuery($queryValidar);
    if ($queryValidarRst['root'][0]['password'] == $_REQUEST['password'] && $queryValidarRst['records'] != 0 && $queryValidarRst['root'][0]['status'] == "Activo" && $queryValidarRst['root'][0]['type'] == 'admin')
    {
        $query = "SELECT * FROM User WHERE email = '" . $_REQUEST['email'] . "'";
        $queryRst = executeQuery($query);
        echo json_encode($queryRst);
    } else
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = "Contraseña o Correo incorrectos, Validar informacion";
        echo json_encode($queryRst);
    }
}

function logearseVendedor()
{
    $queryValidar = "SELECT * FROM User WHERE email = '" . $_REQUEST['email'] . "'";
    $queryValidarRst = executeQuery($queryValidar);

    if ($queryValidarRst['root'][0]['password'] == $_REQUEST['password'] && $queryValidarRst['records'] != 0 && $queryValidarRst['root'][0]['status'] == "Activo")
    {
        $query = "SELECT * FROM User WHERE email = '" . $_REQUEST['email'] . "'";
        $queryRst = executeQuery($query);
        echo json_encode($queryRst);
    } else
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = "Contraseña o Correo incorrectos, Validar informacion";
        echo json_encode($queryRst);
    }
}

function traerVendedores()
{
    $query = "Select name, id from User";

    $queryRst = executeQuery($query);

    if (isset($_SESSION['error_sql']) && $_SESSION['error_sql'] != "")
    {
        $queryRst['success'] = false;
        $queryRst['messageText'] = $_SESSION['error_sql'];
    }
    confirm($queryRst['success']);
    echo json_encode($queryRst);
}

/*
  +-----------------------------------------------------------------------------------------------------------------------------------
  |   OBTENEMOS LA INFORMACION RECURRENTE DEL CLIENTE REGISTRADO( Domicilios, Facturacion, Credito )
  +-----------------------------------------------------------------------------------------------------------------------------------
 */

function conseguirInfoClienteXid()
{
    if ($_POST['ClienteId'])
    {
        $clienteId = $_POST['ClienteId'];
        $codigoPostal = $_POST['codigoPostal'];

        $clienteDirecciones = array();
        $clienteFacturacion = array();
        $clienteCredito = array();

        $sqlDireccion = "SELECT
        cli.id as ClienteId
        ,dir.id as DireccionId
        ,dir.calle
        ,dir.numInt
        ,dir.numExt
        ,dir.localidad
        ,dir.notas
        ,dir.colonia
        ,dir.municipio
        ,dir.ciudad
        ,dir.estado
        ,dir.pais
        ,dir.codigoPostal
        FROM Cliente as cli
        INNER JOIN Direccion as dir
        ON dir.idCliente = cli.id
        WHERE cli.id = " . $clienteId . " AND dir.codigoPostal = " . $codigoPostal . ";";

        $outDireccion = executeQuery($sqlDireccion);
        if ($outDireccion["records"] > 0)
        {
            foreach ($outDireccion['root'] as $dir)
            {

                array_push($clienteDirecciones, $dir);
            }
        } else
        {
            $clienteDirecciones = false;
        }

        $sqlFacturacion = "SELECT
        cli.id as ClienteId
        ,fac.id as FacturacionId
        ,fac.razonSocial as RazonSocial
        ,fac.RFC
        ,fac.notas
        FROM Cliente as cli
        INNER JOIN Facturacion as fac
        ON fac.idCliente = cli.id
        WHERE cli.id = " . $clienteId . ";";

        $outFacturacion = executeQuery($sqlFacturacion);
        if ($outFacturacion["records"] > 0)
        {
            foreach ($outFacturacion['root'] as $fac)
            {

                array_push($clienteFacturacion, $fac);
            }
        } else
        {
            $clienteFacturacion = false;
        }

        $sqlCredito = "SELECT
        cli.id as ClienteId
        ,crt.id as TarjetaId
        ,crt.vigencia
        ,crt.numero
        ,crt.nombre
        ,crt.marca
        FROM Cliente as cli
        INNER JOIN Tarjeta as crt
        ON crt.idCliente = cli.id
        WHERE cli.id = " . $clienteId . ";";

        $outCredito = executeQuery($sqlCredito);
        if ($outCredito["records"] > 0)
        {
            foreach ($outCredito['root'] as $crts)
            {
                $vigencia = explode('/', $crts['vigencia']);
                $credito = [
                    "Terminacion" => substr($crts["numero"], -4),
                    "TarjetaId" => $crts['TarjetaId'],
                    "VigenciaMes" => $vigencia[0],
                    "VigenciaAnio" => $vigencia[1],
                    "Nombre" => $crts["nombre"],
                    "Marca" => $crts["marca"]
                ];

                array_push($clienteCredito, $credito);
            }
        } else
        {
            $clienteCredito = false;
        }

        $response = array(
            "Domicilio" => $clienteDirecciones,
            "Facturacion" => $clienteFacturacion,
            "Credito" => $clienteCredito
        );
    } else
    {
        $response = array(
            "Domicilio" => false,
            "Facturacion" => false,
            "Credito" => false
        );
    }
    echo json_encode($response);
}

function traerDatosTarjeta($tarjetaId, $clienteId)
{
//$token = [];
    $sql = "SELECT
    c.sesion,
    t.token,
    c.token as tokenCliente
    FROM Cliente as c
    INNER JOIN Tarjeta as t
    ON t.idCliente = c.id
    WHERE c.id = " . $clienteId . "
    AND t.id = " . $tarjetaId;
    $outCredito = executeQuery($sql);
    foreach ($outCredito['root'] as $tc)
    {
        $token = [
            "tokenCard" => $tc["token"],
            "sessionDevice" => $tc["sesion"],
            "tokenCliente" => $tc["tokenCliente"]
        ];
    }

    return $token;
}

function opCustomerId($clienteId)
{
//$token = [];
    $sql = "SELECT
    c.token as tokenCliente
    FROM Cliente as c
    WHERE c.id = " . $clienteId;
    $outCredito = executeQuery($sql);
    foreach ($outCredito['root'] as $tc)
    {
        $token = [
            "tokenCliente" => $tc["tokenCliente"]
        ];
    }

    return $token;
}

function traerDatosTarjetaCliente()
{
//$token = [];
    $sql = "SELECT
    c.sesion,
    t.token,
    c.token as tokenCliente,
    t.vigencia,
    t.numero,
    t.nombre,		
    t.marca
    FROM Cliente as c
    INNER JOIN Tarjeta as t
    ON t.idCliente = c.id
    WHERE c.id = " . $_POST['clienteId'] . "
    AND t.id = " . $_POST['tarjetaId'];
    $outCredito = executeQuery($sql);
    foreach ($outCredito['root'] as $tc)
    {
        $token = [
            "tokenCard" => $tc["token"],
            "sessionDevice" => $tc["sesion"],
            "tokenCliente" => $tc["tokenCliente"],
            "vigencia" => $tc["vigencia"],
            "numero" => $tc["numero"],
            "nombre" => $tc["nombre"],
            "marca" => $tc["marca"]
        ];
    }

    echo json_encode($token);
}

/*
 * Aqui se agregar Nuevas Caracteristicas cuando se hay detectado que el cliente ya haya sido registrado.
 * Para pasar como productivo esta funcion se debe de comentar el device para que no cause problemas con la IP del dispositivo
 * 
 */

function agregarSuscripcionCliente($OpenPay)
{
    $registro = json_decode($_POST['registro']);
    setTransaccion($registro, $OpenPay);
}

function guardarDireccionInstalacion($registro, $i, $idCliente)
{
    $query = "INSERT INTO Direccion (idCliente, calle, numInt, numExt, localidad, colonia, municipio, ciudad, estado, pais, notas, codigoPostal)";
    $query .= "VALUES ('" . $idCliente . "','" . $registro->suscripciones[$i]->instalacion->calle . "','" . $registro->suscripciones[$i]->instalacion->numInt . "','" . $registro->suscripciones[$i]->instalacion->numExt . "','" . $registro->suscripciones[$i]->instalacion->localidad . "','" . $registro->suscripciones[$i]->instalacion->colonia . "','" . $registro->suscripciones[$i]->instalacion->municipio . "','" . $registro->suscripciones[$i]->instalacion->ciudad . "','" . $registro->suscripciones[$i]->instalacion->estado . "','México','" . $registro->suscripciones[$i]->instalacion->notas . "','" . $registro->suscripciones[$i]->instalacion->codigoPostal . "')";
    $queryRst = executeQuery($query);
    return $queryRst["id"];
}

function guardarFacturacionCliente($registro, $i, $idCliente)
{
    if ($registro->suscripciones[$i]->facturacion !== null)
    {
        $query = "INSERT INTO Facturacion (idCliente, razonSocial, RFC, notas) VALUES ('" . $idCliente . "','" . $registro->suscripciones[$i]->facturacion->razonSocial . "','" . $registro->suscripciones[$i]->facturacion->RFC . "','" . $registro->suscripciones[$i]->facturacion->notas . "')";
        $queryRst = executeQuery($query);
        return $queryRst["id"];
    } else
    {
        return null;
    }
}

function guardarTarjetaPagoCliente($registro, $card, $idCliente)
{
    $insertaTargeta = "INSERT INTO Tarjeta (idCliente, vigencia, numero, marca, token, nombre)";
    $insertaTargeta .= "VALUES ('" . $idCliente . "','" . $registro->tarjeta->vigencia . "','" . $registro->tarjeta->numero . "','" . $registro->tarjeta->marca . "','" . $registro->tarjeta->token . "','" . $registro->tarjeta->nombre . "')";
    $queryRst = executeQuery($insertaTargeta);
    return $queryRst["id"];
}

function guardarInformacionCliente($registro, $customer)
{

    $nuevoCliente = "INSERT INTO Cliente (nombre, apellido, email, telefono, tipoTelefono, telefono2, tipoTelefono2, tipoCliente, status,token, sesion, fuente) ";
    $nuevoCliente .= "VALUES ('" . $registro->cliente->nombre . "','" . $registro->cliente->apellido . "','" . $registro->cliente->email . "','" . $registro->cliente->telefono . "','" . $registro->cliente->tipoTelefono . "','" . $registro->cliente->telefono2 . "','" . $registro->cliente->tipoTelefono2 . "','" . $registro->cliente->tipoCliente . "','Activo','" . $customer->id . "', '" . $registro->tarjeta->session . "',  'E-commerce' )";
    $queryRst = executeQuery($nuevoCliente);

    return $queryRst["id"];
}

function actualizarInformacionCliente($registro, $idCliente)
{
    $infoCliente = "UPDATE Cliente SET nombre='" . $registro->cliente->nombre . "', apellido='" . $registro->cliente->apellido . "', email='" . $registro->cliente->email . "', telefono='" . $registro->cliente->telefono . "', tipoTelefono='" . $registro->cliente->tipoTelefono . "', telefono2='" . $registro->cliente->telefono2 . "', tipoTelefono2='" . $registro->cliente->tipoTelefono2 . "'";
    $infoCliente .= "WHERE id = " . $idCliente;
    $queryRst = executeQuery($infoCliente);
    return $queryRst["status"];
}

function deleteClient($idCliente)
{
    $sql = "DELETE FROM Cliente WHERE id = " . $idCliente;
    $result = executeQuery($sql);
    return $result["success"];
}

function deleteDireccionInstalacion($idDireccion)
{
    $sql = "DELETE FROM Direccion WHERE id = " . $idDireccion;
    executeQuery($sql);
}

function deleteSuscripcionCliente($idSuscripcion)
{
    $sql = "DELETE FROM Suscripcion WHERE id=" . $idSuscripcion;
    executeQuery($sql);
}

function deleteTarjetaCliente($idTarjeta)
{
    $sql = "DELETE FROM Tarjeta WHERE id = " . $idTarjeta;
    executeQuery($sql);
}

function deleteFacturacionCliente($idFacturacion)
{
    $sql = "DELETE FROM Facturacion WHERE id= " . $idFacturacion;
    executeQuery($sql);
}

function deleteOrdenesCargoCliente($id)
{
    $sql = "DELETE FROM OrdenesCargo WHERE idCargo= " . $id;
    executeQuery($sql);
}

function updateCargoIdOrdenCargo($id, $orden)
{
    $sql = "UPDATE OrdenesCargo SET CargoId = '" . $orden . "' WHERE idCargo = " . $id;
    executeQuery($sql);
}

function tarjetaClienteData($idTarjeta)
{
    $sql = "SELECT vigencia, numero, nombre, marca FROM Tarjeta WHERE id = " . $idTarjeta;
    $outCredito = executeQuery($sql);
    foreach ($outCredito['root'] as $tc)
    {
        $token = [
            "vigencia" => $tc["vigencia"],
            "numero" => $tc["numero"],
            "nombre" => $tc["nombre"],
            "marca" => $tc["marca"]
        ];
    }
    return $token;
}

//
//function calcularPromociones($suscripciones)
//{
//    $montoSum = [];
//    $montoRes = [];
//    $montosSinPromo = [];
//    $montosSum = 0;
//    $montosRes = 0;
//    $montosTot = 0;
//    $listaDescuentos = [];
//    $listaIncrementos = [];
//    $descuentoMayor = 0;
//    $promo = false;
//
//
//    array_push($montosSinPromo, $suscripciones->precio);
//
//    if (count($suscripciones->promociones) > 0)
//    {
//        $promo = true;
//        foreach ($suscripciones->promociones as $promos)
//        {
//            if ($promos->tipo == 4)
//            {
//                array_push($listaIncrementos, $promos->descuento);
//            }
//            if ($promos->tipo == 3 || $promos->tipo == 2)
//            {
//                array_push($listaDescuentos, $promos->descuento);
//            }
//        }
//    }
//
//
//    if ($promo === true)
//    {
//        $descuentoMaximo = max($listaDescuentos);
//
//        if (count($listaIncrementos) > 0 && count($listaDescuentos) > 0)
//        {
//            $calculoIncremento = (array_sum($montosSinPromo) + (( reset($listaIncrementos) / 100 ) * array_sum($montosSinPromo) ));
//            $calculado = $calculoIncremento - (( $descuentoMaximo / 100 ) * $calculoIncremento );
//        }
//
//        if (count($listaIncrementos) > 0 && count($listaDescuentos) == 0)
//        {
//            $calculado = (array_sum($montosSinPromo) + (( reset($listaIncrementos) / 100 ) * array_sum($montosSinPromo) ));
//        }
//
//        if (count($listaIncrementos) == 0 && count($listaDescuentos) > 0)
//        {
//            $calculado = (array_sum($montosSinPromo) - (( $descuentoMaximo / 100 ) * array_sum($montosSinPromo) ));
//        }
//
//        $total = $calculado;
//    } else
//    {
//        $total = array_sum($montosSinPromo);
//    }
//    return $total;
//}

/**
 *  Esta funciona es para realizar las suscripciones para realizar los cargos de las suscripciones
 *  @author David Lopez <dalopez@rotoplas.com>
 *  @Reviso Javier Ibarrola 
 *  @Fecha_modificación: 22/05/2018
 */
function setTransaccion($data, $OpenPay)
{

    $Operacion = new \registro\suscripcion\Operacion();
    $Suscripcion = new \registro\suscripcion\Suscripcion();
    $Transaccion = new \registro\suscripcion\Transaccion();

    $hoy = getdate();
    $fecha = date('Y-m-d H:i:s', $hoy[0]);
    $guardarSuscripciones = false;
    $montosTransaccion = [];
    $montosMG = [];
    $idUsuario = 0;
    if ($data->Usuario)
    {
        $idUsuario = $data->Usuario->Id;
    }

    $idOperacion = $Operacion->startOperacion($idUsuario, json_encode($data));

    /**
     * Iniciamos recorriendo el Objeto que envía la vista donde separamos los precios,
     * se calculan las promociones y se agregan al arreglo para verificarlo después.
     */
    foreach ($data->suscripciones as $sus)
    {
        if ($sus->compraUnica == 0)
        {
            $montoCalculado = $Suscripcion->calcularPromociones($sus);
            array_push($montosTransaccion, $montoCalculado);
            $mg = $Suscripcion->validarMesesGratis($sus);
            array_push($montosMG, $mg);
        } else
        {
            array_push($montosTransaccion, $sus->precioCompra);
        }
    }

    $totalaPagar = array_sum($montosTransaccion);

    if ($data->cliente->zohoId)
    {
        $zohoId = $data->cliente->zohoId;
    } else
    {
        $zohoId = null;
    }

    if (!$data->solicitudUSuario->ClienteId && !$data->solicitudUSuario->TarjetaId)
    {
        try
        {
            $customerData = array(
                'name' => $data->cliente->nombre,
                'last_name' => $data->cliente->apellido,
                'email' => $data->cliente->email,
                'requires_account' => false
            );

            $customerOpenPay = $OpenPay->customers->add($customerData);
        } catch (Exception $ex)
        {
            $response = [
                "Resultado" => [
                    "success" => false,
                ],
                "Request" => $ex->getMessage(),
                "ExceptionLevel" => "Registrar Cliente"
            ];

            $operacion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => $ex->getMessage(),
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);

            echo json_encode($response);
            return false;
        }

        $opidCustomer = $customerOpenPay->id;
        $customer = $OpenPay->customers->get($opidCustomer);
        try
        {
            $cardDataRequest = array(
                'token_id' => $data->tarjeta->token,
                'device_session_id' => $data->tarjeta->session
            );
            $card = $customer->cards->add($cardDataRequest);
        } catch (Exception $ex)
        {
            $response = [
                "Resultado" => [
                    "success" => false,
                ],
                "Request" => $ex->getMessage(),
                "ExceptionLevel" => "Registro Tarjeta"
            ];

            $operacion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => $ex->getMessage(),
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);
            echo json_encode($response);
            return false;
        }
    }

    if ($data->solicitudUSuario->ClienteId && !$data->solicitudUSuario->TarjetaId)
    {
        $token = $Suscripcion->opCustomerId($data->solicitudUSuario->ClienteId);
        $customer = $OpenPay->customers->get($token['tokenCliente']);
        try
        {
            $cardDataRequest = array(
                'token_id' => $data->tarjeta->token,
                'device_session_id' => $data->tarjeta->session
            );
            $card = $customer->cards->add($cardDataRequest);
        } catch (Exception $ex)
        {
            $response = [
                "Resultado" => [
                    "success" => false,
                ],
                "Request" => $ex->getMessage(),
                "ExceptionLevel" => "Registro Tarjeta"
            ];

            $operacion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => $ex->getMessage(),
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);
            echo json_encode($response);
            return false;
        }
    }

    if ($data->solicitudUSuario->ClienteId && $data->solicitudUSuario->TarjetaId)
    {
        $token = $Suscripcion->opCustomerId($data->solicitudUSuario->ClienteId);
        $customer = $OpenPay->customers->get($token['tokenCliente']);
        $payment = $Suscripcion->traerDatosTarjeta($data->solicitudUSuario->TarjetaId, $data->solicitudUSuario->ClienteId);
        $data->tarjeta->token = $payment["tokenCard"];
        try
        {
            $card = $customer->cards->get($payment["tokenCard"]);
        } catch (Exception $ex)
        {
            $response = [
                "Resultado" => [
                    "success" => false,
                ],
                "Request" => $ex->getMessage(),
                "ExceptionLevel" => "Registro Tarjeta"
            ];

            $operacion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => $ex->getMessage(),
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);
            echo json_encode($response);
            return false;
        }


        $cc = $Suscripcion->InformacionTarjetaCliente($data->solicitudUSuario->TarjetaId);
        $data->tarjeta->nombre = $cc["nombre"];
        $data->tarjeta->numero = $cc["numero"];
        $data->tarjeta->vigencia = $cc["vigencia"];
        $data->tarjeta->marca = $cc["marca"];
    }

    //$customer = $OpenPay->customers->get($OpidCustomer);


    if ($card->type == "debit")
    {

        if ($data->Usuario->correoElectronico == "dalopez@rotoplas.com" || $data->Usuario->correoElectronico == "actualizacion_cliente@rotoplas.com" || $data->Usuario->correoElectronico == "blopez@rotoplas.com" || $data->Usuario->correoElectronico == "jibarrola@rotoplas.com")
        {
            $data->Usuario->specialPermits = true;
        } else
        {
            $operacion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => "Esta es una tarjeta de débito, este comercio no admite este tipo de tarjetas.",
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);

            $response = [
                "Resultado" => [
                    "success" => false,
                ],
                "Request" => "Esta es una tarjeta de débito, este comercio no admite este tipo de tarjetas.",
                "ExceptionLevel" => "Registro Tarjeta"
            ];
            echo json_encode($response);
            return false;
        }
    }
    $data->tarjeta->token = $card->id;
    $data->tarjeta->tipo = $card->type;
    $OpCardType = $card->type;


    $random = RandomString();

    if ($totalaPagar > 0)
    {

        $transaccion = [
            "idOperacion" => $idOperacion,
            "idUsuario" => $idUsuario,
            "ChargeId" => null,
            "MessageOP" => null,
            "MontoTotal" => $totalaPagar,
            "Articulos" => count($data->suscripciones)
        ];

        $idTransaccion = $Transaccion->setTransaccion($transaccion);

        $chargeRequest = array(
            'method' => 'card',
            'source_id' => $data->tarjeta->token,
            'amount' => $totalaPagar,
            'currency' => 'MXN',
            'description' => 'Servicios Rotoplas (Primera Orden)',
            'order_id' => "TRAN:" . $idTransaccion . "/OP:" . $idOperacion . "/RND:" . $random
                //'device_session_id' => $registro->tarjeta->session
        );



        try
        {
            $charge = $customer->charges->create($chargeRequest);
            // Tratamos de Realizar el Cargo
        } catch (Exception $ex)
        {
            $transaccion = [
                "ChargeId" => null,
                "result" => false,
                "MessageOP" => $ex->getMessage(),
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($transaccion);
            $Transaccion->endTransaccion($idTransaccion, $ex->getMessage(), null);
            // Si cae aqui, en este punto se realiza el "Rollback", no se eliminara la tarjeta, ni el cliente
            $response = [
                "Resultado" => array(
                    "success" => false,
                ),
                "Request" => $ex->getMessage(),
                "ExceptionLevel" => "Realizar cargo a OP"
            ];
            echo json_encode($response);
            $guardarSuscripciones = false;

            return false;
        }

        /**
         * La operación realizada por OpenPay fue realizada con éxito.
         * Se procede a guardar la información de la suscripción.
         */
        if ($charge->status == "completed")
        {
            $OpidCustomer = $customer->id;
            $operacion = [
                "ChargeId" => $charge->id,
                "result" => true,
                "MessageOP" => null,
                "id" => $idOperacion
            ];
            $Operacion->endOperacion($operacion);
            $Transaccion->endTransaccion($idTransaccion, $charge->status, $charge->id);
            $guardarSuscripciones = true;
        }
    } else
    {
        if (count($montosMG) > 0)
        {
            $guardarSuscripciones = true;
        } else
        {
            $guardarSuscripciones = false;
        }
    }

    if ($guardarSuscripciones == true)
    {

        if ($data->solicitudUSuario->ClienteId)
        {
            $idCliente = $data->solicitudUSuario->ClienteId;
        } else
        {
            $cliente = [
                "nombre" => $data->cliente->nombre,
                "apellido" => $data->cliente->apellido,
                "email" => $data->cliente->email,
                "telefono" => $data->cliente->telefono,
                "tipoTelefono" => $data->cliente->tipoTelefono,
                "telefono2" => $data->cliente->telefono2,
                "tipoTelefono2" => $data->cliente->tipoTelefono2,
                "tipoCliente" => null,
                "status" => "Activo",
                "token" => $customer->id,
                "sesion" => ($data->tarjeta->session) ? $data->tarjeta->session : $data->solicitudUSuario->deviceSessionId,
                "fuente" => "E-commerce"
            ];
            $idCliente = $Suscripcion->SaveClienteInfo($cliente);
            $data->solicitudUSuario->ClienteId = $idCliente;
        }

        if ($data->solicitudUSuario->TarjetaId)
        {
            $idTarjeta = $data->solicitudUSuario->TarjetaId;
        } else
        {

            $data->tarjeta->token = $card->id;
            $tarjeta = [
                "idCliente" => $idCliente,
                "vigencia" => $data->tarjeta->vigencia,
                "numero" => $data->tarjeta->numero,
                "marca" => $data->tarjeta->marca,
                "token" => $card->id,
                "nombre" => $data->tarjeta->nombre,
                "tipo" => $OpCardType
            ];

            $idTarjeta = $Suscripcion->SaveCreditCartInfo($tarjeta, $idCliente);
        }



        if ($data->solicitudUSuario->direccionUnica == true)
        {
            if ($data->solicitudUSuario->DireccionId)
            {
                $idDireccion = $data->solicitudUSuario->DireccionId;
            } else
            {
                $dir = $data->suscripciones[0]->instalacion;
                $direccion = [
                    "idCliente" => $idCliente,
                    "calle" => $dir->calle,
                    "numInt" => $dir->calle,
                    "numExt" => $dir->numExt,
                    "colonia" => $dir->colonia,
                    "municipio" => $dir->municipio,
                    "ciudad" => $dir->ciudad,
                    "estado" => $dir->estado,
                    "pais" => "mexico",
                    "notas" => $dir->notas,
                    "codigoPostal" => $dir->codigoPostal,
                ];

                $idDireccion = $Suscripcion->saveDireccion($direccion);
            }
        }


        //SolicitudUsuarios
        if ($data->solicitudUSuario)
        {
            if ($data->solicitudUSuario->FacturacionId)
            {
                $idFacturacion = $data->solicitudUSuario->FacturacionId;
                $data->suscripciones[0]->facturacion->FacturacionId = $idFacturacion;
                $data->suscripciones[0]->facturacion->RazonSocial = $data->suscripcion[0]->facturacion->RazonSocial;
                $data->suscripciones[0]->facturacion->RFC = $data->suscripcion[0]->facturacion->RFC;
            } else
            {
                if ($data->solicitudUSuario->facturacionUnica == true)
                {
                    if ($data->suscripciones[0]->facturacion)
                    {
                        $fak = $data->suscripciones[0]->facturacion;
                        $facturacion = [
                            "idCliente" => $idCliente,
                            "razonSocial" => $fak->razonSocial,
                            "RFC" => $fak->RFC,
                            "notas" => $fak->notas,
                            "CorreoEnvio" => ($fak->CorreoEnvio) ? $fak->CorreoEnvio : null
                        ];

                        $idFacturacion = $Suscripcion->saveFacturacion($facturacion);

                        $data->suscripciones[0]->facturacion->FacturacionId = $idFacturacion;
                        $data->suscripciones[0]->facturacion->RazonSocial = $fak->RazonSocial;
                        $data->suscripciones[0]->facturacion->RFC = $fak->RFC;
                    }
                }
            }
        }
        $data->fecha = $fecha;
        //Realizamos las Iteraciones para guardar las Suscripciones y sus nodos.
        foreach ($data->suscripciones as $item)
        {


            if ($data->solicitudUSuario->direccionUnica == false)
            {

                if ($data->solicitudUSuario->DireccionId)
                {
                    $idDireccion = $data->solicitudUSuario->DireccionId;
                    $item->instalacion->DireccionId = $idDireccion;
                } else
                {
                    $dir = $item->instalacion;
                    $direccion = [
                        "idCliente" => $idCliente,
                        "calle" => $dir->calle,
                        "numInt" => $dir->numInt,
                        "numExt" => $dir->numExt,
                        "colonia" => $dir->colonia,
                        "municipio" => $dir->municipio,
                        "ciudad" => $dir->ciudad,
                        "estado" => $dir->estado,
                        "pais" => "mexico",
                        "notas" => $dir->notas,
                        "codigoPostal" => $dir->codigoPostal,
                    ];

                    $idDireccion = $Suscripcion->saveDireccion($direccion);
                    $item->instalacion->DireccionId = $idDireccion;
                }
            }

            if ($data->solicitudUSuario->facturacionUnica == false)
            {
                if ($data->solicitudUSuario->FacturacionId)
                {
                    $idFacturacion = $data->solicitudUSuario->FacturacionId;
                    $item->facturacion->FacturacionId = $idFacturacion;
                    $item->facturacion->RazonSocial = $data->suscripcion->facturacion->RazonSocial;
                    $item->facturacion->RFC = $data->suscripcion->facturacion->RFC;
                } else
                {
                    if ($item->facturacion)
                    {
                        $fak = $item->facturacion;
                        $facturacion = [
                            "idCliente" => $idCliente,
                            "razonSocial" => $fak->razonSocial,
                            "RFC" => $fak->RFC,
                            "notas" => $fak->notas,
                            "CorreoEnvio" => ($fak->CorreoEnvio) ? $fak->CorreoEnvio : null
                        ];
                        //FacturacionId
                        if ($data->solicitudUSuario->FacturacionId)
                        {
                            $idFacturacion = $fak->$idFacturacion;
                        } else
                        {
                            $idFacturacion = $Suscripcion->saveFacturacion($facturacion);
                        }
                        $item->facturacion->FacturacionId = $idFacturacion;
                        $item->facturacion->RazonSocial = $fak->razonSocial;
                        $item->facturacion->RFC = $fak->RFC;
                    }
                }
            }


            if ($data->Usuario)
            {
                $vendedor = $data->Usuario->Id;
            } else
            {
                $vendedor = 0;
            }

            //Iteramos las Suscripciones
            $subs = [
                "idCliente" => $idCliente,
                "idPlan" => $item->idProducto,
                "idInstalacion" => $idDireccion,
                "idFacturacion" => $idFacturacion,
                "idTarjeta" => $idTarjeta,
                "fechaCreacion" => "",
                "fechaInstalacion" => NULL,
                "statusInstalacion" => "Pendiente",
                "fechaMantenimiento" => NULL,
                "fechaCobro" => NULL,
                "token" => $idOperacion,
                "status" => "Activa",
                "compraUnica" => $item->compraUnica,
                "vendedor" => $vendedor,
                "DealId" => $zohoId,
                "idTransaccion" => ($idTransaccion == null) ? 0 : $idTransaccion,
                "ChargeId" => $charge->id
            ];


            $idSuscripcion = $Suscripcion->saveSuscripcion($subs);

            $item->idSuscripcion = $idSuscripcion;

            //Guardar Cupones en caso de que haya promociones

            if ($item->promociones)
            {

                foreach ($item->promociones as $promo)
                {
                    if ($promo->tipo == 1 || $promo->tipo == 2 || $promo->tipo == 3)
                    {
                        $promocion = [
                            "idSuscripcion" => $idSuscripcion,
                            "idPromocion" => $promo->id,
                            "aplicaciones" => 1,
                            "uso" => $promo->usos
                        ];
                        $idCupon = $Suscripcion->saveCupones($promocion);
                    }

                    if ($promo->tipo == 4)
                    {
                        $promocion = [
                            "idSuscripcion" => $idSuscripcion,
                            "idPromocion" => $promo->id,
                            "aplicaciones" => 1,
                            "uso" => $promo->usos
                        ];
                        $idCupon = $Suscripcion->saveCupones($promocion);
                    }
                }
            } else
            {
                $idCupon = 0;
            }
            $saldopagar = $Suscripcion->calcularPromociones($item);
            //Guardamos las Ordenes de Cargo
            $ordenCargo = [
                "idSuscripcion" => $idSuscripcion,
                "idCupon" => $idCupon,
                "monto" => $saldopagar,
                "status" => 1,
                "tipo" => ($item->compraUnica == 0) ? "Primer cargo Renta" : "Compra Unica",
                "fechaCobro" => null,
                "fechaPago" => 'NOW()',
                "saldado" => $saldopagar,
                "tarjetaId" => $idTarjeta,
                "idTransaccion" => ($idTransaccion == null) ? 0 : $idTransaccion,
                "ChargeID" => $charge->id
            ];
            //print_r($ordenCargo);
            $idOrden = $Suscripcion->saveOrdenesCargo($ordenCargo);
            $item->ordenCompra = $idOrden;
            $item->monto = $saldopagar;
            $item->tipoOrden = ($item->compraUnica == 0) ? "Primer cargo Renta" : "Compra Unica";
            $data->solicitudUSuario->TarjetaId = $idTarjeta;
            $confirmacion = [
                "idCliente" => $idCliente,
                "idTarjeta" => $idTarjeta,
                "idTransaccion" => ($idTransaccion == null) ? 0 : $idTransaccion,
            ];
            $Transaccion->confirmarTransaccion($confirmacion);
        }
        $response = [
            "Resultado" => [
                "success" => true,
                "idTransaccion" => $idTransaccion
            ],
            "Request" => $data
        ];
        echo json_encode($response);
        return true;
    } else
    {
        $response = [
            "Resultado" => array(
                "success" => false,
            ),
            "Request" => "No fue posible procesar esta solicitud, favor de checar sus productos y datos entrados",
            "ExceptionLevel" => "No es posible procesar"
        ];

        $operacion = [
            "ChargeId" => null,
            "result" => false,
            "MessageOP" => "No fue posible procesar esta solicitud, favor de checar sus productos y datos entrados",
            "id" => $idOperacion
        ];
        $Operacion->endOperacion($operacion);

        echo json_encode($response);
        return false;
        //OK
    }
}

?>
