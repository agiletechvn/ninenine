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

class PopadsController extends FBToolController {

    function index() {
        
    }

    function proxy($page) {
        $url = "http://proxylist.hidemyass.com/$page#listable";
        $script = PROCESS_PATH . 'scripts/proxy4free.js';
        $cmd = "casperjs --ignore-ssl-errors=true --disk-cache=true --url='$url' $script";
        $ret = array();
        exec($cmd, $ret);
        $lines = json_decode($ret[0], true);
        return $lines;
    }

    function spam($socks = 0) {
        $script = PROCESS_PATH . 'scripts/popads.js';

        $urls = array_filter(file(PROCESS_PATH . "scripts/popads_links.txt"));
        $agents = file(PROCESS_PATH . 'scripts/agent.txt');
        $desk_viewports = array('1280|800', '1269|718', '1600|900', '1440|900', '1280|1024', '1366|768', '1024|768');

        // make random order
        shuffle($urls);

        $lines = file(PROCESS_PATH . 'scripts/' . ($socks == 0 ? 'proxy' : 'socks') . '.txt');

        // loop with url
        foreach ($urls as $url) {

//                $lines = $this->proxy($page);

            if ($lines) {

                array_filter($lines);

                foreach ($lines as $line) {
                    list($host, $port) = explode('|', $line);
                    $host = trim($host);
                    $port = trim($port);
                    $proxy = "--proxy=$host:$port";
                    if ($socks) {
                        $proxy .= " --proxy-type=socks5";
                    }
                    list($width, $height) = explode('|', $desk_viewports[array_rand($desk_viewports)]);
                    $agent = trim($agents[array_rand($agents)]);
                    $agent_str = "--agent='$agent'";
                    // cache images
                    $cmd = "casperjs --ignore-ssl-errors=true --disk-cache=true --url='$url' --width=$width --height=$height $script $proxy $agent_str";

                    echo $cmd . "\n";
                    $ret = array();
                    exec($cmd, $ret);
                    print_r($ret);
                    sleep(0.5);
                }
            }
        }
    }

}
