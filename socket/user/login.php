<?php
/**
 * Created by PhpStorm.
 * User: sierramws
 * Date: 2020-07-16
 * Time: 16:51
 */
include_once ('../../dao/daoLogin.php');

//environment
header('content-type:application/json;charset=utf8');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");

//$username, $password, $email, $display_name
echo json_encode($daoLogin->login($_GET['id'], $_GET['password']));