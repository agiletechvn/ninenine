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

if (!isset($argv[1])) {
	echo "Usage:\n" .
		"nn {module}/{controller}/{action}/{param}?key=value \n" .
		"(http://99framwork.com.vn)";
	die;
}

$GLOBALS['debug'] = array('time'=> microtime(true), 'mem' => memory_get_usage());
// Error reporting on
error_reporting(E_ALL ^ E_DEPRECATED);

// Define
define('DS', DIRECTORY_SEPARATOR);
define('SITE_PATH', realpath(dirname(__FILE__)) . DS);
define('SYS_PATH', SITE_PATH . 'systems' . DS);
/*** Define Path ***/
define('APP_PATH', SITE_PATH . 'apps' . DS);
define('MODULE_PATH', SITE_PATH . 'modules' . DS);
define('MEDIA_PATH', SITE_PATH . 'media' . DS);
define('THEME_PATH', SITE_PATH . 'themes' . DS);
define('CACHE_PATH', SITE_PATH . 'cache' . DS);

/*** SITE ***/
define('SITE_ROOT', 'http://' . gethostname() . '/' . $argv[0]);

// Include the core class
include SYS_PATH . 'core.php';
include APP_PATH . 'config.php';
include SYS_PATH . 'router.php';
include SYS_PATH . 'controller.php';
include SYS_PATH . 'language.php';
include SYS_PATH . 'database' . DS . DB_ENGINE . '.php';

// init and run
date_default_timezone_set(DEFAULT_TIMEZONE);

// init get array
if(strrchr($argv[1], '?')){
	list($_GET['rt'], $param) = explode('?', $argv[1]);
	$pair = explode('&', $param);
	foreach($pair as $item){
		list($k,$v) = explode('=', $item);
		$_GET[$k] = $v;
	}
} else
	$_GET['rt'] = $argv[1];


// load router
Router::load();

if(defined('DEBUG') && DEBUG === true){
	echo "\nTime excute:" . (microtime(true) - $GLOBALS['debug']['time']) . ' seconds';
	echo "\nMem usage:" . ((memory_get_usage(true) - $GLOBALS['debug']['mem']) / (1024 * 1024)) . ' mb';
}