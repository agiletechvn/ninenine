<?php
class PollAnswerController extends AdministratorController{
	private $table = 'poll_answer';
	private $where;
	private $order;
	
	function __construct(){
		parent::__construct();
		$this->order = isset($_GET['order']) ? $_GET['order'] : 'asc';		
		$this->assign('order', $this->order);
	}
	
	function index(){
		if(($task = @$_POST['task']) && isset($_POST['id'])) {
			$this->where = is_array($_POST['id']) 
				? 'answer_id IN (' . implode(',', $_POST['id']) . ')' 
				: 'answer_id = ' . $_POST['id'];
			$this->$task();
		}
		$where = 'WHERE poll_id=' . $_GET['poll_id'];
		$rows_per_page = 10;
		$numrows = db_query_one("SELECT COUNT(*) AS numrows FROM {$this->table} $where", true);
		$page = isset($_GET['page']) ? $_GET['page'] : 1;
		
		$pager = array(
			'numpages' => ceil($numrows / $rows_per_page),
		    'page' => $page,
			'link' => $this->route
		);

		$this->assign('PAGING', helper('paging', $pager));
		
		$offset = ($page - 1) * $rows_per_page;
		
		$list = db_query("SELECT answer_id as id,answer_title as title,votes_count,`order` FROM {$this->table} $where ORDER BY `order` {$this->order} LIMIT $offset,$rows_per_page");
		
		$this
			->assign('poll_id',$_GET['poll_id'])
			->assign('list', $list)
			->load();
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
	
	private function update(){
		if(!($title = mysql_real_escape_string($_POST['title'])))
			return $this->add_error('Tiêu đề không được rỗng');		
		if($id = $_POST['id']){
			$sql = 	"
					UPDATE {$this->table} SET 
						poll_title = '$title' WHERE {$this->where}";
		} else{
			$poll_id=$_POST['poll_id'];
			$sql = 	"
					INSERT INTO {$this->table} 
						(poll_title, poll_id) 
					VALUES
						('$title', $poll_id)
					";
		}
		db_excute($sql);
		if($err = db_error())
			$this->add_error($err);
		
		$this->msg(t('Chúc mừng'), t('Bạn đã cập nhật thành công'), array('type'=>'success'));
	}
	
	private function add_error($msg){
		$this->msg(t('Lỗi'), t($msg), array(
			'type'=>'error',
			'url'=>'/administrator/article/pollanswer/add/' . $_POST['id']
		));
	}
	
	function add($id = NULL){
		if($id){
			$row = db_query_one("SELECT * FROM {$this->table} WHERE answer_id = $id");
			$this->assign($row);
		} 
		
		$this
			->assign('poll_id',$_GET['poll_id'])
			->load();
	}
}

