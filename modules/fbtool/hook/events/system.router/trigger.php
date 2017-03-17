<?php

$isMobile = array_shift(explode(".",$_SERVER['HTTP_HOST'])) == 'm99sale';// array_shift(explode(".",$_SERVER['HTTP_HOST'])) == 'm' || (!$_COOKIE['webee'] && preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|palm|phone|iphone|pie|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]));

if(!in_array($args[0], array('ozsale','ozsale_m','dantruong','ducanh','admin','charity'))){
	
	// define my own logic
	if(in_array($args[0], array('404','505')))
		array_unshift($args, 'error');
	else {	
		if($temp = strrchr($args[0], '-')) {
			if($isMobile)
				array_unshift($args, array_shift(explode('-',$args[0],2)));
			else
				array_unshift($args, 'news');
		} else 
			$temp = strrchr($args[1],'-');
							
		if($temp){
			for($i=count($args);$i>2;$i--)
				$args[$i] = $args[$i-1];
			$args[2] = substr($temp, 1);
			$args[1] = 'detail';			
		}
	}
	
	if($isMobile)
		array_unshift($args, 'ozsale_m');
	else	
		array_unshift($args, 'ozsale');
}