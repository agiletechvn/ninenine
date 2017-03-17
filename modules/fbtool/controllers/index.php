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
 * 
 * set @distanceInKilometers=5;
set @cosDistance = cos(@distanceInKilometers / 6371);
set @latitude=21.0204952;
set @longitude=105.8096749;
set @latCos = cos(radians(@latitude));
set @latSin = sin(radians(@latitude));
set @lngCos = cos(radians(@longitude));
set @lngSin = sin(radians(@longitude));
set @latSinPi = sin(@latitude * pi()/180);
set @latCosPi = cos(@latitude*pi()/180);
set @distance_unit = 111.045;

SELECT name, `password`,
(((acos(@latSinPi * 
            sin(lat * pi()/180)+ @latCosPi * 
            cos(lat * pi()/180) * cos(  ((@longitude- lng)*pi()/180)))) *180/pi())*60*1.1515
        ) as distance,
        address        
        from wifi_chua         
WHERE lat
     BETWEEN @latitude  - (@distanceInKilometers / @distance_unit)
         AND @latitude  + (@distanceInKilometers / @distance_unit)
    AND lng
     BETWEEN @longitude - (@distanceInKilometers / (@distance_unit * @latCos))
         AND @longitude + (@distanceInKilometers / (@distance_unit * @latCos))
   AND      
(@latCos * cos(radians(lat)) * (@lngCos * cos(radians(lng)) + @lngSin * sin(radians(lng))) + @latSin * sin(radians(lat))) > @cosDistance
order by distance limit 20
 */

class IndexController extends FBToolController {

    function index() {
        //echo $_SESSION['user_id'];
        //$_SESSION['user_name'] = 'kiet.ly.7315';
        $ind = 0;
        $lines = file(PROCESS_PATH . 'scripts/cpc.csv');
        $data = [];
        foreach ($lines as $line) {
            $csv = str_getcsv($line);

            if (empty($csv[0]))
                continue;

            $data[] = $csv[0];
        }


        file_put_contents(PROCESS_PATH . 'scripts/keyword_cpc.txt', implode(PHP_EOL, $data));
//        $this->load();
    }

    function ashley_love_number($arr = [ [7, 8], [52, 80], [57, 64], [74, 78]]) {
        $q = count($arr);
        $ret = [];
        if ($q >= 1 && $q <= 100000) {
            foreach ($arr as $row) {
                list($n, $m) = $row;
                if ($n <= $m && $n >= 1 && $m <= 1000000) {
                    $count = $m - $n + 1;
                    while ($n <= $m) {
                        $num_mask = 0;
                        $num_digits = ceil(log10($n + 1));
                        for ($digit_ind = 0; $digit_ind < $num_digits; $digit_ind++) {
                            $cur_digit = ($n / pow(10, $digit_ind)) % 10;
                            $digit_mask = 1 << $cur_digit;
                            if (($num_mask & $digit_mask) > 0) {
                                $count--;
                                break;
                            }
                            $num_mask = $num_mask | $digit_mask;
                        }
                        $n++;
                    }
                    $ret[] = $count;
                }
            }
        }
        echo implode(PHP_EOL, $ret);
    }

    function royal_name($names = ['Philipine I', 'Philip II']) {

        $n = count($names);
        $names = array_unique($names);
        if ($n >= 0 && $n <= 50 && $n === count($names)) {
            $romans = array('L' => 50, 'XL' => 40, 'XXX' => 30, 'XX' => 20, 'X' => 10, 'IX' => 9, 'VIII' => 8, 'VII' => 7,
                'VI' => 6, 'V' => 5, 'IV' => 4, 'III' => 3, 'II' => 2, 'I' => 1);

            $names_hash = [];

            foreach ($names as $name) {

                $ind = strrpos($name, ' ');
                if ($ind !== false) {
                    if ($ind >= 1 && $ind <= 20) {
                        $firtname = substr($name, 0, $ind);
                        if (preg_match('/^[A-Z][a-z]*$/', $firtname)) {
                            $roman = substr($name, $ind + 1);
                            //if (preg_match('/^(?:[IVX]+|L)$/', $roman)) {                                
                                $number = 0;
                                $test = $roman;
                                foreach ($romans as $key => $value) {
                                    while (strpos($test, $key) === 0) {
                                        $number += $value;
                                        $test = substr($test, strlen($key));
                                    }
                                }
                                if ($number >= 1 && $number <= 50) {
                                    $names_hash[] = array(
                                        'firstname' => $firtname,
                                        'roman' => $roman,
                                        'number' => $number
                                    );
                                }
                            //}
                        }
                    }
                }
            }
            
            uasort($names_hash, function($a, $b) {
                $ret = strcmp($a['firstname'], $b['firstname']);
                return $ret !== 0 ? $ret :
                        ($a['number'] === $b['number'] ? 0 : ($a['number'] < $b['number'] ? -1 : 1));
            });

            $ret = array_map(function($item){
                return $item['firstname'] . ' ' . $item['roman'];
            }, $names_hash);
            echo implode(PHP_EOL, $ret);
        }
    }

    function test2() {
        $ret = -1;
        echo 1 || $ret;
    }

    function triangle_pascal($k = 4) {
        $triangle = '';
        $numbers = [[0]];
        for ($row = 1; $row <= $k; $row++) {
            $numbers[$row] = [];
            for ($column = 1; $column <= $row; $column++) {
                $triangle .= $numbers[$row][$column] = ($column == 1 || $column == $row ? 1 : ($numbers[$row - 1][$column - 1] + $numbers[$row - 1][$column]));
                $triangle .= ' ';
            }
            $triangle .= "\n";
        }
        echo $triangle;
    }

    function download() {

        $json_str = '[{"place":"Hà Nội","wifi_point":"440246"},{"place":"Hồ Chí Minh","wifi_point":"591274"},{"place":"Đà Nẵng","wifi_point":"23040"},{"place":"Hải Phòng","wifi_point":"19902"},{"place":"Quảng Ninh","wifi_point":"15600"},{"place":"Gia Lai","wifi_point":"4301"},{"place":"Điện Biên","wifi_point":"1232"},{"place":"Thừa Thiên Huế","wifi_point":"9659"},{"place":"Lào Cai","wifi_point":"2788"},{"place":"Sơn La","wifi_point":"1235"},{"place":"Yên Bái","wifi_point":"2138"},{"place":"Hải Dương","wifi_point":"7905"},{"place":"Nam Định","wifi_point":"13393"},{"place":"Vũng Tàu","wifi_point":"21035"},{"place":"Bắc Ninh","wifi_point":"7521"},{"place":"Lạng Sơn","wifi_point":"2898"},{"place":"Vĩnh Phúc","wifi_point":"6901"},{"place":"Khánh Hoà","wifi_point":"23412"},{"place":"Đồng Tháp","wifi_point":"8903"},{"place":"Tuyên Quang","wifi_point":"2306"},{"place":"Trà Vinh","wifi_point":"3409"},{"place":"Hưng Yên","wifi_point":"8099"},{"place":"Bến Tre","wifi_point":"6986"},{"place":"Tiền Giang","wifi_point":"7604"},{"place":"Tây Ninh","wifi_point":"13432"},{"place":"Cần Thơ","wifi_point":"21466"},{"place":"Ninh Thuận","wifi_point":"2345"},{"place":"Phú Yên","wifi_point":"4221"},{"place":"Thái Bình","wifi_point":"4543"},{"place":"Hà Giang","wifi_point":"2578"},{"place":"Kon Tum","wifi_point":"1204"},{"place":"Thái Nguyên","wifi_point":"7778"},{"place":"Bắc Kạn","wifi_point":"509"},{"place":"Quảng Ngãi","wifi_point":"79776"},{"place":"Cao Bằng","wifi_point":"1545"},{"place":"Vĩnh Long","wifi_point":"4578"},{"place":"Bình Phước","wifi_point":"9852"},{"place":"Nghệ An","wifi_point":"8990"},{"place":"Đắk Nông","wifi_point":"2705"},{"place":"Ninh Bình","wifi_point":"5892"},{"place":"Bình Thuận","wifi_point":"13596"},{"place":"Thanh Hoá","wifi_point":"19002"},{"place":"Đồng Nai","wifi_point":"159031"},{"place":"Bắc Giang","wifi_point":"9013"},{"place":"Đà Nẵng","wifi_point":"34092"},{"place":"Hậu Giang","wifi_point":"7801"},{"place":"Hoà Bình","wifi_point":"2321"},{"place":"Bình Định","wifi_point":"210"},{"place":"Lai Châu","wifi_point":"902"},{"place":"Phú Thọ","wifi_point":"6502"},{"place":"Long An","wifi_point":"12349"},{"place":"Hà Nam","wifi_point":"4345"},{"place":"Đắk Lắk","wifi_point":"16028"},{"place":"Hà Tĩnh","wifi_point":"8302"},{"place":"Quảng Trị","wifi_point":"7602"},{"place":"Sóc Trăng","wifi_point":"9721"},{"place":"Quảng Nam","wifi_point":"5623"},{"place":"Quảng Bình","wifi_point":"3431"},{"place":"An Giang","wifi_point":"32400"},{"place":"Bình Dương","wifi_point":"89239"},{"place":"Bạc Liêu","wifi_point":"4023"},{"place":"Kiên Giang","wifi_point":"21234"},{"place":"Lâm Đồng","wifi_point":"24003"},{"place":"Cà Mau","wifi_point":"8912"}]';
        $json_data = json_decode($json_str, true);
        foreach ($json_data as $v) {
            $param = "address=" . urlencode($v['place']) . "&timestamp=" . time();
            $secret_key = "wifi_chua_2016_pro";
            $hashmac = hash_hmac('sha256', $param, $secret_key);
            $db_url = "http://128.199.106.139:3033/wifis/place?$param&token=$hashmac";
            echo "Downloading ... $db_url\n\n";
            file_put_contents(PROCESS_PATH . "scripts/wifi_chua/" . $v['place'] . '.json', file_get_contents($db_url));
        }
    }

    function test() {

        $json_str = '[{"place":"Hà Nội","wifi_point":"440246"},{"place":"Hồ Chí Minh","wifi_point":"591274"},{"place":"Đà Nẵng","wifi_point":"23040"},{"place":"Hải Phòng","wifi_point":"19902"},{"place":"Quảng Ninh","wifi_point":"15600"},{"place":"Gia Lai","wifi_point":"4301"},{"place":"Điện Biên","wifi_point":"1232"},{"place":"Thừa Thiên Huế","wifi_point":"9659"},{"place":"Lào Cai","wifi_point":"2788"},{"place":"Sơn La","wifi_point":"1235"},{"place":"Yên Bái","wifi_point":"2138"},{"place":"Hải Dương","wifi_point":"7905"},{"place":"Nam Định","wifi_point":"13393"},{"place":"Vũng Tàu","wifi_point":"21035"},{"place":"Bắc Ninh","wifi_point":"7521"},{"place":"Lạng Sơn","wifi_point":"2898"},{"place":"Vĩnh Phúc","wifi_point":"6901"},{"place":"Khánh Hoà","wifi_point":"23412"},{"place":"Đồng Tháp","wifi_point":"8903"},{"place":"Tuyên Quang","wifi_point":"2306"},{"place":"Trà Vinh","wifi_point":"3409"},{"place":"Hưng Yên","wifi_point":"8099"},{"place":"Bến Tre","wifi_point":"6986"},{"place":"Tiền Giang","wifi_point":"7604"},{"place":"Tây Ninh","wifi_point":"13432"},{"place":"Cần Thơ","wifi_point":"21466"},{"place":"Ninh Thuận","wifi_point":"2345"},{"place":"Phú Yên","wifi_point":"4221"},{"place":"Thái Bình","wifi_point":"4543"},{"place":"Hà Giang","wifi_point":"2578"},{"place":"Kon Tum","wifi_point":"1204"},{"place":"Thái Nguyên","wifi_point":"7778"},{"place":"Bắc Kạn","wifi_point":"509"},{"place":"Quảng Ngãi","wifi_point":"79776"},{"place":"Cao Bằng","wifi_point":"1545"},{"place":"Vĩnh Long","wifi_point":"4578"},{"place":"Bình Phước","wifi_point":"9852"},{"place":"Nghệ An","wifi_point":"8990"},{"place":"Đắk Nông","wifi_point":"2705"},{"place":"Ninh Bình","wifi_point":"5892"},{"place":"Bình Thuận","wifi_point":"13596"},{"place":"Thanh Hoá","wifi_point":"19002"},{"place":"Đồng Nai","wifi_point":"159031"},{"place":"Bắc Giang","wifi_point":"9013"},{"place":"Đà Nẵng","wifi_point":"34092"},{"place":"Hậu Giang","wifi_point":"7801"},{"place":"Hoà Bình","wifi_point":"2321"},{"place":"Bình Định","wifi_point":"210"},{"place":"Lai Châu","wifi_point":"902"},{"place":"Phú Thọ","wifi_point":"6502"},{"place":"Long An","wifi_point":"12349"},{"place":"Hà Nam","wifi_point":"4345"},{"place":"Đắk Lắk","wifi_point":"16028"},{"place":"Hà Tĩnh","wifi_point":"8302"},{"place":"Quảng Trị","wifi_point":"7602"},{"place":"Sóc Trăng","wifi_point":"9721"},{"place":"Quảng Nam","wifi_point":"5623"},{"place":"Quảng Bình","wifi_point":"3431"},{"place":"An Giang","wifi_point":"32400"},{"place":"Bình Dương","wifi_point":"89239"},{"place":"Bạc Liêu","wifi_point":"4023"},{"place":"Kiên Giang","wifi_point":"21234"},{"place":"Lâm Đồng","wifi_point":"24003"},{"place":"Cà Mau","wifi_point":"8912"}]';
        $json_data = json_decode($json_str, true);
        foreach ($json_data as $v) {
            $filepath = PROCESS_PATH . "scripts/wifi_chua/" . $v['place'] . '.json';
            echo "Processing ... $filepath\n\n";
            $data = json_decode(file_get_contents($filepath), true);
            foreach ($data as &$item) {
                $strlen = strlen($item['password']);
                $item['password'] = base64_decode(substr($item['password'], $strlen - 5, $strlen) . substr($item['password'], 0, $strlen - 5));
                db_insert('wifi_chua', array(
                    '_id' => $item['_id'],
                    'name' => $item['name'],
                    'city' => $item['city'],
                    'address' => $item['address'],
                    'password' => $item['password'],
                    'lat' => $item['loc']['coordinates'][1],
                    'long' => $item['loc']['coordinates'][0],
                ));
            }
        }
    }

    function cronjob() {
        // return user_id to update later
        if ($this->is_callback()) {

            // 'CAACW5Fg5N2IBALT06ZBfZAq7mtcfhtec19EMZA29ekbdUxSpwo0UZCIqEB9J1x7vGbAZBBL1wkRmZCExzdiZAh9Nds2n5C4wB4ZCOrzeSqO61RJpy4QzUYI5yQcMuwlWiEppAmGDJIk7xn0SI8FZBTPUZAZCZAsLd2ZBFpR9yY1qMQ4YJoa50TlYFqgw02J5mY19eNmOWtp5C9ykZB5JRQ8QolwBxh';
            require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
            $fb = new Facebook(array('fileUpload' => false));
            $access_token = trim($_POST['access_token']);

            // if already login, no need to get access token again
            if (isset($_SESSION['user_id']) && empty($access_token)) {
                $user_id = $_SESSION['user_id'];
                // get back group data
                $user_data = db_select_one('tbl_autopost_user', array('access_token', 'group_data'), array('user_id' => $user_id));
                $access_token = $user_data['access_token'];
                $group_data = json_decode($user_data['group_data'], true);
            } else {

                if (isset($_POST['access_token'])) {

                    $access_token = trim($_POST['access_token']);

                    $params = array(
                        'access_token' => $access_token
                    );

                    $ret = $fb->api('/me', 'GET', $params);
                    // break now
                    if (!isset($ret['id'])) {
                        die;
                    }
                    // data should be json, so will can return so fast without deserialize
                    // background job does it better
                    $user_id = $ret['id'];
                    $user_name = isset($ret['username']) ? $ret['username'] : $ret['first_name'] . ' ' . $ret['last_name'];
                    $data = array('access_token' => $access_token);
                    $data['user_data'] = json_encode($ret);

                    $ret = $fb->api($user_id . '/groups', 'GET', $params);
                    $group_data = $ret['data'];
                    $data['group_data'] = json_encode($group_data);
                    // check user existed
                    $user = db_select_one('tbl_autopost_user', 'id', array('user_id' => $user_id));
                    if ($user) {
                        db_update('tbl_autopost_user', $data, array('user_id' => $user_id));
                    } else {
                        $data['user_id'] = $user_id;
                        db_insert('tbl_autopost_user', $data, array('user_id' => $user_id));
                    }

                    // update user id to look after later
                    $_SESSION['user_id'] = $user_id;
                    $_SESSION['user_name'] = $user_name;
                }
            }

            // insert into cronjob, $ret now is group
            $cronjob_data = array(
                'link_url' => trim($_POST['link_url']),
                'message' => trim($_POST['message']),
//                'link_title' => trim($_POST['link_title']),
//                'link_description' => trim($_POST['link_description']),
//                'link_caption' => trim($_POST['link_caption']),
//                'picture_url' => trim($_POST['picture_url']),
                'send_interval' => +($_POST['send_interval']),
                'access_token' => $access_token,
                'leave_group_if_pending_post' => +(@$_POST['pending_post'])
            );

            // validate $cronjob_data
            $json = array('success' => true);

            if (empty($cronjob_data['access_token'])) {
                $json['errors'][] = array('name' => 'access_token', 'msg' => 'Access token is empty');
            }

            if (empty($cronjob_data['link_url'])) {
                $json['errors'][] = array('name' => 'link_url', 'msg' => 'Link url is empty');
            }

            if (empty($cronjob_data['message'])) {
                $json['errors'][] = array('name' => 'message', 'msg' => 'Message is empty');
            }

            if (empty($cronjob_data['link_url'])) {
                $json['errors'][] = array('name' => 'link_url', 'msg' => 'Link url is empty');
            }

            if (isset($json['errors'])) {
                $json['success'] = false;
            } else {

                $cronjob_data['send_interval'] = min(array(max(array($cronjob_data['send_interval'], 3)), 30));

                // if validate ok, then add group to cronjob data
                $cronjob_data['groups'] = array();
                foreach ($group_data as $v) {
                    $cronjob_data['groups'][] = array('id' => $v['id'], 'name' => $v['name']);
                }

                // now insert into cronjob
                db_insert('tbl_autopost_cronjob', array(
                    'created' => date('d/m/Y H:i:s'),
                    'user_id' => $user_id,
                    'publish' => 1,
                    'data' => json_encode($cronjob_data),
                    'finish' => 0,
                    'running_percent' => '0',
                    'result_data' => json_encode(array()),
                    'runat' => strtotime($_POST['reg_date_start'] . ' ' . $_POST['reg_time_start'])
//                  'stopat' => strtotime($_POST['reg_date_end'] . ' ' . $_POST['reg_time_end'])
                ));
            }

            $this->json($json);
        }

        // step: from token get user_id
        // if not had that user_id then
        // insert into table tbl_autopost_user => userid, id, access_token :D
        // insert into talbe tbl_autopost_group => userid, groupid, id, group name
        // start insert into table tbl_autopost_cronjob to run : url seperate, some infomation
        // if found that user_id then, update access_token
        // show process status is running, there will be list result and stop to stop cronjob(by deactive it)
        // tbl_autopost_cronjob : will have status is publish or not
        // if publish then will run, if not then stop
        // there will be a status show running_result
        // the running_result will be an array serialize
        // current url(which number), the url should be store as string with seperate to easy to debug
        // current url(order) and current group number(order)
        // we move to current url, and move to current group for the first time
        // if run all then set status as finish (boolean)
        // the result should be array(group_id=>id, group_name=>name, group_number=>number, post => array(id_post_facebook, link_title to view)
        // each time, one post success to group, we will update array result, status, then return array as json to client to show on view
        // each there is a cronjob, then we will show, after submit, and all the preview cronjob, current cronjob
    }

    private function generate_info_html() {

        $cronjob_list = db_select('tbl_autopost_cronjob', array('publish', 'deleted', 'finish', 'running_percent', 'id', 'created'), array('user_id' => $_SESSION['user_id']), false, 50, 'id DESC');

        // finish = 0: waiting
        // finish = 1: runnning, publish = 1: running, publish = 0: pause
        // finish = 2: finish
        $info_html = array();
        foreach ($cronjob_list as $v) {
            $html = array('id' => $v['id'], 'running_percent' => $v['running_percent'], 'created' => $v['created']);
            if ($v['deleted'] == 0) {
                if ($v['finish'] == 0) {
                    $html['status'] = 'waiting';
                    $html['button'] = 'remove';
                    $html['class'] = 'danger';
                } elseif ($v['finish'] == 1) {
                    if ($v['publish'] == 1) {
                        $html['status'] = 'running';
                        $html['class'] = 'info';
                        $html['button'] = 'pause';
                    } else {
                        $html['status'] = 'pause';
                        $html['class'] = 'primary';
                        $html['button'] = 'resume';
                    }
                } else {
                    $html['status'] = 'finish';
                    $html['class'] = 'success';
                }
            } else {
                $html['status'] = 'deleting';
                $html['class'] = 'danger';
            }

            $info_html[] = $html;
        }

        return $info_html;
    }

    // set interval from javascript to get the infomation
    function info() {



        if ($this->is_callback()) {

            if (isset($_SESSION['user_id'])) {
                $this->assign('cronjob_list', $this->generate_info_html());
                $this->load(false, 'ajax/list_cronjob');
            }
            // by default, false ajax will be called, then we invoke dialog to enter access_token
        } else {

            if (isset($_SESSION['user_id'])) {
                $this->assign('cronjob_list', $this->generate_info_html());
            }

            $this->load();
        }

//        $result = $facebook->api("/POST_ID");
//                if (!array_key_exists("actions",$result)){
//                    // pending post
//                }
    }

    function update() {
        if (isset($_SESSION['user_id'])) {
            $cronjob_id = $_POST['cronjob_id'];

            $cronjob = db_select_one('tbl_autopost_cronjob', array('id', 'finish'), array('id' => $cronjob_id, 'user_id' => $_SESSION['user_id']));
            if ($cronjob) {
                $cronjob_cmd = $_POST['cronjob_cmd'];
                if ($cronjob_cmd == 'remove') {
                    // if not running then remove, if is pause then set status is delete and remove after
                    // delete all posts
                    if ($cronjob['finish'] == 0) {
                        db_delete('tbl_autopost_cronjob', array('id' => $cronjob['id']));
                    } else {
                        // mark running so we can update again
                        db_update('tbl_autopost_cronjob', array('deleted' => 1, 'running' => 1), array('id' => $cronjob['id']));
                    }
                } elseif ($cronjob_cmd == 'pause') {
                    // update publish = 0, running = 0, so if it is running, it will restart, other set running = 1
                    // next cronjob will by pass itr
                    db_update('tbl_autopost_cronjob', array('publish' => 0, 'running' => 0), array('id' => $cronjob['id']));
                } elseif ($cronjob_cmd == 'resume') {
                    // update publish = 1, set running is 0 to start
                    db_update('tbl_autopost_cronjob', array('publish' => 1, 'running' => 0), array('id' => $cronjob['id']));
                }
            }
        }
    }

    function validate() {

        if ($this->is_callback() && !isset($_SESSION['user_id'])) {
            $access_token = trim($_POST['access_token']);
            require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
            $fb = new Facebook(array('fileUpload' => false));
            $params = array(
                'access_token' => $access_token
            );
            $ret = $fb->api('/me', 'GET', $params);
            // data should be json, so will can return so fast without deserialize
            // background job does it better
            if (isset($ret['id'])) {
                $_SESSION['user_id'] = $ret['id'];
                $_SESSION['user_name'] = isset($ret['username']) ? $ret['username'] : $ret['first_name'] . ' ' . $ret['last_name'];
                // update token for user
                db_update('tbl_autopost_user', array('access_token' => $access_token), array('user_id' => $_SESSION['user_id']));
                $json = array('success' => true);
            } else {
                $json = array('success' => false);
            }

            return $this->json($json);
        }
    }

    function cronjob_result($cronjob_id) {

        if ($this->is_callback()) {

            if (isset($_SESSION['user_id'])) {
                $result_data = db_select_one('tbl_autopost_cronjob', 'result_data', array('user_id' => $_SESSION['user_id'], 'id' => $cronjob_id), true);
                header('Content-type: application/json');
                echo($result_data);
            } else {
                $this->json(array('error' => true));
            }
            // by default, false ajax will be called, then we invoke dialog to enter access_token
        } else {

            if (!isset($_SESSION['user_id'])) {
                $this->redirect('index/info'); // back to cronjob list
            }
            $cronjob = db_select_one('tbl_autopost_cronjob', array('id', 'data', 'created', 'running_percent', 'result_data', 'deleted'), array('user_id' => $_SESSION['user_id'], 'id' => $cronjob_id));

            // without decode, make it faster
            $this->assign('cronjob', $cronjob);
            $this->load();
        }
    }

    function detail($id = 0) {
        if ($id) {
            $v = db_select_one('tbl_shorten_url', '*', array('id' => $id));
            $v['shorten_url'] = ($v['domain'] ? 'http://' . $v['domain'] . '/' : SITE_ROOT) . str_replace('.x', '-' . $v['id'] . '.x', $v['shorten_url']);
            $isMobile = isset($_GET['m']) || (preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|palm|phone|iphone|pie|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]));
            if ($isMobile) {
                $redirect = $v['alt_link_url'];
                if (substr($redirect, 0, 4) !== "http") {
                    $redirect = "http://" . $redirect;
                }
                header('Location: ' . $redirect);
            } else {

                if ($v['image_url']) {
                    // get response from get request
                    include APP_PATH . 'lib/plugins/class.curlCrawler.php';
                    $curl_crawler = new CURLCrawler();
                    $resp = $curl_crawler->get($v['link_url']);
                    $ret = $resp['content'];

                    $ret = preg_replace('#<meta\s+property="og:url"\s+content="[^"]+">#', '<meta property="og:url" content="' . $v['shorten_url'] . '">', $ret);


                    list($width, $height) = getimagesize($v['image_url']);
                    if ($width && $height) {
                        $ret = preg_replace('#<meta\s+property="og:image"\s+content="[^"]+">#', '<meta property="og:image" content="' . $v['image_url'] . '">', $ret);
                        $ret = preg_replace('#<meta\s+property="og:image:width"\s+content="\d+">#', '<meta property="og:image:width" content="' . $width . '">', $ret);
                        $ret = preg_replace('#<meta\s+property="og:image:height"\s+content="\d+">#', '<meta property="og:image:height" content="' . $height . '">', $ret);
                    }


                    echo $ret;
                } else {
                    header('Location: ' . $v['link_url']);
                }

                //$resp = $curl_crawler->get($v['link_url']);
                //echo $resp['content'];
                // crawler then output
                // header('Location: ' . $v['link_url']);
                //$v['shorten_url'] = ($v['domain'] ? 'http://' . $v['domain'] . '/' : SITE_ROOT) . str_replace('.x', '-' . $v['id'] . '.x', $v['shorten_url']);
                //$this->assign($v)->load(false);
            }
        }
    }

    function csv() {
        include APP_PATH . 'lib/plugins/function.csv.php';
        $file = PROCESS_PATH . 'scripts/ebay.com-domain_organic-us.csv';
        $data = csv2array($file);
        $keywords = array_map(function($row) {
            return $row[0];
        }, $data['rows']);
        file_put_contents(PROCESS_PATH . 'scripts/keywords.csv', implode(PHP_EOL, $keywords));
    }

    function state($folder = 'states') {

        $scanned_directory = array_diff(scandir(PROCESS_PATH . "scripts/$folder"), array('..', '.'));
        $ind = 0;
        $line_list = [];
        $hash = [];
        foreach ($scanned_directory as $file) {
            $lines = file(PROCESS_PATH . "scripts/$folder/$file");
            foreach ($lines as $line) {
                $line = trim($line);
                if (!isset($hash[$line])) {
                    $hash[$line] = true;
                    $line_list[] = $line;
                } else {
                    $ind++;
                    echo "$ind ): $line\n";
                }
            }
        }
        // write file
        file_put_contents(PROCESS_PATH . "scripts/states.txt", implode(PHP_EOL, $line_list));
    }

    function keyword_search() {
        $keywords = file(PROCESS_PATH . "scripts/keywords.csv");
        $state = file(PROCESS_PATH . "scripts/states.txt");
        shuffle($state);
        $keywords_search = [];
        $ind = 0;
        foreach ($keywords as $keyword) {
            $keywords_search[] = trim($keyword) . " " . trim($state[$ind++]);
        }
        file_put_contents(PROCESS_PATH . "scripts/keyword_search.txt", implode(PHP_EOL, $keywords_search));
    }

}
