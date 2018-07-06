<?php

namespace registro\suscripcion;

date_default_timezone_set("America/Mexico_City");

//error_reporting(0);

class Operacion
{

    private $idTransaccion;
    private $idLog;
    private $idUsuario;
    private $ChargeId;
    private $result;
    private $MessageOP;

    public function startOperacion($idUsuario, $request)
    {
        $sql = "INSERT INTO Operaciones(startsAt, idUsuario, request) ";
        $sql .= "VALUES(NOW(), " . $idUsuario . ", '". addslashes($request)."');";
        $result = executeQuery($sql);
        if ($result["id"] != 0)
        {
            return $result["id"];
        }
    }

    public function endOperacion($operacion)
    {
        $sql = "UPDATE Operaciones SET endsAt = NOW(), ChargeId = '" . $operacion["ChargeId"] . "',  result = '" . $operacion["result"] . "', MessageOP = '" . addslashes($operacion["MessageOP"]) . "' WHERE id = " . $operacion["id"];
        executeQuery($sql);
    }

}

class Suscripcion
{

    public function traerDatosTarjeta($tarjetaId, $clienteId)
    {

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

    public function SaveClienteInfo($cliente)
    {

        $nuevoCliente = "INSERT INTO Cliente (nombre, apellido, email, telefono, tipoTelefono, telefono2, tipoTelefono2, status,token, sesion, fuente) ";
        $nuevoCliente .= "VALUES ('" . addslashes($cliente["nombre"]) . "','" . addslashes($cliente["apellido"]) . "','" . $cliente["email"] . "','" . $cliente["telefono"] . "','" . $cliente["tipoTelefono"] . "','" . $cliente["telefono2"] . "','" . $cliente["tipoTelefono2"] . "','" . $cliente["status"] . "','" . $cliente["token"] . "', '" . $cliente["session"] . "',  '" . $cliente["fuente"] . "' )";
        $queryRst = executeQuery($nuevoCliente);
        return $queryRst["id"];
    }

    public function SaveCreditCartInfo($tarjeta, $idCliente)
    {

        $query = "INSERT INTO Tarjeta (idCliente, vigencia, numero, marca, token, nombre, tipo ) ";
        $query .= "VALUES ('" . $tarjeta["idCliente"] . "','" . $tarjeta["vigencia"] . "','" . $tarjeta["numero"] . "','" . $tarjeta["marca"] . "','" . $tarjeta["token"] . "','" . addslashes($tarjeta["nombre"]) . "', '" . $tarjeta["tipo"] . "')";
        $queryRst = executeQuery($query);
        return $queryRst["id"];
    }

    public function calcularPromociones($suscripcion)
    {
        $montoSum = [];
        $montoRes = [];
        $montosSinPromo = [];
        $montosSum = 0;
        $montosRes = 0;
        $montosTot = 0;
        $listaDescuentos = [];
        $listaIncrementos = [];
        $descuentoMayor = 0;
        $promo = false;

        if ($suscripcion->compraUnica == 0)
        {
            array_push($montosSinPromo, $suscripcion->precio);
        } else
        {
            array_push($montosSinPromo, $suscripcion->precioCompra);
        }

        if (count($suscripcion->promociones) > 0)
        {
            $promo = true;
            foreach ($suscripcion->promociones as $promos)
            {

                if ($promos->tipo == 4)
                {
                    array_push($listaIncrementos, $promos->descuento);
                }
                if ($promos->tipo == 3 || $promos->tipo == 2)
                {
                    array_push($listaDescuentos, $promos->descuento);
                }
                if ($promos->tipo == 1)
                {
                    array_push($listaDescuentos, $promos->descuento);
                }
            }
        }


        if ($promo === true)
        {
            $descuentoMaximo = max($listaDescuentos);

            if (count($listaIncrementos) > 0 && count($listaDescuentos) > 0)
            {
                $calculoIncremento = (array_sum($montosSinPromo) + (( reset($listaIncrementos) / 100 ) * array_sum($montosSinPromo) ));
                $calculado = $calculoIncremento - (( $descuentoMaximo / 100 ) * $calculoIncremento );
            }

            if (count($listaIncrementos) > 0 && count($listaDescuentos) == 0)
            {
                $calculado = (array_sum($montosSinPromo) + (( reset($listaIncrementos) / 100 ) * array_sum($montosSinPromo) ));
            }

            if (count($listaIncrementos) == 0 && count($listaDescuentos) > 0)
            {
                $calculado = (array_sum($montosSinPromo) - (( $descuentoMaximo / 100 ) * array_sum($montosSinPromo) ));
            }

            $total = $calculado;
        } else
        {
            $total = array_sum($montosSinPromo);
        }
        return $total;
    }

    public function validarMesesGratis($suscripciones)
    {
        $montoSum = [];
        $montoRes = [];
        $montosSinPromo = [];
        $montosSum = 0;
        $montosRes = 0;
        $montosTot = 0;
        $listaDescuentos = [];
        $listaIncrementos = [];
        $descuentoMayor = 0;
        $promo = false;


        array_push($montosSinPromo, $suscripciones->precio);

        if (count($suscripciones->promociones) > 0)
        {
            $promo = true;
            foreach ($suscripciones->promociones as $promos)
            {
//MESES GRATIS
                if ($promos->tipo == 1)
                {
                    array_push($listaDescuentos, $promos->descuento);
                }
            }

            return ( count($listaDescuentos) > 0 ) ? true : false;
        }
    }

    public function opCustomerId($clienteId)
    {
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

    public function saveDireccion($direccion)
    {

        $query = "INSERT INTO Direccion (idCliente, calle, numInt, numExt, colonia, municipio, ciudad, estado, pais, notas, codigoPostal)";
        $query .= "VALUES (" . $direccion["idCliente"] . ",'" . addslashes($direccion["calle"]) . "','" . addslashes($direccion["numInt"]) . "','" . $direccion["numExt"] . "','" . addslashes($direccion["colonia"]) . "','" . addslashes($direccion["municipio"]) . "','" . addslashes($direccion["ciudad"]) . "','" . $direccion["estado"] . "','México','" . $direccion["notas"] . "','" . $direccion["codigoPostal"] . "')";
//echo "\n" . $query;
        $queryRst = executeQuery($query);
        return $queryRst["id"];
    }

    public function saveFacturacion($facturacion)
    {

        $query = "INSERT INTO Facturacion (idCliente, razonSocial, RFC, notas, CorreoEnvio) ";
        $query .= "VALUES (" . $facturacion["idCliente"] . ",'" . $facturacion["razonSocial"] . "','" . $facturacion["RFC"] . "','" . addslashes($facturacion["notas"]) . "', '" . addslashes($facturacion["CorreoEnvio"]) . "') ";
        //echo "\n" . $query;
        $queryRst = executeQuery($query);
        return $queryRst["id"];
    }

    public function saveSuscripcion($subs)
    {

        $query = "INSERT INTO Suscripcion (idCliente, idPlan, idInstalacion, idFacturacion, idTarjeta, fechaCreacion, fechaInstalacion, statusInstalacion, fechaMantenimiento, fechaCobro, token, status, compraUnica, vendedor, DealId, idTransaccion, CargoId)";
        $query .= "VALUES ('" . $subs["idCliente"] . "','" . $subs["idPlan"] . "','" . $subs["idInstalacion"] . "','" . $subs["idFacturacion"] . "','" . $subs["idTarjeta"] . "',NOW(),'" . $subs["fechaInstalacion"] . "','" . $subs["statusInstalacion"] . "','" . $subs["fechaMantenimiento"] . "','" . $subs["fechaCobro"] . "', '" . $subs["token"] . "', '" . $subs["status"] . "'," . $subs["compraUnica"] . ", " . $subs["vendedor"] . ", '" . $subs["DealId"] . "', " . $subs["idTransaccion"] . ", '" . $subs["ChargeId"] . "')";
        //echo "\n" . $query;
        $queryRst = executeQuery($query);
        return $queryRst["id"];
    }

    public function saveOrdenesCargo($ordenCargo)
    {

        $query = "INSERT INTO OrdenesCargo (idSuscripcion, idCupon, monto, status, tipo, fechaCobro, fechaPago, saldado, tarjetaId, idTransaccion, CargoId, idSobreCargo) ";
        $query .= "VALUES ('" . $ordenCargo["idSuscripcion"] . "', " . $ordenCargo["idCupon"] . "," . $ordenCargo["monto"] . "," . $ordenCargo["status"] . ",'" . $ordenCargo["tipo"] . "', NOW(),NOW(),'" . $ordenCargo["saldado"] . "', " . $ordenCargo["tarjetaId"] . ", ".$ordenCargo["idTransaccion"].", '".$ordenCargo["ChargeID"]."', ".$ordenCargo["idSobreCargo"].")";
        //echo "\n" . $query;
        $queryRst = executeQuery($query);
        return $queryRst['id'];
    }

    public function saveCupones($promocion)
    {


        $queryCupon = "INSERT INTO Cupon (idSuscripcion, idPromocion, aplicaciones, uso) ";
        $queryCupon .= "VALUES (" . $promocion["idSuscripcion"] . ", " . $promocion["idPromocion"] . "," . $promocion["aplicaciones"] . "," . $promocion["uso"] . ")";
//echo "\n".$queryCupon;
        $queryCuponRst = executeQuery($queryCupon);
        return $queryCuponRst["id"];
    }

    public function InformacionTarjetaCliente($idTarjeta)
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

}

class Transaccion
{

    /**
     * 
     * @param array $transaccion
     * 
     */
    public function setTransaccion($transaccion)
    {

        $query = "INSERT INTO Transaccion (idOperacion, idUsuario, ChargeId, MessageOP, MontoTotal, Articulos)";
        $query .= "VALUES (" . $transaccion["idOperacion"] . "," . $transaccion["idUsuario"] . ",'" . $transaccion["ChargeId"] . "','" . $transaccion["MessageOP"] . "'," . $transaccion["MontoTotal"] . ", " . $transaccion["Articulos"] . ")";
        $result = executeQuery($query);
        return $result['id'];
    }

    public function endTransaccion($idTransaccion, $message, $chargeid)
    {
        $sql = "UPDATE Transaccion SET ChargeId = '" . $chargeid . "', MessageOP = '" . $message . "' WHERE id = " . $idTransaccion . ";";
        executeQuery($sql);
    }

    public function confirmarTransaccion($transaccion)
    {
        $sql = "UPDATE Transaccion SET idCliente = " . $transaccion["idCliente"] . ", idTarjeta = " . $transaccion["idTarjeta"] . "  WHERE id = " . $transaccion["idTransaccion"] . ";";
        executeQuery($sql);
    }

}
