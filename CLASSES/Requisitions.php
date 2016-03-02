<?php
require_once('../../CLASSES/ClassParent.php');
class Requisitions extends ClassParent {

    var $pk = NULL;
    var $profile = NULL;
    var $total = NULL;
    var $end_date = NULL;
    var $remarks = NULL;
    var $created_by = NULL;
    var $date_created = NULL;
    var $archived = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function create($data){
        $profile_pk = pg_escape_string(trim(strip_tags($data['profile_pk'])));

        $sql = "begin;";
        $sql .= <<<EOT
            insert into requisitions
            (
                requisition_id,
                profile,
                total,
                end_date,
                created_by
            )
            values
            (
                coalesce((select to_char(now(), 'YYMM-') || lpad((substring(max(requisition_id) from 6 for 4)::int + 1)::text, 4, '0') from requisitions), to_char(now(), 'YYMM-0001')),
                $profile_pk,
                $this->total,
                '$this->end_date',
                $this->created_by
            );
            insert into requisitions_logs
            (
                requisitions_pk,
                type,
                details,
                created_by
            )
            values
            (
                currval('requisitions_pk_seq'),
                'Remarks',
                '$this->remarks',
                $this->created_by
            );
EOT;

        $sourcers_sql = <<<EOT
            select employees_pk from talent_acquisition_group where supervisor_pk = $this->created_by
EOT;

        $sourcers = ClassParent::get($sourcers_sql);
        
        foreach ($sourcers['result'] as $k=>$v) {
            $employees_pk = $v['employees_pk'];

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
                        $employees_pk,
                        'A new requisition has been submitted by ' || (select employee from employees_permission where employees_pk = $this->created_by),
                        'requisitions',
                        currval('requisitions_pk_seq')
                    );
EOT;
        }

        $sql .= "commit;";

        return ClassParent::insert($sql);
    }

    public function fetch(){
        $where="true";
        
        $sql = <<<EOT
                select
                    pk,
                    requisition_id,
                    profile as profile_pk,
                    (select position from job_positions where pk = profile) as profile,
                    total as needed,
                    0 as processing,
                    0 as nothired,
                    0 as hired,
                    (select employee from employees_permission where employees_pk = created_by) as created_by,
                    end_date::timestamp(0) as end_date,
                    date_created::timestamp(0) as date_created
                from requisitions
                where $where
                order by date_created asc
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function request(){
        $where="true";
        
        $sql = <<<EOT
                select
                    pk,
                    requisition_id,
                    profile as profile_pk,
                    (select position from job_positions where pk = profile) as profile,
                    total as needed,
                    0 as processing,
                    0 as nothired,
                    0 as hired,
                    (select employee from employees_permission where employees_pk = created_by) as created_by,
                    end_date::timestamp(0) as end_date,
                    date_created::timestamp(0) as date_created
                from requisitions
                where requisition_id = '$this->requisition_id'
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function fetch_remarks($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $requisitions_pk = $data['requisitions_pk'];
        $sql = <<<EOT
                select
                    requisitions_pk,
                    details,
                    date_created::timestamp(0) as date_created,
                    (select employee from employees_permission where employees_pk = created_by) as name
                from requisitions_logs
                where requisitions_pk = $requisitions_pk
                order by date_created desc, requisitions_pk desc
                ;
EOT;
        
        return ClassParent::get($sql);   
    }

    public function update($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $remarks = $data['remarks'];
        $employees_pk = $data['employees_pk'];
        $requisition_id = $data['requisition_id'];
        $requisitions_pk = $data['requisitions_pk'];

        unset($data['remarks']);
        unset($data['employees_pk']);
        unset($data['requisition_id']);
        unset($data['requisitions_pk']);

        if(isset($data['post'])){
            $remarks = $data['post'];
            unset($data['post']);
        }

        $cols=array();
        $vals=array();

        foreach($data as $k=>$v){
            array_push($cols, $k);

            if(is_numeric($v)){
                array_push($vals, $v);
            }
            else {
                array_push($vals, "'".$v."'");
            }
        }

        $cols = implode(',', $cols);
        $vals = implode(',', $vals);

        $sql = "begin;";

        if(!empty($cols) > 0){
        $sql .= <<<EOT
                update requisitions set
                ($cols)
                =
                ($vals)
                where pk = $requisitions_pk
                ;
EOT;
        }

        $sql .= <<<EOT
                insert into requisitions_logs
                (
                    requisitions_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $requisitions_pk,
                    'Remarks',
                    '$remarks',
                    $employees_pk
                );
EOT;

        $involved_users = $this->get_contributors($pk, $employees_pk);
        $users = $involved_users['result'];

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
                    'Requisition $requistion_id has been modified.'
                    'requisition',
                    $requisitions_pk,
                );
EOT;
        }

        $sql .= "commit;";

        return ClassParent::update($sql);
    }

    private function get_contributors($requisitions_pk, $self){
        $sql = <<<EOT
                select
                    distinct(created_by) as employees_pk
                from requisitions_logs
                where requisitions_pk = $requisitions_pk
                and created_by not in ($self, 0)
                ;
EOT;

        return ClassParent::get($sql);   
    }
}
?>