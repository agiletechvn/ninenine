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

define('SITE_NAME', 'http://99s.vn');
define('RESOURCE_ROOT', 'http://resource.99s.vn');

/*** Rewrite URL ***/
define('URI_SUFFIX', '.html|.xml');

/*** Database***/
define('DB_ENGINE', 'mysqli');
/*define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '123456');
define('DB_NAME', 'newssik');*/

/*** Language ***/
define('DEFAULT_LANGUAGE', 'en');

/*** Stuff, this is for portal, when delivery for other partner, change this ***/
define('GZIP_MODE', false);
define('DEFAULT_TIMEZONE', 'Asia/Ho_Chi_Minh');
define('CHARSET', 'utf8');
define('REWRITE_MODE', true);
define('DEBUG', false);

/*** GLOBALS ***/
$GLOBALS['default_route'] = 'index';
$GLOBALS['tpl_engine'] = 'MF';
$GLOBALS['theme'] = 'team';

// global
hook('system.router', array('team'));