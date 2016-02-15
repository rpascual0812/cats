<?php
require_once('../../CLASSES/ClassParent.php');
class Notifications extends ClassParent {

    var $pk = NULL;
    var $employees_pk = NULL;
    var $notification = NULL;
    var $type = NULL;
    var $table_pk = NULL;
    var $date_created = NULL;
    var $read = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function fetch(){
        $where="true";
        if($this->employees_pk){
            $where .= " pk = $this->pk";
        }

        if($this->notification){
            $where .= " and notification = '$this->notification'";
        }

        if($this->date_created){
            $where .= " and date_created = '$this->date_created'";
        }

        // if($this->read){
        //     $where .= " and read = '$this->read'";
        // }

        $sql = <<<EOT
                select
                    pk,
                    employees_pk,
                    notification,
                    type,
                    table_pk,
                    date_created::timestamp(0) as date_created,
                    case when read = false then 'online' else 'offline' end as status,
                    (select applicant_id from applicants where pk = table_pk) as applicant_id
                from notifications
                where $where
                order by date_created desc
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function update(){
        $sql = <<<EOT
                update notifications set
                read = '$this->read'
                where pk = $this->pk
                ;
EOT;

        return ClassParent::update($sql);
    }
}
?>