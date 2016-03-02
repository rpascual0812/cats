<?php
require_once('../../CLASSES/ClassParent.php');
class Profiles extends ClassParent {

    var $pk = NULL;
    var $position = NULL;
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
            insert into job_positions
            (
                position
            )
            values
            (
                '$this->position'
            );
EOT;

        return ClassParent::insert($sql);
    }

    public function fetch($data){
        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        if(isset($data['text']) && !empty($data['text'])){
            $where .= " and position ilike '%".$data['text']."%'";
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
                    position,
                    archived,
                    (select count(*) from job_positions where true $where) as total
                from job_positions
                where true $where
                order by position
                $paginate
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function fetch_all($data){
        if($this->archived){
            $where .= " and archived = $this->archived";
        }

        if(isset($data['text']) && !empty($data['text'])){
            $where .= " and position ilike '%".$data['text']."%'";
        }

        $sql = <<<EOT
                select
                    pk,
                    position,
                    archived,
                    (select count(*) from job_positions where true $where) as total
                from job_positions
                where true $where
                order by position
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

        if($this->position){
            array_push($cols, 'position');
            array_push($vals, "'".$this->position."'");
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
                update job_positions set
                ($cols)
                =
                ($vals)
                where pk = $this->pk
                ;

                insert into job_positions_logs
                (
                    position_pk,
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
        $sql .= <<<EOT
            select
                details,
                    date_created::timestamp(0) as date_created,
                    (select employee from employees_permission where employees_pk = created_by) as name
            from job_positions_logs
            order by date_created desc
            offset $offset limit 5
EOT;

        return ClassParent::get($sql);
    }
}
?>