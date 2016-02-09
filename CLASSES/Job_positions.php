<?php
require_once('../../CLASSES/ClassParent.php');
class Job_positions extends ClassParent {

    var $pk = NULL;
    var $position = NULL;
    var $archived = NULL;

    public function __construct(
                                    $pk,
                                    $position,
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

    public function fetch(){
        $where = "true";
        if($this->pk){
            $where .= " and pk = $this->pk";
        }

        if($this->position){
            $where .= " and position = '$this->position'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select 
                    *
                from job_positions
                where $where
                order by position
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>