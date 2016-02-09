<?php
require_once('../employees_connect.php');
require_once('../../CLASSES/Employees.php');

$filters = array(
					'pk' => NULL,
					'employee_id' => NULL,
					'first_name' => NULL,
					'middle_name' => NULL,
					'last_name' => NULL,
					'email_address' => NULL,
					'archived' => NULL
				);

foreach($_POST as $k=>$v){
	$filters[$k] = $v;
}

$class = new Employees(
						$filters['pk'], 
						$filters['employee_id'], 
						$filters['first_name'], 
						$filters['middle_name'], 
						$filters['last_name'], 
						$filters['email_address'], 
						$filters['archived']
					);

$data = $class->profile();

header("HTTP/1.0 404 User Not Found");
if($data['status']){
	header("HTTP/1.0 200 OK");
}

header('Content-Type: application/json');
print(json_encode($data));
?>