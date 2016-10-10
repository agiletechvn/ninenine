<?php 
// +--------------------------------------------------------------------------+
// | Authors	: Tu, Pham Thanh                    |
// | Email		: mask_final@yahoo.com;		miss_all_old_friends@yahoo.com    | 								
// | Mobile		: (+84) 936 885 466;		(+84) 1214 149 420                |
// | Date		: 11/2011												      |
// | Website	: http://maskfinalphp.com									  |						
// +--------------------------------------------------------------------------+
// | Copyrights (C) 2011 by MASKFINAL                                         |
// | All rights reserved                                                      |
// +--------------------------------------------------------------------------+


define('DS', DIRECTORY_SEPARATOR);
define('SITE_PATH', realpath(dirname(__FILE__)) . DS);

// Turn on session
session_start();

// Error reporting on
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);

define('SYS_PATH', SITE_PATH . 'systems' . DS);
include SYS_PATH . 'init.php';

if(DEBUG === true)
    // for debugging
    $GLOBALS['debug'] = array('time'=> microtime(true), 'mem' => memory_get_usage());

// init and run
date_default_timezone_set(DEFAULT_TIMEZONE);
header('Content-type: text/html; charset=' . CHARSET); 
header('X-Powered-By: Ninenine CMS');

Router::load();