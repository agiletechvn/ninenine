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

//ssh-keygen -R "hostname"

class GoogleAdsController extends FBToolController {

    protected $table = 'tbl_ssh_thang';
    protected $blacklist = [];

    function index() {

        $ssh_list = db_select($this->table, ' *');

        $this->assign(
                'current_ip', db_select_one('config', 'value', array('name' => 'current_ip'), true), 'ssh_list', $ssh_list
        );

        $this->load();
    }

    function check_run($ip, $url) {
        $check = db_select_one('tbl_ssh_done', 'id', array('url' => $url, 'ip' => $ip), true);

        if ($check) {
            return false;
        }

        return true;
    }

    function checkip($ip, $port) {
        if (isset($this->blacklist[$ip])) {
            return false;
        }
        return true;
        $script = PROCESS_PATH . 'scripts/proxy.js';
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $cmd = "casperjs --ignore-ssl-errors=true  --disk-cache=true $script --url=http://whatismyipaddress.com/ $proxy";
//        echo $cmd ."\n";
        $ret = array();
        exec($cmd, $ret);

        if (isset($ret[0])) {
            $str = trim($ret[0]);

            if ($str === $ip || (strpos($str, '::') !== false)) {
                return true;
            }
        }

        return false;
    }

    function youtube($ip, $port, $agent, $width, $height, $url) {
        $script = PROCESS_PATH . 'scripts/youtube.js';
//        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
//        $proxy = "";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
        $cmd = "casperjs --ignore-ssl-errors=true --url='$url' --width=$width --height=$height $script $proxy $agent_str";
        exec($cmd, $ret);
        print_r($ret);
        echo "\n\n";
    }

    function carinsurance($ip, $port, $agent) {
        $script = PROCESS_PATH . 'scripts/carinsurance.js';
        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
//        $proxy = "";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
//        echo "casperjs --ignore-ssl-errors=true  --disk-cache=true $script --url='http://carsinsuranceblog.online/' $proxy $cookie $agent_str";
//        die;
        $ret = exec("casperjs --ignore-ssl-errors=true  --disk-cache=true $script --url='http://carsinsuranceblog.online/' $proxy $cookie $agent_str");
        if ($ret) {
            echo "$ip: $ret\n";
        }
//        echo "\n\n";
    }

    function haudao($ip, $port, $agent, $width, $height, $click = 0, $url) {

        $script = PROCESS_PATH . 'scripts/haudao.js';
        $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$ip.txt";
        $proxy = "--proxy=127.0.0.1:$port --proxy-type=socks5";
        $agent_str = "--agent='$agent'";
        // cache images
        $cmd = "casperjs --ignore-ssl-errors=true --url='$url' --width=$width --height=$height --click=$click $script $proxy $agent_str";
        exec($cmd, $ret);
        if ($ret) {
            echo "$ip: \n" . print_r($ret) . "\n";
        }
        // has response
        if (isset($ret[0])) {
            // check exit or maximun step timeout
            $ret_str = substr(trim($ret[0]), 0, 7);

            if ($ret_str === 'Exiting' || (isset($ret[1]) && substr(trim($ret[1]), 0, 6) === 'Unsafe') || count($ret) >= 5) {
                return false;
            }

            // it is ok, has viewed
            return true;
        }

        // default is problem
        return false;
//        echo "\n\n";
    }

    function showcommand() {

        if ($this->is_postback()) {
            $step = +$_POST['step'];
            $ctr = +$_POST['ctr'];
            $partner_id = $_POST['partner_id'];
            $is_american = -1;
            $keyword_param = implode('|', array_filter(preg_split("#[\n\r\t]+#", $_POST['keyword'])));
            $where = array();

            $db = $_POST['db'];
            $number = db_select_one($this->table, 'count(id)', $where, true);
            $num = floor($number / $step);
            $start = 1;
            $value = [];
            for ($ind = 1; $ind <= $step; ++$ind) {
                $port = "$ind$ind$ind$ind";

                $where = array('id > ' . $start);
                $ids = db_select($this->table, 'id', $where, true, $num);
                $stop = array_pop($ids);
                $str = isset($_POST['is_sudo']) ? "sudo " : "";
                $str .= "php console.php fbtool/googleads/spam_haudao/$port/$start/$stop/$ctr/$is_american";
                if ($partner_id) {
                    $str .= "/$partner_id";
                }
                if ($keyword_param) {
                    $str .= "  --keyword='$keyword_param'";
                }
                $str .= " --db=$db";

                $value[] = $str;

                $start = $stop;
            }

            $this->assign($_POST)->assign('value', $value);
        }

        $this->load();
    }

    function update($ssh_file = 'hau_ssh', $is_american = 1) {
        $lines = file(PROCESS_PATH . "scripts/$ssh_file.txt");
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
        $mobile_agents = file(PROCESS_PATH . 'scripts/mobile_agent1.txt');
        $viewports = file(PROCESS_PATH . 'scripts/mobile_viewport.txt');
        $ind = 0;

        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');


        foreach ($lines as $line) {
            @list($ip, $user, $pass) = explode('|', $line);
            $ip = trim($ip);
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
                    'is_american' => $is_american
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
                    'is_american' => $is_american,
                    'mobile_height' => $mobile_height
                        ), array('id' => $id));
            }
        }
    }

    function get_pid($port) {
        $ret = shell_exec("lsof -n -i4TCP:$port | grep ssh");
        preg_match('#ssh\s+(\d+)#', $ret, $match);

        if (isset($match[1])) {
            return +$match[1];
        }
        return 0;
    }

    function echo_pid($port) {
        echo $this->get_pid($port);
    }

    function spam_youtube() {
        $script = PROCESS_PATH . 'scripts/popads.js';
        $url = "http://www.popcash.net/world/go/108738/229706/aHR0cCUzQS8vYmNncHJlcC5jb20v";
        $lines = file(PROCESS_PATH . 'scripts/proxy.txt');
        array_filter($lines);
        
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');
            
        //Array.prototype.slice.call(document.querySelectorAll('.altshade')).map(function(item){ return item.childNodes[3].innerText + '|' + item.childNodes[5].innerText;}).join("\n");
        foreach ($lines as $line) {
            list($host, $port) = explode('|', $line);
            $host = trim($host);
            $port = trim($port);
            $proxy = "--proxy=$host:$port";
            list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
            $agent = trim($agents[array_rand($agents)]);
            $agent_str = "--agent='$agent'";
            // cache images
            $cmd = "casperjs --ignore-ssl-errors=true --disk-cache=true --url='$url' --width=$width --height=$height $script $proxy $agent_str";

//            echo $cmd . "\n";
            $ret = array();
            exec($cmd, $ret);
            print_r($ret);
            sleep(0.5);
        }
    }

    function spam_carinsurance($port, $start, $amount = 100) {
        $stop = $start + $amount;
        $ip_list = db_select($this->table, '*', array("id >= $start", "id < $stop"));

        foreach ($ip_list as $item) {
            if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {
                $this->carinsurance($item['ip'], $port, $item['agent']);
            }
        }
    }

    function generate_link($partner_id = 'partner-pub-6645176534884273:3619772948', $keyword = '') {
        if (!$keyword) {
            $keys = file(PROCESS_PATH . 'scripts/keyword.txt');
        } else {
            $keys = explode('|', $keyword);
        }
        $urls = [];
        foreach ($keys as $key) {
            $key1 = preg_replace('#\s+#', '+', $key);
            $key2 = preg_replace('#\s+#', '%20', $key);
            $url = "https://cse.google.com/cse?cx=$partner_id&ie=UTF-8&q=$key1&sa=Search&ref=#gsc.tab=0&gsc.q=$key2";
//            echo "'$url',<br/>";
            $urls[] = $url;
        }

        return $urls;
    }

    function showlink() {
        $line_break = isset($_GET['n']) ? +$_GET['n'] : 0;
        if ($this->is_postback()) {            
            $keyword_post = preg_replace("#[\r\t]+#", " ", $_POST['keyword']);
            $keys = array_filter(preg_split("#\n+#", $keyword_post));
            $partner_id = trim($_POST['partner_id']);
            $urls = '';
            $ind = 0;
            foreach ($keys as $key) {
                $key = trim($key);
                if ($key) {
                    $check = db_select_one('tbl_keyword', 'id', array('keyword' => $key), true);
                    if (!$check) {

                        // insert into db
                        db_insert('tbl_keyword', array(
                            'keyword' => $key,
                            'partner_id' => $partner_id
                        ));
                    } else {
                        // mark as existed, so we can ignore later, or if there was error when loading page, or our intent
                        // we still need it
                        $urls .= "(existed) ";
                    }

                    $key1 = preg_replace('#\s+#', '+', $key);
                    $key2 = preg_replace('#\s+#', '%20', $key);
                    $urls .= "https://cse.google.com/cse?cx=$partner_id&ie=UTF-8&q=$key1&sa=Search&ref=#gsc.tab=0&gsc.q=$key2\n";
                    $ind++;
                    if($line_break > 0){                        
                        if($ind % $line_break === 0){
                            $urls .= "\n";
                        }
                    }
                }
            }

            $this->assign($_POST)->assign('urls', $urls);
        }
        
        $this->assign('n',$line_break);
        $this->load();
    }

    function spam_haudao($port, $start, $stop, $ctr = 8, $is_american = -1, $partner_id = null) {
        $where = array("id >= $start", "id < $stop");
        if ($is_american != -1) {
            $where['is_american'] = $is_american;
        }
        $ip_list = db_select($this->table, '*', $where);
        $ind = 0;
        $click = 0;
        // local above, server below
//        global $argh;
        // later will generate link first, then loop all
//        $urls = isset($argh['--keyword']) ? $this->generate_link($partner_id, $argh['--keyword']) : $this->generate_link($partner_id);
        // get from file ?
        $urls = array_filter(file(PROCESS_PATH . "scripts/links.txt"));


//        $urls = [
//            'https://cse.google.com/cse?cx=partner-pub-6645176534884273:3619772948&ie=UTF-8&q=personal+injury+lawyer&sa=Search&ref=#gsc.tab=0&gsc.q=personal%20injury%20lawyer',
//            'https://cse.google.com/cse?cx=partner-pub-6645176534884273:3619772948&ie=UTF-8&q=personal+injury+lawyer+houston&sa=Search&ref=#gsc.tab=0&gsc.q=personal%20injury%20lawyer%20houston'
//        ];
        // loop with url
        foreach ($urls as $url) {

            foreach ($ip_list as $item) {
                if ($this->change_server($item['ip'], $item['user'], $item['pass'], $port)) {

                    // has run, then next
                    if (!$this->check_run($item['ip'], $url)) {
                        continue;
                    }

                    sleep(1);
                    $ret = false;

                    if ($this->checkip($item['ip'], $port)) {

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
                        $mobile = (rand(0, 100) % 5) != 0;
                        if ($mobile) {
                            echo "browsing as mobile\n";
                            $ret = $this->haudao($item['ip'], $port, $item['mobile_agent'], $item['mobile_width'], $item['mobile_height'], $click, $url);
                        } else {
                            echo "browsing as desktop\n";
                            $ret = $this->haudao($item['ip'], $port, $item['agent'], $item['width'], $item['height'], $click, $url);
                        }
                    }

                    // only success will increase view
                    if ($ret) {
                        echo "Success surfing...\n";
                        if ($click) {
                            // insert into run table
                            db_insert('tbl_ssh_done', array('url' => $url, 'ip' => $item['ip']));
                            $ind = 0;
                        } else {
                            $ind++;
                        }
                    } else {
                        if (!isset($this->blacklist[$item['ip']])) {
                            $this->blacklist[$item['ip']] = true;
                            // if usd increased, I will comment out these
                            // remove this no-working ip, then insert into black for later checking
                            echo "Deleting, and move to blacklist, ip " . $item['ip'] . "\n";
                            db_delete($this->table, array('ip' => $item['ip']));
                            db_insert('tbl_blacklist', array('ip' => $item['ip']));
                        }
                    }
                }
            }
        }
    }

    // each cronjob repeat at a specific port
    // will not kill all after each 10 instance :v
    function change_server($ip = 0, $user, $pass, $port) {
        if ($ip) {
            $cmd = "";

            $pid = $this->get_pid($port);

            if ($pid) {
                $cmd .= "kill $pid && ";
            }
            $cmd .= "sshpass ";
            if ($pass) {
                $cmd .= "-p$pass ";
            }
//                $cmd = "sshpass -p" . $ssh_row['pass'] . " ssh " . $ssh_row['user'] . "@" . $ssh_row['ip'] . " -f -N -D 3333";
            $cmd .= "ssh -o StrictHostKeyChecking=no $user@$ip -f -C -N -D $port > /dev/null 2>/dev/null &";
            $ret = shell_exec($cmd);
//            echo $cmd ."\n";
            return true;
        } else {

//            db_update('config', array('value' => ''), array('name' => 'current_ip'));
            return false;
        }
    }

    function test() {
        $url = "http://whatismyipaddress.com/";
        $user_agent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.115.10.25 Safari/537.36';
//        $cookie = __DIR__ . '/cookie.txt';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, $user_agent);
//curl_setopt($ch, CURLOPT_COOKIESESSION, true);
//curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
//curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
        curl_setopt($ch, CURLOPT_URL, $url);


        curl_setopt($ch, CURLOPT_PROXY, "117.135.251.133:84");
        curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);

        $result = curl_exec($ch);
        curl_close($ch);
        echo $result;

//        $lines = file(PROCESS_PATH . "scripts/6k-gobal.txt");
//        
//        $check = [];
//        
//        foreach($lines as $line){
//            @list($ip, $user, $pass) = explode('|', $line);
//            $ip = trim($ip);
//            if(!isset($check[$ip])){
//                $check[$ip] = true;
//            } else {
//                echo "$ip<br/>";
//            }
//        }
    }

    function remove_blacklist() {
        $list = db_select('tbl_blacklist', 'ip', null, true);

        foreach ($list as $ip) {
            echo "Removing $ip\n";
            shell_exec("ssh-keygen -R $ip");
        }
    }

}
