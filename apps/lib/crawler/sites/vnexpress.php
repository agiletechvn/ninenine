<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Crawler::$table_name = 'tbl_content';

Crawler::$url = 'http://vnexpress.net/';

Crawler::$total = 20;

// config for master view
Crawler::$master_selector = array(
                array(
                    'item'=>'#news_home>li',  // item de lay, se timeout doi den luc no xuat hien      
                    'category'=>'#menu_web > li:gt(0)', // dang category, phan trang cung la category
                    'extract'=> array(
                       'img' => array(
                           'selector'=>'.thumb img',
                           'attr'=>'src'
                        ),
                        'link' => array(
                            'selector'=>'a.txt_link',
                            'attr'=>'href',
                            'require'=>true
                        ),
                        'desc' => array(
                            'selector'=>'.news_lead',
                            'method'=>'text'
                        )
                    )
                )
            );


// config for detail selector, all are custom
Crawler::$detail_selector = array(
                'extract' => array(
                    'title' => array(
                        'selector'=>'head>title',
                        'method'=>'text'
                    ),
                    'category' => array(
                        'selector'=>'#breakumb_web li.active',
                        'method' => 'text'
                    ),
                    'tag' => array(
                        'selector'=>'.block_tag', 
                        'method'=>'function (tag){
                            return tag.find("a").map(function(){
                                return $.trim($(this).text());
                            }).get().join(",");
                        }'
                    ),
                    'content' => array(
                        'selector' => '.fck_detail width_common',
                        'method' => 'html'
                    )
                )
            );

// function to insert into table, fields are from detail selector config
Crawler::$on_scrape = function($item, $scraper){
    
        //$host = $scraper->get_crawler_domain();
        // insert data, insert category .v.v. bla bla
        //print_r($row);
        echo "\nUPDATE:" . $item['link'];
        // insert database
        //print_r($item);
        db_insert(Crawler::$table_name, $item);
        
    };