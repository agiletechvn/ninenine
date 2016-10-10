<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Crawler {

    static $js;
    static $table_name;
    static $url;
    static $insert_item;
    static $timeout = 10000;
    static $phantom_file;
    static $scraped_url_field = 'link';
    static $param = array('load-images'=>'false','ignore-ssl-errors'=>'yes','ssl-protocol'=>'any');
    static $total = 1;
    static $master_selector;
    static $detail_selector;
    static $proxy_list = false;
    static $scraper;
    // callback
    static $on_error;
    static $on_scrape;
    
    static function ignore_other_resource($bln=true){
        self::init();
        self::$scraper->ignore_other_domain_scripts = $bln;
        if($bln === false){
            self::$param['load-images'] = 'true';
        }
    }

    static function init() {
        if (!isset(self::$scraper)) {
            // set bo nho cho ram de luu cac url da duyet
            // mac dinh unlimit vi du duyet 500 000 url
            ini_set('memory_limit', '-1');
            // include scrapper
            include_once realpath(dirname(__FILE__)) . '/scraper.php';
            // init scraper
            self::$scraper = new Scraper();
        }
    }
    
    static function assign_cookie_str($str, $secure=true, $domain=null){
        if(empty($domain)){
             $url = parse_url(self::$url);
             $domain = preg_replace('/^www./', '', $url['host']);
        }
        $temp = explode(';', $str);
        foreach($temp as $t){
            list($k,$v) = explode('=', $t,2);
            self::$param['cookie-data'][] = array(
                        'domain' => $domain,
                        'httponly' => false,
                        'name' => $k,
                        'path' => '/',
                        'secure' => $secure,
                        'value' => $v

            );
        }
    }
    
    static function scrape($link, $data){
        self::init();
        $ret = self::$scraper->scrape($link, $data);
        return $ret;
    }

    static function do_login($login_link, $data) {
        self::init();
        
        $temp = self::$scraper->ignore_other_domain_scripts;
        // we need to load image to pass through captcha
        Crawler::ignore_other_resource(false);

        // update param for crawler
        self::$scraper->set_param(self::$param);
        $current_scraper_file = self::$scraper->scraper_file;
        self::$scraper->scraper_file = self::$scraper->scraper_login_file;
        $ret = self::$scraper->scrape($login_link, $data);
        // update param for crawler if we don't specify cookies-file
        //if(!isset(self::$param['cookies-file'])){
        self::$scraper->set_param('cookie-data', $ret);
        //}
        self::$scraper->scraper_file = $current_scraper_file;
        
        // return config
        Crawler::ignore_other_resource($temp);
        // return cookie for later login
        return $ret;
    }

    private static function fix() {

        if (self::$table_name) {

            $scraped_col = db_query_one("SELECT count(*)   
                        FROM information_schema.COLUMNS 
                        WHERE 
                            TABLE_SCHEMA = '" . DB_NAME . "' 
                        AND TABLE_NAME = '" . self::$table_name . "' 
                        AND COLUMN_NAME = '" . self::$scraped_url_field . "'", true);

            if (!$scraped_col) {
                db_excute("ALTER TABLE " . self::$table_name . " ADD " . self::$scraped_url_field . " VARCHAR( 255 )");
            }
        }

        if (!is_callable(self::$on_error)) {
            self::$on_error = function($error, $scraper) {
                if ($error['type'] === 'scrape') {
                    $error_data = $error['data'];
                    echo "\nERROR while scraping:\n";
                    print_r($error_data);
                }
            };
        }
    }

    static function run($again=false) {
        if(!$again){
            if (!self::$total) {
                return;
            }

            self::init();

            // update param for crawler
            self::$scraper->set_param(self::$param);

            self::fix();

            // gioi han so tin se crawler
            self::$scraper->crawler_total = self::$total;

            if (self::$phantom_file) {
                self::$scraper->phantom_file = self::$phantom_file;
            }
            if(!empty(self::$js)){
                if(is_array(self::$js)){
                    self::$js = implode(',', self::$js);
                }
                self::$scraper->js = self::$js;
            }

            // selector for index
            self::$scraper->link_selector_key = self::$scraped_url_field;

            self::$scraper->timeout = self::$timeout;


            // only continue, not start over again :D
            if (self::$table_name) {
                $scraped_urls = db_query("select distinct " . self::$scraped_url_field . " from " . self::$table_name . "", true);
                self::$scraper->set_scraped_urls($scraped_urls);
            }

            if (self::$proxy_list) {
                self::$scraper->set_proxy(self::$proxy_list);
            }
        }
        // run again must update on_scrape and on_error as long as selector
        self::$scraper->on_error = self::$on_error;
        // callback function, ham nay se goi khi extract duoc tin, vi du insert vao csdl
        self::$scraper->on_scrape = self::$on_scrape;
        
        // run again only with selector config
        self::$scraper->master_selector = self::$master_selector;
        self::$scraper->detail_selector = self::$detail_selector;
        self::$scraper->run(self::$url);
    }

}
