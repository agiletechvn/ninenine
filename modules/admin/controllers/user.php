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

class UserController extends AdminController{
	
        var $config = array(
            'groups' => array('admin'),
            'table' => 'admin_users',
            'index_column' => 'id',
            'columns' => array(null, 'avatar', 'name', 'username', 'group', 'block'),
            'searches' => array(2,3), // index of $columns arrray	
            'orders' => array(2,3) // which column allow to sort	
        );
        
        protected function check_permission(){
            // these methods are belong to doctor, so make it in medical group
            if(in_array(Router::$action, array('profile','add_profile','update_profile'))){
                // default user group is member, who can see the admin functionality but can't change 
                // other user, no need to check, 'cos we check for specific user_id then
                $this->groups = array();
            } 

            return parent::check_permission();
        }
        
	function index(){
		// custom breadcrumb button, should be placed in parent class
		$this->breadcrumb(t('Add new user'))->load();
	}
	
	function add($id=NULL){
		$this->assign('groups', $this->avail_group);
                parent::add($id);
	}
	
	function update(){
		$ret = array('error'=>array());		
		if(isset($_FILES['avatar'])){
			if($id=intval(@$_POST['id'])){
				$row = db_query_one("select avatar from {$this->table} where {$this->index_column} = $id limit 1");
				
				//Path
	    		$filepath = MEDIA_PATH . 'images' . DS . 'user' . DS;
	    		
				if($row['avatar']){
					@unlink($filepath . basename($row['avatar']));
				}
				
				$image = $_FILES['avatar'];
				$imageName = basename($image['name']);	
                                // get uniq name
                                $imageName = uniqid(). '.' . pathinfo($imageName, PATHINFO_EXTENSION); 
	    		
				if (!file_exists($filepath)) {
				    mkdir($filepath);
				}
	
			    //Save file
			    move_uploaded_file($image['tmp_name'], $filepath . $imageName);
                            $data = array(
                                'avatar' => "media/images/user/$imageName"
			    );	
			} else 
                            return;// :D
			
		} else {
			// mapping data
			$data = array(
				'username' => trim($_POST['username']),
				'email' => trim($_POST['email']),
				'name' => trim($_POST['name']),
				'group' => $_POST['group']
			);
			
			
			if(empty($data['username']))
				$ret['error']['username'] = array('msg'=>t('Tên đăng nhập rỗng'), 'type'=>'error');
			if(!preg_match("/^[a-z0-9_\+-]+(\.[a-z0-9_\+-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*\.([a-z]{2,4})$/", 
				$data['email']))
				$ret['error']['email'] = array('msg'=>t('Địa chỉ Email không đúng'), 'type'=>'error');
			if(empty($data['name']))
				$ret['error']['name'] = array('msg'=>t('Tên rỗng'),'type'=>'error');
				
			if(isset($_POST['password']) && $_POST['password'] != '')
				$data['password'] = md5($_POST['password']);
					
			
		}
                
                parent::update($data, $ret);
		
	}
	

	function update_status($id){
            parent::update_status(intval($id), array('block'=>$_POST['block']));
        }

        
        
        function profile($id=0){
            $id = intval($id);
            if($id == $this->user['id']){
                $this->page_title='User Profile';
                $this->page_desc='All user detail information';
                $user = db_query_one('select username,name, email,avatar,`group` from admin_users where id='.$id.' limit 1');
                // just make a style for it :D
                $this->breadcrumb .= '<li><a href="javascript:;">User Profile</a><span class="divider-last">&nbsp;</span></li>'
                . '<li style="background:none"><a data-target="#add-modal" href="'.LANGUAGE.'/admin/user/add_profile/'.$this->user['id']
                . '" no-push="" role="button" data-toggle="modal" data-modal="0">'
                . '<button class="btn btn-primary"><i class="icon-edit icon-white"></i> ' . t('Change profile') . '</button></a></li>';
                        
                $this->assign(
                        'profile', $user,
                        'update_action', 'update_profile/' . $this->user['id']
                      )
                      ->load();
            }else 
                $this->redirect ('/admin/index');
        }
        
        function update_profile($id=0){
            // only allow update for current user in profile mode
            if($this->user['id'] == $id){
                $this->update();
            }else 
                $this->redirect ('/admin/index');
        }
        
        function add_profile($id=0){
            // only allow show change for current user in profile mode
            if($this->user['id'] == $id){
                $this->add($id);
            }else 
                $this->redirect ('/admin/index');
        }
        
}