<?php

error_reporting(0);
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');



require_once("credentials.php");
require_once("sqlConnections.php");
date_default_timezone_set("America/Mexico_City");
header("Content-type:application/json");

$data = [
    "id" => $_POST["id"],
    "calendarID" => $_POST["calendarID"],
    "appointmentTypeID" => $_POST["appointmentTypeID"],
];

$schedule = new Schedule($data);

$schedule->addSchedule($data);

echo json_encode(["response" => true]);

class Schedule
{

    private $acuityUrl;
    private $acuityUserName;
    private $acuityPassword;

    function getAcuityUrl()
    {
        return $this->acuityUrl;
    }

    function getAcuityUserName()
    {
        return $this->acuityUserName;
    }

    function getAcuityPassword()
    {
        return $this->acuityPassword;
    }

    function setAcuityUrl($acuityUrl)
    {
        $this->acuityUrl = $acuityUrl;
    }

    function setAcuityUserName($acuityUserName)
    {
        $this->acuityUserName = $acuityUserName;
    }

    function setAcuityPassword($acuityPassword)
    {
        $this->acuityPassword = $acuityPassword;
    }

    public function __construct($data)
    {
        return $data;
    }

    protected function searchSchedule()
    {
        $acuityUrl = "https://acuityscheduling.com/api/v1/appointments/186740624";
        $acuityUserName = "14487290";
        $acuityPassword = "3f34af8cfdf51de71262723a62f4cdd7";
        $this->setAcuityUrl($acuityUrl);
        $this->setAcuityUserName($acuityUserName);
        $this->setAcuityPassword($acuityPassword);
    }

    public function addSchedule()
    {

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $this->acuityUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => FALSE,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $jsonRequestBody,
            CURLOPT_HTTPHEADER => array(
                "Authorization: Bearer EwBIA+l3BAAUWm1xSeJRIJK6txKjBez4GzapzqMAAYNcC0dWiXcTKKqcp/NZrzwi4gqRoXf/1x7h/mwiZnx9BHRsQ+aR/1jcVnYhLCK4TuDl47SltAjsNtE8dxgiQypB2LW0FRKME16xLaJ7paTxi0GbtKEyHcw+X2Gk4cYuayW9HmzSzYmGE8Gr+Fhk21O0t+Bj2dLni5TAUyTOumgF+3if3nKN7UPyGWg6gYpK26G1OKDqy+Qc2gjMgKTVDBq47I/oQDZV9M9yInRp67n3sfpLNPtTrFkdIKo/3fj8MRU6+OVVXZZwh8QsFHfT4ZSgMAW9TaDa4ZpzpZd0Kg56iWafSl+glp4zujWBoqQaBlXk/P/Gz0QRsRZF4K1ON0EDZgAACOEgHd8qE/RHGAJWZ/+l6f3Ync/q32cIotTzGUyQMn2UORTvx4xButqWWEkv710K9Ly7nNpDuh0pAdt3gWBV7Vz1nBLuad5glovB7sHupGFl16xEIWMiBf/8geOSPGR/f8RSObsHU5bOzQzQ976UPLov/Sgxuf6lR0By/BlGX2p+XsdiPoHUCIPa6Szo1GMFDuDRUBypF3+QSnqKtzBEvG7VhmUU4/z4/kmSCmGqeJX8RjVG7gBzXcsOJdqc/+ndqsBHDvmkWewGZ+9iLm0AFNJ+DwCn4j/jOVa/s1mwTw7n1rb58/xQ/an2L3Cp0q3SN47bBatXqq0bxRK9wSQPRzBNh7L49p6vidzn6LdHvmSYQQDqi2cf0eU1TykrCBXIoxbcnliGpstifvdR0xaLT1oLrqGGsSNgDsGDzW93GCSRSRJRenD+ybTl8WhVB2xzy1gt/ZqPscixwZvWcQsrJXOFbRfUnePr4CQX6CccW0G/LSC6V7EFrKxZBUxxA24bcRELTBOL8bEwdda4PHs+KlObYDpb695EcVyoRxhNrn732VCzgrSuOyLNqj3r7bg+gRiIC6aAcu3Kz8QOU5bc6y40QuQ1dRgY99Z5pvTRRCCdIYZ0dz4lUkAR55U0buzlXKWBwIfc+0CVkP/zXCYXLNLix3kyR6HcK0t4RfCGjJyLksQeMhnn/klqp+qq4X1YtA8xcBeSpF0VyzY/Oz35/ISOXTkC",
                "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        if ($err)
        {
            echo "cURL Error #:" . $err;
        } else
        {
            echo $response;
        }

        return $retorno;
    }

}
