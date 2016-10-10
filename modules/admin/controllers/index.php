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

class IndexController extends AdminController{	
	
	private $dashboard = '';
	private $dashboard_item_ind = 0;
	
	function index(){
		$this->page_title='Dashboard';
		$this->page_desc='Dashboard information';
		$this->breadcrumb .= '<li><a href="javascript:;">Ninenine</a><span class="divider">&nbsp;</span></li>'
                . '<li><a href="javascript:;">Dashboard</a><span class="divider-last">&nbsp;</span></li>';
		$this->assign('DASHBOARD', $this->dashboard);
		$this->load();
	}
	
	protected function get_tree_item($k, $v, $group){
		if($this->dashboard_item_ind == 6){
			$this->dashboard .= '</div><div class="row-fluid">';
			$this->dashboard_item_ind = 0;
		}
	    if(@$v['icon'] && $k[0]!='#'){ 
	    	$this->dashboard .=	
    					'<a class="icon-btn span2' .(isset($v['desc']) 
						    ? ' tooltips" ui-type="tooltip" title="' . t($v['desc']). '"' 
						    : '"')
    					. ' href="' . ($k[0] == '/' ? LANGUAGE . $k : $k) . '">'.
					    '<i class="icon-' . $v['icon'] . '"></i><div>' .
					    t($v['title']) . '</div></a>';
			// increase the index of dashboard item				    
			$this->dashboard_item_ind++;
	    }
		return parent::get_tree_item($k, $v, $group);
	}
}