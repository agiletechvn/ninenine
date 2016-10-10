<?php
class ImportController extends AdminController{
	
	// override variable groups
	protected $groups = array('editor');
	protected $table = 'article_import';
	protected $index_column = 'id';
	protected $columns = array(null, 'domain', 'title', 'tag', 'category', 'img', 'description', 'content');
	protected $searches = array(1, 2); // index of $columns arrray
	protected $orders = array(1, 2); // which column allow to sort

	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb('Thêm nguồn nhập')->load();
	}
	
	function all(){		
            parent::all();	
	}
	
	function add($id=null){
		$id = intval($id);
		if($id){
			$row = db_query_one("select * from {$this->table} where {$this->index_column} = $id limit 1");
		} else {
			$row = array();// default value
		}		

		$this->assign(			
			'v', $row
		)->load(false,null,true);
	}
	
	function delete(){	
		if(isset($_POST['id']))	{
			$id = intval($_POST['id']);
			$ret = array('type'=>'success');
			if(!db_excute("delete from {$this->table} where {$this->index_column} = $id")){
				$ret['msg'] = $this->msg('', db_error(), array('type'=>'error','return'=>true));
				$ret['type'] = 'error';
			}			
			$this->json($ret);
		}	
	}
	
	function update(){
		// mapping data
		$data = array(
			'title' => trim($_POST['title']),
			'description' => trim($_POST['description']),
			'img' => trim($_POST['img']),
			'tag' => trim($_POST['tag']),
			'category' => trim($_POST['category']),
			'domain' => trim($_POST['domain']),
			'content' => trim($_POST['content'])
		);		
		
		$ret = array('error'=>array());
			
		if(empty($data['title']))
			$ret['error']['title'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');	
		if(empty($data['description']))
			$ret['error']['description'] = array('msg'=>t('Miêu tả rỗng'), 'type'=>'error');
		if(empty($data['domain']))
			$ret['error']['domain'] = array('msg'=>t('Domain rỗng'), 'type'=>'error');
		if(empty($data['content']))
			$ret['error']['content'] = array('msg'=>t('Nội dung rỗng'), 'type'=>'error');					

		if($this->get_error_count($ret) > 0){
			$ret['msg'] = $this->msg('Cập nhật nội dung thất bại', 'Dữ liệu nhập ko đúng',
					array('return'=>true,'type'=>'error'));
		} else {			
			if(isset($_POST['id']) && ($id = intval($_POST['id']))){
				db_update($this->table, $data, $this->index_column . " = " . $_POST['id']);			
			} else {				
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
	
}

