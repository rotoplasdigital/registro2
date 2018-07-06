<?php
	
	function mysqlErrorMessages($errroNum)
	{
		 switch ($errroNum) {
		 	case '1046':
		 		return "Error: ".$errroNum.", Base de datos no encontrada. Consulte a su administrador.";
		 		break;
		 	case '1054':
		 		return "Error: ".$errroNum.", Columna invalida.";
		 		break;
		 	case '1062':
		 		return "Error: ".$errroNum.", No puede insertar un registro que duplique una llave primaria.";
		 		break;
		 	case '1064':
		 		return "Error: ".$errroNum.", La sintaxis de la peticion es incorrecta, favor de notificarlo con su administrador de sistema.";
		 		break;
		 	case '1146':
		 		return "Error: ".$errroNum.", Una de las tablas a la que se hace referencia no existe. Favor de notificarlo a su administrador de sistema.";
		 		break;
		 	case '1242':
		 		return "Error; ".$errroNum.", Error en Subconsultas.";
		 		break;
		 	case '1366':
		 		return "Error: ".$errroNum.", El Valor a insertar es incorrecto para la columna.";
		 		break;
		 	case '1451':
		 		return "Error: ".$errroNum.", No puede borrar o actualizar el registro porque tiene registros dependientes.";
		 		break;
		 	case '1452':
		 		return "Error: ".$errroNum.", No puede agregar o actualizar el registro cuando una llave foranea no existe.";
		 		break;
		 	case '1406':
		 		return "Error: ".$errroNum.", La información en uno de los campos es demsaido larga";
		 	
		 	default:
		 		return "Error: ".$errroNum." No se reconoce, favor de notificarlo con su administrador de sistema";
		 		break;
		 }
	}
?>