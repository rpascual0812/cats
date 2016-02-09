<?php
require_once('../../CLASSES/ClassParent.php');
class Sources extends ClassParent {

    var $pk = NULL;
    var $source = NULL;
    var $archived = NULL;

    public function __construct(
                                    $pk,
                                    $source,
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

        if($this->source){
            $where .= " and source = '$this->source'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select 
                    *
                from sources
                where $where
                order by source
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>