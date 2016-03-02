<?php
require_once('../../CLASSES/ClassParent.php');
class Employees_permission extends ClassParent {

    var $employees_pk = NULL;
    var $employee_id = NULL;
    var $employee = NULL;
    var $role = NULL;
    var $permission = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function talent_acquisitions(){
        $sql = <<<EOT
                select 
                    employees_pk,
                    employee_id,
                    employee,
                    role,
                    permission
                from employees_permission
                where role in (select pk from roles where role = 'Talent Acquisition')
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function sourcers($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $where = "where role in (select pk from roles where role = 'Sourcer')";
        if($data['search'] != 'undefined'){
            $where .= " and employee ilike '%".$data['search']."%'";
        }

        if($data['talent_acquisition'] == 'All Talent Acquisitions'){
            // skip
        }
        else if($data['talent_acquisition'] == 'Not Yet Assigned'){
            $where .= " and employees_permission.employees_pk not in (select employees_pk from talent_acquisition_group)"; 
        }
        else {
            $where .= " and talent_acquisition_group.supervisor_pk = ". $data['talent_acquisition'];
        }

        $sql = <<<EOT
                select 
                    employees_permission.employees_pk,
                    employees_permission.employee_id,
                    employees_permission.employee,
                    employees_permission.role,
                    employees_permission.permission,
                    coalesce((select supervisor_pk from talent_acquisition_group where employees_pk = employees_permission.employees_pk),0) as talent_acquisition
                from employees_permission
                left join talent_acquisition_group on (employees_permission.employees_pk = talent_acquisition_group.employees_pk)
                $where
                order by employees_permission.employee
                ;
EOT;

        return ClassParent::get($sql);
    }

    function update_sourcer_talent_acquisitions($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $employees_pk = $data['employees_pk'];
        $supervisor_pk = $data['supervisor_pk'];

        $sql = "begin;";
        $sql .= <<<EOT
                delete from talent_acquisition_group
                where employees_pk = $employees_pk
                ;
EOT;

        $sql .= <<<EOT
                insert into talent_acquisition_group
                (employees_pk,supervisor_pk)
                values
                ($employees_pk, $supervisor_pk)
                ;
EOT;

        $sql .= "commit;";

        return ClassParent::insert($sql);
    }

}
?>