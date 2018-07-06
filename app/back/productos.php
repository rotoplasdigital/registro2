<?php

	require ("credentials.php");
	require ("sqlConnections.php");
	// require ("sendEmail.php");
	date_default_timezone_set("America/Mexico_City");

	function RandomString() {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randstring = '';
    for ($i = 0; $i <5; $i++) {
        $randstring = $randstring.$characters[rand(0, strlen($characters))];
    }
    return $randstring;
	}

	$OpenPay = getOpenpay();
	session_start();

	switch($_REQUEST['action']){
		case "traerProductos":
			traerProductos();
			break;
		default:
			echo '';
			break;
	}


  function traerProductos()
  {
    $sql = "SELECT producto AS nombre, precioRenta AS precio, precioCompra, 1 AS cantidad, id AS idProducto, imagen
    FROM PlanRotoplas";
    $rst = executeQuery($sql);
    echo json_encode($rst);
  }


?>
