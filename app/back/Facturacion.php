<?php

require_once 'Facturacion.class.php';

switch ($_REQUEST['action'])
{
    case "generarFactura":
        generarFactura();
        break;
    case "obtenerWebHook":
        obtenerWebhook();
        break;
    default:
        echo '';
        break;
}

function generarFactura()
{
    $idTransaccion = json_decode($_REQUEST["idTransaccion"]);
    $invoice = new Facturacion();
    $json = $invoice->GenerarSolicitudGeneracionCFDI($idTransaccion);
    $invoice->ConsumirEndPointOpenPay($json);
}
