<?php
class CommentController extends AdministratorController{
	
	private $table = 'news_comment';
	private $where;
	private $filter = '';
	
	function __construct(){
		parent::__construct();
		if($newsid = @$_GET['newsid']) $this->filter .= 'c.news_id=' . intval($_GET['newsid']);
		$this->assign('newsid',$newsid);
	}
	
	function index(){
		if(($task = @$_POST['task']) && isset($_POST['id'])) {
			$this->where = is_array($_POST['id']) 
				? 'id IN (' . implode(',', $_POST['id']) . ')' 
				: 'id = ' . $_POST['id'];
			$this->$task();
		}
		$rows_per_page = 10;
		$where = $this->filter ? " WHERE " . $this->filter : '';
		$numrows = db_query_one("SELECT COUNT(*) AS numrows FROM {$this->table} as c $where", true);
		$page = isset($_GET['page']) ? $_GET['page'] : 1;
		
		$pager = array(
			'numpages' => ceil($numrows / $rows_per_page),
		    'page' => $page,
			'link' => $this->route
		);

		$this->assign('PAGING', helper('paging', $pager));
		
		$offset = ($page - 1) * $rows_per_page;		
		$where = ($where ? $where . " AND" : " WHERE") . " a.master = 1";
		$list = db_query("SELECT c.id,c.username, a.title as title,c.publish FROM  {$this->table}  as c left join article as a on (c.news_id=a.id) $where LIMIT $offset,$rows_per_page");
		$this->assign('list', $list);	
		
		$rows_per_page = 5;
		$page = isset($_GET['apage']) ? $_GET['apage'] : 1;
		$offset = ($page - 1) * $rows_per_page;				
		$numpages = ceil(db_query_one("SELECT COUNT(*) AS numrows FROM article where master = 1", true) / $rows_per_page);
		$this->assign('aritcle', db_query("SELECT id, title FROM article where master = 1 LIMIT $offset,$rows_per_page"));
		$this->assign('APAGING', helper('article_paging', array('page'=>$page,'numpages'=>$numpages)));
		
		$this->load();
	}
	
	private function publish($publish = 1){
		db_excute("UPDATE {$this->table} SET publish = $publish WHERE {$this->where}");	
		if($err = db_error())
			$this->msg(t('Lỗi'), $err, array('type'=>'error'));
	}
	
	private function unpublish(){
		$this->publish(0);
	}
	
	private function delete(){
		db_excute("DELETE FROM {$this->table} WHERE {$this->where}");
		if($err = db_error())
			$this->msg(t('Lỗi'), $err, array('type'=>'error'));
		else 
			$this->msg(t('Chúc mừng'), t('Bạn đã xóa tin thành công'), array('type'=>'success'));
	}
	
	private function saveorder(){
		foreach($_POST['id'] as $i=>$id) db_excute("UPDATE {$this->table} SET `order` = {$_POST['order'][$i]} WHERE id = $id");
	}
	
}

