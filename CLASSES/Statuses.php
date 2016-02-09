<?php
require_once('../../CLASSES/ClassParent.php');
class Statuses extends ClassParent {

    var $pk = NULL;
    var $status = NULL;
    var $archived = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function create(){
        $applicant_id = $this->random_string();
        
        $sql .= <<<EOT
            insert into statuses
            (
                status
            )
            values
            (
                '$this->status'
            );
EOT;

        $sql .= "commit;";
        return ClassParent::insert($sql);
    }

    public function fetch(){
        $where="true";
        if($this->pk){
            $where .= " and pk = $this->pk";
        }

        if($this->status){
            $where .= " and status = '$this->status'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select
                    pk,
                    status,
                    archived
                from statuses
                where $where
                order by status
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>