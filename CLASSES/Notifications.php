<?php
require_once('../../CLASSES/ClassParent.php');
class Notifications extends ClassParent {

    var $employees_pk = NULL;
    var $notification = NULL;
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
            $where .= " notification = '$this->notification'";
        }

        if($this->date_created){
            $where .= " date_created = '$this->date_created'";
        }

        if($this->read){
            $where .= " read = $this->read";
        }

        $sql = <<<EOT
                select
                    employees_pk,
                    notification,
                    date_created,
                    read
                from notifications
                where $where
                order by date_created desc
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>