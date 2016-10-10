<?php

class MenuController extends AdminController {
	
	// override variable groups
	protected $groups = array('admin');
	protected $table = 'menu';
	protected $index_column = 'id';
	protected $translations = array('name'); // which column need translate
	
	/**
	 * Show menu manager
	 */
	function index($group_id=1) {
		$menu = $this->get_menu($group_id);
		$data['menu_ul'] = '<ol id="easymm"></ol>';
		if ($menu) {
			include SYS_PATH . 'tree.php';
			$tree = new Tree;

			foreach ($menu as $row) {
				$tree->add_row(
					$row['id'],
					$row['parent_id'],
					' id="menu-'.$row['id'].'"',
					$this->get_label($row)
				);
			}

			$data['menu_ul'] = $tree->generate_list('ol', 'id="easymm" class="sortable" ui-type="nested-sortable"');
		}
		$data['group_id'] = $group_id;
		$data['group_title'] = $this->get_menu_group_title($group_id);
		$data['menu_groups'] = $this->get_menu_groups();
		
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb .= '<li style="background:none"><a data-target="#add-modal" toggle-mode="0" data-modal="0"'
					 . 'href="'.LANGUAGE.'/admin/menu/add" no-push role="button" data-toggle="modal">'
					. '<button class="btn btn-warning"><i class="icon-plus icon-white">'
                    . '</i> Thêm danh mục</button></a></li>';
                    
		$this
			->assign($data)
			->load();
	}

	/**
	 * Add menu action
	 * For use with ajax
	 * Return json data
	 */
	function update() {
		$response = array('error'=>array());
		if (isset($_POST['title'])) {
			$data['title'] = trim($_POST['title']);
			if (!empty($data['title'])) {
				$data['name'] = trim($_POST['name']);
				$data['url'] = trim($_POST['url']);
				$data['link'] = trim($_POST['link']);
				$data['class'] = trim($_POST['class']);
				$data['group_id'] = $_POST['group_id'];	
                                $data['publish'] = $_POST['publish'] ? 1 : 0;
				$data['description'] = trim($_POST['description']);
				
				if($id = intval(@$_POST['id']))	
				    $db_ret = db_update($this->table, $data, $this->index_column . ' = ' . $id);
				else {	
					$data['position'] = $this->get_last_position($_POST['group_id']) + 1;
					$db_ret = db_insert($this->table, $data);
				}
				
				if ($db_ret) {
					if($id){
						$response['status'] = 1;
						$d['id'] = $id;
                                                $d['publish'] = $data['publish'];
						$d['title'] = $data['title'];
                                                $d['name'] = $data['name'];
						$d['url'] = $data['url'];
						$d['klass'] = $data['class']; //klass instead of class because of an error in js
						$response['menu'] = $d;
					} else {
						$data['id'] = $id = db_insert_id();
						$response['status'] = 1;
						$li_id = 'menu-'.$data['id'];
						$response['li'] = '<li id="'.$li_id.'">'.$this->get_label($data).'</li>';
						$response['li_id'] = $li_id;
					}
					
					// update translate when have id
					$this->update_trans($id);
					
					$response['msg'] = $this->msg('', 'Cập nhật nội dung thành công',array('return'=>true));
				} else {
					$response['status'] = 2;
					$response['msg'] = $this->msg('Cập nhật nội dung thất bại', db_error(),
						array('return'=>true,'type'=>'error'));
				}
			} else {
				$response['status'] = 3;
				$response['error']['title'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');
			}
			$this->json($response);
		}
	}

	/**
	 * Show edit menu form
	 */
	function add($id=null) {
                parent::add($id);
	}	

	/**
	 * Delete menu action
	 * Also delete all submenus under current menu
	 * return json data
	 */
	function delete() {
		if(isset($_POST['id']))	{
			
			$id = intval($_POST['id']);	
			// save id here, maybe parent
			$ret = array('type'=>'success', 'data'=>$id);
								
			// delete one with all descendants
			$ids = array($id);
			$this->get_descendants($id, $ids);	
 								
			foreach($ids as $id)
				// delete translated text
				$this->delete_trans($id);


			$sql = sprintf('DELETE FROM %s WHERE ' . $this->index_column . ' IN (%s)', 
					$this->table, implode(', ', $ids));
			
			if(!db_excute($sql)){
				$ret['msg'] = $this->msg('', db_error(), array('type'=>'error','return'=>true));
				$ret['type'] = 'error';				
			}
						
			$this->json($ret);
		}
	}

	/**
	 * Save menu position
	 */
	function save_position() {
		if (isset($_POST['easymm'])) {
			$easymm = $_POST['easymm'];
			$ret['msg'] = $this->update_position(0, $easymm);
			$this->json($ret);
		}
	}
	
	
	/**
	 * group methods
	 */
	/**
	 * Add menu group action
	 * or
	 * Show add menu group form
	 */
	public function group_add($id=null) {
            $id = intval($id);
            if ($id) {
                $sql = "select * from menu_group where id = $id limit 1";
                $row = db_query_one($sql);
            } else
                $row = array();

            $this->assign(
                    'v', $row
            )->load(false, null, true);
        }

        /**
	 * Edit menu group action
	 */
	public function group_update() {
            $response = array('error'=>array());
            if (isset($_POST['title'])) {
                $id = (int) $_POST['id'];
                $data['title'] = trim($_POST['title']);
                $response['title'] = $data['title'];
                if ($id) {
                    $response['id'] = $id;
                    $response['update'] = true;
                    if (db_update('menu_group', $data, 'id = ' . $id))
                         $response['msg'] = $this->msg('', 'Cập nhật nội dung thành công',array('return'=>true));
                     else 
                         $response['msg'] = $this->msg('Cập nhật nội dung thất bại', db_error(),
						array('return'=>true,'type'=>'error'));
                } else {
                    $response['update'] = false;
                    if (!empty($data['title'])) {
                        
                        if (db_insert('menu_group', $data)) {
                            $response['status'] = 1;
                            $response['id'] = db_insert_id();
                            $response['msg'] = $this->msg('', 'Cập nhật nội dung thành công',array('return'=>true));
                        } else {
                            $response['status'] = 2;
                            $response['msg'] = $this->msg('Cập nhật nội dung thất bại', db_error(),
						array('return'=>true,'type'=>'error'));
                            
                        }
                    } else
                        $response['error']['title'] = array('msg'=>t('Thêm bộ danh mục lỗi.'), 'type'=>'error');
                }
                $this->json($response);
            }
        }

    /**
	 * Delete menu group action
	 * This will also delete all menus under this group
	 */
	public function group_delete() {
		if(isset($_POST['id']))	{
			$id = intval($_POST['id']);
                        $response = array('type'=>'success', 'data'=>$id);
			if ($id == 1) {
				$response['type'] = 'error';
				$response['msg'] = $this->msg('',t('Không thể xóa Group ID = 1'), array('type'=>'error','return'=>true));
			} else {
				$sql = sprintf('DELETE FROM menu_group WHERE id = %s', $id);
				$delete = db_excute($sql);
				if ($delete) {
					$sql = sprintf('DELETE FROM %s WHERE group_id IN (%s)', $this->table, $id);
					db_excute($sql);
					
				} else {
					$response['msg'] = $this->msg('', db_error(), array('type'=>'error','return'=>true));
                                        $response['type'] = 'error';	
                                }
				
			}
			$this->json($response);
		}
	}
	

	/**
	 * Recursive function for save menu position
	 */
	private function update_position($parent, $children) {
		$i = 1;
		foreach ($children as $k => $v) {
			$id = (int)$children[$k]['id'];
			$data['parent_id'] = $parent;
			$data['position'] = $i;
			if(!db_update($this->table, $data, $this->index_column . ' = ' . $id))
				return db_error();
			if (isset($children[$k]['children'][0])) 
				$this->update_position($id, $children[$k]['children']);			
			$i++;
		}
		return 'Cập nhật trạng thái thành công';
	}

	/**
	 * Get items from menu table
	 *
	 * @param int $group_id
	 * @return array
	 */
	private function get_menu($group_id) {
		$sql = sprintf(
			'SELECT * FROM %s WHERE group_id = %s ORDER BY parent_id, position',
			$this->table,
			$group_id
		);
		return db_query($sql);
	}

	/**
	 * Recursive method
	 * Get all descendant ids from current id
	 * save to $this->ids
	 *
	 * @param int $id
	 */
	private function get_descendants($id, &$ids) {	
		$data = db_query('SELECT ' . $this->index_column . ' FROM ' . $this->table 
								   . ' WHERE parent_id = ' . $id, true);
		if (!empty($data)) {
			foreach ($data as $v) {
				$ids[] = $v;
				$this->get_descendants($v, $ids);
			}
		}		
	}

	/**
	 * Get the highest position number
	 *
	 * @param int $group_id
	 * @return string
	 */
	private function get_last_position($group_id) {
		$sql = sprintf(
			'SELECT MAX(position) FROM %s WHERE group_id = %s',
			$this->table,
			$group_id
		);
		return db_query_one($sql, true);
	}

	/**
	 * Get all items in menu group table
	 *
	 * @return array
	 */
	private function get_menu_groups() {
		return db_query('SELECT id, title FROM menu_group');
	}

	/**
	 * Get menu group title
	 *
	 * @param int $group_id
	 * @return string
	 */
	private function get_menu_group_title($group_id) {
		$sql = sprintf(
			'SELECT title FROM menu_group WHERE id = %s',
			$group_id
		);
		return db_query_one($sql, true);
	}

	/**
	 * Get label for list item in menu manager
	 * this is the content inside each <li>
	 *
	 * @param array $row
	 * @return string
	 */
	private function get_label($row) {
		$label =
			'<div class="ns-row"><span class="disclose"><span></span></span>' .
				'<div class="ns-title"><span class="label label-'.($row['publish'] ? 'info' : 'default').'" title="'.$row['title'].'">'.$row['name'] .'</span></div>' .
				'<div class="ns-url hidden-sm hidden-xs"><a target="_blank" href="'.$row['url'].'">'.$row['url'].'</a></div>' .
				'<div class="ns-actions">' .
					'<a data-target="#add-modal" href="'.LANGUAGE.'/admin/menu/add/'.$row['id'].'" 
			     		 no-push role="button" data-toggle="modal" data-modal="0"
			     		 class="btn btn-primary mini purple"><i class="icon-edit"></i> Sửa</a>&nbsp;
                                            <a data-target="#del-modal" no-push data-show="1" data-toggle="modal" data-modal="0"
			       		data-id="'.$row['id'].'" class="btn btn-danger mini black">
                                        <i class="icon-trash"></i> Xóa</a>' .
				'</div>' .
			'</div>';
		return $label;
	}
}
	