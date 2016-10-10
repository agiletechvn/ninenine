<?php
class CategoryController extends AdminController{
	
	// override variable groups
	protected $groups = array('editor');
	protected $table = 'category';
	protected $index_column = 'id';
	protected $columns = array(null, 'title', 'section', 'description', 'order', 'publish');
	protected $searches = array(1, 2, 3); // index of $columns arrray
	protected $orders = array(1, 2); // which column allow to sort
	protected $translations = array('title'); // which column need translate
	
	function index(){
		$this->assign('sections', db_query('select id, title from section')) ->
                        breadcrumb(t('Add category'))->load();
	}
	
	function all(){		
            if($secid = @intval($_GET['secid']))
                        $where = "secid = $secid";
		
            parent::all($where, '`order` asc');	
	}
	
	function add($id=null){	
		$this->assign(		
			'sections', db_query("SELECT id, title FROM section")
		);
                parent::add($id, array('publish'=>0));
	}
	
	
	function update(){
            $ret = array('error'=>array());
	// mapping data
		$data = array(
			'title' => trim($_POST['title']),
			'description' => trim($_POST['description']),
			'alias' => trim($_POST['alias']),
                        'order' => +$_POST['order'],
			'publish' => $_POST['publish'],
			'secid' => intval($_POST['secid'])
		);		
                
                
                // change section id mean change all the article belong to category, so we will retrieve faster
                if(isset($_POST['id'])){
                    $catid = +$_POST['id'];
                    $old_secid = +db_query_one('select secid from category where id='.$catid.' limit 1', true);
                    if($data['secid'] !== $old_secid){
                        db_update('article', array('secid'=>$data['secid']), array('catid'=>$catid));
                    }
                }
                
                $section = db_query_one('select title from section where id='.$data['secid'].' limit 1');               
		$data['section'] =$section['title'];
			
		if(empty($data['title']))
			$ret['error']['title'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
                
          

		parent::update($data, $ret);
	}
	
	
	function update_status($id){
		$id = intval($id);
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
	
}

