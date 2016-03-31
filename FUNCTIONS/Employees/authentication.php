<?php
require_once('../employees_connect.php');
require_once('../../CLASSES/Employees.php');

$class = new Employees(
						NULL,
						NULL,
						NULL,
						NULL,
						NULL,
						NULL,
						NULL
					);

$data = $class->auth($_POST);

header("HTTP/1.0 404 User Not Found");
if($data['status']){
	$pk = md5('pk'); 
	setcookie($pk, md5($data['result'][0]['pk']), time()+7200000, '/');
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>