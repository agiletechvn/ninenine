<?php

class AmazonController extends FBToolController {

    function index() {
        
    }
    
    function export(){
        $list = db_select('tbl_amazon_check', array('user','pass'));
        
        $lines = [];
        foreach($list as $v){
            $lines[] = $v['user'] . '|' . $v['pass'] . "\n";            
        }
        
        file_put_contents(PROCESS_PATH . 'scripts/amazon_all.txt', $lines);
    }

    function check() {

        $this->load();
    }

    function update() {
        if (isset($_POST['acc_list'])) {
            $lines = array_filter(preg_split("#\n+#", $_POST['acc_list']));
            $agents = file(PROCESS_PATH . 'scripts/agent.txt');
            foreach ($lines as $line) {
                @list($user, $pass) = explode('|', $line);
                $user = trim($user);
                $pass = trim($pass);
                if ($user && $pass) {
                    $data = compact('user', 'pass');

                    $id = db_select_one('tble_amazon_check', 'id', array('user' => $user), true);
                    if ($id) {
                        // update
                        db_update('tbl_amazon_check', $data, array('id' => $id));
                    } else {
                        $data['agent'] = trim($agents[array_rand($agents)]);
                        db_insert('tbl_amazon_check', $data);
                    }
                }
            }
//            $this->json($lines);
        }
    }

    function checkuser() {
        if (isset($_GET['user'])) {
            $ret = db_select_one('tbl_amazon_check', array('user', 'pass', 'result', 'check'), array('user' => $_GET['user']));

            if ($ret['result'] && $ret['result'][0] == '{' && strlen($ret['result']) > 10) {
                $ret['result'] = json_decode($ret['result'], true);                
                $ret['success'] = true;
            } else {
                $ret['success'] = false;
            }

            $this->json($ret);
        }
    }
    
    function result() {
        
        $page = isset($_GET['page']) ? +$_GET['page'] : 1;
        $where = array('success' => 1);
        $rows_per_page = 10;
        
        $numrows = db_select_one('tbl_amazon_check', 'COUNT(*)', $where, true);
        
        $pager = array(
            'numpages' => ceil($numrows / $rows_per_page),
            'link' => 'amazon/result',
            'total' => $numrows
        );
        $offset = ($page - 1) * $rows_per_page;
        
        $fields = array('user', 'pass', 'result');
        if(isset($_GET['agent'])){
            $fields[] = 'agent';
            $this->assign('agent',true);
        }

        $list = db_select('tbl_amazon_check', $fields, $where, false, "$offset, $rows_per_page", 'id DESC');                
        
        foreach ($list as &$v) {
            $v['result'] = json_decode($v['result'], true);
        }
        $this->assign(
                'list', $list, 'PAGING', helper('paging', $pager)
        )->load();
    }
    
    function export_success($filename = 'amazon_check'){
        $list = db_select('tbl_amazon_check', array('user','pass','agent','result'),array('success' => 1));
        
        $lines = [];
        foreach($list as $v){            
            $lines[] = $v['user'] . '|' . $v['pass'] . '|' . $v['agent'] . '|' . $v['result'] . "\n";            
        }
        
        file_put_contents(PROCESS_PATH . "scripts/$filename.txt", $lines);
    }

}
