<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Scraper {

    public $phantom_file = 'phantomjs';
    public $scraper_file;
    //public $scraper_detail_file;
    public $proxy_file;
    public $timeout = 10000;
    public $crawler_total;
    public $on_scrape;
    public $on_error;
    public $delegate_obj;
    public $master_selector;
    public $detail_selector;
    public $link_selector_key = 'link';
    public $ignore_other_domain_scripts = true;
    public $correct_catogory = false;
    public $js;
    private $param;
    private $cache;
    private $crawler_domain;
    private $crawler_index;
    private $current_path;
    // http://www.proxy4free.com/list/webproxy1.html
    private $proxy_cache;
    private $proxy_checked;
    private $current_url;
    

    /**
     * 
     */
    function __construct() {
        if (!$this->current_path) {
            $this->current_path = realpath(dirname(__FILE__)) . '/';
        }
        
        $this->param = array();
        // get default scraper file include image + title + description
        $this->phantom_file = $this->current_path . 'bin/phantomjs';
        $this->scraper_file = $this->current_path . 'js/scraper.js';
        $this->scraper_login_file = $this->current_path . 'js/scraper_login.js';
        //$this->scraper_detail_file = $this->current_path . 'js/scraper_detail.js';
        $this->proxy_file = $this->current_path . 'assets/proxies.txt';
    }
    
    /**
     * 
     * @param type $param
     */
    function set_param($param, $value=null){
        if($value){
            $this->param[$param] = $value;
        } else {
            if(is_array($param)){
                $this->param = array_merge($this->param, $param);
            }
        }
        
    }

    /**
     * Ignore urls which we have scraped
     */
    function set_scraped_urls($scraped_urls) {
        if (!isset($this->cache)) {
            $this->cache = array();
        }

        // corrected form
        if(is_array($scraped_urls)){
            foreach ($scraped_urls as $url) {
                $this->cache[$url] = true;
            }
        } else {
            $this->cache[$scraped_urls] = true;
        }
    }
    
    function unset_scraped_urls($scraped_urls){
        if(isset($this->cache)){
            if(is_array($scraped_urls)){
                foreach ($scraped_urls as $url) {
                    unset($this->cache[$url]);
                }
            } else {
                unset($this->cache[$scraped_urls]);
            }
        }
    }
    
    /**
     * 
     * @return type
     */
    function get_current_scraped_url(){
        return $this->current_url;
    }

    /**
     * 
     * @return type
     */
    function get_current_path() {
        return $this->current_path;
    }
    
    /**
     * 
     * @return type
     */
    function get_current_index(){
        return $this->crawler_index;
    }

    /**
     * 
     * @return type
     */
    function get_crawler_domain() {
        return $this->crawler_domain;
    }

    /**
     * 
     * @param type $file : defaul is system file like proxy_file
     */
    function set_proxy($file = null, $append = true) {
        
        if(is_array($file)){
            $temp = $file;
        } else {
            // read proxies from file as array
            $text = file_get_contents($file ? $file : $this->proxy_file);
            $temp = preg_split("/\n+/", $text);
        }
        
        if(!$append || !isset($this->proxy_cache)){
            $this->unset_proxy();
            $this->proxy_cache = array();
        }
        
        foreach ($temp as $item) {
            $item = trim($item);
            if (!(empty($item))) {
                // only set proxies which are not in array
                // for large of proxies, you should override by setting append = false
                // for better performance
                if(in_array($item, $this->proxy_cache) === false) {
                    $this->proxy_cache[] = $item;
                }
            }
        }

        //print_r($this->proxy_cache);
    }

    /**
     * 
     */
    function unset_proxy() {
        unset($this->proxy_cache);
        unset($this->proxy_checked);
    }

    private function test_proxy($proxy) {

        // has checked before
        if (isset($this->proxy_checked[$proxy])) {
            return true;
        }

        $check = false;
        preg_match('#(?:https?://)?([^:]+)(?::(.*))?#', $proxy, $match);
        if(isset($match[1])){
            $ip_or_host = $match[1];
            $port = isset($match[2]) ? +$match[2] : 80;
            
            // timeout 3 seconds
            if ($con = @fsockopen($ip_or_host, $port, $err_no, $err_str, 3)) {
                $check = true;
                $this->proxy_checked[$proxy] = true;
                fclose($con); // Close the socket handle
            }
        }
        return $check;
    }

    /**
     * 
     * @param type $method
     * @param type $data
     */
    private function invoke($method, $data) {
        if (isset($method)) {
            if (is_callable($method)) {
                // invoke function, just like call_user_functions
                $method->__invoke($data, $this);
            } else if (is_string($method) && isset($this->delegate_obj)) {
                call_user_method($method, $this->delegate_obj, $data, $this);
            }
        }
    }

    /**
     * 
     * @return null
     */
    function nextProxy() {

        if (!isset($this->proxy_cache)) {
            return null;
        }
        while ($proxy = array_shift($this->proxy_cache)) {
            if ($this->test_proxy($proxy)) {
                // make cycle
                array_push($this->proxy_cache, $proxy);
                return $proxy;
            } else {
                $error = array('type' => 'proxy', 'data' => $proxy);
                //echo "\nPROXY_ERROR: " . $proxy;
                // should delete this item in file in callback function
                $this->invoke($this->on_error, $error);
            }
        }
        // unset 'cos we have nothing
        $this->unset_proxy();
        return null;
    }

    /**
     * 
     * @return null
     */
    function currentProxy() {
        if (!isset($this->proxy_cache)) {
            return null;
        }
        return $this->proxy_cache[0];
    }

    /**
     * 
     * @param type $url
     * @param type $scarper_file
     * @param type $data
     * @param type $proxy
     * @return type
     */
    private function phantom($url, $scraper_file, $data = null, $proxy = null,$param=null, $ready = null, $sent_type = 'GET', $sent_data = null) {
        $cmd = "'{$this->phantom_file}' --disk-cache=true";
        $cookie_data = null;
        // proxy config
        if ($proxy) {
            $cmd .= " --proxy=$proxy";
        }
        if(is_array($param)){
            foreach($param as $k=>$v){
                if($k==='cookie-data'){
                    $cookie_data = $v;
                } else {
                    $cmd .= " --$k='$v'";
                }
            }
        }
        
        if($sent_type === 'GET'){
            // this url is a copy of string, we don't have to create another
            $url = $url . "?" . (is_array($sent_data) 
                    ? http_build_query($sent_data) 
                    : $sent_data);
        } 
        
        $cmd .= " '$scraper_file' '$url' "
                . urlencode(str_replace(' ', '&nbsp;', json_encode($data)))
                . " '{$this->timeout}'";
         
        if($this->ignore_other_domain_scripts){
            $cmd .= " true";
        } else {
            $cmd .= " false";
        }
        
        // send cookie to server
        $cmd .= ' ' .urlencode(str_replace(' ', '&nbsp;', json_encode($cookie_data)));
        // ready function and js function
        $cmd .= " '" . urlencode(str_replace(' ', '&nbsp;',$ready)) . "' '{$this->js}'";
        
        // now define type and sent data
        $cmd .= ' ' . $sent_type;
        
        // it get, phantomjs doesn't support, so we have to build up
        if($sent_type !== 'GET'){
            if(is_array($sent_data)){
                $sent_data_str = '';
                foreach($sent_data as $k=>$v){
                    $sent_data_str .= strlen($sent_data_str) > 0 ? '&' : '';
                    $sent_data_str .= "$k=$v";
                }
                $cmd .= " '$sent_data_str'";
            } else {
                $cmd .= " '$sent_data'";
            }
        }
        
        //echo $cmd;
        // remove space
        $response = trim(exec($cmd, $output));

        if(!$response){
            // find other row ?
            $response = $output[0];
        }
        return $response;
    }

    /**
     * 
     * @param string $url
     * @param type $data
     * @param type $scrape_detail
     * @return null
     */
    public function scrape($url, $data = null, $scrape_detail = true,$param=null) {
        if (!$url)
            return;
        // assign current url
        $this->current_url = $url;
        $ready = null;
        if(isset($data['ready'])){
            $ready = $data['ready'];
            unset($data['ready']);
        }
        
        $sent_type = null;
        if(isset($data['type'])){
            $sent_type = $data['type'];
            unset($data['type']);
        }
        
        $sent_data = null;
        if(isset($data['data'])){
            $sent_data = $data['data'];
            unset($data['data']);
        }
        
        if($param){
            $param = array_merge($this->param, $param);
        } else {
            $param = $this->param;
        }
        
        $scrape_data = $data;
        // fast way to check where we scrape  master or detail
        if (!$scrape_detail) {
            // ok it is master scrape
            if (!isset($data[0])) {
                // mark to tell javascript to know if we scrape master data
                $scrape_data = array($data);
            }
        }

        if (file_exists($this->scraper_file)) {

            //$scraper_file = $scrape_detail ? $this->scraper_detail_file : $this->scraper_file;
            $proxy = $this->nextProxy();

            $response = $this->phantom($url, $this->scraper_file, $scrape_data, $proxy,$param, $ready, $sent_type, $sent_data);
            
            // try again with slash, for master only :D
            if ($this->correct_catogory && empty($response) && !$scrape_detail) {
                // correct category to scrape master data
                if (substr($url, -1) !== '/') {
                    $url .= '/';
                    $response = $this->phantom($url, $this->scraper_file, $data, $proxy,$param, $ready, $sent_type, $sent_data);
                }
            }
            //if ($scrape_detail) {
                //echo $response;
            //}
            $json = json_decode($response, true);
            if(is_array($json)){
                // check error :D
                if (isset($json['errors'])) {
                    $error = array(
                        'type' => 'scrape',
                        'data' => $json['errors']
                    );
                    //print_r($error);
                    $this->invoke($this->on_error, $error);
                }
                //print_r($json);
                return $json;
            } else {
                // plain text 'cos we can't decode
                return $response;
            }
        }

        return null;
    }

    /**
     * 
     * @param type $href
     * @return type
     */
    private function extract($href) {
        
        $url = parse_url($href);
        if (isset($url['host'])) {
            $host = preg_replace('/^www./', '', $url['host']);
            if ($host != $this->crawler_domain) {
                return;
            }
        } else {
            echo "\nNotice:", $href, "\n";
            return;
        }

        // we not only cache url of detail but url of everything like category url
        if (isset($this->cache[$href])) {
            echo "\nexisted: $href";
            return;
        }

        $this->cache[$href] = true;

        $data = $this->scrape($href, $this->master_selector, false, $this->param);
        //print_r($data);die;
        if(is_array($data)){
            if (is_array($data['articles'])) {
                foreach ($data['articles'] as $row) {
                    // exit 'cos we exceed max number
                    if ($this->crawler_index >= $this->crawler_total){
                        return;
                    }
                    // increase the total of crawler items
                    $this->crawler_index++;
                    // assign aticle item
                    $article = $row;

                    // we assum link is detail link, if have
                    if (isset($row[$this->link_selector_key]) && ($url = $row[$this->link_selector_key])) {

                        if (isset($this->cache[$url])) {
                            // this article we have already indexed
                            // we just get another description of it
                            //echo 'existed: ', $href,"<br/>";
                            continue;
                        }
                        // don't read this url 
                        $this->cache[$url] = true;

                        // sometime, we define url just to index the crawler, but we don't
                        // want to read detail
                        //echo "\n", $this->crawler_index, ":", $url;
                        if(!empty($this->detail_selector)){
                            $row_detail = $this->scrape($url, $this->detail_selector, true, $this->param);
                            if (isset($row_detail['article']) && is_array($row_detail['article'])) {
                                $article = array_merge($article, $row_detail['article']);
                            }
                        }


                    }
                    // now we have fully article item
                    $this->invoke($this->on_scrape, $article);
                }
            }

            // category may be paging or main menu
            $categories = $data['categories'];
            // loop through it again
            if (is_array($categories)) {
                foreach ($categories as $cat) {
                    // after one run, may be we have enough, so break loop
                    if ($this->crawler_index >= $this->crawler_total)
                        return;
                    $this->extract(rtrim($cat, '/'));
                }
            }
            unset($data);
        } else {
            $error = array(
                'type' => 'scrape',
                'msg' => 'No data are extracted, may be need to login first',
                'data' => $data
            );
            //print_r($error);
            $this->invoke($this->on_error, $error);
        }
    }

    /**
     * Of course we don't want to run a url twice
     * @param type $href
     */
    function run($href) {
        $url = parse_url($href);
        $this->crawler_ind = 0;

        if (!isset($this->cache)) {
            $this->cache = array();
        }
        $this->crawler_domain = preg_replace('/^www./', '', $url['host']);

        // start
        $this->extract($href);
    }

    function __destruct() {
        unset($this->cache);
    }

}
