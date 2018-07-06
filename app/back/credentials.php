<?php
header('Content-type: text/javascript');
require(dirname(__FILE__) . '/Openpay/Openpay.php');

function getOpenpay(){
    
    try {
        
        $productivo = true;
        if($productivo){
            // produccion
            $usuario['OPID'] = '';
            $usuario['APIKEY'] = '';
            Openpay::setProductionMode(true);
        }else{
            // pruebas
            $usuario['OPID'] = '';
            $usuario['APIKEY'] = '';
        }
        //Activar en Produccion:
        
        $openpay = Openpay::getInstance($usuario['OPID'], $usuario['APIKEY']);
        return ($openpay);
        
    } catch (OpenpayApiTransactionError $e) {
        error_log('ERROR on the transaction: ' . $e->getMessage() .
        ' [error code: ' . $e->getErrorCode() .
        ', error category: ' . $e->getCategory() .
        ', HTTP code: '. $e->getHttpCode() .
        ', request ID: ' . $e->getRequestId() . ']', 0);
        
        //print_r($e);
        
    } catch (OpenpayApiRequestError $e) {
        error_log('ERROR on the request: ' . $e->getMessage(), 0);
        //print_r($e);
        
    } catch (OpenpayApiConnectionError $e) {
        error_log('ERROR while connecting to the API: ' . $e->getMessage(), 0);
        //print_r($e);
        
    } catch (OpenpayApiAuthError $e) {
        error_log('ERROR on the authentication: ' . $e->getMessage(), 0);
        //print_r($e);
        
    } catch (OpenpayApiError $e) {
        error_log('ERROR on the API: ' . $e->getMessage(), 0);
        //print_r($e);
        
    } catch (Exception $e) {
        error_log('Error on the script: ' . $e->getMessage(), 0);
        //print_r($e);
    }
    $excepcion = $e->getMessage();
    return $excepcion;
}

getOpenpay();

?>