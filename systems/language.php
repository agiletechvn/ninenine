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


$lang = array();

/**
 * @param $file
 * @return array
 */
function read_language($files){
	$lang = array();
	foreach($files as $file){
		if(file_exists($file)){
			$lines = file($file,FILE_SKIP_EMPTY_LINES);
			// Special char
			if(isset($lines[0][0]) && ord($lines[0][0]) === 239)
					$lines[0] = substr($lines[0], 3);

			$key = false;
			foreach($lines as $line){	
				$line = trim($line);
				if(!$line || $line[0] === '#') continue;			
				if ($key){
					$lang[$key] = $line;				
					$key = false;
				} else 			
					$key = $line;				
			}
		} 
	}
	return $lang;
}

function extend_language($cache_path, $lang_files, $merge=TRUE){
	global $lang;
	$time = 0;
	foreach($lang_files as $f) if(($t=@filemtime($f))>$time) $time = $t;
	if(!$time) return;
	$cache_file = $cache_path . LANGUAGE . "$time.php";
	if(!file_exists($cache_file)){	
		$temp = read_language($lang_files);
		$lang = array_merge($lang, $temp);
		if($merge){
			$content = array('<?php $lang=array(');
			foreach($temp as $k=>$v)
				$content[] = "'".str_replace("'", "\\'", $k)."'=>'" . str_replace("'", "\\'", $v) ."',";
			$content[] = ');';
		} else {
			$content = array('<?php ');
			foreach($temp as $k=>$v)
				$content[] = "\$lang['".str_replace("'", "\\'", $k)."']='" . str_replace("'", "\\'", $v) ."';";
		}
		if(!is_dir($cache_path)) 
		 	mkdir($cache_path);
		else {
			$files = scandir($cache_path);
			foreach($files as $file)
				if(substr($file,0,2) === LANGUAGE)
					unlink($cache_path . $file);
		}
		file_put_contents($cache_file, $content);
		$GLOBALS['compile_template'] = TRUE;
	}else 
		// the cache file maybe include more than one during event driving process
		include_once($cache_file);
}
 
/**
 * utility functions
 * @param $str
 * @return string
 */
function t($str){	
	global $lang;		
   	return  isset($lang[$str]) ?  $lang[$str] : $str;
}