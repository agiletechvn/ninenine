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

$GLOBALS['mf_tpl_hash'] = array();

define('MF_BASE', SYS_PATH . 'template' . DS . 'MF' . DS);

function tpl_hash(&$name){
	if(!isset($GLOBALS['mf_tpl_hash'][$name])){
		$hex = '';
		$pos = strlen($name) - 4;// '.htm'
	    for ($i=0; $i < $pos; $i++)
	        $hex .= $name[$i] === '/' ? '_' : $name[$i];	    
	    $GLOBALS['mf_tpl_hash'][$name] = $hex;
	}
    return $GLOBALS['mf_tpl_hash'][$name];
}

function abs_path($path){
	return str_replace(DS, '/', substr($path, strlen(SITE_PATH)));
}

include MF_BASE . 'exceptions.php';
include MF_BASE . 'runtime.php';
include MF_BASE . 'api.php';


class MFTemplate implements Template {
	private $loader;
	function __construct($cache_path) {
		$this->loader = new MF_Loader($cache_path . 'MF');
	}	
	
  	function display($master = NULL, $tpl, &$args){
		$GLOBALS['mf_master_file'] = $master ? abs_path($master) : NULL;
		$this->loader->getTemplate($GLOBALS['mf_tpl_file'] = abs_path($tpl))->display($args); 
    }
}
