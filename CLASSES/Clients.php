<?php
require_once('../../CLASSES/ClassParent.php');
class Clients extends ClassParent {

    var $pk = NULL;
    var $code = NULL;
    var $client = NULL;
    var $archived = NULL;

    public function __construct(
                                    $pk,
                                    $code,
                                    $client,
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

        if($this->code){
            $where .= " and code = '$this->code'";
        }

        if($this->client){
            $where .= " and client = '$this->client'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select 
                    *
                from clients
                where $where
                order by client
                ;
EOT;

        return ClassParent::get($sql);
    }
}
?>