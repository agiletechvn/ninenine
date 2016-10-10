<?php

 function get_resource_file($files, $name, $type = 'css', $path = NULL){
 	$abs_path = ($path ? SITE_PATH . $path : THEME_PATH . $GLOBALS['theme']) . DS . $type . DS;
 	$cache_file = $abs_path . ($name = $name . '.' . $type);
 	$validate = false;
 	if(file_exists($cache_file)){
 		foreach($files as $file)
 			if(filemtime($cache_file) < filemtime($abs_path . $file)) {
 				$validate = true;
 				break;
 			}
 	} else  
 		$validate = true;
 	if($validate) {
 		$data = array();
		foreach($files as $file)
			$data[] = file_get_contents($abs_path . $file);
		if($type == 'js'){
			include_once 'class.javascriptPacker.php';
			$packer = new JavaScriptPacker(implode(';', $data));
			$data = $packer->pack();
		} else {
			include_once 'function.cssCompress.php';
			foreach($data as &$v) $v = css_compress($v);
		}
		file_put_contents($cache_file, $data);
 	} 
 	
 	return ($path ? $path : 'themes/' . $GLOBALS['theme']) . '/' . $type . '/' . $name ;
 }
 
