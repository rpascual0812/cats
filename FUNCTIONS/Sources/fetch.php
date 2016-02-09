<?php
require_once('../connect.php');
require_once('../../CLASSES/Sources.php');

$filters = array(
					'pk' => NULL,
					'source' => NULL,
					'archived' => NULL,
				);

foreach($_POST as $k=>$v){
	$filters[$k] = $v;
}

$class = new Sources(
						$filters['pk'],
						$filters['source'],
						$filters['archived']
					);

$data = $class->fetch();

header("HTTP/1.0 404 User Not Found");
if($data['status']){
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>