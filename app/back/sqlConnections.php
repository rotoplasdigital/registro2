<?php
require("sqlErrorMessages.php");
function executeQuery($query){
    set_time_limit(0);
    $_SESSION['error_sql'] = "";
    $_SESSION['sql_debug'] = $query;
    
    $productivo = true;
    if($productivo){
        $host = ""
        $usr = ""
        $pwd = ""
        $db = ""
    }else{
        $host = "localhost";
        $usr = "root";
        $pwd = "";
        $db = "";
    }
    
    $link = mysql_connect($host, $usr,$pwd) or die (json_encode(array('success'=>'false','error_sql'=>mysql_error(),'meesageText'=>'Error de conexi&oacute;n')));
    mysql_select_db($db);
    mysql_query("SET NAMES 'utf8'");
    $result = mysql_query($query,$link);
    $operation = strtoupper(substr(trim($query), 0,6));
    $resultArray = array('success'=>true);
    switch($operation){
        case "SELECT":
            $pos = 0;
            $resultArray['records'] =  mysql_num_rows($result);
            while($row = mysql_fetch_assoc($result)){
                $resultArray['root'][$pos] = $row;
                $pos++;
        };
        if (!isset($resultArray['root'])) {
            $resultArray['root'] = null;
        }
        break;
    case "INSERT":
        $id = mysql_insert_id ();
        if($id == true || $id!= 0){
            $resultArray['id'] = $id;
    }
    break;
default:
    
    break;
}
if (mysql_errno($link) == 0)
    $error_msg = "";
else
    $error_msg = mysqlErrorMessages(mysql_errno($link));
//To array
$_SESSION['erorNo_sql'] = mysql_errno($link);
$_SESSION['error_sql'] = $error_msg;
$_SESSION['error_sql_debug'] = $error_msg;
return ($resultArray);
}
function confirm($parametro) {
    if ($parametro == true) {
        executeQuery("commit");
    } else {
        executeQuery("rollback");
    }
}
function conCatConditional($whereStr, $conditional) {
    if ($conditional <> "") {
        if ($whereStr == "") {
            $whereStr = "WHERE ";
        } else {
            
            $whereStr = $whereStr." AND ";
        }
        
        $whereStr = $whereStr.$conditional;
    }
    return $whereStr;
}
?>