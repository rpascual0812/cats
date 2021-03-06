<?php
require_once('../../CLASSES/ClassParent.php');
class Employees extends ClassParent {

    var $pk = NULL;
    var $employee_id = NULL;
    var $first_name = NULL;
    var $middle_name = NULL;
    var $last_name = NULL;
    var $email_address = NULL;
    var $archived = NULL;

    public function __construct(
                                    $pk,
                                    $employee_id,
                                    $first_name,
                                    $middle_name,
                                    $last_name,
                                    $email_address,
                                    $archived
                                ){
        
        $fields = get_defined_vars();
        
        if(empty($fields)){
            return(FALSE);
        }

        //sanitize
        foreach($fields as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function auth($post){
        $empid = pg_escape_string(strip_tags(trim($post['empid'])));
        $password = pg_escape_string(strip_tags(trim($post['password'])));

        $sql = <<<EOT
                select 
                    employees.*
                from accounts
                left join employees on (accounts.employee_id = employees.employee_id)
                where employees.archived = false
                and accounts.employee_id = '$empid'
                and accounts.password = md5('$password')
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function fetch($post){
        $title = pg_escape_string(strip_tags(trim($post['title'])));

        $sql = <<<EOT
                with A as
                (
                    select 
                        employees.pk,
                        employees.employee_id,
                        employees.first_name,
                        employees.middle_name,
                        employees.last_name,
                        employees.email_address,
                        employees_titles.titles_pk
                    from employees
                    left join employees_titles on (employees.pk = employees_titles.employees_pk)
                    where employees.archived = false
                )
                select
                    *
                from A
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function profile(){
        $sql = <<<EOT
                select 
                    pk,
                    employee_id,
                    first_name,
                    middle_name,
                    last_name,
                    email_address,
                    business_email_address,
                    titles_pk,
                    (select title from titles where pk = titles_pk) as position,
                    level
                from employees
                where archived = false
                and md5(pk::text) = '$this->pk'
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function employees_permissions($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $sql = <<<EOT
                select 
                    employees_pk,
                    employee_id,
                    employee,
                    title,
                    array_to_string(department, ',') as department,
                    roles_pk,
                    (select employee from employees_permission as A where A.employees_pk = employees_permission.supervisor) as supervisor,
                    (select role from roles where pk = roles_pk) as role,
                    permission
                from employees_permission
                order by employee
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function permissions($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $employees_pk = $data['employees_pk'];
        $sql = <<<EOT
                select 
                    employees_pk,
                    employee_id,
                    employee,
                    roles_pk,
                    permission
                from employees_permission
                where md5(employees_pk::text) = '$employees_pk'
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function save_permission($data){
        
        $check = $data;
        $check['employees_pk'] = md5($check['employees_pk']);
        $p = $this->permissions($check);

        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $employees_pk = $data['employees_pk'];
        $employee_id = $data['employee_id'];
        $employee = $data['employee'];
        $permission = "'{".$data['permission']."}'";
        $role = $data['role'];
        
        if($p['status']){
            $sql = <<<EOT
                    update employees_permission set
                    (role,permission)
                    =
                    ($role, $permission)
                    where employees_pk = '$employees_pk'
                    ;
EOT;
            return ClassParent::update($sql);
        }
        else {
            $sql = <<<EOT
                    insert into employees_permission
                    (
                        employees_pk,
                        employee_id,
                        employee,
                        role,
                        permission
                    )
                    values
                    (
                        $employees_pk,
                        '$employee_id',
                        '$employee',
                        $role,
                        $permission
                    );
EOT;
            return ClassParent::insert($sql);
        }
    }

    public function search($txt){
        $txt = pg_escape_string(trim(strip_tags($txt)));

        $sql = <<<EOT
                select
                    pk,
                    employee_id,
                    first_name,
                    last_name,
                    middle_name,
                    first_name||' '||middle_name||' '||last_name as name,
                    -- first_name||' '||middle_name||' '||last_name||' ('||employee_id||')' as name,
                    email_address,
                    (
                        select
                            titles.title
                        from titles
                        where titles.pk = employees.titles_pk
                    ) as title,
                    (
                        with Q as
                        (
                            select
                                unnest(A.department) as departments_pk
                            from employees as A
                            where A.pk = employees.pk 
                        )
                        select
                            array_to_string(array_agg(department),',')
                        from Q
                        left join departments on (pk = Q.departments_pk)
                    ) as department,
                    (
                        select
                            supervisor_pk
                        from groupings
                        where employees_pk = employees.pk
                    ) as supervisor
                from employees
                where archived = false
                and (
                    first_name ilike '$txt%' or
                    last_name ilike '$txt%' or
                    middle_name ilike '$txt%' or
                    employee_id ilike '$txt%' or
                    first_name||' '||last_name ilike '$txt%' or
                    first_name||' '||middle_name||' '||last_name ilike '$txt%'
                )
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function roles($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $archived = $data['archived'];
        $sql = <<<EOT
                select 
                    pk,
                    role
                from roles
                where archived = $archived
                order by r_order
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>