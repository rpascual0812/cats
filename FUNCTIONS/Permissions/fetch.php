<?php
require_once('../connect.php');
require_once('../../CLASSES/Permissions.php');

$data=array();
foreach($_POST as $k=>$v){
	$data[$k] = $v;
}

$class = new Permissions($data);
$data = $class->fetch();

header("HTTP/1.0 500 Internal Server Error");
if($data['status']==true){
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>