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

class YoutubeController extends FBToolController {

    protected $table = 'tbl_ssh_thuan';

//    protected $blacklist = [];

    function split($file, $num = 3) {
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        if (!empty($lines)) {
            $size = ceil(count($lines) / $num);
            $parts = array_chunk($lines, $size);

            for ($ind = 1; $ind <= $num; $ind++) {
                $part = $parts[$ind - 1];

                file_put_contents(PROCESS_PATH . "scripts/$file-$ind.txt", $part);
            }
        }
    }

    function index($folder = 'ssh_files') {
        
    }

    function show() {
        $list = db_select('tbl_ssh_done', '*');

        $this->assign('list', $list);
    }

    function crawler() {
        for ($ind = 0; $ind < 20; $ind++) {
            echo "running $ind\n";
            sleep(1);
        }
    }

    function test_ssh($ip, $user, $pass) {
        $cmd .= "sshpass ";
        if ($pass) {
            $cmd .= "-p$pass ";
        }
        $cmd .= "ssh -o StrictHostKeyChecking=no $user@$ip -f -C -N -D 1111 > /dev/null 2>/dev/null &";
        $ret = shell_exec($cmd);

        print_r($ret);
    }

    function carinsurance($ip, $port, $agent) {
        $script = PROCESS_PATH . 'scripts/carinsurance.js';
        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
        $ret = exec($this->casper() . " --ignore-ssl-errors=true  --disk-cache=true $script --url='http://carsinsuranceblog.online/' $proxy $cookie $agent_str");
        if ($ret) {
            echo "$ip: $ret\n";
        }
    }

    function update_agent(array &$array, $save = true) {

        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
        $mobile_agents = file(PROCESS_PATH . 'scripts/mobile_agent1.txt');
        $viewports = file(PROCESS_PATH . 'scripts/mobile_viewport.txt');

        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');


        foreach ($array as &$item) {

            list($mobile_width, $mobile_height) = explode('|', $viewports[array_rand($viewports)]);
            list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
            // update again

            if ($save) {
                db_update($this->table, array(
                    'mobile_agent' => $mobile_agents[array_rand($mobile_agents)],
                    'agent' => $agents[array_rand($agents)],
                    'width' => $width,
                    'height' => $height,
                    'mobile_width' => $mobile_width,
                    'mobile_height' => $mobile_height
                        ), array('id' => $item['id']));
            } else {
                $item['mobile_agent'] = trim($mobile_agents[array_rand($mobile_agents)]);
                $item['agent'] = trim($agents[array_rand($agents)]);
                $item['width'] = $width;
                $item['height'] = $height;
                $item['mobile_width'] = trim($mobile_width);
                $item['mobile_height'] = trim($mobile_height);
            }
        }
    }

//    function checkip($ip, $port, $timeout = 10000) {
//        if (isset($this->blacklist[$ip])) {
//            return false;
//        }
//
//        return $this->check_port($port, $timeout);
//    }

    function youtube($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/youtube.js';
        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
        // cache images
        $cmd = $this->casper() . " --url='$url' --width=$width --height=$height --click=$click $script $cookie $proxy $agent_str";
        // will always kill this process after 180 seconds
        //$cmd .= " && (sleep 180 ; kill -TERM $!; sleep 1; kill -9 $!)";
        $ret = array();
        exec($cmd, $ret);
        if ($ret) {
            echo "$ip: \n" . print_r($ret) . "\n";
        }
        // has response
        if (isset($ret[0])) {

            foreach ($ret as $row) {
                // check exit or maximun step timeout
                $ret_str = strtolower(substr(trim($row), 0, 6));
                // check exit or maximun step timeout, Unsafe javascript ?, Exiting @@                
                if ($ret_str === 'exitin' || $ret_str === 'maximu' || $ret_str === 'unsafe') {
                    return false;
                }
            }

            // it is ok, has viewed
            return true;
        }

        // default is problem
        return false;
//        echo "\n\n";
    }

    function update_amazon($file, $output) {
        // save to amazon
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

    function update_amazon_file($file) {
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        foreach ($lines as &$line) {
            @list($user, $pass, $agent) = explode('|', $line);
            $user = trim($user);
            $pass = trim($pass);
            $agent = trim($agent);

            $data = compact('user', 'pass', 'agent');

            $id = db_select_one('tbl_amazon_check', 'id', array('user' => $user), true);
            if ($id) {
                // update
                db_update('tbl_amazon_check', $data, array('id' => $id));
            } else {
                db_insert('tbl_amazon_check', $data);
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

    function spam_amazon($port, $start, $stop, $ctr = 10, $remove_ip = 1, $mobile_rate = 3, $timeout = 10000) {

        // get file to run for this instance
//        $ind_file = +$port - 1110;
//        $lines = file(PROCESS_PATH . "scripts/spam_amazon/$ind_file.txt");
        // each instance has a range of ip, then run a file of amazon acc list
        $where = array("id > $start", "id <= $stop");
//        if ($is_american != -1) {
//            $where['is_american'] = $is_american;
//        }
        $ip_list = db_select($this->table, array('ip', 'user', 'pass'), $where, false, 0, 'id ASC');

        // to get ssh by circle
        $ind_list = 0;

//        foreach ($lines as $line) {
        while (true) {
//            $user = 'skippershe@sbcglobal.net';
//            $pass = 'marios';            
//            $agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';
//            @list($user, $pass, $agent) = explode('|', $line);
//            $user = trim($user);
//            $pass = trim($pass);
//            $agent = trim($agent);

            $line = db_query_one('SELECT `user`,`pass`,`agent`,`id` FROM tbl_amazon_check WHERE (`check` = 0 and `processing` = 0) ORDER BY `id` DESC LIMIT 1');

            if ($line) {

                // mark this item as processing
                db_update('tbl_amazon_check', array('processing' => 1), array('id' => $line['id']));

                $user = $line['user'];
                $pass = $line['pass'];
                $agent = $line['agent'];

                // update info
                $agent_str = "--agent='$agent'";
                $login = "--username='$user' --password='$pass'";
                $cookie = ""; // "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$user.txt";
                $script = PROCESS_PATH . 'scripts/amazon.js';
                $jquery = MEDIA_PATH . 'js/jquery-2.2.1.min.js';
                $test = $this->get_next_ssh($ip_list, $ind_list, $timeout, $port);

                // if ok
                if ($test) {

                    $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
//                $proxy = "";
                    // cache images, viewport as desktop
                    $cmd = $this->casper();
                    //$cmd .= " --jquery=$jquery";
                    $cmd .= " --disk-cache=true --width=1024 --height=800 $script $login $cookie $proxy $agent_str";

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
                    db_update('tbl_amazon_check', $updated_data, array('id' => $line['id']));
                } else {
                    // not check, just processing
                    db_update('tbl_amazon_check', array('check' => 0, 'processing' => 0), array('id' => $line['id']));
                }

                // update processing = 1;
                $this->close_port($port);
            }

            // sleep 1 second
            sleep(1);
        }
    }

    function amazon_update() {
        $ret = db_select('tbl_amazon_check', array('id', 'result'));
        foreach ($ret as &$v) {
            if ($v['result'] && $v['result'][0] == '{' && strlen($v['result']) > 10) {
                db_update('tbl_amazon_check', array('success' => 1), array('id' => $v['id']));
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

    function spam_youtube($port, $start, $stop, $ctr = 10, $remove_ip = 1, $mobile_rate = 3, $timeout = 10000) {

        // random from file, not db
//        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
//        $mobile_agents = file(PROCESS_PATH . 'scripts/mobile_agent1.txt');
//        $viewports = file(PROCESS_PATH . 'scripts/mobile_viewport.txt');
//        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');

        $where = array("id > $start", "id <= $stop");
//        if ($is_american != -1) {
//            $where['is_american'] = $is_american;
//        }
        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');


        $ind = 0;
        $click = 0;
        // local above, server below
//        global $argh;
        // later will generate link first, then loop all
//        $urls = isset($argh['--keyword']) ? $this->generate_link($partner_id, $argh['--keyword']) : $this->generate_link($partner_id);
        // get from file ?
        $urls = array_filter(file(PROCESS_PATH . "scripts/youtube_links.txt"));

        // make random order
        shuffle($urls);

//        $urls = [
//           'https://cse.google.com/cse?cx=partner-pub-6645176534884273:3619772948&ie=UTF-8&q=los+angeles+auto+accident+lawyers&sa=Search&ref=#gsc.tab=0&gsc.q=los%20angeles%20auto%20accident%20lawyers&gsc.page=1'
//        ];
        // loop with url
        foreach ($urls as $url) {

            $this->update_agent($ip_list);
            $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');

            // random this ip range for better ip click, may be one ip click too many times
            shuffle($ip_list);

            foreach ($ip_list as $item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    // has run, then next, no need, url can be repeated, because we have checked existed
//                    if (!$this->check_run($item['ip'], $url)) {
//                        continue;
//                    }

                    sleep(0.5);
                    $ret = false;

                    if ($this->check_port($port, $timeout)) {
                        // random information
//                        list($mobile_width, $mobile_height) = explode('|', $viewports[array_rand($viewports)]);
//                        list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
//                        $mobile_agent_str = $mobile_agents[array_rand($mobile_agents)];
//                        $agent_str = $agents[array_rand($agents)];
//                    $url = $urls[array_rand($urls)];

                        echo "This ip is okay\n";


                        // later should be when page is loaded, each view increase view, each click decrease view by 10, click only >10
                        $click = 0; //+$item['is_american'];
                        // 10%
                        if ($ind == $ctr || $click) {
                            $click = 1;
                            echo "gonna click \n";
                        }
                        // mobile or desktop, 80% mobile, can be 1,2,3,4
                        $mobile = 0; //(rand(0, 100) % $mobile_rate) != 0;
//                        if ($mobile) {
//                            echo "browsing as mobile\n";
//                            $ret = $this->haudao($item['ip'], $port, $mobile_agent_str, $mobile_width, $mobile_height, $click, $url);
//                        } else {
//                            echo "browsing as desktop\n";
//                            $ret = $this->haudao($item['ip'], $port, $agent_str, $width, $height, $click, $url);
//                        }

                        if ($mobile) {
                            echo "browsing as mobile\n";
                            $ret = $this->youtube($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->youtube($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
                        }
                    } else {
                        // can not connect to ssh ?
                        $ret = false;
                    }

                    // only success will increase view
                    if ($ret) {
                        echo "Success surfing...\n";
                        if ($click) {
                            // insert into run table
//                            db_insert('tbl_ssh_done', array('url' => $url, 'ip' => $item['ip'], 'created' => date('y-m-d h:i:s')));
                            $ind = 0;
                        } else {
                            $ind++;
                        }

                        // must check until see the result
                        // fail time now is 0
                        db_excute("update " . $this->table . " set fails = 0 where ip='" . $item['ip'] . "'");
                    } else {
//                        if (!isset($this->blacklist[$item['ip']])) {
//                            $this->blacklist[$item['ip']] = true;
                        // if usd increased, I will comment out these
                        // remove this no-working ip, then insert into black for later checking
                        if ($remove_ip) {
                            echo "Deleting, and move to blacklist, ip " . $item['ip'] . "\n";
                            db_delete($this->table, array('ip' => $item['ip']));
                        }
//                        db_insert('tbl_blacklist', array('ip' => $item['ip']));
                        // increase fail time, cuz we can forward this ssh, port is not ok, ip is not ok
                        db_excute("update " . $this->table . " set fails = fails + 1 where ip='" . $item['ip'] . "'");
//                        }
                    }
                }
            }
        }
    }

    function khuechuot($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/khuechuot.js';
//        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='" . trim($agent) . "'";
        // cache images
        $cmd = $this->casper() . " --disk-cache=true --ignore-ssl-errors=true --url='" . trim($url) . "' --width=$width --height=$height --click=$click $proxy $agent_str $script";
        // will always kill this process after 180 seconds
        //$cmd .= " && (sleep 180 ; kill -TERM $!; sleep 1; kill -9 $!)";
        $ret = array();
        exec($cmd, $ret);
        if ($ret) {
            echo "$ip: \n" . print_r($ret) . "\n";
        }
        // has response
        if (isset($ret[0])) {

            foreach ($ret as $row) {
                // check exit or maximun step timeout
                $ret_str = strtolower(substr(trim($row), 0, 6));
                // check exit or maximun step timeout, Unsafe javascript ?, Exiting @@                
                if ($ret_str === 'exitin' || $ret_str === 'maximu' || $ret_str === 'unsafe') {
                    return false;
                }
            }

            // it is ok, has viewed
            return true;
        }

        // default is problem
        return false;
//        echo "\n\n";
    }

    function spam_khuechuot($port, $start, $stop, $ctr = 10, $remove_ip = 0, $mobile_percent = 50, $timeout = 10000) {

        $where = array("id > $start", "id <= $stop");
//        if ($is_american != -1) {
//            $where['is_american'] = $is_american;
//        }
        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');
        $save_agent = true;
        $ind = 0;
        $click = 0;
        // local above, server below
//        global $argh;
        // later will generate link first, then loop all
//        $urls = isset($argh['--keyword']) ? $this->generate_link($partner_id, $argh['--keyword']) : $this->generate_link($partner_id);
        // get from file ?
        $urls = array_filter(file(PROCESS_PATH . "scripts/khuechuot_links.txt"));

        // make random order
        shuffle($urls);

//        $urls = [
//           'https://cse.google.com/cse?cx=partner-pub-6645176534884273:3619772948&ie=UTF-8&q=los+angeles+auto+accident+lawyers&sa=Search&ref=#gsc.tab=0&gsc.q=los%20angeles%20auto%20accident%20lawyers&gsc.page=1'
//        ];
        // loop with url
        foreach ($urls as $url) {

            // update user agent for these ssh
            $this->update_agent($ip_list, $save_agent);
            if ($save_agent) {
                // get from database again
                $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');
            }
            // each time we run a new link, we have to shuffle ssh
            // random this ip range for better ip click, may be one ip click too many times
            shuffle($ip_list);

            foreach ($ip_list as $item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    // has run, then next, no need, url can be repeated, because we have checked existed
//                    if (!$this->check_run($item['ip'], $url)) {
//                        continue;
//                    }

                    sleep(0.5);
                    $ret = false;

                    if ($this->check_port($port, $timeout)) {
                        // random information
//                        list($mobile_width, $mobile_height) = explode('|', $viewports[array_rand($viewports)]);
//                        list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
//                        $mobile_agent_str = $mobile_agents[array_rand($mobile_agents)];
//                        $agent_str = $agents[array_rand($agents)];
//                    $url = $urls[array_rand($urls)];

                        echo "This ip is okay\n";


                        // later should be when page is loaded, each view increase view, each click decrease view by 10, click only >10
                        $click = 0; //+$item['is_american'];
                        // 10%
                        if ($ind == $ctr || $click) {
                            $click = 1;
                            echo "gonna click \n";
                        }

                        $mobile = mt_rand(0, 99) < $mobile_percent;

                        if ($mobile) {
                            echo "browsing as mobile\n";
                            $ret = $this->khuechuot($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->khuechuot($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
                        }
                    } else {
                        // can not connect to ssh ?
                        $ret = false;
                    }

                    // only success will increase view
                    if ($ret) {
                        echo "Success surfing...\n";
                        if ($click) {
                            // insert into run table
//                            db_insert('tbl_ssh_done', array('url' => $url, 'ip' => $item['ip'], 'created' => date('y-m-d h:i:s')));
                            $ind = 0;
                        } else {
                            $ind++;
                        }

                        // must check until see the result
                        // fail time now is 0
                        db_excute("update " . $this->table . " set fails = 0 where ip='" . $item['ip'] . "'");
                    } else {
//                        if (!isset($this->blacklist[$item['ip']])) {
//                            $this->blacklist[$item['ip']] = true;
                        // if usd increased, I will comment out these
                        // remove this no-working ip, then insert into black for later checking
                        if ($remove_ip) {
                            echo "Deleting, and move to blacklist, ip " . $item['ip'] . "\n";
                            db_delete($this->table, array('ip' => $item['ip']));
                        }
//                        db_insert('tbl_blacklist', array('ip' => $item['ip']));
                        // increase fail time, cuz we can forward this ssh, port is not ok, ip is not ok
                        db_excute("update " . $this->table . " set fails = fails + 1 where ip='" . $item['ip'] . "'");
//                        }
                    }
                }
            }
        }
    }

    function spam_carinsurance($port, $start, $stop) {
        $ip_list = db_select($this->table, '*', array("id >= $start", "id < $stop"));

        foreach ($ip_list as $item) {
            if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {
                $this->carinsurance($item['ip'], $port, $item['agent']);
            }
        }
    }

    function tupt($port) {
        global $argh;
        echo $argh['--db'] . "\n";
        for ($ind = 0; $ind < 10; $ind++) {
            echo "$port\n";
        }
    }

    function reset_process_amazon() {
        db_update('tbl_amazon_check', array('processing' => 0), array('processing' => 1));
    }

    function prepare_process_amazon($instance_number) {
        $data = db_select('tbl_amazon_check', array('user', 'pass', 'agent'), array('check' => 0));
        $size = ceil(count($data) / $instance_number);
        $parts = array_chunk($data, $size);

        $ind_file = 0;
        foreach ($parts as $part) {
            $ind_file++;
            $lines = [];
            foreach ($part as $v) {
                $lines[] = $v['user'] . '|' . $v['pass'] . '|' . $v['agent'];
            }
            file_put_contents(PROCESS_PATH . "scripts/spam_amazon/$ind_file.txt", implode(PHP_EOL, $lines));
        }
    }

}
