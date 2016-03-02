<?php
require_once('../../CLASSES/ClassParent.php');
class Clients extends ClassParent {

    var $pk = NULL;
    var $code = NULL;
    var $client = NULL;
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
            insert into clients
            (
                code,
                client
            )
            values
            (
                '$this->code',
                '$this->client'
            );
EOT;

        return ClassParent::insert($sql);
    }

    public function fetch($data){
        $where="";

        if(isset($data['text']) && !empty($data['text'])){
            $where .= " and (client ilike '%".$data['text']."%' or code ilike '%".$data['text']."%')";
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
                    code,
                    client,
                    archived,
                    (select count(*) from clients where true $where) as total
                from clients
                where true $where
                order by client
                $paginate
                ;
EOT;

        return ClassParent::get($sql);
    }

    public function fetch_all($data){
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
                    pk,
                    code,
                    client,
                    archived,
                    (select count(*) from clients where true $where) as total
                from clients
                where true $where
                order by client
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

        if($this->code){
            array_push($cols, 'code');
            array_push($vals, "'".$this->code."'");
        }

        if($this->client){
            array_push($cols, 'client');
            array_push($vals, "'".$this->client."'");
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
                update clients set
                ($cols)
                =
                ($vals)
                where pk = $this->pk
                ;

                insert into clients_logs
                (
                    client_pk,
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
            from clients_logs
            order by date_created desc
            offset $offset limit 5
EOT;

        return ClassParent::get($sql);
    }
}
?>