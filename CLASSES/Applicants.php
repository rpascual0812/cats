<?php
require_once('../../CLASSES/ClassParent.php');
class Applicants extends ClassParent {

    var $pk = NULL;
    var $applicant_id = NULL;
    var $requisitions_pk = NULL;
    var $created_by = NULL;
    var $sources_pk = NULL;
    var $date_created = NULL;
    var $date_received = NULL;
    var $first_name = NULL;
    var $last_name = NULL;
    var $middle_name = NULL;
    var $birthdate = NULL;
    var $profiled_for_pk = NULL;
    var $contact_number = NULL;
    var $email_address = NULL;
    var $clients_pk = NULL;
    var $cv = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));

        }

        return(true);
    }

    public function create($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $applicant_id = $this->random_string();
        $tags = "{".pg_escape_string(trim(strip_tags($data['new_tags'])))."}";
        
        $talent_acquisition_pk = $data['talent_acquisition_pk'];

        $sql = "begin;";
        $sql .= <<<EOT
            insert into applicants
            (
                applicant_id,
                requisitions_pk,
                sources_pk,
                created_by,
                date_received,
                first_name,
                last_name,
                middle_name,
                birthdate,
                job_positions_pk,
                contact_number,
                email_address,
                clients_pk,
                cv,
                statuses_pk
            )
            values
            (
                '$applicant_id',
                '$this->requisitions_pk',
                '$this->sources_pk',
                '$this->created_by',
                '$this->date_received',
                '$this->first_name',
                '$this->last_name',
                '$this->middle_name',
                '$this->birthdate',
                '$this->profiled_for_pk',
                '$this->contact_number',
                '$this->email_address',
                '$this->clients_pk',
                '$this->cv',
                (select pk from statuses where status = 'For Processing')
            );
            --insert into applicants_status
            --(
            --    applicants_pk,
            --    status,
            --    created_by
            --)
            --values
            --(
            --   currval('applicants_pk_seq'),
            --    (select pk from statuses where status = 'For Processing'),
            --    '$this->created_by'
            --);
            insert into applicants_talent_acquisition
            (
                applicants_pk,
                employees_pk
            )
            values
            (
                currval('applicants_pk_seq'),
                $talent_acquisition_pk
            );
            insert into applicants_logs
            (
                applicants_pk,
                type,
                details,
                created_by
            )
            values
            (
                currval('applicants_pk_seq'),
                'Logs',
                'Added new applicant.',
                $this->created_by
            );
            insert into notifications
            (
                employees_pk,
                notification,
                type,
                table_pk
            )
            values
            (
                $talent_acquisition_pk,
                'A new candidate has been added.',
                'applicants',
                currval('applicants_pk_seq')
            );
EOT;

        if($tags){
            $sql .= <<<EOT
                insert into applicants_tags
                (
                    applicants_pk,
                    tags
                )
                values
                (
                    currval('applicants_pk_seq'),
                    '$tags'
                );
EOT;
        }


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

        if(isset($data['new_status'])){
            $where .= " and applicants.statuses_pk = ". $data['new_status'];
        }

        $arr = array('Administrator', 'Director', 'Manager');
        if(!in_array($data['role'], $arr)){
            $where .= " and employees_permission.department && '{".$data['department']."}'";
        }

        if($data['role'] == "Talent Acquisition"){
            $where .= " and created_by in (select employees_pk from talent_acquisition_group where supervisor_pk = ".$data['employees_pk'].")";
        }

        if($data['role'] == "Sourcer"){
            $where .= " and created_by = ". $data['employees_pk'];
        }

        $sql = <<<EOT
                select
                    pk,
                    applicant_id,
                    (select source from sources where pk = applicants.sources_pk::int) as source,
                    created_by,
                    date_created::timestamp(0) as date_created,
                    date_received::date as date_received,
                    date_received::time as time_received,
                    (select employees_pk from applicants_talent_acquisition where applicants_pk = pk order by date_created desc limit 1) as talent_acquisition,
                    date_interaction,
                    time_completed,
                    (case when (date_received - date_created) > '2 hours'::interval then true else false end) as over_due,
                    first_name,
                    last_name,
                    middle_name,
                    birthdate::date as birthdate,
                    (select position from job_positions where pk = job_positions_pk) as profiled_for,
                    contact_number,
                    email_address,
                    endorcer,
                    endorcement_date,
                    (select client from clients where pk = applicants.clients_pk) as client,
                    cv,
                    (select status from statuses where pk = statuses_pk) as status
                from applicants
                left join employees_permission on (applicants.created_by = employees_permission.employees_pk)
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
                    applicants.sources_pk,
                    (select source from sources where pk = applicants.sources_pk::int) as source,
                    requisitions_pk,
                    (
                        select
                            requisition_id
                        from requisitions
                        where requisitions.pk = requisitions_pk
                    ) as requisition_id,
                    (
                        select
                            position
                        from requisitions
                        left join job_positions on (requisitions.job_positions_pk = job_positions.pk)
                        where requisitions.pk = requisitions_pk
                    ) as requisition_job_position,
                    (
                         select 
                              case when alternate_title != ''
                              then alternate_title 
                              when alternate_title is null
                              then alternate_title 
                              else (select position from job_positions where job_positions.pk = job_positions_pk) 
                              end 
                         from requisitions
                         where requisitions.pk = applicants.requisitions_pk
                    ) as requisition,
                    created_by,
                    date_created::timestamp(0) as date_created,
                    date_received::date as date_received,
                    date_received::time as time_received,
                    (select employees_pk from applicants_talent_acquisition where applicants_pk = pk order by date_created desc limit 1) as talent_acquisitions_pk,
                    (select employee from applicants_talent_acquisition left join employees_permission on (applicants_talent_acquisition.employees_pk = employees_permission.employees_pk) where applicants_talent_acquisition.applicants_pk = pk order by applicants_talent_acquisition.date_created desc limit 1) as talent_acquisition,
                    -- date_interaction,
                    -- time_completed,
                    -- over_due,
                    (select min(date_created) from applicants_status where applicants_pk = pk) as date_interaction,
                    (select min(date_created) - applicants.date_created from applicants_status where applicants_pk = pk) as time_interval,
                    first_name,
                    last_name,
                    middle_name,
                    birthdate::date as birthdate,
                    applicants.job_positions_pk,
                    (select position from job_positions where pk = job_positions_pk) as job_position,
                    contact_number,
                    email_address,
                    (select max(endorsement::date) from applicants_endorser where applicants_pk = pk) as endorsement_date,
                    (select max(appointment::date) from applicants_appointer where applicants_pk = pk) as appointment_date,
                    -- endorcer,
                    -- endorcement_date,
                    applicants.clients_pk,
                    (select client from clients where pk = applicants.clients_pk) as client,
                    cv,
                    statuses_pk,
                    (select status from statuses where pk = applicants.statuses_pk) as status
                from applicants
                where applicant_id = '$this->applicant_id'
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function update_cv($data){
        $remarks = pg_escape_string(trim(strip_tags($data['remarks'])));
        $employees_pk = pg_escape_string(trim(strip_tags($data['employees_pk'])));
        $applicant_id = pg_escape_string(trim(strip_tags($data['applicant_id'])));

        $sql = "begin;";
        
        $sql .= <<<EOT
                update applicants set
                (cv)
                =
                ('$this->cv')
                where applicant_id = '$applicant_id'
                ;
EOT;

        $_id = md5('pk');
        $sql .= <<<EOT
                insert into applicants_logs
                (
                    applicants_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    (select pk from applicants where applicant_id = '$applicant_id'),
                    'Remarks',
                    '$remarks',
                    $employees_pk
                );

EOT;

        $sql .= "commit;";
        return ClassParent::update($sql);
    }

    public function update($data){        
        $remarks = pg_escape_string(trim(strip_tags($data['remarks'])));
        $employees_pk = pg_escape_string(trim(strip_tags($data['employees_pk'])));
        $applicant_id = pg_escape_string(trim(strip_tags($data['applicant_id'])));

        $applicant = $this->fetch();
        $details = $applicant['result'][0];

        $applicants_pk = $details['pk'];

        $date_endorsed = null;
        if(isset($data['date_endorsed'])){
            $date_endorsed = $data['date_endorsed'];
            unset($data['date_endorsed']);
        }

        $date_appointed = null;
        if(isset($data['date_appointment'])){
            $date_appointed = $data['date_appointment'];
            unset($data['date_appointment']);
        }

        $talent_acquisitions_pk = null;
        if(isset($data['talent_acquisitions_pk'])){
            $talent_acquisitions_pk = $data['talent_acquisitions_pk'];
            unset($data['talent_acquisitions_pk']);
        }

        $post = null;
        if(isset($data['post'])){
            $remarks = $data['post'];
            unset($data['post']);
        }

        unset($data['remarks']);
        unset($data['applicant_id']);
        unset($data['employees_pk']);

        $cols = array();
        $vals = array();

        foreach($data as $k=>$v){
            array_push($cols, $k);

            if(is_numeric($v)){
                array_push($vals, (int) pg_escape_string(trim(strip_tags($v))));
            }
            else {
                array_push($vals, "'".pg_escape_string(trim(strip_tags($v)))."'");
            }
        }
        
        $cols = implode(',', $cols);
        $vals = implode(',', $vals);

        $sql = "begin;";
        if(!empty($cols) > 0){
            $sql .= <<<EOT
                    update applicants set
                    ($cols)
                    =
                    ($vals)
                    where applicant_id = '$applicant_id'
                    ;
EOT;
        }

        if(isset($talent_acquisitions_pk)){
            $sql = <<<EOT
                    insert into applicants_talent_acquisition
                    (
                        applicants_pk,
                        employees_pk
                    )
                    values
                    (
                        $applicants_pk,
                        $talent_acquisitions_pk
                    );

                    insert into applicants_logs
                    (
                        applicants_pk,
                        type,
                        details,
                        created_by
                    )
                    values
                    (
                        $applicants_pk,
                        'Logs',
                        'TALENT ACQUISITION was changed from ' || (
                                                                    select 
                                                                        employees_permission.employee
                                                                    from applicants_talent_acquisition
                                                                        left join employees_permission on (applicants_talent_acquisition.employees_pk = employees_permission.employees_pk)
                                                                    where applicants_talent_acquisition.applicants_pk = $applicants_pk and applicants_talent_acquisition.employees_pk != $talent_acquisitions_pk
                                                                    order by applicants_talent_acquisition.date_created desc limit 1
                                                                ) || ' to ' || (select employee from employees_permission where employees_pk = $talent_acquisitions_pk),
                        0
                    );
EOT;
        }

        if(isset($date_endorsed)){
            $sql .= <<<EOT
                insert into applicants_endorser
                (
                    applicants_pk,
                    endorsement,
                    employees_pk
                )
                values
                (
                    $applicants_pk,
                    '$date_endorsed',
                    $employees_pk
                );

                insert into applicants_logs
                (
                    applicants_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $applicants_pk,
                    'Logs',
                    'Set DATE OF ENDORSEMENT to $date_endorsed',
                    0
                );
EOT;
        }

        if(isset($date_appointed)){
            $sql .= <<<EOT
                insert into applicants_appointer
                (
                    applicants_pk,
                    appointment,
                    employees_pk
                )
                values
                (
                    $applicants_pk,
                    '$date_appointed',
                    $employees_pk
                );

                insert into applicants_logs
                (
                    applicants_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $applicants_pk,
                    'Logs',
                    'Set DATE OF APPOINTMENT to $date_appointed',
                    0
                );
EOT;
        }
        
        $_id = md5('pk');
        $sql .= <<<EOT
                insert into applicants_logs
                (
                    applicants_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $applicants_pk,
                    'Remarks',
                    '$remarks',
                    $employees_pk
                );
EOT;
        
        $involved_users = $this->get_contributors($applicants_pk, $employees_pk, $details['talent_acquisition_pk']);
        $users = $involved_users['result'];

        array_push($users, array('employees_pk' => $details['talent_acquisition_pk']));

        $applicant_name = $details['first_name']. " " . $details['last_name']; 
        foreach ($users as $key => $value) {
            $emp = $value['employees_pk'];
            $sql .= <<<EOT
                insert into notifications
                (
                    employees_pk,
                    notification,
                    type,
                    table_pk
                )
                values
                (   
                    $emp,
                    'Applicant $applicant_name has been modified.'
                    'applicants',
                    $applicants_pk,
                );
EOT;
        }

        $sql .= "commit;";
        return ClassParent::update($sql);
    }

    private function get_contributors($applicants_pk, $self, $ta){
        $sql = <<<EOT
                select
                    distinct(created_by) as employees_pk
                from applicants_logs
                where applicants_pk = $applicants_pk
                and created_by not in ($self, $ta, 0)
                ;
EOT;

        return ClassParent::get($sql);   
    }

    public function fetch_remarks($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }
        
        $offset = $data['offset'];
        $applicants_pk = $data['applicants_pk'];
        $sql = <<<EOT
                select
                    applicants_pk,
                    details,
                    date_created::timestamp(0) as date_created,
                    (select employee from employees_permission where employees_pk = created_by) as name
                from applicants_logs
                where applicants_pk = $applicants_pk
                order by date_created desc, applicants_pk desc
                offset $offset limit 10
                ;
EOT;
        
        return ClassParent::get($sql);   
    }

    public function dashboard_applicants_count($data){
        $datenow = date('Y-m-01 0000');

        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $where = '';
        foreach ($data as $key => $value) {
            if($key == "department"){
                $where .= " and employees_permission." . $key . " && '{" . $value ."}'";
            }
            else {
                $where .= " and applicants." . $key . " = " . $value;    
            }
            
        }

        $sql = <<<EOT
                select
                    coalesce(sum(case when statuses.status = 'For Processing' then 1 else 0 end), 0) as pending,
                    coalesce(sum(case when statuses.status != 'For Processing' then 1 else 0 end), 0) as processed
                from applicants
                left join statuses on (applicants.statuses_pk = statuses.pk)
                left join employees_permission on (applicants.created_by = employees_permission.employees_pk)
                where applicants.date_created between '$datenow'::timestamptz and '$datenow'::timestamptz + interval '1 month' - interval '1 millisecond'
                $where
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function check_duplicate(){
        $sql = <<<EOT
                select
                    applicant_id,
                    first_name,
                    middle_name,
                    last_name,
                    birthdate::date as birthdate
                from applicants
                where lower(first_name) = lower('$this->first_name')
                and lower(middle_name) = lower('$this->middle_name')
                and lower(last_name) = lower('$this->last_name')
                and birthdate = '$this->birthdate'
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>