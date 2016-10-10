<?php


class Creation_CatController extends FFlivesController {
        var $groups = array('admin');
	protected $table = 'tbl_creation_cat';
	protected $index_column = 'id';
	protected $columns = array(null, 'name','publish');
	protected $searches = array(1); // index of $columns arrray	
	protected $orders = array(1); // which column allow to sort	
        
        protected $translations = array('name'); // which column need translate
	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb('Add creation category')->load();
	}
	
	function all(){	
                parent::all(null, 'id');
	}
	
	function add($id=null){
                parent::add($id);
	}
	
	function update_status($id){
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
        
        function update(){
            // mapping data
            $data = array(
                    'name' => trim($_POST['name']),
                    'publish' => $_POST['publish'] 
            );	
            
            $ret = array('error'=>array());      
            
            if(empty($data['name']))
                    $ret['error']['name'] = array('msg'=>t('Creation name empty'), 'type'=>'error');

            parent::update($data, $ret);
        }
	
}

