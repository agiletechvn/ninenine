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

class CustomerController extends FBToolController {

    var $config = array(
        'groups' => array('admin'),
        'table' => 'tbl_users',
        'index_column' => 'id',
        'columns' => array(null, 'avatar', 'email', 'phone','gmt_zone','fullname','block'),
        'searches' => array(2, 3, 4), // index of $columns arrray	
        'orders' => array(2, 3) // which column allow to sort	
    );

    // override check permission
    protected function check_permission() {

        // for all
        if (in_array(Router::$action, array('register', 'forgot')))
            return true;

        // these methods are belong to doctor, so make it in medical group
        if (in_array(Router::$action, array('profile', 'add_profile', 'update_profile'))) {
            $this->groups = array('fbtool');
        }

        return parent::check_permission();
    }

    function index() {
        // custom breadcrumb button, should be placed in parent class
        $this->breadcrumb('Add new Customer')->load();
    }

    function add($id = NULL) {

        $this->assign('group', $this->user['group']);
        parent::add($id);
    }

    function update() {
        $ret = array('error' => array());

        if ($this->user['group'] === 'admin') {
            $data = array(
                    'email' => trim($_POST['email']),
                    'block' => +$_POST['block']
                );
            
            if (isset($_POST['password']) && $_POST['password'] != '') {
                    $data['password'] = md5($_POST['password']);
                }
                
        } else {
            if (isset($_FILES['avatar'])) {
                $ret['data'] = $data = parent::update_file_field('avatar');
            } else {
                // mapping data
                $data = array(
                    'email' => trim($_POST['email']),
                    'gmt_zone' => trim($_POST['gmt_zone']),
                    'phone' => $_POST['phone'],
                    'fullname' => trim($_POST['fullname'])                    
                );


                if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
                    $ret['error']['email'] = array('msg' => t('Invalid Email Address'), 'type' => 'error');
                if (empty($data['fullname']))
                    $ret['error']['fullname'] = array('msg' => t('Empty FullName'), 'type' => 'error');


                if (isset($_POST['password']) && $_POST['password'] != '') {
                    $data['password'] = md5($_POST['password']);
                }
            }
        }

        parent::update($data, $ret);
    }

    

    function forgot() {
        if ($this->is_callback()) {
            $data = array(
                'email' => trim($_POST['email'])
            );
            $ret = array('error' => array());
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
                $ret['error']['email'] = array('msg' => t('Invalid Email Address'), 'type' => 'error');
            else {
                if (!($raw_password = db_query("select raw_password from {$this->table} 
						where email = '" . stripslashes($data['email']) . "' limit 1", true))) {
                    $ret['error']['email'] = array('msg' => 'Email does not exist!', 'type' => 'error');
                } else {
                    if (!$this->mail($data['email'], SMTP_USER, 'admin', 'Your password', $raw_password)) {
                        $ret['error']['email'] = array('msg' => 'Email can not be reached', 'type' => 'error');
                    }
                }
            }

            if ($this->get_error_count($ret) > 0) {
                $ret['msg'] = $this->msg('Error', 'Wrong input parameters', array('return' => true, 'type' => 'error'));
            } else {
                // send email
                $ret['msg'] = $this->msg('Success', 'Password is sent to email', array('return' => true, 'type' => 'error'));
            }
            $this->json($ret);
        } else {
            $this->load(false);
        }
    }

    function profile($id = 0) {
        $id = intval($id);
        if ($id == $this->user['id']) {
            $this->page_title = 'Customer Profile';
            $this->page_desc = 'All customer detail information';
            $user = db_select_one($this->table, array('phone', 'fullname', 'email', 'avatar'), array('id' => $id));
            // just make a style for it :D
            $this->breadcrumb .= '<li><a href="javascript:;">User Profile</a><span class="divider-last">&nbsp;</span></li>'
                    . '<li style="background:none"><a data-target="#add-modal" href="' . LANGUAGE . '/admin/' . Router::$hook_module . '/' . Router::$controller . '/add_profile/' . $this->user['id']
                    . '" no-push="" role="button" data-toggle="modal" data-modal="0">'
                    . '<button class="btn btn-primary"><i class="icon-edit icon-white"></i> ' . t('Change profile') . '</button></a></li>';

            $this->assign(
                            'profile', $user, 'update_action', 'update_profile/' . $this->user['id']
                    )
                    ->load();
        } else
            $this->redirect('/admin/index');
    }

    function update_profile($id = 0) {
        // only allow update for current user in profile mode
        if ($this->user['id'] == $id) {
            $this->update();
        } else
            $this->redirect('/admin/index');
    }

    function add_profile($id = 0) {
        // only allow show change for current user in profile mode
        if ($this->user['id'] == $id) {
            $this->add($id);
        } else
            $this->redirect('/admin/index');
    }

}
