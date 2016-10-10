<?php
// +--------------------------------------------------------------------------+
// | Authors	: Tung, Nguyen Dam ; 		Tu, Pham Thanh                    |
// | Email		: mask_final@yahoo.com;		miss_all_old_friends@yahoo.com    | 								
// | Mobile		: (+84) 936 885 466;		(+84) 1214 149 420                |
// | Date		: 11/2011												      |
// | Website	: http://maskfinalphp.com									  |						
// +--------------------------------------------------------------------------+
// | Copyrights (C) 2011 by MASKFINAL                                         |
// | All rights reserved                                                      |
// +--------------------------------------------------------------------------+

/*** Define Path ***/
define('APP_PATH', SITE_PATH . 'apps' . DS);
define('MODULE_PATH', SITE_PATH . 'modules' . DS);
define('MEDIA_PATH', SITE_PATH . 'media' . DS);
define('THEME_PATH', SITE_PATH . 'themes' . DS);
define('CACHE_PATH', SITE_PATH . 'cache' . DS);

/*** SITE ***/
define('SITE_ROOT', 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('/index.php$/', '', $_SERVER['PHP_SELF']));

// Include the core class
include SYS_PATH . 'core.php';
include APP_PATH . 'config.php';
include SYS_PATH . 'router.php';
include SYS_PATH . 'controller.php';
include SYS_PATH . 'language.php';
include SYS_PATH . 'database' . DS . DB_ENGINE . '.php';
