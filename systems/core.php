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


// large values should place in global variable unless they are accessed from closure
$hook = array();

/**
 * 
 * @param $event
 * @param $modules
 * @return void
 */
function hook($event_str_list, $modules){
	global $hook;
        $events = explode(',', $event_str_list);
        foreach ($events as $v){
            $event = trim($v);
            if(!isset($hook[$event])) 
                $hook[$event] = array();
            $hook[$event] = array_merge($hook[$event], $modules);
        }
}

/**
 * 
 * @param $event
 * @param $controller
 * @param $args
 * @return void
 */
function trigger($event, &$args = NULL, $global=true){
	global $hook;
	if(isset($hook[$event])){
		$return = false;
		$lang_suffix = 'langs' . DS . LANGUAGE . '.txt';
		if($global)
			$loop = $hook[$event];
		elseif(in_array(Router::$module, $hook[$event]))
			$loop = array(Router::$module);	
		else 
			$loop = array(); // default loop here	
		foreach($loop as $m){
			extend_language(CACHE_PATH . 'langs' . DS . $m . "_event_" . $event . DS, 
				array(($hook_path = MODULE_PATH . $m . DS . 'hook' . DS . 'events' . DS . $event . DS) 
					 . $lang_suffix),
				false);
			@include  $hook_path . 'trigger.php';
			if($return) return;
		}
	}
}

function helper($fn, $args = NULL){
	$temp =  'lib' . DS . 'helpers' . DS . "$fn.php";
	if(defined('HOOK_PATH') && file_exists($f = HOOK_PATH . $temp))
		include $f;
	elseif(PROCESS_PATH != APP_PATH && file_exists($f = PROCESS_PATH . $temp))
		include $f;
	else 
		@include APP_PATH . $temp;
	return @$return;
}
