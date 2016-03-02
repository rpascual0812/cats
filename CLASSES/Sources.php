<?php
require_once('../../CLASSES/ClassParent.php');
class Sources extends ClassParent {

    var $pk = NULL;
    var $source = NULL;
    var $archived = NULL;

    public function __construct($data){
        //sanitize
        foreach($data as $k=>$v){
            $this->$k = pg_escape_string(trim(strip_tags($v)));
        }

        return(true);
    }

    public function create(){        
        $sql .= <<<EOT
            insert into sources
            (
                source
            )
            values
            (
                '$this->source'
            );
EOT;

        return ClassParent::insert($sql);
    }

    public function fetch($data){
        $where="";

        if(isset($data['text']) && !empty($data['text'])){
            $where .= " and source ilike '%".$data['text']."%'";
        }

        if($this->source){
            $where .= " and source = '$this->source'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $current_page = $data['current_page'];
        $page_size = $data['page_size'];

        $offset = 0;
        $limit = $page_size;
        $offset = ((int) $current_page - 1) * $limit;

        if($page_size && $current_page){
            $paginate = 'offset '.$offset.' limit '.$limit;
        }

        $sql = <<<EOT
                select
                    pk,
                    source,
                    archived,
                    (select count(*) from sources where true $where) as total
                from sources
                where true $where
                order by source
                $paginate
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function fetch_all($data){
        if($this->source){
            $where .= " and source = '$this->source'";
        }

        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        $sql = <<<EOT
                select
                    pk,
                    source,
                    archived,
                    (select count(*) from sources where true $where) as total
                from sources
                where true $where
                order by source
                ;
EOT;

        return ClassParent::get($sql);
    }

    function update($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $cols = array();
        $vals = array();

        if($this->source){
            array_push($cols, 'source');
            array_push($vals, "'".$this->source."'");
        }

        if($this->archived){
            array_push($cols, 'archived');
            array_push($vals, "'".$this->archived."'");
        }

        $cols = implode(',', $cols);
        $vals = implode(',', $vals);

        $remarks = $data['remarks'];
        $created_by = $data['created_by'];

        $sql = "begin;";
        $sql .= <<<EOT
                update sources set
                ($cols)
                =
                ($vals)
                where pk = $this->pk
                ;

                insert into sources_logs
                (
                    source_pk,
                    type,
                    details,
                    created_by
                )
                values
                (
                    $this->pk,
                    'Remarks',
                    '$remarks',
                    '$created_by'
                );
EOT;

        $sql .= 'commit;';
        return ClassParent::update($sql);
    }

    public function logs($data){
        foreach($data as $k=>$v){
            $data[$k] = pg_escape_string(trim(strip_tags($v)));
        }

        $offset = $data['offset'];
        $sql = <<<EOT
            select
                details,
                    date_created::timestamp(0) as date_created,
                    (select employee from employees_permission where employees_pk = created_by) as name
            from sources_logs
            order by date_created desc
            offset $offset limit 5
EOT;

        return ClassParent::get($sql);
    }
}
?>