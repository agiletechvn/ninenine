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

interface Template {
	function __construct($cache_path);
	function display($master, $tpl, &$args);
}

include SYS_PATH . 'template' . DS . $GLOBALS['tpl_engine'] . '.php';