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

class SearchController extends AdministratorController{
	
	function index(){
		$ret = array(array('title'=>'administrator','content'=>'Kết quả từ Administrator'));
		// by default we will clone data from array when setting value
		trigger('administrator.search', array(&$ret, @$_GET['q']));
		$this->assign('ret', $ret);
		$this->load();
	}
	
}