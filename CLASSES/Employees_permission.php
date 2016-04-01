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

    public function fetch(){
        $sql = <<<EOT
                select 
                    employees_pk,
                    employee_id,
                    employee,
                    title,
                    array_to_string(department, ',') as department,
                    roles_pk,
                    supervisor,
                    (select role from roles where pk = roles_pk) as role,
                    permission
                from employees_permission
                where employees_pk = $this->employees_pk
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function talent_acquisitions(){
        $sql = <<<EOT
                select 
                    employees_pk,
                    employee_id,
                    employee,
                    roles_pk,
                    permission
                from employees_permission
                where roles_pk in (select pk from roles where role = 'Talent Acquisition')
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function sourcers($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $where = "where roles_pk in (select pk from roles where role = 'Sourcer')";
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
                    employees_permission.roles_pk,
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

    function update($data){
        foreach($data as $k=>$v){
            if($k == "permission")
                $data[$k] = pg_escape_string(trim(strip_tags(stripslashes(json_encode($v)))));
            else
                $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }
        
        $employees_pk = $data['employees_pk'];
        $employee_id = $data['employee_id'];
        $employee_name = $data['employee_name'];
        $title = $data['title'];
        $department = "{".$data['department']."}";
        $supervisor = $data['supervisor'];
        $created_by = $data['created_by'];
        $roles_pk = $data['roles_pk'];
        $permission = substr($data['permission'], 1, -1);
        $remarks = $data['remarks'];

        $check = <<<EOT
                select employee_id from employees_permission where employees_pk = $employees_pk;
EOT;
        $check_query = ClassParent::get($check);

        $sql = "begin;";
        if($check_query['status']){
            $sql .= <<<EOT
                    update employees_permission set
                    (
                        title,
                        department,
                        supervisor,
                        roles_pk,
                        permission
                    )
                    =
                    (
                        '$title',
                        '$department',
                        $supervisor,
                        $roles_pk,
                        '$permission'
                    )
                    where employees_pk = $employees_pk
                    ;
EOT;

            $sql .= <<<EOT
                insert into employees_permission_logs
                (
                    employees_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $employees_pk,
                    'Remarks',
                    '$remarks',
                    $created_by
                );
EOT;

            $sql .= "commit;";
            return ClassParent::update($sql);
        }
        else {
            $sql .= <<<EOT
                    insert into employees_permission
                    (
                        employees_pk,
                        employee_id,
                        employee,
                        title,
                        department,
                        supervisor,
                        roles_pk,
                        permission
                    )
                    values
                    (
                        $employees_pk,
                        $employee_id,
                        '$employee_name',
                        '$title',
                        '$department',
                        $supervisor,
                        $roles_pk,
                        '$permission'
                    );
EOT;

            $sql .= <<<EOT
                insert into employees_permission_logs
                (
                    employees_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $employees_pk,
                    'Remarks',
                    '$remarks',
                    $created_by
                );

EOT;

            $sql .= "commit;";
            return ClassParent::insert($sql);    
        }
    }
}
?>