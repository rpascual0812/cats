<?php
require_once('../connect.php');
require_once('../../CLASSES/Requisitions.php');

$data=array();
foreach($_POST as $k=>$v){
	$data[$k] = $v;
}

$class = new Requisitions($data);
$data = $class->fetch_remarks($data);

$a = $data['result'];
foreach ($a as $key => $value) {
	$data['result'][$key][$value]['details'] = html_entity_decode($value['details']);
}

header("HTTP/1.0 500 Internal Server Error");
if($data['status']==true){
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>