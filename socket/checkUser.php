<?php
/**
 * Created by PhpStorm.
 * User: sierramws
 * Date: 2020-07-28
 * Time: 16:59
 */

include_once ('../dao/daoChat.php');

//environment
header('content-type:application/json;charset=utf8');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");


echo json_encode($daoChat->checkUser($_GET['user_id'], $_GET['session']));