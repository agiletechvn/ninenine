<?php
class FacebookGroupController extends FBToolController{
	
	// override variable groups
	protected $groups = array('fbtool');
	protected $table = 'tbl_facebook_groups';
	protected $index_column = 'id';
	protected $columns = array(null, 'name', 'description', 'fb_id', 'access_token', 'publish', 'token_expired');
	protected $searches = array(1, 2); // index of $columns arrray
	protected $orders = array(1); // which column allow to sort
        
        
	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb(t('Add facebook group'))->load();
	}
	
	function all(){	
            $where = 'user_id = ' . $this->user['id'];
		parent::all($where);	
	}
	
	function add($id=null){
		parent::add($id, array('publish'=>0));
	}
	

	function update(){
            
             $ret = array('error'=>array());
	// mapping data
		$data = array(
			'name' => trim($_POST['name']),
			'description' => trim($_POST['description']),
			'publish' => $_POST['publish'],
                        'user_id' => $this->user['id'],
                        'fb_id' => +$_POST['fb_id'],
                        'user_name' => $this->user['name'],
			'access_token' => trim($_POST['access_token']),
                        'token_expired' => 0
		);			
		
			
		if(empty($data['name']))
			$ret['error']['name'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
                
                

		parent::update($data, $ret);
	
	}
	
	
	function update_status($id){
		$id = intval($id);
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
	
}

