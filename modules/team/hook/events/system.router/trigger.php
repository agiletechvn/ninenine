<?php

// SERVER_NAME is depended on server config, in this case we depended on client request
if (!isset($_SERVER['HTTP_HOST'])) {
    $return = false; // stop hook
    return false; // end code
}

// we can connect to database for this center module to retrieve the match module
// but better way is use memcahe or apc
// in this file, variables are in closure, don't care about them
$route_map = array(
    
);

// remove alias of domain
//$domain = preg_replace('/^www./', '', $_SERVER['HTTP_HOST']);
//$module = $route_map[$domain] ;

$module = 'fflives';

if (empty($module))
    $args = array('404');

else {

    if (!in_array($args[0], array('admin', 'language'))) {
        // error controller
        if (in_array($args[0], array('404', '505')))
            array_unshift($args, 'error');

        if ($temp = strrchr($args[0], '-')) {
            array_unshift($args, 'news');
        } else
            $temp = strrchr($args[1], '-');

        if ($temp) {
            for ($i = count($args); $i > 2; $i--)
                $args[$i] = $args[$i - 1];
            $args[2] = substr($temp, 1);
            $args[1] = 'detail';
        }

        // get the first part as domain
        //$domain = substr($_SERVER['HTTP_HOST'], 0, strpos($_SERVER['HTTP_HOST'], '.'));
        //array_unshift($args, $domain);	
        array_unshift($args, $module);
    } else
    // admin module, or language change need to know about other module
    // so we will load config file of them	
        include MODULE_PATH . $module . DS . 'config.php';
}