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

abstract class AdminController extends Controller {

    protected $user;
    protected $avail_group;
    protected $avail_langs = array('en', 'vi');  // unlike group, language should be reset instead of add more
    protected $notifications;
    protected $groups = null;
    protected $super_admin = true; // admin can have all roles
    protected $route;
    protected $dateformat = 'd/m/Y';
    protected $err_msg;
    protected $err_no; // error type like error or warning
    // css and js to override themes :D, you can you child themes
    protected $css;
    protected $js;
    protected $page_title;
    protected $page_desc;
    protected $breadcrumb;
    // this menu is belong to AdminController, we don't want it to be appeared gobally
    // don't translate menu automatically, let system do it
    protected $menu = array();

    /**
     * 
     */
    function __construct() {


        // we will not allow any hook controller that is not found in the menu   
        // but this may be a problem when a module need other controllers from other modules
        // so we should remove module that is not nessesary when we deploy, or prevent in hook
//	if(Router::$hook_module){
//            global $hook;
//            if(!in_array(Router::$hook_module, $hook['admin.menu'])){
//                $this->redirect('admin/error/404.html');
//            }
//        }
        // init for admin menu
        $this->menu['#0'] = array(
            'title' => 'System Controls',
            'group' => array('admin'),
            'icon' => 'dashboard',
            'children' => array(
                '/admin/user' => array(
                    'title' => t('User Management'),
                    'icon' => 'group',
                    'desc' => t('User Management')
                ),
                '/admin/menu' => array(
                    'title' => t('Menu Management'),
                    'icon' => 'sitemap',
                    'desc' => t('Menu Management')
                ),
                '/admin/config' => array(
                    'title' => t('Configuration'),
                    'icon' => 'cogs',
                    'desc' => t('List of system configuration')
                ),
                '/admin/mysqlconvert' => array(
                    'title' => t('Database Export')
                )
            )
        );

        // init for variables
        $config = array(
            'avail_group' => array('admin', 'guest', 'member')
        );

        trigger('admin.config', $config);

        // assign from config of controller, override, not merge recursive
        // even menu can be override, but should not do that, this is for simple vars
        // which simple vars can be add more, are inited in $config, otherwise are reset
        if (isset($this->config))
            $config = array_merge($config, $this->config);

        // try to not copy, so don't have to release $config capacity
        foreach ($config as $k => $v)
            $this->$k = $v;

        // just remove pointer
        unset($this->config);

        // get fully url
        $this->route = Router::$module;
        $this->breadcrumb = '<li><a href="' . LANGUAGE . '/admin/index.html"><i class="icon-home"></i></a><span class="divider">&nbsp;</span></li>';

        if (Router::$hook_module)
            $this->route .= '/' . Router::$hook_module;
        if (Router::$controller != 'index')
            $this->route .= '/' . Router::$controller;
        if (Router::$action != 'index' && !ctype_digit(Router::$action))
        // may be it is param, we use number as direct param, otherwise string value should be query, to differ easier
            $this->route .= '/' . Router::$action;

        if (!$this->check_permission()) {
            // encode url for browser that denies url as parameter, by default, move them to admin dashboard
            // such as when they change the permission for that group permanently or remove that page^^
            $redirect_url = 'admin/account/login?return_url=' . urlencode(SITE_ROOT . 'admin/index.html');
            if ($this->is_callback()) {
                // don't put this in redirect 'cos it can cause misunderstood
                echo '<ajax><content><![CDATA[<script>location.href="'
                . (SITE_ROOT . (REWRITE_MODE ? '' : '?rt=') . $redirect_url)
                . '";</script>]]></content></ajax>';
                exit();
            } else
                $this->redirect($redirect_url);
        }

        parent::__construct();
        if (isset($_SESSION['MESSAGE'])) {
            $this->assign('MESSAGE', $_SESSION['MESSAGE']);
            unset($_SESSION['MESSAGE']);
        }

        db_connect();

        // initialize some properties
        if (defined('AVAIL_GROUP'))
            $this->avail_group = array_merge($this->avail_group, explode(',', AVAIL_GROUP));

        // assign all available languages
        if (defined('AVAIL_LANGUAGES'))
            $this->avail_langs = array_merge($this->avail_langs, explode(',', AVAIL_LANGUAGES));

        // assign to views 
        $this->assign('avail_langs', $this->avail_langs);

        // default empty trans_langs	
        $this->trans_langs = array();
        if (defined('TRANS_LANGUAGES')) {
            $temp = explode(',', TRANS_LANGUAGES);
            foreach ($temp as $v) {
                list($key, $value) = explode('=', $v);
                $this->trans_langs[$key] = t($value);
            }
            $this->assign('trans_langs', $this->trans_langs);
        }

        // so children controllers can access
        $this->set_notification();

        set_error_handler(array(&$this, 'handle_error'));
    }

    /**
     * 
     * Enter description here ...
     * @param unknown_type $breadcrumb
     * @param unknown_type $action
     */
    protected function breadcrumb($breadcrumb, $action = 'add') {
        $this->breadcrumb .= '<li style="background:none"><a data-target="#add-modal" toggle-mode="0" data-modal="0"'
                . 'href="' . LANGUAGE . '/admin/';
        if (!empty(Router::$hook_module))
            $this->breadcrumb .= Router::$hook_module . '/';
        $this->breadcrumb .= Router::$controller
                . '/' . $action . '" no-push role="button" data-toggle="modal">'
                . '<button class="btn btn-warning"><i class="icon-plus icon-white">'
                . '</i> ' . $breadcrumb . '</button></a></li>';
        return $this;
    }

    /**
     * 
     */
    protected function set_notification() {
        $this->notifications = array('total' => 0, 'list' => array(), 'limit' => MIN_NOTIFICATION_LIMIT);
        trigger('admin.notification', $this->notifications);
    }

    /**
     * 
     * @param type $layout
     * @param type $view
     * @param type $no_push
     */
    protected function load($layout = true, $view = null, $no_push = false) {
        $this->assign(
                'hook_module', Router::$hook_module, 'controller', Router::$controller, 'PAGE_TITLE', $this->page_title, 'PAGE_DESC', $this->page_desc, 'BREADCRUMB', $this->breadcrumb, 'NOTIFICATIONS', $this->notifications
        );

        if (!$this->is_callback()) {
            // make profile menu
            $adminpage = array('profile_menu' => array(
                    '<li><a href="' . LANGUAGE . '/admin/user/profile/' . $this->user['id']
                    . '"><i class="icon-user"></i> My Profile</a></li>',
                    '<li><a href="' . LANGUAGE . '/admin/account/logout.html" no-push>
                                    <i class="icon-key"></i> Log Out</a></li>'
            ));

            trigger('admin.adminpage', $adminpage);
            $this->assign(
                    'ADMIN_PAGE', $adminpage, 'logo', $this->logo, // required, but no need for ajax
                    'favicon', $this->favicon, // custom
                    'copyright', $this->copyright, // custom
                    'css', $this->css, 'js', $this->js
            );
        }

        parent::load($this->is_callback() && !$no_push ? 'ajax' : $layout, $view);
    }

    /**
     * 
     * @param type $errno
     * @param type $errstr
     * @param type $errfile
     * @param type $errline
     * @return boolean
     */
    function handle_error($errno, $errstr, $errfile, $errline) {
        // get custom message then display it in json format
        $this->err_msg = $this->msg('', $errstr, array('return' => true, 'type' => ($this->err_no = $errno) === E_ERROR ? 'error' : 'warning'));

        return true;
    }

    /**
     * 
     */
    function index() {
        // do nothing
    }

    /**
     * Auto set for link of each menu by it key for default, if not specific
     * @param type $k
     * @param type $v
     * @param type $group
     * @return type
     */
    protected function get_tree_item($k, $v, $group) {
        // by default class item will be menu-item
        $class = 'menu-item';
        // add more class
        if (isset($v['class']))
            $class .= ' ' . $v['class'];
        // show their children
        if (isset($v['children']))
            $class .= ' has-sub';
        return '<li class="' . $class . '">'
                . '<a href="' . ($v['link'] = $k[0] === '#' ? 'javascript:;' : ($k[0] === '/' ? LANGUAGE . $k : $k)) . '">'
                . (isset($v['children']) ? '<span class="icon-box"><i class="icon-' . $v['icon'] . '"></i></span>'
                        . $v['title'] . '<span class="arrow"></span></a><ul class="sub">'
                        . $this->get_tree($v['children'], $group, $v) . '</ul>' : $v['title'] . '</a>')
                . '</li>';
    }

    /**
     * 
     * @param type $menu
     * @param type $group
     * @param type $parent
     * @return type
     */
    private function get_tree(&$menu, $group = null, $parent = null) {
        $ret = '';
        foreach ($menu as $k => $v) {
            $authorized = false;
            // empty also check for isset
            if (empty($v['group']) || ($group === 'admin' && $this->super_admin) || in_array($group, $v['group'])) {
                if (isset($v['link']))
                    $k = $v['link'];
                // after this function $v['link'] will always have value
                $ret .= $this->get_tree_item($k, $v, $group);
                $authorized = true;
            }

            // may be a link can be override by other module, so we repeat it            
            if ($this->route === preg_replace('/^\/|\/index\/?$/i', '', $k)) {
                if ($authorized) {
                    $this->page_title = $v['title'];
                    if (isset($v['desc']))
                        $this->page_desc = $v['desc'];

                    // append breadcrumb
                    $this->breadcrumb .= '<li><a href="'
                            . (isset($parent['url']) ? $parent['url'] : $this->route) . '">'
                            . $parent['title'] . '</a>'
                            . '<span class="divider">&nbsp;</span></li>'
                            . '<li><a href="' . $k . '">' . $this->page_title . '</a>'
                            . '<span class="divider-last">&nbsp;</span></li>';
                } else
                    $this->not_authorized();
            }
        }
        return $ret;
    }

    /**
     * We have to hack to change the value by reference
     * @param type $method
     * @param type $data
     * support maximum 5 params 
     * at least on param
     */
    private function invoke($method, &$arg0, &$arg1 = null, &$arg2 = null, &$arg3 = null, &$arg4 = null, &$arg5 = null) {
        if (isset($method)) {
            if (is_callable($method)) {
                // invoke function, just like call_user_functions
                // in callback function, we can access $this object
                $method->__invoke($arg0, $arg1, $arg2, $arg3, $arg4, $arg5);
            } else if (is_string($method)) {
                call_user_method($method, $this, $arg0, $arg1, $arg2, $arg3, $arg4, $arg5);
            }
        }
    }

    /**
     * 
     */
    protected function not_authorized() {
        $this->msg(t('Thông báo!'), t('Bạn không có quyền truy cập.'), array('url' => '/admin/index', 'type' => 'warn'));
    }

    /**
     * 
     * @return boolean
     */
    protected function check_permission() {
        if (isset($_SESSION['user'])) {
            if ((($group = $_SESSION['user']['group']) === 'admin' && $this->super_admin) || !$this->groups || in_array($group, $this->groups)) {
                trigger('admin.menu', $this->menu);
                // we can't change value via key when other does first, that why we have
                // to use extends array
                if (isset($this->menu['extends'])) {
                    $extended_menu = $this->menu['extends'];
                    unset($this->menu['extends']);
                    $this->menu = array_replace_recursive($this->menu, $extended_menu);
                }

                ksort($this->menu);
                $this->assign('USER', $this->user = $_SESSION['user']);
                $this->assign('MENU', $this->get_tree($this->menu, $group));
                return true;
            } else
                $this->not_authorized();
        }
        return false;
    }

    /**
     * don't translate automatically too much
     * @param type $title
     * @param type $content
     * @param type $options
     * @return string
     */
    protected function msg($title, $content = '', $options = array()) {
        $options = array_merge(array('type' => 'success', 'url' => NULL, 'return' => false), $options);
        $msg = '<div class="alert alert-block alert-' . $options['type'] . ' fade in">' .
                '<button data-dismiss="alert" class="close" type="button">×</button>
			<h4 class="alert-heading">' . $title . '</h4><p>' . $content .
                '</p></div>';
        if ($options['url']) {
            $_SESSION['MESSAGE'] = $msg;
            $absolute = substr($options['url'], 0, 4) === 'http';
            $this->redirect($options['url'], $absolute);
        } else {
            if ($options['return'])
                return $msg;
            else
                $this->assign('MESSAGE', $msg);
        }
    }

    /**
     * 
     * @param type $to
     * @param type $from
     * @param type $from_name
     * @param type $title
     * @param type $body
     * @return boolean
     */
    protected function mail($to, $from, $from_name, $title, $body) {
        require_once APP_PATH . 'lib' . DS . 'plugins' . DS . 'Swift' . DS . 'lib' . DS . 'swift_required.php';
        $transport = Swift_SmtpTransport::newInstance(SMTP_HOST, SMTP_PORT, SMTP_SECURITY)
                ->setUsername(SMTP_USER)
                ->setPassword(SMTP_PASS);

        $mailer = Swift_Mailer::newInstance($transport);
        $message = Swift_Message::newInstance($title)
                ->setReplyTo($from, $from_name)
                ->setFrom(SMTP_USER)
                ->setTo($to)
                ->setBody($body, 'text/html');

        if ($mailer->send($message))
            return true;
        else
            return false;
    }

    /**
     * 
     * @param type $view
     * @param type $args
     * @param type $hook
     * @return type
     */
    protected function get_content($view, $args = NULL, $hook = false) {
        include_once SYS_PATH . 'template.php';
        $template = new MF_Loader(CACHE_PATH . 'Views' . DS . 'MF');
        return $template->getTemplate('modules/'
                        . ($hook ? Router::$hook_module . '/hook/modules/' : '') . Router::$module
                        . '/views/' . Router::$controller . '/' . $view . '.htm')->render($args);
    }

    /**
     * 
     * @param type $server
     * @param type $path
     * @param type $file
     * @param type $user
     * @param type $pass
     */
    protected function upload_ftp_file($server, $path, $file, $user, $pass) {

        $connection = ftp_connect($server);
        $login = ftp_login($connection, $user, $pass);

        if (!$connection || !$login) {
            die('Connection attempt failed, Check your settings');
        }
        ftp_put($connection, $path . basename($file), $file, FTP_BINARY);
    }

    /**
     * update translate automatically	
     * @param int $id
     */
    protected function update_trans($id) {

        // hook translations (?)
        if (isset($this->translations))
        // get all field that translated
            foreach ($this->translations as $fieldTransName) {
                foreach (array_keys($this->trans_langs) as $lang) {
                    if (isset($_POST[$fieldPostName = $fieldTransName . '_' . $lang])) {
                        $translated_str = addslashes(trim($_POST[$fieldPostName]));
                        // we don't translate into empty string
                        if (!empty($translated_str)) {
                            $tid = "{$this->table}/{$fieldTransName}/{$id}";
                            db_excute("INSERT INTO translate (tid, lang, str) 
									VALUES ('$tid', '$lang', '$translated_str')
		  							ON DUPLICATE KEY UPDATE str='$translated_str'");
                        }
                    }
                }
            }
    }

    /**
     * 
     * @param type $id
     */
    protected function delete_trans($id) {
        // hook translations (?)
        if (isset($this->translations))
            foreach ($this->translations as $fieldTransName) {
                $tid = "{$this->table}/{$fieldTransName}/{$id}";
                db_excute("DELETE FROM translate WHERE tid='$tid'");
            }
    }

    /**
     * 
     * @param type $sDefaultWhere
     * @param type $sDefaultOrder
     * @return type
     */
    protected function get_ouput($sDefaultWhere = '', $sDefaultOrder = '', $iFilteredTotal = 0, $iTotal = 0) {
        $sTable = $this->table;
        // sanitize all column name, we name variable like it is used in datatable plugin
        //+string is the fastest way to go instead of intval()
        $aColumns = db_sanitize_columns($this->columns);
        $sIndexColumn = db_sanitize_column($this->index_column);
        $aCanSearch = $this->searches;
        $aCanOrder = isset($this->orders) ? $this->orders : array();

        // paging		
        $sLimit = '';
        if (isset($_GET['iDisplayStart']) && $_GET['iDisplayLength'] != '-1') {
            $sLimit = "LIMIT " . (+$_GET['iDisplayStart']) . ", " .
                    (+$_GET['iDisplayLength']);
        }

        // Ordering		
        // with searching, must declare searchIndexes at server
        // but for order, no need to do
        $sOrder = '';
        if (isset($_GET['iSortCol_0'])) {
            $sOrder = 'ORDER BY  ';
            for ($i = 0, $iSortingCols = +$_GET['iSortingCols']; $i < $iSortingCols; $i++) {
                $iSortCol = +$_GET['iSortCol_' . $i];
                if ($_GET['bSortable_' . $iSortCol] === 'true' && in_array($iSortCol, $aCanOrder))
                    $sOrder .= $aColumns[$iSortCol] . ' '
                            . mysql_real_escape_string($_GET['sSortDir_' . $i]) . ', ';
            }

            $sOrder = substr_replace($sOrder, '', -2);
            if ($sOrder === 'ORDER BY')
                $sOrder = '';
        }

        // never use default order with custom order, user won't see what's happening
        if ($sOrder === '' && !empty($sDefaultOrder))
            $sOrder = 'ORDER BY ' . $sDefaultOrder;

        $sWhere = '';
        if (!empty($sDefaultWhere))
            $sWhere = 'WHERE ' . $sDefaultWhere;
        if ($aCanSearch && $_GET['sSearch'] != '') {
            if ($sWhere === '')
                $sWhere = 'WHERE ';
            else
                $sWhere .= ' AND ';
            $sWhere .= ' (';
            // real_escape_string is better for insert binary, such as from msgpack
            // however, addslashes is a good alternative
            $sSearch = mysql_real_escape_string($_GET['sSearch']);
            if (is_callable($aCanSearch))
                $sWhere .= $aCanSearch($sSearch);
            else {
                for ($i = 0; $i < count($aColumns); $i++)
                    if (in_array($i, $aCanSearch))
                        $sWhere .= $aColumns[$i] . " LIKE '%$sSearch%' OR ";

                // delete redundant
                $sWhere = substr_replace($sWhere, '', -3);
            }
            $sWhere .= ')';
        }

        // Individual column filtering 
        for ($i = 0; $i < count($aColumns); $i++) {
            if (isset($_GET[$bSearchableKey = 'bSearchable_' . $i]) && $_GET[$bSearchableKey] === "true" && $_GET['sSearch_' . $i] != '') {
                if ($sWhere === '')
                    $sWhere = 'WHERE ';
                else
                    $sWhere .= ' AND ';
                // fulltext instead
                $sWhere .= $aColumns[$i] . " LIKE '%" . mysql_real_escape_string($_GET['sSearch_' . $i]) . "%' ";
            }
        }

        // query
        $sQuery = "SELECT ";
        if ($iFilteredTotal === 0)
            $sQuery .= 'SQL_CALC_FOUND_ROWS';

        $sQuery .= "$sIndexColumn, " . str_replace(' , ', ' ', implode(', ', array_filter($aColumns))) . "
			FROM `$sTable`
			$sWhere
			$sOrder
			$sLimit
		";


        $rResult = db_query($sQuery);
        // check db_error()
        if ($msg = db_error())
            $this->msg(t('Database Error!'), $msg, array('type' => 'error'));

        // Data set length after filtering 
        if ($iFilteredTotal === 0) {
            $sQuery = 'SELECT FOUND_ROWS()';
            $iFilteredTotal = db_query_one($sQuery, true);
        }

        // Total data set length 
        if ($iTotal === 0) {
            $sQuery = "SELECT COUNT($sIndexColumn) FROM  $sTable";
            if ($sDefaultWhere !== '')
                $sQuery .= ' WHERE ' . $sDefaultWhere;

            $iTotal = db_query_one($sQuery, true);
        }

        // output
        return array(
            'sEcho' => +$_GET['sEcho'],
            'iTotalRecords' => $iTotal,
            'iTotalDisplayRecords' => $iFilteredTotal,
            'aaData' => $rResult
        );
    }

    /**
     * Should put this into plugin functions (?) ...
     * @param datetime $date
     * @param string $format
     */
    protected function parse_date($date, $format = null) {
        $returnArray = array('hour' => 0, 'minute' => 0, 'second' => 0,
            'month' => 0, 'day' => 0, 'year' => 0);

        $dateArray = array();

        if ($format === null)
            $format = $this->dateformat;

        // array of valid date codes with keys for the return array as the values
        $validDateTimeCode = array('Y' => 'year', 'y' => 'year',
            'm' => 'month', 'n' => 'month',
            'd' => 'day', 'j' => 'day',
            'H' => 'hour', 'G' => 'hour',
            'i' => 'minute', 's' => 'second');

        /* create an array of valid keys for the return array
         * in the order that they appear in $format
         */
        for ($i = 0; $i <= strlen($format) - 1; $i++) {
            $char = substr($format, $i, 1);

            if (array_key_exists($char, $validDateTimeCode)) {
                $dateArray[$validDateTimeCode[$char]] = '';
            }
        }

        // create array of reg ex things for each date part
        $regExArray = array('.' => '\.', // escape the period
            // parse d first so we dont mangle the reg ex
            // day
            'd' => '(\d{2})',
            // year
            'Y' => '(\d{4})',
            'y' => '(\d{2})',
            // month
            'm' => '(\d{2})',
            'n' => '(\d{1,2})',
            // day
            'j' => '(\d{1,2})',
            // hour
            'H' => '(\d{2})',
            'G' => '(\d{1,2})',
            // minutes
            'i' => '(\d{2})',
            // seconds
            's' => '(\d{2})');

        // create a full reg ex string to parse the date with
        $regEx = str_replace(array_keys($regExArray), array_values($regExArray), $format);

        // Parse the date, use # to encode / character
        preg_match("#$regEx#", $date, $matches);

        // some checks...
        if (!is_array($matches) ||
                $matches[0] != $date ||
                sizeof($dateArray) != (sizeof($matches) - 1)) {
            return $returnArray;
        }

        // an iterator for the $matches array
        $i = 1;

        foreach ($dateArray AS $key => $value) {
            $dateArray[$key] = $matches[$i++];

            if (array_key_exists($key, $returnArray)) {
                $returnArray[$key] = $dateArray[$key];
            }
        }

        return $returnArray;
    }

    /**
     * 
     * @param type $ret
     * @return int
     */
    protected function get_error_count($ret) {
        $count_error = 0;
        foreach ($ret['error'] as $error)
            if ($error['type'] === 'error')
                $count_error++;
        return $count_error;
    }

    /**
     * remove dir recursively
     * @param string $dir
     */
    protected function remove_dir($dir) {
        foreach (glob($dir . '/*') as $file)
            if (is_dir($file))
                $this->remove_dir($file);
            else
                unlink($file);
        @rmdir($dir);
    }

    /**
     * empty string, null also
     * public function for router
     */
    function all($where = '', $order = '', $view = 'ajax/list') {
        // get output from table as list, ajax paging already added
        $this->assign('output', $this->get_ouput($where, $order))->load(false, $view, true);
    }

    /**
     * 
     */
    function delete() {
        if (isset($_POST['id'])) {
            $id = intval($_POST['id']);
            $ret = $this->delete_one($id);
            $this->json($ret);
        }
    }

    /**
     * 
     * @return type
     */
    function delete_all() {
        if (isset($_POST['id']) && count($_POST['id']) > 0) {
            foreach ($_POST['id'] as $id) {
                $id = intval($id);
                $ret = $this->delete_one($id);
                if ($ret['type'] === 'error')
                    return $this->json($ret);
            }
            $ret['msg'] = t('Xóa thành công');
            $this->json($ret);
        }
    }

    /**
     * 
     * @param type $id
     * @param type $default
     */
    function add($id = null, $default = array(), $callback = null) {
        $id = intval($id);
        if ($id) {
            $trans_keys = array_keys($this->trans_langs);
            $sql = "select *";
            if (isset($this->translations)) {
                $this->assign('translations', $this->translations);

                foreach ($this->translations as $field)
                    foreach ($trans_keys as $k)
                        $sql .= ', ' . db_t($this->table, $field, $k) . '_' . $k . '';
            }
            $sql .= " from {$this->table} where {$this->index_column} = $id limit 1";
            $row = db_query_one($sql);

            // we need to access directly via translation reference
            if (isset($this->translations)) {
                $row['translation'] = array();
                foreach ($this->translations as $field)
                    foreach ($trans_keys as $k)
                        $row['translation'][$field][$k] = &$row[$field . '_' . $k];
            }
        } else
            $row = $default; // default value

            
// callback function
        $this->invoke($callback, $row);

        // always load add view
        $this->assign('v', $row)->load(false, 'add', true);
    }

    /**
     * delete files automatically, by default, to remove space
     * If we define the file field, we should delete it
     * @param type $file_fields
     */
    protected function delete_files($file_fields) {
        foreach ($file_fields as $file_field) {
            if ($file_field && strpos($file_field, 'http') !== 0) {
                @unlink(SITE_PATH . $file_field);
            }
        }
    }

    /**
     * protected, this function use as a better callback solution		 
     * @param unknown_type $id
     */
    protected function delete_one($id) {

        // delete translated text
        $this->delete_trans($id);

        // delete all file fields
        if (isset($this->file_fields)) {
            $file_fields = db_select_one($this->table, $this->file_fields, array($this->index_column => $id));
            // we can override here ^^
            $this->delete_files($file_fields);
        }

        // then delete data		
        $ret = array('type' => 'success');
        if (!db_excute("delete from {$this->table} where {$this->index_column} = $id")) {
            $ret['msg'] = $this->msg('', db_error(), array('type' => 'error', 'return' => true));
            $ret['type'] = 'error';
        } else
        // return id as data to client on afterSubmit callback
            $ret['data'] = $id;
        return $ret;
    }

    /**
     * Id must always be an increament value
     * @param type $id
     * @param type $data
     */
    protected function update_status($id, $data) {
        db_update($this->table, $data, $this->index_column . ' = ' . intval($id));
        $ret = array();
        if ($msg = db_error())
            $ret['msg'] = $msg;
        else
            $ret['msg'] = t('Cập nhật trạng thái thành công');
        $this->json($ret);
    }

    /**
     * update file field for convenience
     * @param type $field
     * @param string $path
     * @param type $delete
     * @param type $upload
     * @param type $uniq_name
     * @return string
     */
    protected function update_file_field($field, $path = null, $delete = true, $upload = true, $uniq_name = true) {
        if ($id = intval(@$_POST['id'])) {
            //Path
            if (empty($path))
                $path = 'media/images/' . Router::$hook_module . '/' . Router::$controller . '/';
            else {
                if (substr($path, -1) !== '/')
                    $path .= '/';
                // shortcut for $id
                $path = str_replace('{id}', $id, $path);
            }
            $filepath = SITE_PATH . $path;

            // delete old one
            if ($delete) {
                // we know what to do so use sql for better performance
                $filename = db_query_one("select $field from {$this->table} where {$this->index_column} = $id limit 1", true);

                // not a remote file
                if ($filename && strpos($filename, 'http') !== 0) {
                    // remove even a name of file, of path of file
                    @unlink($filepath . basename($filename));
                }
            }

            // upload new one, must provile file input with the same name
            if ($upload) {
                $image = $_FILES[$field];
                $imageName = basename($image['name']);
                // create a uniq name
                if ($uniq_name)
                    $imageName = uniqid() . '.' . pathinfo($imageName, PATHINFO_EXTENSION);

                if (!file_exists($filepath))
                // create dir, but only full control for owner, other read
                    mkdir($filepath, 0775, true);

                //Save file
                move_uploaded_file($image['tmp_name'], $filepath . $imageName);

                // return data for update into database, and other usages, don't update db
                $data = array(
                    $field => $path . $imageName
                );

                return $data;
            }
        }
    }

    /**
     * 
     * @param type $data
     * @param type $ret
     */
    protected function update($data, $ret, $callback = null) {
        // we have internal error message, assign it to json response
        if (!empty($this->err_msg))
            $ret['msg'] = $this->err_msg;

        // some error may occur, we ignore error that is not E_ERROR
        if ($this->err_no !== E_ERROR) {
            if ($this->get_error_count($ret) > 0) {
                $ret['msg'] = $this->msg(t('Cập nhật nội dung thất bại'), t('Dữ liệu nhập ko đúng'), array('return' => true, 'type' => 'error'));
            } else {
                // assign from data, we can put custom mapping for id here
                if (isset($_POST[$this->index_column]) && ($id = intval($_POST[$this->index_column]))) {
                    db_update($this->table, $data, $this->index_column . "=$id");
                    // update again :D, return id is represented for index_column
                    $ret['id'] = $id;
                } else {
                    db_insert($this->table, $data);
                    $ret['id'] = db_insert_id();
                }
                if ($msg = db_error()) {
                    // this is for showing error message for db_error, such as hidden field
                    $ret['error']['db_error'] = array('msg' => $msg, 'type' => 'error');
                    $ret['msg'] = $this->msg(t('Cập nhật nội dung thất bại'), $msg, array('return' => true, 'type' => 'error'));
                } else {

                    // invoke one array so we can access them easier
                    $this->invoke($callback, $data, $ret);
                    // check again
                    if ($this->get_error_count($ret) > 0)
                        $ret['msg'] = $this->msg(t('Cập nhật nội dung thất bại'), t('Dữ liệu nhập ko đúng'), array('return' => true, 'type' => 'error'));
                    else {

                        // update translations only when update item successfully
                        $this->update_trans($ret['id']);
                        // return message
                        $ret['msg'] = $this->msg('', t('Cập nhật nội dung thành công'), array('return' => true));
                    }
                }
            }
        }
        $this->json($ret);
    }

}
