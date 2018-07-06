<?php

require_once 'sqlConnections.php';

/**
 * @author David A. Lopez <dalopez@rotoplas.com>
 * @uses SolicitudCFDI aquí se establece los Nodos que se requieren para generar el CFDI
 * @copyright (c) 2018, Rotoplaslabs 
 */
class Facturacion
{

    /**
     * Requiere una Serie de elementos para poder generar un JSON
     * @return string RequestCFDI
     * @param int $idTransaccion Usar una id de transacción para Ordenes y subórdenes, no de suscripción.
     */
    public function GenerarSolicitudGeneracionCFDI($idTransaccion)
    {

        $conceptosTransaccion = $this->traerConceptos($idTransaccion);

        //print_r($conceptosTransaccion);

        $idfactura = $this->inicio($idTransaccion);

        $conceptos = [];
        $traslados = [];

        $recep = $this->TraerReceptor($conceptosTransaccion[0]["idSuscripcion"]);
        //print_r($recep);

        $receptor = Array(
            "nombre" => $recep["razonSocial"],
            "rfc" => $recep["RFC"],
            "email" => $recep["email"],
            "residencia_fiscal" => $recep["codigoPostal"],
            "uso_cfdi" => "G03",
        );

        /**
         * Recorremos ahora los productos adquiridos.
         */
        $montosSinIVA = [];
        $montosConIVA = [];
        $montosIVA = [];
        $montosDescuento = [];
        $importes = [];

        foreach ($conceptosTransaccion as $concepto)
        {

            $conceptoPrecioIVA = ($concepto["compraUnica"] == 0) ? $concepto["precioRenta"] : $concepto["precioCompra"];

            /**
             * Quitamos el IVA al producto.
             * IVA: impuesto al valor agregado, 002, 16%
             */
            if ($concepto["idCupon"] == 0)
            {
                $precioUnitario = round(($conceptoPrecioIVA / 1.16), 2);
                $importe = $precioUnitario;
                $conceptoMontoIVA = round(($conceptoPrecioIVA - $precioUnitario), 2);
                $descuentoConceptos = 0;
            } else
            {
                $precioUnitario = round(($conceptoPrecioIVA / 1.16), 2);
                $importe = ( $precioUnitario - (( $concepto["descuento"] / 100 ) * $precioUnitario)); //( $precioUnitario - (( $concepto["descuento"] / 100 ) * $precioUnitario ) );
                $conceptoMontoIVA = round($importe - ($importe - ((16 / 100) * $importe)), 2);
                $descuentoConceptos = round($precioUnitario, 2) - round(($precioUnitario - (( $concepto["descuento"] / 100 ) * $precioUnitario )), 2);
            }

            if ($importe > $descuentoConceptos)
            {
                array_push($montosSinIVA, $precioUnitario);
                array_push($montosConIVA, $conceptoPrecioIVA);
                array_push($montosIVA, $conceptoMontoIVA);
                array_push($montosDescuento, $descuentoConceptos);
                array_push($importes, $precioUnitario);

                $conceptoOrdenes = [
                    "identificador" => $concepto["idProducto"], // Revisar que sea el id de la linea de concepto
                    "clave" => "48101716",
                    "clave_unidad" => "E48",
                    "cantidad" => "1",
                    "descripcion" => $concepto["producto"],
                    "valor_unitario" => round($precioUnitario, 2), //Precio sin IVA (Traslado)
                    "importe" => round($precioUnitario, 2), // Importe = ConceptoSinIVA - Descuento ( precioSinIVA - (( descuento / 100)*precioSinIVA)) )
                    "descuento" => $descuentoConceptos, // Descuento ( precioSinIVA - (( descuento / 100)*precioSinIVA))
                    "traslados" => [
                        0 => [
                            "impuesto" => "002",
                            "base" => round($importe, 2),
                            "tipo_factor" => "Tasa",
                            "tasa" => floatval("0.16"),
                            "importe" => round($conceptoMontoIVA, 2)
                        ]
                    ]
                ];
                array_push($conceptos, $conceptoOrdenes);
            }
        }



        $impuestos_trasladados = [];

        $impuestoTraslado = [
            "impuesto" => "002",
            "tasa" => 0.16,
            "importe" => round(array_sum($montosIVA), 2),
            "tipo_factor" => "Tasa"
        ];

        array_push($impuestos_trasladados, $impuestoTraslado);
        $tranChangeId = $conceptosTransaccion[0]["CargoId"];
        $subTotal = array_sum($importes);
        $total = (array_sum($importes) - array_sum($montosDescuento)) + array_sum($montosIVA);
        //print_r($importes);
        echo "\n Importes: " . array_sum($importes);
        echo "\n Descuentos: " . array_sum($montosDescuento);
        echo "\n Traslados: " . round(array_sum($montosIVA), 2);
        echo "\n";
        $request = [
            "openpay_transaction_id" => $tranChangeId,
            "tipo_comprobante" => "I",
            "invoice_id" => $idfactura,
            "serie" => "FR",
            "folio" => "33",
            "total" => round($total, 2), //sub + iva
            "subtotal" => round($subTotal, 2),
            "total_trasladados" => round(array_sum($montosIVA), 2),
            "descuento" => round(array_sum($montosDescuento), 2),
            "forma_pago" => "04",
            "metodo_pago" => "PUE",
            "lugar_expedicion" => "11040",
            "observaciones" => $recep["notas"],
            "moneda" => "MXN",
            "tipo_de_cambio" => 1,
            "receptor" => $receptor,
            "conceptos" => $conceptos,
            "impuestos_traslado" => $impuestos_trasladados
        ];

        //print_r($request);

        $this->guardarFactura($request, $idfactura);

        $json = json_encode($request);
        echo "\n";
        //echo $json;
        return $json;
    }

    /**
     * @param string $json Solicitud de CFDI
     * @param object $openpay Objeto de OpenPay para realizar operaciones. bancarias
     */
    public function ConsumirEndPointOpenPay($json)
    {

        //echo $json;
        //print_r(json_decode($json));
        $productivo = false;
        if ($productivo)
        {
// produccion
            $usuario['OPID'] = '';
            $usuario['APIKEY'] = '';
            $url = "https://api.openpay.mx/v1/" . $usuario['APIKEY'] . "/invoices/v33";
            Openpay::setProductionMode(true);
        } else
        {
// pruebas
            $usuario['OPID'] = '';
            $usuario['APIKEY'] = '';
            $url = "https://sandbox-api.openpay.mx/v1/" . $usuario['OPID'] . "/invoices/v33";
        }
        echo "\nURL: " . $url;

        try
        {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
            curl_setopt($ch, CURLOPT_USERPWD, $usuario['APIKEY'] . ":");
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json'
            ));
            $content = curl_exec($ch);
        } catch (Exception $ex)
        {
//falla el envio al Servidor de OpenPay.
            echo $ex->getMessage();
        }
        $responce = json_decode($content);

        print_r($responce);
    }

    private function TraerReceptor($idSuscripcion)
    {
        $query = "SELECT 
                    s.id AS idSuscripcion,
                    cl.id AS idCliente,
                    cl.nombre,
                    cl.apellido,
                    cl.email,
                    (CASE
                        WHEN f.RFC IS NULL THEN 'XAXX010101000'
                        ELSE f.RFC
                    END) AS RFC,
                    (CASE
                        WHEN f.razonSocial IS NULL THEN CONCAT(cl.nombre, ' ', cl.apellido)
                        ELSE f.razonSocial
                    END) AS razonSocial,
                    d.codigoPostal,
                    f.notas
                FROM
                    Suscripcion AS s
                        INNER JOIN
                    Cliente AS cl ON cl.id = s.idCliente
                        LEFT JOIN
                    Facturacion AS f ON f.id = s.idFacturacion
                        LEFT JOIN
                    Direccion AS d ON d.id = s.idInstalacion
                WHERE
                    s.id = " . $idSuscripcion;
        $responce = executeQuery($query);
        return $responce["root"][0];
    }

    private function traerConceptos($idTransaccion)
    {
        $query = "
                SELECT 
                    s.id as idSuscripcion,
                    oc.CargoId,
                    oc.monto,
                    oc.saldado,
                    oc.idCupon,
                    p.descuento,
                    f.razonSocial,
                    f.RFC,
                    pr.producto,
                    pr.precioRenta,
                    pr.precioCompra,
                    t.tipo,
                    s.idCliente, 
                    s.idInstalacion,
                    s.compraUnica,
                    s.idPlan as idProducto
                FROM
                    Suscripcion AS s
                        LEFT JOIN
                    OrdenesCargo AS oc ON s.id = oc.idSuscripcion
                        LEFT JOIN
                    Cupon AS cp ON cp.idCupon = oc.idCupon
                        LEFT JOIN
                    Promocion AS p ON p.id = cp.idPromocion
                        LEFT JOIN
                    Facturacion AS f ON f.id = s.idFacturacion
                        LEFT JOIN
                    PlanRotoplas AS pr ON pr.id = s.idPlan
                        LEFT JOIN
                    Tarjeta AS t ON t.id = s.idTarjeta
                WHERE
                    oc.idTransaccion = " . $idTransaccion;
        $responce = executeQuery($query);

        return $responce["root"];
    }

    /**
     * @return int invoice_id
     */
    private function inicio($idTransaccion)
    {
        $query = "INSERT INTO Facturas(idTransaccion) VALUES(" . $idTransaccion . ")";
        $responce = executeQuery($query);
        return $responce["id"];
    }

    private function guardarFactura($request, $idFactura)
    {


        print_r($request);


        $query = "UPDATE Facturas 
                    SET 
                        openpay_transaction_id = '" . $request["openpay_transaction_id"] . "',
                        tipo_comprobante = '" . $request["tipo_comprobante"] . "',
                        serie = '" . $request["serie"] . "',
                        folio = '" . $request["folio"] . "',
                        total = '" . $request["total"] . "',
                        subtotal = '" . $request["subtotal"] . "',
                        total_trasladados = '" . $request["total_trasladados"] . "',
                        descuento = '" . $request["descuento"] . "',
                        forma_pago = '" . $request["forma_pago"] . "',
                        metodo_pago = '" . $request["metodo_pago"] . "',
                        lugar_expedicion = '" . $request["lugar_expedicion"] . "',
                        observaciones = '" . $request["observaciones"] . "',
                        moneda = '" . $request["moneda"] . "',
                        tipo_de_cambio = '" . $request["tipo_de_cambio"] . "',
                        nombre = '" . $request["receptor"]["nombre"] . "',
                        rfc = '" . $request["receptor"]["rfc"] . "',
                        email = '" . $request["receptor"]["email"] . "',
                        residencia_fiscal = '" . $request["receptor"]["residencia_fiscal"] . "',
                        uso_cfdi = '" . $request["receptor"]["uso_cfdi"] . "',
                        impuesto = '" . $request["impuestos_traslado"][0]["impuesto"] . "',
                        tasa = '" . $request["impuestos_traslado"][0]["tasa"] . "',
                        tipo_factor = '" . $request["impuestos_traslado"][0]["tipo_factor"] . "',
                        importe = '" . $request["impuestos_traslado"][0]["importe"] . "'
                    WHERE
                        invoice_id = " . $idFactura;

        $responce = executeQuery($query);
        print_r($responce);

        foreach ($request["conceptos"] as $concepto)
        {
            $this->guardarConceptosFactura($concepto, $idFactura);
        }
    }

    private function guardarConceptosFactura($conceptos, $idFactura)
    {
        $query = "INSERT INTO FacturaConceptos (
                                invoice_id,
                                identificador,
                                clave,
                                clave_unidad,
                                cantidad,
                                descripcion,
                                valor_unitario,
                                importe,
                                descuento,
                                impuesto,
                                base,
                                tipo_factor,
                                tasa,
                                importe_impuesto
                        ) VALUES(
                                " . $idFactura . ",
                                " . $conceptos["identificador"] . ",
                                '" . $conceptos["clave"] . "',
                                '" . $conceptos["clave_unidad"] . "',
                                '" . $conceptos["cantidad"] . "',
                                '" . $conceptos["descripcion"] . "',
                                '" . $conceptos["valor_unitario"] . "',
                                '" . $conceptos["importe"] . "',
                                '" . $conceptos["descuento"] . "',
                                '" . $conceptos["traslados"][0]["impuesto"] . "',
                                '" . $conceptos["traslados"][0]["base"] . "',
                                '" . $conceptos["traslados"][0]["tipo_factor"] . "',
                                '" . $conceptos["traslados"][0]["tasa"] . "',
                                '" . $conceptos["traslados"][0]["importe"] . "'
                        )";
        executeQuery($query);
    }

    public function obtenerWebHook($data)
    {
        $query = "UPDATE Facturas SET UUID = '" . $data["invoice_data"]["uuid"] . "', status = '" . $data["invoice_data"]["status"] . "', fiscal_status = '" . $data["invoice_data"]["fiscal_status"] . "', ruta_XML = '" . $data["invoice_data"]["public_xml_link"] . "', ruta_PDF = '" . $data["invoice_data"]["public_pdf_link"] . "', message = '" . $data["invoice_data"]["message"] . "', link_expiration_date = '" . $data["invoice_data"]["link_expiration_date"] . "' WHERE  invoice_id  = " . $data["invoice_data"]["invoice_id"];
        executeQuery($query);
    }

}
