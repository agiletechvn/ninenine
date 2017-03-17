<?php
        
define('DB_ENGINE', 'mysqli');
define('DB_SERVER', '127.0.0.1');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '123456');
define('DB_NAME', 'facebook_autopost');

define('CRONJOB_INTERVAL', 60*10);
define('MAX_POST_DELAY', 10000);
define('DEBUG', true);

// may be array for hook name
hook('admin.menu,admin.updateprofile,admin.loginform,
      admin.adminpage,admin.config', array('fbtool'));

hook('admin.menu', array('fbtool'));


$GLOBALS['theme'] = 'fbtool';