<?php

class AlbumController extends AdminController {
	
	// override variable groups
	protected $groups = array('editor');
	protected $table = 'album';
	protected $index_column = 'id';
	protected $columns = array(null, 'main_img', 'title', 'description', 'publish');
	protected $searches = array(2); // index of $columns arrray
	protected $orders = array(2); // which column allow to sort
	
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb('Add album');
                // upload template from admin, to inherit
                // but download template we will make some change
                $include_path = HOOK_PATH . 'views'. DS . 'album' . DS . 'content' . DS;
                $this->assign(
                        'template_download', file_get_contents($include_path . 'js_template_download.htm'),
                        'template_upload', file_get_contents($include_path . 'js_template_upload.htm')
                );
                
		$this->load();
	}
	
	function all(){		
            parent::all();	
	}
	
	function add($id=null){
		parent::add($id, array('publish'=>0));
	}
	
	function delete(){	
		if(isset($_POST['id']))	{
			$id = intval($_POST['id']);
			// delete image
			$row = db_query_one("select id from {$this->table} 
				where {$this->index_column} = $id limit 1");
				
			// delete the whole album belong to album
			$this->remove_dir(MEDIA_PATH . 'images' . DS . 'album' . DS . $row['id']);
			
			$ret = array('type'=>'success');
			if(!db_excute("delete from {$this->table} where {$this->index_column} = $id")){
				$ret['msg'] = $this->msg('', db_error(), array('type'=>'error','return'=>true));
				$ret['type'] = 'error';
			}			
			$this->json($ret);
		}	
	}
	
	function update(){			

		$ret = array('error'=>array());
                
                if (isset($_FILES['main_img'])) {
                        $ret['data'] = $data = 
                                parent::update_file_field('main_img', 'media/images/album/{id}');
                } else {
                    $data = array(
                            'title' => trim($_POST['title']),
                            'description' => trim($_POST['description']),
                            'publish' => $_POST['publish']
                    );			
                    if(empty($data['title']))
			$ret['error']['title'] = array('msg'=>t('Tên album rỗng'), 'type'=>'error');
                }
		
		
		
		parent::update($data, $ret);				
	}
	
	
	// no need to emit error
	function update_img($name='img', $id){
		$id = intval($id);
		$room_img = implode(',', $_POST['imgs']);
		db_update($this->table, array($name=>$room_img), "id=$id");
	}
	
	
	/**
	 * id is showroom id
	 */ 
	function photos($name='img', $id){
		if(($id = intval($id)) && $this->is_callback()){
			require(APP_PATH . 'lib' . DS . 'plugins' . DS . 'UploadHandler.php');
			$upload_dir = MEDIA_PATH . 'images' . DS . 'album' . DS . $id . DS . 'album' . DS;
                        $name = 'img';
			$upload_handler = new UploadHandler(array(
                                'param_name' => $name,
				'upload_dir' => $upload_dir,
				'mkdir_mode' => 0775, // to run on server
                                'upload_url' =>  'media/images/album/' . $id . '/album/',
				'script_url' =>  'admin/article/album/photos/' . $name . '/' . $id,
                                'accept_file_types' => '/\.(gif|jpe?g|png)$/i',
				'max_file_size' => 2097152, // 2m
				'custom_data' => array(
					'upload_dir' => $upload_dir,
					'id' => $id,
					'table' => $this->table,
                                        'name' => $name
				),
				'max_width' => 800,
			    '   max_height' => 800,
				'min_height' => 200,
				'image_versions' => array(
					'thumbnail' => array(
					        'max_width' => 300,
					        'max_height' => 300
					)
				),
				'get_callback' => function($files, $row, &$response){
                                        $name = $row['name'];
					$room_img = db_select_one($row['table'], $name, 
                                                    array('id' => $row['id']), true);	
					$list = array_filter(explode(',', rtrim($room_img, ', ')));
					// sort files
					$len= min(array(count($list), count($response[$name])));
                                        $room_img = '';
					// swap
					for($i=0; $i<$len;++$i){
						for($j=0;$j<$len;++$j){
							if(($file = $response[$name][$j]) && $list[$i] === $file->name){
								$response[$name][$j] = $response[$name][$i];
								$response[$name][$i] = $file;
                                                                $room_img .= $file->name . ',';
                                                                break;
							}
						}
					}
                                        // update again, check for some deleted files
                                        db_update($row['table'], array($name=>$room_img), array('id' => $row['id']));
				},
				'upload_callback' => function($files, $row, &$response){
					$img = db_query_one("SELECT img FROM " . $row['table'] .
						" WHERE id = " . $row['id'], true);					
					foreach($files as $file)
						$img .= $file->name . ',';
					db_update($row['table'], array('img' => $img), "id = " . $row['id']);		
				},
				'delete_callback' => function($files, $row){		
                                        $name = $row['name'];
					$img = db_query_one("SELECT $name FROM " . $row['table'] .
						" WHERE id = " . $row['id'], true);
					foreach($files as $file)
						$img = str_replace($file->name . ',', '', $img);
					db_update($row['table'], array($name => $img), "id = " . $row['id']);				
				}
			));		
		}
	}
	
}