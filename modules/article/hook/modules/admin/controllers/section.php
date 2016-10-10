<?php
class SectionController extends AdminController{
	
	// override variable groups
	protected $groups = array('editor');
	protected $table = 'section';
	protected $index_column = 'id';
	protected $columns = array(null, 'title', 'description', 'order', 'publish');
	protected $searches = array(1, 2); // index of $columns arrray
	protected $orders = array(1); // which column allow to sort
	protected $translations = array('title'); // which column need translate
        
        
	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb(t('Add section'))->load();
	}
	
	function all(){		
		parent::all();	
	}
	
	function add($id=null){
            $this->assign('templates', array('category'=>'Category','article'=>'Article'));
		parent::add($id, array('publish'=>0));
	}
	

	function update(){
            
             $ret = array('error'=>array());
	// mapping data
		$data = array(
			'title' => trim($_POST['title']),
			'description' => trim($_POST['description']),
			'publish' => $_POST['publish'],
                        'order' => +$_POST['order'],
                        'template' => trim($_POST['template']),
			'alias' => trim($_POST['alias'])
		);			
		
			
		if(empty($data['title']))
			$ret['error']['title'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
                
                

		parent::update($data, $ret);
	
	}
	
	
	function update_status($id){
		$id = intval($id);
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
	
}

