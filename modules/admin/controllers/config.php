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

class ConfigController extends AdminController{
	// override variable groups
	protected $groups = array('admin');
	protected $table = 'config';
	protected $index_column = 'id';
	protected $columns = array(null, 'label', 'name', 'type', 'options', 'value');
	protected $searches = array(1, 2); // index of $columns arrray
	protected $orders = array(1); // which column allow to sort
	
	function index(){
		$include_path = VIEW_PATH . 'config' . DS . 'content' . DS;
		
		
                $this->breadcrumb(t('Thêm cấu hình'))
		->assign(
			'template_config', file_get_contents($include_path . 'js_template_config.htm')
		)
		->load();
	}
	
	function all(){
		$output = $this->get_ouput();
		foreach ($output['aaData'] as &$v)
			if(!empty($v['options']))
				$v['options'] = nl2br($v['options']);
			
		$this->assign('output', $output)->load(false, 'ajax/config_list', true);	
	}
	
	function update(){
		
		// mapping data
		$data = array(
			'label' => trim($_POST['label']),
			'name' => trim($_POST['name']),
			'options' => trim($_POST['options']),
			'value' => trim(isset($_POST['value']) ? $_POST['value'] : ''),
			'type' => $_POST['type']
		);
		
		$ret = array('error'=>array());
			
		if(empty($data['label']))
			$ret['error']['label'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
			
		if(empty($data['name']))
			$ret['error']['name'] = array('msg'=>t('Tên rỗng'), 'type'=>'error');		

		if($this->get_error_count($ret) > 0){
			$ret['msg'] = $this->msg('Cập nhật nội dung thất bại', 'Dữ liệu nhập ko đúng',
					array('return'=>true,'type'=>'error'));
		} else {
			if(isset($_POST['id']) && ($id = intval($_POST['id']))){
				db_update($this->table, $data, $this->index_column . " = " . $_POST['id']);			
			}else {				
				db_insert($this->table, $data);
					$ret['id'] = db_insert_id();
			}
			if($msg = db_error())
				$ret['msg'] = $this->msg('Cập nhật nội dung thất bại', $msg,
					array('return'=>true,'type'=>'error'));
			else
				$ret['msg'] = $this->msg('', 'Cập nhật nội dung thành công',array('return'=>true));
				
		}
		
		$this->json($ret);
	}

	
	function add($id=NULL){
		if($id){
			$row = db_query_one("SELECT * FROM {$this->table} WHERE id = $id limit 1");
		} else{
			$row=array();
		}
		$this->assign('types', array('yesno','dropdown','text','textarea','editor'));
		$this->assign('v', $row)->load(false,null,true);
	}
}