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

class Router {

    static $controller = 'index';
    static $action = 'index';
    static $args = array();
    static $module;
    static $hook_module;

    /**
     * @return void
     */
    static function load() {
        // get controller
        self::_init();
        // if the file is not exists
        if (!is_readable($file = (defined('HOOK_PATH') ? HOOK_PATH : PROCESS_PATH) . 'controllers' . DS . self::$controller . '.php')) {
            self::$controller = 'error';
            self::$action = '404';
            $file = APP_PATH . 'controllers' . DS . 'error.php';
        }

        // include the controller
        include $file;
        $class = self::$controller . 'Controller';
        $controller = new $class();

        // run the action, for simply, no args are passed, just use $_GET and $_POST
        if (!method_exists($controller, self::$action)) {
            // rebind action by default is index
            // don't use magic function because may be there will be something hazardous
            array_unshift(self::$args, self::$action);
            self::$action = 'index';
        }
        call_user_func_array(array(&$controller, self::$action), self::$args);
    }

    /**
     * get controller
     * @return void
     */
    static function _init() {
        // Get the parts of the route
        $uri = explode("/", preg_replace('/(?:\/|' . URI_SUFFIX . ')$/', '', @$_GET['rt']));
        define('LANGUAGE', file_exists(APP_PATH . 'langs' . DS . @$uri[0] . '.txt') ? array_shift($uri) : DEFAULT_LANGUAGE);

        if (!@$uri[0])
            $uri = explode('/', rtrim($GLOBALS['default_route'], '/'));
        trigger('system.router', $uri);

        if (self::_is_module($first = array_shift($uri), $uri)) {
            define('PROCESS_PATH', MODULE_PATH . self::$module . DS);
            @include PROCESS_PATH . 'config.php';
            // must have an abstract class, no way ;)
            include PROCESS_PATH . self::$module . '.php';
        } else {
            self::$controller = $first;
            self::$action = array_shift($uri);
            self::$args = $uri;
            define('PROCESS_PATH', APP_PATH);
        }

        define('VIEW_PATH', PROCESS_PATH . 'views' . DS);
        // process languages
        $lang_cache_path = CACHE_PATH . 'langs' . DS . self::$module;
        $lang_files = array(
            APP_PATH . ($lang_suffix = 'langs' . DS . LANGUAGE . '.txt'),
            PROCESS_PATH . $lang_suffix
        );

        if (defined('HOOK_PATH')) {
            $lang_cache_path .= '_' . self::$hook_module . DS;
            $lang_files[] = HOOK_PATH . $lang_suffix;
            // include override of admin controller if existed
            @include HOOK_PATH . self::$hook_module . '.php';
            @include HOOK_PATH . 'config.php';
        } else
            $lang_cache_path .= DS;

        extend_language($lang_cache_path, $lang_files);
    }

    /**
     * Module
     * @param $mod_name
     * @param $uri
     * @return boolean
     */
    static function _is_module($mod_name = '', &$uri) {
        // check module
        if (is_dir(MODULE_PATH . $mod_name)) {
            self::$module = $mod_name;
            if (count($uri) > 0) {
                $first = array_shift($uri);
                $action = array_shift($uri);
                // is controller in module or call from another module
                if (file_exists(($hook_path = MODULE_PATH . $first . DS . 'hook' . DS . 'modules' . DS . $mod_name . DS)
                                . 'controllers' . DS . "$action.php")) {
                    define('HOOK_PATH', $hook_path);
                    self::$hook_module = $first;
                    self::$controller = $action;
                    $action = array_shift($uri);
                } elseif (file_exists(MODULE_PATH . $mod_name . DS . 'controllers' . DS . "$first.php"))
                    self::$controller = $first;
                else
                    $action = $first;

                if (!empty($action)) {
                    self::$action = $action;
                    self::$args = $uri;
                }
            }
            return TRUE;
        }
        return FALSE;
    }

}
