<?php

/*
 * Copyright 2015 tupt.
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

class TestController extends Controller {

    function index() {
        $this->load();
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
        return $ipaddress;
    }

    function ip($ip = null) {
        if($ip == null){
            $ip = $this->get_client_ip();
        }
        db_connect();
        $ip2long = ctype_digit($ip) ? +$ip : ip2long($ip);                

        $ip_data = db_select_one('ip2location', '*', array("$ip2long BETWEEN ip_from AND ip_to"));
        $ip_data['ip_address'] = long2ip($ip2long);
        $ip_data['ip_address_long'] = $ip2long;
        $this->json($ip_data);
    }

    function timestamp() {
        $time = strtotime('2016/01/04 07:54');

        echo $time;
        echo "<br/>";
        echo date("Y-m-d h:i", $time);
    }

    function bestbuy_email(){
        $lines = explode("\n", file_get_contents('/Users/thanhtu/Downloads/tbl_bestbuy_check.csv'));        
        $output = [];
        foreach($lines as $line){
            $email = trim($line, '"');                            
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
              $output[] = $email;
            }            
        }
        file_put_contents('/Users/thanhtu/Downloads/bestbuy_email.csv',implode("\n",$output));
    }

    function random_string() {
        $key1 = '0123456789';
        $key2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $url = 'http://nanhtrang.ga/';
        for ($i = 0; $i < 11; $i++) {
            $url .= $i == 5 ? '-' : $key1[mt_rand(0, strlen($key1) - 1)];
        }
        $url .= '.x?i=';
        for ($i = 0; $i < 4; $i++) {
            $url .= $key2[mt_rand(0, strlen($key2) - 1)];
        }
        return $url;
    }

    function random() {
        // if existed then delete :D
        $cache = array();
        for ($i = 0; $i < 10000; $i++) {
            $msg = $this->random_string();
            if (isset($cache[$msg])) {
                echo $msg . "<br/>";
            }
            $cache[$msg] = true;
        }
    }

}
