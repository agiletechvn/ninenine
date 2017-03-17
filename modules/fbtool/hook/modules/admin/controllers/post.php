<?php

class PostController extends FBToolController {

    var $config = array(
        'groups' => array('fbtool'),
        'table' => 'tbl_facebook_posts',
        'index_column' => 'id',
        'columns' => array(null, 'name', 'type', 'publish', 'online'),
        'searches' => array(1), // index of $columns arrray	
        'orders' => array(1), // which column allow to sort
        'file_fields' => array('main_img')
    );

    function index() {
        $this
                ->breadcrumb('Add Post')->load();
    }

    function all() {
        $where = 'user_id = ' . $this->user['id'];
        if(isset($_GET['post_online']) && ($online = +$_GET['post_online']) !== -1)
            $where .= " AND online = $online";
        $this->assign('post_type', array('Text','Link','Image','Video'));
        parent::all($where, 'id desc');
    }
    


    private function format_option($v) {
        return htmlspecialchars('<img onerror="this.src=\'themes/admin/img/no-image.gif\'" src="' . $v['main_img'] . '" style="height:15px;margin-right:10px" />') .
                $v['name'];
    }

    function add($id = null) {


        $user_id = $this->user['id'];

        $list = db_select('tbl_facebook_group_cat', array('id', 'main_img', 'name'), array('user_id'=>$user_id));

            foreach ($list as &$v) {
                $v['avatar'] = $this->format_option($v);
            }

            $this->assign('list_group_cat', $list);

        parent::add($id, array('publish' => 0), function(&$row) {
            
        });
    }
    
    private function check_online($id) {
        if(isset($id)){
            // can't edit coupon online :D
            $online = db_select_one($this->table, 'online', array('id'=>+$id), true);
            if($online)
                return true;
        }
        return false;
    }

    function update() {
        
        if($this->check_online($_POST['id']))
            return;
        
        $ret = array('error' => array());

        // update file fields, if has any then break
        foreach($this->file_fields as $field){
            if (isset($_FILES[$field])) {
                $ret[$field] = $data = parent::update_file_field($field);
                parent::update($data, $ret);
                return;
            }
        }
   
        
        // mapping data
        $data = array(
            'name' => trim($_POST['name']),
            'description' => trim($_POST['description']),
            'message' => trim($_POST['message']),
            'link' => trim($_POST['link']),
            'picture' => trim($_POST['picture']),
            'user_name' => $this->user['name'],
            
            'user_id' => $this->user['id'],
            'caption' => trim($_POST['caption']),
            'group_cat_ids' => is_array($_POST['group_cat_ids']) ? implode(',', $_POST['group_cat_ids']) : $_POST['group_cat_ids'],
            
            'type' => +$_POST['type'],
            
            'publish' => $_POST['publish']
        );

       

        if (empty($data['name']))
            $ret['error']['name'] = array('msg' => t('Tiêu đề rỗng'), 'type' => 'error');
        

        parent::update($data, $ret);
    }

    function update_status($id) {
        if($this->check_online($id))
            return;
        $id = intval($id);
        parent::update_status($id, array('publish' => $_POST['publish']));
    }


}
