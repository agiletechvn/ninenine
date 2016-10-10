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

// Re-Set
$GLOBALS['theme'] = 'admin';
$GLOBALS['default_route'] = 'index';

// Admin account
define('ADMIN_USERNAME', 'ninenine');
define('ADMIN_PASSWORD', 'nmtnmt124');

// maximum limit for each kind of notification in modules
define('MAX_NOTIFICATION_LIMIT', 100);
define('MIN_NOTIFICATION_LIMIT', 20);

define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 465);
define('SMTP_SECURITY', 'ssl');
define('SMTP_USER', 'maikieu.cute@gmail.com');
define('SMTP_PASS', 'nmtnmt111');

// register template filter, this event runs local
hook('system.template.filter', array('admin'));
//hook('language.change', array('admin'));