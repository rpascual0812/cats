<?php
require_once('../../CLASSES/ClassParent.php');
class Applicants extends ClassParent {

    var $pk = NULL;
    var $applicant_id = NULL;
    var $created_by = NULL;
    var $source = NULL;
    var $date_created = NULL;
    var $date_received = NULL;
    var $talent_acquisition = NULL;
    var $date_interaction = NULL;
    var $time_completed = NULL;
    var $over_due = NULL;
    var $first_name = NULL;
    var $last_name = NULL;
    var $middle_name = NULL;
    var $birthdate = NULL;
    var $profiled_for = NULL;
    var $contact_number = NULL;
    var $email_address = NULL;
    var $endorcer = NULL;
    var $endorcement_date = NULL;
    var $client = NULL;
    var $cv = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function create(){
        $applicant_id = $this->random_string();
        
        $sql = "begin;";
        $sql .= <<<EOT
            insert into applicants
            (
                applicant_id,
                source,
                created_by,
                date_received,
                talent_acquisition,
                first_name,
                last_name,
                middle_name,
                birthdate,
                profiled_for,
                contact_number,
                email_address,
                client,
                cv
            )
            values
            (
                '$applicant_id',
                '$this->source',
                '$this->created_by',
                '$this->date_received',
                '$this->talent_acquisition',
                '$this->first_name',
                '$this->last_name',
                '$this->middle_name',
                '$this->birthdate',
                '$this->profiled_for',
                '$this->contact_number',
                '$this->email_address',
                '$this->client',
                '$this->cv'
            );
            insert into applicants_status
            (
                applicants_pk,
                status,
                created_by
            )
            values
            (
                currval('applicants_pk_seq'),
                (select pk from statuses where status = 'For Processing'),
                $this->created_by
            )
            ;
            insert into applicants_logs
            (
                applicants_pk,
                details,
                created_by
            )
            values
            (
                currval('applicants_pk_seq'),
                'Added new applicant.',
                $this->created_by
            );
            insert into notifications
            (
                employees_pk,
                notification
            )
            values
            (
                $this->talent_acquisition,
                'A new candidate has been added.'
            );
EOT;

        $sql .= "commit;";
        return ClassParent::insert($sql);
    }

    public function dump($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $where="true";
        if($data['datetype'] == "Date Submitted"){
            $where .= " and date_created between '".$data['datefrom']." 0000' and '".$data['dateto']." 2359'";
        }
        else {
            $where .= " and date_received between '".$data['datefrom']." 0000' and '".$data['dateto']." 2359'";
        }

        $sql = <<<EOT
                select
                    pk,
                    applicant_id,
                    (select source from sources where pk = applicants.source::int) as source,
                    created_by,
                    date_created::timestamp(0) as date_created,
                    date_received::date as date_received,
                    date_received::time as time_received,
                    talent_acquisition,
                    date_interaction,
                    time_completed,
                    over_due,
                    first_name,
                    last_name,
                    middle_name,
                    birthdate::date as birthdate,
                    (select position from job_positions where pk = profiled_for) as profiled_for,
                    contact_number,
                    email_address,
                    endorcer,
                    endorcement_date,
                    (select client from clients where pk = applicants.client) as client,
                    cv,
                    (select statuses.status from applicants_status left join statuses on (applicants_status.status = statuses.pk) where applicants_pk = applicants.pk order by date_created desc limit 1) as status
                from applicants
                where $where
                order by pk asc
                ;
EOT;

        return ClassParent::get($sql);
    }

//     public function search($data){
//         $data = pg_escape_string(trim(strip_tags($data)));
//         $where=" lastname ilike '$data%' or firstname ilike '$data%' or username ilike '$data%'";
        
//         $sql = <<<EOT
//                 select
//                     id,
//                     lastname,
//                     firstname,
//                     lastname||' '||firstname as name,
//                     username
//                 from accounts
//                 where $where
//                 ;
// EOT;

//         return ClassParent::get($sql);
//     }

    function random_string(){
        $character_set_array = array();
        $character_set_array[] = array('count' => 2, 'characters' => 'ABCDEFGHJKLMNPQRSTUVWZ');
        $character_set_array[] = array('count' => 4, 'characters' => '123456789');
        $temp_array = array();
        foreach ($character_set_array as $character_set) {
            for ($i = 0; $i < $character_set['count']; $i++) {
                $temp_array[] = $character_set['characters'][rand(0, strlen($character_set['characters']) - 1)];
            }
        }

        shuffle($temp_array);
        return implode('', $temp_array);
    }

    function fetch(){
        $sql = <<<EOT
                select
                    pk,
                    applicant_id,
                    applicants.source as source_id,
                    (select source from sources where pk = applicants.source::int) as source,
                    created_by,
                    date_created::timestamp(0) as date_created,
                    date_received::date as date_received,
                    date_received::time as time_received,
                    talent_acquisition,
                    date_interaction,
                    time_completed,
                    over_due,
                    first_name,
                    last_name,
                    middle_name,
                    birthdate::date as birthdate,
                    profiled_for as profiled_for_id,
                    (select position from job_positions where pk = profiled_for) as profiled_for,
                    contact_number,
                    email_address,
                    endorcer,
                    endorcement_date,
                    Applicants.client as client_id,
                    (select client from clients where pk = applicants.client) as client,
                    cv,
                    (select statuses.status from applicants_status left join statuses on (applicants_status.status = statuses.pk) where applicants_pk = applicants.pk order by date_created desc limit 1) as status
                from applicants
                where applicant_id = '$this->applicant_id'
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function update($data){
        $remarks = pg_escape_string(trim(strip_tags($data['remarks'])));
        $employees_pk = pg_escape_string(trim(strip_tags($data['employees_pk'])));
        $applicant_id = pg_escape_string(trim(strip_tags($data['applicant_id'])));

        $applicant = $this->fetch();
        $details = $applicant['result'][0];

        $status = NULL;

        if(isset($data['status'])){
            $status = $data['status'];
            unset($data['status']);            
        }

        unset($data['remarks']);
        unset($data['applicant_id']);
        unset($data['employees_pk']);

        $cols = array();
        $vals = array();
        foreach($data as $k=>$v){
            array_push($cols, $k);

            if(is_integer($v)){
                array_push($vals, pg_escape_string(trim(strip_tags($v))));
            }
            else {
                array_push($vals, "'".pg_escape_string(trim(strip_tags($v)))."'");
            }
            
        }
        
        $cols = implode(',', $cols);
        $vals = implode(',', $vals);
        
        $sql = "begin;";
        if(count($cols) > 0){
            $sql .= <<<EOT
                    update applicants set
                    ($cols)
                    =
                    ($vals)
                    where applicant_id = '$applicant_id'
                    ;
EOT;
        }

        $applicants_pk = $details['pk'];
        if($status){
            $sql = <<<EOT
                    insert into applicants_status
                    (
                        applicants_pk,
                        status,
                        created_by
                    )
                    values
                    (
                        $applicants_pk,
                        $status,
                        $employees_pk
                    );
EOT;
        }

        
        $_id = md5('pk');
        $sql .= <<<EOT
                insert into applicants_remarks
                (
                    applicants_pk,
                    remarks,
                    created_by
                )
                values
                (
                    $applicants_pk,
                    '$remarks',
                    $employees_pk
                );

EOT;

        $sql .= "commit;";

        return ClassParent::update($sql);
    }

    public function fetch_remarks($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $applicants_pk = $data['applicants_pk'];
        $sql = <<<EOT
                select
                    applicants_pk,
                    remarks,
                    date_created::timestamp(0) as date_created,
                    (select employee from employees_permission where employees_pk = created_by) as name
                from applicants_remarks
                where applicants_pk = $applicants_pk
                order by date_created desc
                ;
EOT;
        
        return ClassParent::get($sql);   
    }
}
?>