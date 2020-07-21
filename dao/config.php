<?php
/**
 * Created by PhpStorm.
 * User: sierramws
 * Date: 2020-06-24
 * Time: 12:10
 */

$servername = "localhost";
$username = "em_database";
$password = "iKNn65CwfYd225Gw";
$dbname = "em_database";

//Connect Database
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->query("SET NAMES UTF8");
