<?php
require_once('../connect.php');
require_once('../../CLASSES/Job_positions.php');

$filters = array(
					'pk' => NULL,
					'position' => NULL,
					'archived' => NULL,
				);

foreach($_POST as $k=>$v){
	$filters[$k] = $v;
}

$class = new Job_positions(
						$filters['pk'],
						$filters['position'],
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