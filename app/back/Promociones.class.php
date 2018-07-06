<?php

require_once("sqlConnections.php");

$promo = new Promociones();

switch ($_REQUEST['action'])
{
    case "getPromocion":
        $promo->setCodigoPromocion($_REQUEST['codigoPromocion']);
        $promo->getPromocion();
        break;
    default:
        echo '';
        break;
}

class Promociones
{

    private $codigoPromocion;

    public function setCodigoPromocion($codigoPromocion)
    {
        $this->codigoPromocion = $codigoPromocion;
    }

    public function getPromocion()
    {
        $sql = "SELECT 
                    p.id,
                    p.clasificacion,
                    p.nombre,
                    p.codigo,
                    p.vigencia,
                    p.tipo,
                    p.descuento,
                    p.usos,
                    p.productos,
                    p.fechaInicial,
                    p.estado,
                    cat.descripcion
                FROM
                    Promocion AS p
                        INNER JOIN
                    CatTipoDescuentos AS cat ON cat.id = p.tipo
                    WHERE BINARY p.codigo = '" . $this->codigoPromocion . "';";
        $out = executeQuery($sql);
        if ($out["records"] > 0)
        {
            $resp = [
                "success" => true,
                "data" => [
                    "id" => $out["root"][0]["id"],
                    "clasificacion" => $out["root"][0]["clasificacion"],
                    "nombre" => $out["root"][0]["nombre"],
                    "codigo" => $out["root"][0]["codigo"],
                    "vigencia" => $out["root"][0]["vigencia"],
                    "tipo" => $out["root"][0]["tipo"],
                    "descuento" => $out["root"][0]["descuento"],
                    "usos" => $out["root"][0]["usos"],
                    "productos" => json_decode($out["root"][0]["productos"]),
                    "fechaInicial" => $out["root"][0]["fechaInicial"],
                    "estado" => $out["root"][0]["estado"],
                    "descripcion" => $out["root"][0]["descripcion"]
                ],
            ];
        } else
        {
            $resp = [
                "success" => false,
                "data" => null
            ];
        }

        echo json_encode($resp);
    }
    
}
