<?php
class PollController extends AdministratorController{
	
	private $table = 'poll';
	private $where;
	
	function index(){
		if(($task = @$_POST['task']) && isset($_POST['id'])) {
			$this->where = is_array($_POST['id']) 
				? 'poll_id IN (' . implode(',', $_POST['id']) . ')' 
				: 'poll_id = ' . $_POST['id'];
			$this->$task();
		}
		$rows_per_page = 10;
		$numrows = db_query_one('SELECT COUNT(*) AS numrows FROM ' . $this->table, true);
		$page = isset($_GET['page']) ? $_GET['page'] : 1;
		
		$pager = array(
			'numpages' => ceil($numrows / $rows_per_page),
		    'page' => $page,
			'link' => $this->route
		);

		$this->assign('PAGING', helper('paging', $pager));
		
		$offset = ($page - 1) * $rows_per_page;
		
		$list = db_query("SELECT poll_id as id,poll_title as title,votes_count,publish FROM {$this->table} LIMIT $offset,$rows_per_page");
		$this->assign('list', $list);		
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

	
	private function update(){
		if(!($title = mysql_real_escape_string($_POST['title'])))
			return $this->add_error('Tiêu đề không được rỗng');

		if($id = $_POST['id']){
			$sql = 	"
					UPDATE {$this->table} SET 
						poll_title = '$title' WHERE {$this->where}";
		} else{
			$sql = 	"
					INSERT INTO {$this->table} 
						(poll_title) 
					VALUES
						('$title')
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
			'url'=>'/administrator/article/poll/add/' . $_POST['id']
		));
	}
	
	function add($id = NULL){
		if($id){
			$row = db_query_one("SELECT * FROM {$this->table} WHERE poll_id = $id");
			$this->assign($row);
		}
		$this->load();
	}
		
}

