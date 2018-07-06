<?php

		$hoy = getdate();
		$fecha = date('Y-m-d H:i:s', $hoy[0]);
		$cobro = date('Y-m-d', strtotime("+1 months", strtotime($fecha)));
		$futuro = date('Y-m-d', strtotime("+2 years", strtotime($fecha)));

		echo $futuro;
?>