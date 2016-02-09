<?php
require_once('../connect.php');
require_once('../../CLASSES/Statuses.php');

$data=array();
foreach($_POST as $k=>$v){
	$data[$k] = $v;
}

$class = new Statuses($data);
$data = $class->fetch();

header("HTTP/1.0 404 User Not Found");
if($data['status']){
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>