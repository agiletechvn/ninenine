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

class SSHController extends FBToolController {

    protected $table = 'tbl_ssh_thuan';

//    protected $blacklist = [];

    function __construct() {
        global $argh;
        if (isset($argh['--table'])) {
            $this->table = $argh['--table'];
        }
        parent::__construct();
    }

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

    function update($ssh_file = 'hau_ssh') {
        $lines = file(PROCESS_PATH . "scripts/$ssh_file.txt");
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
        $mobile_agents = file(PROCESS_PATH . 'scripts/mobile_agent1.txt');
        $viewports = file(PROCESS_PATH . 'scripts/mobile_viewport.txt');
        $ind = 0;
        global $argh;
        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');


        foreach ($lines as $line) {
            @list($ip, $user, $pass) = explode('|', $line);
            $ip = trim($ip);
            if (isset($argh['--country-code'])) {
                $country_code = $argh['--country-code'];
            } else {
                $ip_data = $this->ip2location($ip);
                $country_code = $ip_data['country_code'];
            }
            $user = trim($user);
            $pass = trim($pass);
            if (!$ip || !$user || !$pass) {
                $ind++;
                echo "$ind) $ip | $user | $pass\n";
                continue;
            }

            list($mobile_width, $mobile_height) = explode('|', $viewports[array_rand($viewports)]);
            list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);

            $id = db_select_one($this->table, 'id', array('ip' => $ip), true);
            if (!$id) {
                db_insert($this->table, array(
                    'ip' => $ip,
                    'user' => $user,
                    'pass' => $pass,
                    'mobile_agent' => $mobile_agents[array_rand($mobile_agents)],
                    'agent' => $agents[array_rand($agents)],
                    'width' => $width,
                    'height' => $height,
                    'mobile_width' => $mobile_width,
                    'mobile_height' => $mobile_height,
                    'country_code' => $country_code
                ));
            } else {

                db_update($this->table, array(
                    'user' => $user,
                    'pass' => $pass,
                    'mobile_agent' => $mobile_agents[array_rand($mobile_agents)],
                    'agent' => $agents[array_rand($agents)],
                    'width' => $width,
                    'height' => $height,
                    'mobile_width' => $mobile_width,
                    'mobile_height' => $mobile_height,
                    'country_code' => $country_code
                        ), array('id' => $id)
                );
            }
        }
    }

    function index($folder = 'ssh_files') {

        $scanned_directory = array_diff(scandir(PROCESS_PATH . "scripts/$folder"), array('..', '.'));
        $ind = 0;
        $ip_list = [];
        $hash = [];
        foreach ($scanned_directory as $ssh_file) {
            $lines = file(PROCESS_PATH . "scripts/$folder/$ssh_file");
            foreach ($lines as $line) {
                $line = trim($line);
                @list($ip, $user) = explode('|', $line);
                $ip = trim($ip);
                $user = trim($user);
                if (!isset($hash[$ip]) && $user != 'nmtnmt') {
                    $hash[$ip] = true;
                    $ip_list[] = $line;
                } else {
                    $ind++;
                    echo "$ind ): $ip | $user\n";
                }
            }
        }
        // write file
        file_put_contents(PROCESS_PATH . "scripts/$folder/ssh_all.txt", implode(PHP_EOL, $ip_list));
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

    function test_haudao() {
        $script = PROCESS_PATH . 'scripts/haudao.js';
        $url = 'https://cse.google.com/cse?cx=partner-pub-2223102831337500:1984623078&ie=UTF-8&q=hotel+in+london&sa=Search&ref=#gsc.tab=0&gsc.q=hotel%20in%20london';
        $agent_str = "--agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'";
        $cmd = $this->casper() . " --ignore-ssl-errors=true --url='" . trim($url) . "' --width=1024 --height=800 --click=1 $agent_str $script";

        $ret = array();
        exec($cmd, $ret);
        if ($ret) {
            echo "\n" . print_r($ret) . "\n";
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
    }

    function haudao($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/haudao.js';
//        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='" . trim($agent) . "'";
        // cache images
        $cmd = $this->casper() . " --url='" . trim($url) . "' --width=$width --height=$height --click=$click $proxy $agent_str $script";
        // will always kill this process after 180 seconds
        //$cmd .= " && (sleep 180 ; kill -TERM $!; sleep 1; kill -9 $!)";
        
        global $argh;
        if(isset($argh['--debug'])){
            echo $cmd . "\n";
            return true;
        }
        
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

    function adsense($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/adsense.js';
        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
        // cache images
        $cmd = $this->casper() . " --ignore-ssl-errors=true --url='$url' --width=$width --height=$height --click=$click $script $proxy $agent_str";
        exec($cmd, $ret);
        if ($ret) {
            echo "$ip: \n" . print_r($ret) . "\n";
        }
        // has response
        if (isset($ret[0])) {

            foreach ($ret as $row) {
                // check exit or maximun step timeout
                $ret_str = substr(trim($row), 0, 7);

                if ($ret_str === 'Exiting' || (isset($ret[1]) && substr(trim($ret[1]), 0, 6) === 'Unsafe') || count($ret) >= 5) {
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

    function test_cmd() {

        $ip_list = db_select($this->table, '*', null, false, 1, 'id ASC');
        $urls = array_filter(file(PROCESS_PATH . "scripts/links.txt"));

        // make random order
        shuffle($urls);

        foreach ($urls as $url) {

            // each time we run a new link, we have to shuffle ssh
            // random this ip range for better ip click, may be one ip click too many times
            shuffle($ip_list);
            $this->update_agent($ip_list, false);
            foreach ($ip_list as $item) {


                $mobile = mt_rand(0, 99) < 70;

                if ($mobile) {
                    echo "browsing as mobile\n";
                    $agent = $item['mobile_agent'];
                    $width = $item['mobile_width'];
                    $height = $item['mobile_height'];
                } else {
                    echo "browsing as desktop\n";
                    $agent = $item['agent'];
                    $width = $item['width'];
                    $height = $item['height'];
                }

                $script = PROCESS_PATH . 'scripts/haudao.js';
                $proxy = "--proxy=127.0.0.1:1111 --proxy-type=socks5";
                $agent_str = "--agent='" . trim($agent) . "'";
                // cache images
                $cmd = $this->casper() . " --ignore-ssl-errors=true --url='" . trim($url) . "' --width=$width --height=$height --click=1 $proxy $agent_str $script";

                echo "$cmd\n";
            }
        }
    }

    function spam_haudao($port, $start, $stop, $ctr = 10, $remove_ip = 0, $mobile_percent = 50, $timeout = 10000) {
        global $argh;
        $where = array("id > $start", "id <= $stop");

        // run only some country
        if (isset($argh['--country-code'])) {
            $where['country_code'] = $argh['--country-code'];
        }
        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');
        $save_agent = true;
        $ind = 0;
        $click = 0;

        $urls = array_filter(file(PROCESS_PATH . "scripts/links.txt"));

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
                            $ret = $this->haudao($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->haudao($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
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

    function spam_haudao_fullclick($port, $start, $stop, $amount = 60, $remove_ip = 0, $mobile_percent = 80, $timeout = 10000) {

        $where = array("id > $start", "id <= $stop");
        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');

        // update user agent for these ssh
        $this->update_agent($ip_list);

        // get from database again
        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');


        $ind = 0;
        $urls = array_filter(file(PROCESS_PATH . "scripts/links.txt"));

        $url = $urls[+$port - 1111];

        if ($url) {

            foreach ($ip_list as $item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    sleep(0.5);
                    $ret = false;

                    if ($this->check_port($port, $timeout)) {

                        echo "This ip is okay\n";

                        // later should be when page is loaded, each view increase view, each click decrease view by 10, click only >10
                        $click = 1;

                        $mobile = mt_rand(0, 99) < $mobile_percent;

                        if ($mobile) {
                            echo "browsing as mobile\n";
                            $ret = $this->haudao($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->haudao($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
                        }
                    } else {
                        // can not connect to ssh ?
                        $ret = false;
                    }

                    // only success will increase view
                    if ($ret) {
                        $ind++;
                        echo "$ind) Success surfing...\n";
                        if ($ind == $amount) {
                            break;
                        }

                        // must check until see the result
                        // fail time now is 0
                        db_excute("update " . $this->table . " set fails = 0 where ip='" . $item['ip'] . "'");
                    } else {
                        db_excute("update " . $this->table . " set fails = fails + 1 where ip='" . $item['ip'] . "'");
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

    function popads($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/popads.js';
//        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='" . trim($agent) . "'";
        // cache images
        $cmd = $this->casper() . " --ignore-ssl-errors=true --disk-cache=true --url='" . trim($url) . "' --width=$width --height=$height --click=$click $script $proxy $agent_str";
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

    function spam_popads($port, $start, $stop, $ctr = 10, $remove_ip = 0, $mobile_percent = 50, $timeout = 10000) {
        $where = array("id > $start", "id <= $stop");

        $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');


        $ind = 0;
        $click = 0;
        $urls = array_filter(file(PROCESS_PATH . "scripts/popads_links.txt"));

        // make random order
        shuffle($urls);

        // loop with url
        foreach ($urls as $url) {

            // update user agent for these ssh
            $this->update_agent($ip_list);
            $ip_list = db_select($this->table, '*', $where, false, 0, 'id ASC');
            // random this ip range for better ip click, may be one ip click too many times
            shuffle($ip_list);

            foreach ($ip_list as $item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    sleep(0.5);
                    $ret = false;

                    if ($this->check_port($port, $timeout)) {

                        echo "This ip is okay\n";
                        // later should be when page is loaded, each view increase view, each click decrease view by 10, click only >10
                        $click = 0; //+$item['is_american'];
                        // 10%
                        if ($ind == $ctr || $click) {
                            $click = 1;
                            echo "gonna click \n";
                        }
                        // mobile or desktop, 80% mobile, can be 1,2,3,4
                        $mobile = mt_rand(0, 99) < $mobile_percent;
                        if ($mobile) {
                            echo "browsing as mobile\n";
                            $ret = $this->popads($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->popads($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
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

                        db_excute("update " . $this->table . " set fails = 0 where ip='" . $item['ip'] . "'");
                    } else {
                        if ($remove_ip) {
                            echo "Deleting, and move to blacklist, ip " . $item['ip'] . "\n";
                            db_delete($this->table, array('ip' => $item['ip']));
                        }
                        db_excute("update " . $this->table . " set fails = fails + 1 where ip='" . $item['ip'] . "'");
                    }
                }
            }
        }
    }

    function tupt() {
        $ip_list = db_select($this->table, '*', null, false, 2, 'id ASC');


        for ($i = 0; $i < 2; $i++) {

            // each time we run a new link, we have to shuffle ssh
            // random this ip range for better ip click, may be one ip click too many times
            shuffle($ip_list);

            // update user agent for these ssh
            $this->update_agent($ip_list);

            print_r($ip_list);
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

}
