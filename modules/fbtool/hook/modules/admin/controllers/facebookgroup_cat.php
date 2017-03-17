<?php
class FacebookGroup_CatController extends FBToolController{
	
	// override variable groups
	protected $groups = array('fbtool');
	protected $table = 'tbl_facebook_group_cat';
	protected $index_column = 'id';
	protected $columns = array(null, 'name', 'description', 'main_img', 'publish');
	protected $searches = array(1, 2); // index of $columns arrray
	protected $orders = array(1); // which column allow to sort
        
        
	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb(t('Add facebook group cat'))->load();
	}
	
	function all(){	
            $where = 'user_id = ' . $this->user['id'];
		parent::all($where);	
	}
	
	function add($id=null){
            
            $user_id = $this->user['id'];
            $this->assign(
               'facebook_groups', db_select('tbl_facebook_groups', array('id', 'name'), 
                       array('publish' => 1, 'user_id' => $user_id))
            );
            
		parent::add($id, array('publish'=>0));
	}
	

	function update(){
            
             $ret = array('error'=>array());
             
             if (isset($_FILES['main_img'])) {
                $ret['data'] = $data = parent::update_file_field('main_img');
            } else {
	// mapping data
		$data = array(
			'name' => trim($_POST['name']),
			'description' => trim($_POST['description']),
			'publish' => $_POST['publish'],
                        'user_id' => $this->user['id'],
                        'group_ids' => is_array($_POST['group_ids']) ? implode(',', $_POST['group_ids']) : $_POST['group_ids'],
                        'user_name' => $this->user['name'],
		);			
		
			
		if(empty($data['name']))
			$ret['error']['name'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
                
            }

		parent::update($data, $ret);
	
	}
	
	
	function update_status($id){
		$id = intval($id);
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
	
}

