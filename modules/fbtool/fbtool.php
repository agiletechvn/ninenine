<?php

class FBToolController extends controller {

    function __construct() {
        parent::__construct();

        db_connect();

        if (isset($_SESSION['user_id'])) {
            $this->assign('user', array(
                'user_id' => $_SESSION['user_id'],
                'user_name' => $_SESSION['user_name']
            ));
        }
    }

    function ip2location($ip) {
        $ip2long = ctype_digit($ip) ? +$ip : ip2long($ip);

        $ip_data = db_select_one('ip2location', '*', array("$ip2long BETWEEN ip_from AND ip_to"));

        return $ip_data;
    }

    function index() {
        
    }

    function process($func, $instance_number = 10, $rate = 10, $remove_ip = 0, $mobile_percent = 80, $timeout = 10000) {

        // add sudo in case of can not fork
        require_once (APP_PATH . 'lib/multiprocess/pool.php');
        $cmds = $this->showcommand($func, $instance_number, $rate, $remove_ip, $mobile_percent, $timeout);
        global $argh;
        if (isset($argh['--debug'])) {
            print_r($cmds);
        } else {
            // get pool then run
            $pool = get_pool($cmds);
            $pool->run();
            // run multi processes at the same time, then wait until the last process finish to run the next
            foreach ($pool->getCommands() as $command) {
                $res = $command->getExecutionResult();
                echo $res->getExitCode() . " | " . $res->getStdout() . " | " . $res->getStderr() . "\n";
            }
        }
    }

    function check_run($ip, $url) {
        $check = db_select_one('tbl_ssh_done', 'id', array('url' => $url, 'ip' => $ip), true);

        if ($check) {
            return false;
        }

        return true;
    }

    function showcommand($func = "spam_haudao", $step = 9, $rate = 10, $remove_ip = 0, $mobile_percent = 50, $timeout = 10000) {
        global $argh;
        $where = array();
        // run only some country
        if (isset($argh['--country-code'])) {
            $where['country_code'] = $argh['--country-code'];
        }
        $number = db_select_one($this->table, 'count(id)', $where, true);
        $num = ceil($number / $step);
        $start = 0;
        $value = [];

        $controller = Router::$controller;
        // re-pass arguments
        $args_str = '';
        foreach ($argh as $k => $v) {
            $args_str .= " $k" . (!empty($v) ? "=$v" : "");
        }

        $path = SITE_PATH;
        // from 1111 to whatever
        $port = 1111;
        for ($ind = 1; $ind <= $step; ++$ind) {
            $where = array('id > ' . $start);
            $ids = db_select($this->table, 'id', $where, true, $num, 'id ASC');
            if (empty($ids)) {
                break;
            }
            $stop = array_pop($ids);
            $str = "cd $path && /usr/local/bin/php console.php fbtool/$controller/$func/$port/$start/$stop/$rate/$remove_ip/$mobile_percent/$timeout";
            $str .= $args_str;
            $value[] = $str;

            $start = $stop;

            $port++;
        }
//        print_r($value);
        return $value;
    }

    function close_port($port, $watch_dog = 2) {
        // maximum 10 times, in case of overflow      
        while ($watch_dog > 0) {
            $ret = shell_exec("ps ax | grep '[D]\ $port'");
            preg_match_all('#^\s*(\d+)\s+([^\s]+)#m', $ret, $matches);
            if (isset($matches[1])) {
                $pts_list = array();
                foreach ($matches[1] as $ind => $pid) {
                    $u = $matches[2][$ind];
                    if (strpos($u, 'pts') === false) {
                        exec("kill $pid");
                        // sleep 5 ms
                        usleep(5000);
                    } else {
                        $pts_list[] = $pid;
                    }
                }
                foreach ($pts_list as $pid) {
                    exec("kill -9 $pid");
                    usleep(5000);
                }
            } else {
                break;
            }
            $watch_dog--;
        }
    }

    function close_process($process, $watch_dog = 2) {
        // maximum 10 times, in case of overflow        
        while ($watch_dog > 0) {
            $ret = shell_exec("ps ax | grep '$process' | grep -v grep");
            preg_match_all('#^\s*(\d+)\s+([^\s]+)#m', $ret, $matches);
            $lines = explode("\n", $ret);
            if (isset($matches[1])) {
                $pts_list = array();
                foreach ($matches[1] as $ind => $pid) {
                    // check if not this function
                    $line = $lines[$ind];
//                    echo "$line\n";
                    if (strpos($line, "close_process/$process") === false && strpos($line, "grep '$process'") === false) {
                        $u = $matches[2][$ind];
                        if (strpos($u, 'pts') === false) {
                            echo "kill $pid, user:$u, process:$process\n";
                            exec("kill $pid");
                            // sleep 5 ms
                            usleep(5000);
                        } else {
                            $pts_list[] = $pid;
                        }
                    }
                }
                foreach ($pts_list as $pid) {
                    echo "kill $pid, user:pts\n";
                    exec("kill -9 $pid");
                    usleep(5000);
                }
            } else {
                echo "done\n";
                break;
            }

            $watch_dog--;
        }
    }

    function check_port($port, $wait_time = 10000) {
        $ret = false;
        $step = 500;
        $current = 0;
        $still_close = 'closed';
        while ($current < $wait_time) {
            $msg = trim(shell_exec("nc -z localhost $port || echo '$still_close'"));
            if ($msg !== $still_close) {
//                echo "$msg:$still_close";
                $ret = true;
                break;
            }
            $current += $step;
            usleep($step * 1000);
        }

        return $ret;
    }

    function change_server($ip = 0, $user, $pass, $port) {
        if ($ip) {

            // check connect ssh, then exit
            $this->close_port($port);

            $cmd = "sshpass ";
            if ($pass) {
                $cmd .= "-p$pass ";
            }
//                $cmd = "sshpass -p" . $ssh_row['pass'] . " ssh " . $ssh_row['user'] . "@" . $ssh_row['ip'] . " -f -N -D 3333";
            $cmd .= "ssh -o StrictHostKeyChecking=no $user@$ip -f -C -N -D $port > /dev/null 2>/dev/null &";
            exec($cmd);

            return true;
        } else {

//            db_update('config', array('value' => ''), array('name' => 'current_ip'));
            return false;
        }
    }

    function casper() {
        global $argh;
        $script = '';
        if (isset($argh['--xvfb']) && $argh['--xvfb']) {
            $script .= 'xvfb-run ';
        }
        $script .= 'casperjs';

        if (isset($argh['--engine'])) {
            $script .= ' --engine=' . $argh['--engine'];
        } else {
            $script .= ' --ignore-ssl-errors=true --ssl-protocol=any';
        }

        return $script;
    }

}
