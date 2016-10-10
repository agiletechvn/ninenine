<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


     // add new css file
    $args['logo'] = 'FFlives';
    $args['css'] = array('themes/fflives/css/admin.css?v=1.0.1');
//    $args['js'] = array('themes/fflives/js/admin.scripts.js');
    $args['page_title'] = 'FFlives';
    $args['copyright'] = '2015 &copy;  FFlives. Version 1.0.0';
    
    // admin is not super :D, we can override in MaggicScanController
//    if(Router::$hook_module === 'magicscan')
//        $args['super_admin'] = false;