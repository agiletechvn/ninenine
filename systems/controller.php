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

abstract class Controller {
    // contain all variables to bind into view
    protected $args = array();

    // compress the action result
    function __construct() {
        if (GZIP_MODE)
            ob_start("ob_gzhandler");
    }

    // all controllers must contain an index method
    abstract function index();

    // load, when we want to change the way we load template, we also want to change layout
    protected function load($layout = true, $view = null) {

        if (!$view)
            $view = Router::$action;
        $args = &$this->args;
        $process_theme_path = THEME_PATH . $GLOBALS['theme'] . DS;
        @include_once $process_theme_path . 'config.php';

        // load on demand		
        if (!defined('THEME_ROOT'))
            define('THEME_ROOT', SITE_ROOT . 'themes' . '/' . $GLOBALS['theme'] . '/');
        if (isset($GLOBALS['child_theme'])) {
            define('CHILD_THEME_ROOT', SITE_ROOT . 'themes' . '/' . $GLOBALS['child_theme'] . '/');
            $theme = $GLOBALS['child_theme'];
        } else
            $theme = $GLOBALS['theme'];
        $sub_view_path = (defined('HOOK_PATH') ? 'hook' . DS . 'modules' . DS
                        . Router::$hook_module . DS . 'views' : 'views') . DS . Router::$controller . DS . $view;
        if (!file_exists($process_view_file = ($process_view_temp = SITE_PATH . 'themes' . DS
                        . $theme . DS . $sub_view_path) . '.htm'))
            $process_view_file = (defined('HOOK_PATH') ? HOOK_PATH . 'views' . DS : VIEW_PATH) .
                    Router::$controller . DS . $view . '.htm';

        // if there is no view, do we need modified args?, should need
        //else 
        //@include_once $process_view_temp . '.php';

        include_once SYS_PATH . 'template.php';
        $class = $GLOBALS['tpl_engine'] . 'Template';
        $this->template = new $class(CACHE_PATH . 'views' . DS);

        // modified $args before display
        @include $process_view_temp . '.php';

        $this->template->display($layout ? $process_theme_path .
                        (is_string($layout) ? $layout : 'index') . '.htm' : NULL, // load layout or default
                $process_view_file, $this->args);
    }

    // json encode
    protected function json($data) {
        header('Content-type: application/json');
        echo json_encode($data);
    }
    
    /**
     * this function is helpful for something that is not changed frequently
     * such as news detail, category, or read from file
     * @param type $timeout
     */
    protected function cache($timeout=3600){
        // enable local cache for controller
        if($timeout > 0){
            $file = SITE_PATH . 'cache/html/' . $_SERVER['SERVER_NAME'] . '/' . md5($_SERVER['REQUEST_URI']) . '.html';
            if (file_exists($file) && (filemtime($file) + $timeout) > time()) {
                // Output the existing file to the user
                readfile($file);
                exit();
            } else {
                // Setup saving and let the page execute:
                ob_start();
                register_shutdown_function(function () use ($file) {
                    file_put_contents($file, ob_get_flush());
                });
            }
        }
    }

    /**
     * redirect
     * @param $url
     * @param $absolute
     * @return void
     */
    protected function redirect($url, $absolute = false) {
        header('Location: ' . ($absolute ? '' : SITE_ROOT) . (REWRITE_MODE ? '' : '?rt=') . ($url[0] == '/' ? LANGUAGE : '') . $url);
        exit();
    }

    // come here must match suffix url
    private function trim_url($url) {
        $ind = $len = strlen($url);
        while (--$len > 0)
            if ($url[$len] === '/')
                break;
            elseif ($url[$len] === '?')
                $ind = $len;
            elseif ($url[$len] === '.')
                return substr($url, 0, $len);
        return substr($url, 0, $ind);
    }

    /**
     * check whether is postback
     */
    protected function is_postback() {
        if (!isset($this->_is_postback))
            $this->_is_postback = $_SERVER['REQUEST_METHOD'] === 'POST' && SITE_ROOT . $this->trim_url(@$_GET['rt']) === $this->trim_url(@$_SERVER['HTTP_REFERER']) && !$this->is_callback();

        return $this->_is_postback; // cache result
    }

    /**
     * check callback, tolower?
     */
    protected function is_callback() {
        return @$_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest'; // so fast, no need to cache
    }

    /**
     * assign, using chainable technique
     * convert into native array, so it will run faster
     * @param $name
     * @param $value
     * @return void
     */
    protected function assign($name) {
        if (is_array($name) || is_object($name))
            $this->args = array_merge($this->args, (array) $name);
        else {// use this to reduce memory usage, copy from perl			
            $args = func_get_args();
            $count = count($args);
            for ($i = 0; $i < $count; $i++)
                $this->args[$args[$i]] = @$args[++$i];
        }
        return $this;
    }

    protected function url($absolute = true) {
        $url = $_SERVER['REQUEST_URI'];
        if ($absolute) {
            $s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
            $sp = strtolower($_SERVER["SERVER_PROTOCOL"]);
            $protocol = substr($sp, 0, strpos($sp, "/")) . $s;
            $port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":" . $_SERVER["SERVER_PORT"]);
            $url = $protocol . "://" . $_SERVER['SERVER_NAME'] . $port . $url;
        }
        return $url;
    }

}
