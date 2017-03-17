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

class ServerController extends FBToolController {

    protected $table = 'tbl_ssh_thuan';
    // this for scan only    
//    protected $server_config = array(
//        'thuan4hau' => ['server' => '162.243.36.60', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'local' => ['server' => DB_SERVER, 'user' => DB_USERNAME, 'pass' => DB_PASSWORD, 'db' => DB_NAME]
//    );
    // this for real system
    protected $server_config = array(
//        'hau1big' => ['server' => '104.131.107.82', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => 'vloz_net'],
//        'hau2big' => ['server' => '159.203.161.88', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => 'vloz_net'],
//        'hau3big' => ['server' => '104.131.83.70', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'hau4big' => ['server' => '45.55.238.131', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'hau5big' => ['server' => '45.55.42.187', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'hau6big' => ['server' => '162.243.241.248', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => 'vloz_net', 'ssh_port' => 2222],
        // ************************************************************
        // 'thuan1big' => ['server' => '159.203.168.217', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'daquy_mobi', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
       'acccheck-1' => ['server' => '104.131.73.81', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'daquy_mobi', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan2big' => ['server' => '107.170.39.212', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan3big' => ['server' => '107.170.43.56', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan4big' => ['server' => '107.170.39.219', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan5big' => ['server' => '107.170.39.221', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan6big' => ['server' => '107.170.39.225', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan7big' => ['server' => '162.243.215.81', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan8big' => ['server' => '162.243.215.176', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        // ************************** TEST **********************************
//        'thuan4hau' => ['server' => '162.243.36.60', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
//        'thuan4thang' => ['server' => '192.241.173.23', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'ssh_tool', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'],
        'local' => ['server' => DB_SERVER, 'user' => DB_USERNAME, 'pass' => DB_PASSWORD, 'db' => DB_NAME]
    );
    
    function __construct() {
        global $argh;
        if (isset($argh['--table'])) {
            $this->table = $argh['--table'];
        }
        parent::__construct();
    }

    function test() {
        // $mobile_agents = file(PROCESS_PATH . 'scripts/agent.txt');
        // $str = $mobile_agents[2302];
        // echo $str . "$\n";
        $config = ['server' => '104.131.73.81', 'user' => 'tupt', 'pass' => '123qwebnN', 'db' => 'daquy_mobi', 'rank' => 1, 'ssh_user' => 'root', 'ssh_pass' => '123qwebnN'];
        $server = $config['server'];
        $ssh_user = $config['ssh_user'];
        $ssh_pass = $config['ssh_pass'];
        $ssh_port = isset($config['ssh_port']) ? +$config['ssh_port'] : 22;
        // connect via ssh2
        $connection = ssh2_connect($server, $ssh_port);
        if($connection) {
            if (!ssh2_auth_password($connection, $ssh_user, $ssh_pass)) {
                echo "ERROR (SSH): can not connect $server_src with $ssh_user and $ssh_pass!\n";
            } else {
                $cmd = "ls";
                echo "EXEC: $cmd\n";
                $stream = ssh2_exec($connection, $cmd);
                stream_set_blocking($stream, true);
                echo stream_get_contents($stream) . "\n";
            }
        }
    }

    // this function will stop a process, then run it again, by stop even nohup or whatever related to process name
    // so it will be ok
    function process($func, $instance_number = 26, $rate = 5, $remove_ip = 0, $mobile_percent = 80, $timeout = 30000) {
        global $argh;
        $args_str = '';
        // by default controller is ssh
        $controller = 'ssh';
        foreach ($argh as $k => $v) {
            // get only controller and re-pass others
            if ($k == '--controller') {
                $controller = $v;
            } else {
                $args_str .= " $k=$v";
            }
        }

        foreach ($this->server_config as $server_src => $config) {
            if (isset($config['ssh_user'])) {

                $real_instance_number = $instance_number * (isset($config['rank']) ? +$config['rank'] : 1);

                $server = $config['server'];
                $ssh_user = $config['ssh_user'];
                $ssh_pass = $config['ssh_pass'];
                $ssh_port = isset($config['ssh_port']) ? +$config['ssh_port'] : 22;
                // connect via ssh2
                $connection = ssh2_connect($server, $ssh_port);
                if ($connection) {
                    if (!ssh2_auth_password($connection, $ssh_user, $ssh_pass)) {
                        echo "ERROR (SSH): can not connect $server_src with $ssh_user and $ssh_pass!\n";
                    } else {
                        // multi commands seperated by ; must be blocking
                        echo "CONNECTED: $server_src\n";
                        // these commands run separatedly
                        $cmd = "cd /var/www/html/ninenine/;php console.php fbtool/$controller/close_process/$func;php console.php fbtool/$controller/close_process/casperjs;killall ssh";
                        echo "EXEC: $cmd\n";
                        $stream = ssh2_exec($connection, $cmd);
                        stream_set_blocking($stream, true);
                        echo stream_get_contents($stream) . "\n";

                        // so if instance number is zero, it is like stop all command
                        if ($instance_number > 0) {
                            // non block
                            $cmd = "cd /var/www/html/ninenine && nohup php console.php fbtool/$controller/process/$func/$real_instance_number/$rate/$remove_ip/$mobile_percent/$timeout $args_str > cronjob/$func.log 2>&1&";
                            echo "EXEC: $cmd\n";
                            ssh2_exec($connection, $cmd);
                        }
                    }

                    // close as soon as possible
                    unset($connection);
                } else {
                    echo("ERROR (SSH): connect failed! ($server:22)\n");
                }
            }
        }
    }

    function remove_duplicate() {

        $check = array();
        $ind = 0;

        foreach ($this->server_config as $server_src => $config) {
            // also use local to store more ssh with faster check
            $deleted_ids = array();

            db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

            $ip_list = db_select($this->table, array('id', 'ip'));

            foreach ($ip_list as $v) {
                $ip = $v['ip'];
                if (isset($check[$ip])) {
                    $ind++;
                    echo "$ind) DELETE: $ip from $server_src\n";
                    $deleted_ids[] = $v['id'];
                } else {
                    // mark it
                    $check[$ip] = true;
                }
            }

            if (!empty($deleted_ids)) {
                // delete from current db
                db_delete($this->table, array('id' => $deleted_ids));
            }
        }
    }

    function copy_link($link = 'links', $upload = 1) {

        $file_content = file_get_contents(PROCESS_PATH . "scripts/$link.txt");
        foreach ($this->server_config as $server_src => $config) {
            // has ftp server
            if (isset($config['ssh_user'])) {
                $file = PROCESS_PATH . "scripts/links/$server_src.txt";
                file_put_contents($file, $file_content);
            }
        }

        if ($upload) {
            $this->upload_links();
        }
    }

    function upload_link($server_src, $permission = 0644) {
        $config = $this->server_config[$server_src];

        // has ftp server
        if (isset($config['ssh_user'])) {

            $file = PROCESS_PATH . "scripts/links/$server_src.txt";
            $remote_file = "/var/www/html/ninenine/modules/fbtool/scripts/links.txt";
            $server = $config['server'];
            $ssh_port = isset($config['ssh_port']) ? +$config['ssh_port'] : 22;
            $ssh_user = $config['ssh_user'];
            $ssh_pass = $config['ssh_pass'];

            // connect via ssh2
            $connection = ssh2_connect($server, $ssh_port);
            if ($connection) {
                if (!ssh2_auth_password($connection, $ssh_user, $ssh_pass)) {
                    echo "ERROR (SSH): can not connect $server_src with $ssh_user and $ssh_pass!\n";
                } else {
                    echo "UPLOAD: from $file to $ssh_user@$server:$remote_file\n";
                    ssh2_scp_send($connection, $file, $remote_file, $permission);
                }

                // close as soon as possible
                unset($connection);
            } else {
                echo("ERROR (SSH): connect failed! ($server:22)\n");
            }
        }
    }

    function upload_links($permission = 0644) {
        foreach ($this->server_config as $server_src => $config) {
            $this->upload_link($server_src, $permission);
        }
    }

    // upload files from folder to vps
    function upload_ftp_files($file = 'ssh.php', $folder = 'controllers', $permission = 0644) {
        foreach ($this->server_config as $server_src => $config) {
            $this->upload_ftp_file($file, $folder, $server_src, $permission);
        }
    }

    function upload_ftp_file($file, $folder, $server_src, $permission = 0644) {

        $config = $this->server_config[$server_src];

        // has ftp server
        if (isset($config['ssh_user'])) {
            $src_file = PROCESS_PATH . ($folder ? "$folder/" : "") . $file;
            $remote_file = "/var/www/html/ninenine/modules/fbtool/$folder/$file";
            $server = $config['server'];
            $ssh_user = $config['ssh_user'];
            $ssh_pass = $config['ssh_pass'];
            $ssh_port = isset($config['ssh_port']) ? +$config['ssh_port'] : 22;

            // connect via ssh2
            $connection = ssh2_connect($server, $ssh_port);
            if ($connection) {
                if (!ssh2_auth_password($connection, $ssh_user, $ssh_pass)) {
                    echo "ERROR (SSH): can not connect $server_src with $ssh_user and $ssh_pass!\n";
                } else {
                    echo "$server_src:\n";
                    echo "UPLOAD: from $src_file to $ssh_user@$server:$remote_file\n";
                    ssh2_scp_send($connection, $src_file, $remote_file, $permission);
                }
                // close as soon as possible
                unset($connection);
            } else {
                echo("ERROR (SSH): connect failed! ($server:22)\n");
            }
        }
    }

    function upload_file($server_src, $permission = 0644) {

        global $argh;
        $country_code = isset($argh['--country-code']) ? $argh['--country-code'] : 'GLOB';
        $config = $this->server_config[$server_src];

        // has ftp server
        if (isset($config['ssh_user'])) {

            $file = PROCESS_PATH . "scripts/$server_src.txt";
            $remote_file = "/var/www/html/ninenine/modules/fbtool/scripts/$server_src.txt";
            $server = $config['server'];
            $ssh_user = $config['ssh_user'];
            $ssh_pass = $config['ssh_pass'];
            $ssh_port = isset($config['ssh_port']) ? +$config['ssh_port'] : 22;

            // connect via ssh2
            $connection = ssh2_connect($server, $ssh_port);
            if ($connection) {
                if (!ssh2_auth_password($connection, $ssh_user, $ssh_pass)) {
                    echo "ERROR (SSH): can not connect $server_src with $ssh_user and $ssh_pass!\n";
                } else {
                    echo "UPLOAD: from $file to $ssh_user@$server:$remote_file\n";
                    ssh2_scp_send($connection, $file, $remote_file, $permission);
                    $cmd = "cd /var/www/html/ninenine && php console.php fbtool/ssh/update/$server_src --db=daquy_mobi --country-code=$country_code";
                    echo "EXEC: $cmd\n";
                    $stream = ssh2_exec($connection, $cmd);
                    stream_set_blocking($stream, true);
                    echo stream_get_contents($stream) . "\n";
                }

                // close as soon as possible
                unset($connection);
            } else {
                echo("ERROR (SSH): connect failed! ($server:22)\n");
            }
        } else {
            $path = SITE_PATH;
            $cmd = "cd $path && php console.php fbtool/googleads/update/$server_src --db=daquy_mobi";
            echo "EXEC: $cmd\n";
            print_r(shell_exec($cmd)) . "\n";
        }
    }

    /**
     * split_ssh_file/ssh_backup_small|ssh_all_13_05/1
     * @param type $file
     * @param type $delete
     * @param type $upload
     */
    function split_ssh_file($file = 'local', $delete = 0, $upload = 1) {
        $lines = file(PROCESS_PATH . "scripts/$file.txt");
        $part_total = 0;

        foreach ($this->server_config as $server_src => $config) {
            if (isset($config['ssh_user'])) {

                $part_total += isset($config['rank']) ? +$config['rank'] : 1;

                if ($delete) {
                    echo "CONNECTED $server_src:\n";
                    db_connect($config['db'], $config['user'], $config['pass'], $config['server']);
                    // then truncate table
                    db_excute("TRUNCATE TABLE " . $this->table);
                }
            }
        }

        if (!empty($lines)) {
            $size = ceil(count($lines) / $part_total);
            $parts = array_chunk($lines, $size);

            foreach ($this->server_config as $server_src => $config) {
                if (isset($config['ssh_user'])) {
                    $part_num = isset($config['rank']) ? +$config['rank'] : 1;
                    $part = [];
                    while ($part_num > 0 && !empty($parts)) {
                        $part = array_merge($part, array_shift($parts));
                        $part_num--;
                    }
                    if (empty($part)) {
                        continue;
                    }
                    file_put_contents(PROCESS_PATH . "scripts/$server_src.txt", $part);
                    if ($upload) {
                        $this->upload_file($server_src);
                    }
                }
            }
        }
    }

    function update_ssh() {
        foreach ($this->server_config as $server_src => $config) {
            if (isset($config['ssh_user'])) {
                $this->upload_file($server_src);
            }
        }
    }

    /**
     * Fails is less than 10 times
     * @param type $fails
     */
    function split_ssh($fails = 10, $backup = false) {
        // get all data, write to file, then split by rank
        // then insert into new file
        $lines = array();
        $part_total = 0;
        foreach ($this->server_config as $server_src => $config) {
            if (isset($config['ssh_user'])) {

                $part_total += isset($config['rank']) ? +$config['rank'] : 1;

                db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

                $ip_list = db_select($this->table, array('ip', 'user', 'pass'), array('fails < ' . $fails));

                foreach ($ip_list as &$row) {
                    $lines[] = $row['ip'] . '|' . $row['user'] . '|' . $row['pass'];
                }

                // then truncate table
                db_excute("TRUNCATE TABLE " . $this->table);
            }
        }

        if (!empty($lines)) {
            // backup like export function, but we dont have to run it again :v
            if ($backup) {
                $this->file_put_contents(PROCESS_PATH . "scripts/$backup.txt", $lines);
            }

            $size = ceil(count($lines) / $part_total);
            $parts = array_chunk($lines, $size);

            foreach ($this->server_config as $server_src => $config) {
                if (isset($config['ssh_user'])) {

                    $part_num = isset($config['rank']) ? +$config['rank'] : 1;
                    $part = [];

                    // empty parts then break
                    while ($part_num > 0 && !empty($parts)) {
                        $part = array_merge($part, array_shift($parts));
                        $part_num--;
                    }

                    // no need to upload
                    if (empty($part)) {
                        continue;
                    }

                    file_put_contents(PROCESS_PATH . "scripts/$server_src.txt", implode(PHP_EOL, $part));

                    // then upload to server, and run update command to insert again
                    $this->upload_file($server_src);
                }
            }
        }
    }

    /*     * *
     * extract good ssh
     */

    function export_good_ssh($file = 'good_ssh', $fails = 10, $delete = false) {

        $lines = array();

        foreach ($this->server_config as $server_src => $config) {
            if (isset($config['ssh_user'])) {

                db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

                $ip_list = db_select($this->table, array('ip', 'user', 'pass'), array('fails < ' . $fails));

                foreach ($ip_list as &$row) {
                    $lines[] = $row['ip'] . '|' . $row['user'] . '|' . $row['pass'];
                }

                // then truncate table
                if ($delete) {
                    db_delete($this->table, array('fails < ' . $fails));
                }
            }
        }

        $this->file_put_contents(PROCESS_PATH . "scripts/$file.txt", $lines);
    }

    function export_ssh_all($file = 'all_ssh') {
        $data = array();
        foreach ($this->server_config as $server_src => $config) {
            echo "EXPORT: $server_src ...\n";
            db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

            $ip_list = db_select($this->table, array('ip', 'user', 'pass'));

            foreach ($ip_list as &$row) {
                $data[] = $row['ip'] . '|' . $row['user'] . '|' . $row['pass'];
            }
        }

        $this->file_put_contents(PROCESS_PATH . "scripts/$file.txt", $data);
    }

    /**
     * export from db server to file
     * @param type $server_src
     * @param type $start
     * @param type $num
     * @param type $server_dst
     */
    function export_ssh($server_src, $start = 1, $num = 0, $server_dst = null) {        
        $config = $this->server_config[$server_src];
        db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

        $where = array("id >= $start");
        $ip_list = db_select($this->table, array('id', 'ip', 'user', 'pass'), $where, false, $num, 'id ASC');

        // get last id
        $stop = $ip_list[count($ip_list) - 1]['id'];

        // remove this range
        $where[] = "id <= $stop";
        db_delete($this->table, $where);

        // then insert into new file
        $data = array();
        foreach ($ip_list as &$row) {
            $data[] = $row['ip'] . '|' . $row['user'] . '|' . $row['pass'];
        }
        $this->file_put_contents(PROCESS_PATH . 'scripts/' . ($server_dst ? $server_dst : $server_src) . '.txt', $data);
    }

    // this is for export form database to file
    private function file_put_contents($path, $data) {
        $fp = fopen($path, 'w');
        fwrite($fp, implode(PHP_EOL, $data));
        fclose($fp);
    }

    // move and split ssh from local to all other vps
    function export_ssh2vps($server_src = 'local', $check_duplicate = false) {

        // remove duplicate
        if ($check_duplicate) {
            $this->remove_duplicate();
        }

        // export to file
        $this->export_ssh($server_src);

        // split file then update to all server
        $this->split_ssh_file($server_src);
    }

    function move_ssh($server_src, $start, $num, $server_dst) {
        $config = $this->server_config[$server_src];
        db_connect($config['db'], $config['user'], $config['pass'], $config['server']);

        $where = array("id >= $start");
        $ip_list = db_select($this->table, '*', $where, false, $num);

        // get last id
        $stop = $ip_list[count($ip_list) - 1]['id'];

        // remove this range
        $where[] = "id <= $stop";
        db_delete($this->table, $where);

        // then insert into new server
        $config = $this->server_config[$server_dst];
        db_connect($config['db'], $config['user'], $config['pass'], $config['server']);
        $ind = 0;
        // move data to destination database
        foreach ($ip_list as &$row) {
            unset($row['id']);
            $ind++;
            $ip = $row['ip'];
            echo "$ind) INSERT: $ip to $server_dst\n";
            db_insert($this->table, $row);
        }
    }

}
