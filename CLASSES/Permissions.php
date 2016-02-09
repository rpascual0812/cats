<?php
require_once('../../CLASSES/ClassParent.php');
class Permissions extends ClassParent {

    var $pk = NULL;
    var $parent = NULL;
    var $item = NULL;
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
            insert into permissions
            (
                parent,
                status
            )
            values
            (
                '$this->parent'
                '$this->item'
            );
EOT;

        return ClassParent::insert($sql);
    }

    public function fetch(){
        $where="true";
        if($this->pk){
            $where .= " and pk = $this->pk";
        }

        if($this->parent){
            $where .= " and parent = '$this->parent'";
        }

        if($this->item){
            $where .= " and item = '$this->parent'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select
                    parent,
                    array_to_string(array_agg(item), '||') as items
                from permissions
                where $where
                group by parent
                order by parent
                ;
EOT;

        $arr = ClassParent::get($sql);

        $new = array();
        foreach ($arr['result'] as $key => $value) {
            $new[$value['parent']] = explode('||', $value['items']);
        }
        
        $arr['result'] = $new;
        return $arr;
    }
}
?>