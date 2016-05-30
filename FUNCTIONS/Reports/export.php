<?php
require_once('../connect.php');
require_once('../../CLASSES/Applicants.php');

$data=array();
foreach($_GET as $k=>$v){
	$data[$k] = $v;
}

$class = new Applicants($data);
$data = $class->dump($data);

$count=1;
$header=	'#,AID,Sourcer,Sourcing Channel,With CV,Date Received,Time Received,Time Entry,Over Due,TA,Date of Interaction,Time Completed,Over Due,First Name,Middle Name,Last Name,Date of Birth,Profiled For,Contact Numbers,Candidate Internal Status,Date of Endorsement,Client';
$body="";

foreach($data['result'] as $k=>$v){
	$body .= $count.','.
			$v['applicant_id'].',"'.
			$v['created_by'].'",'.
			$v['source'].',"'.
			$v['cv'].'",'.
			$v['date_received'].','.
			$v['time_received'].','.
			',,'.
			$v['talent_acquisition'].','.
			$v['date_interaction'].','.
			$v['time_completed'].','.
			','.
			$v['first_name'].','.
			$v['middle_name'].','.
			$v['last_name'].','.
			$v['birthdate'].','.
			$v['profiled_for'].','.
			$v['contact_number'].','.
			$v['status'].','.
			$v['endorcement_date'].','.
			$v['client']."\n";

	$count++;
}

$filename = "PIF_".date('Ymd_His').".csv";

// header ("Content-type: application/octet-stream");
// header ("Content-Disposition: attachment; filename=".$filename);
echo $header."\n".$body;
?>