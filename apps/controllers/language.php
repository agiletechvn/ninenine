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

class LanguageController extends Controller{	
	// change language
	function index($lang='vi'){ 	
		$url_pattern = str_replace('/', '\\/', SITE_ROOT) . '(?:' . LANGUAGE . ')?\/?';
		if(isset($_SERVER["HTTP_REFERER"])){
			$url = preg_replace("/^$url_pattern/i", SITE_ROOT . "$lang/", $_SERVER["HTTP_REFERER"]);
			trigger('language.change', $lang);
			$this->redirect($url, true);	
		} else 
		 	exit();
	}	
}