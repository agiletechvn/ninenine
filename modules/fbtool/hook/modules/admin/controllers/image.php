<?php

class ImageController extends FBToolController {

    var $config = array(
            'groups' => array('admin'),
            'table' => 'tbl_image',
            'index_column' => 'id',
            'columns' => array(null,'title','image','message','publish'),
            'searches' => array(1), // index of $columns arrray	
            'orders' => array(1), // which column allow to sort	
            'file_fields' => array('image')
    );
    
    function index() {
        // custom breadcrumb button, should be placed in parent class
        $this->breadcrumb(t('Add image'))->load();
    }

    function all() {

        parent::all($where, 'id desc');

        // $output = $this->get_ouput('sender_id = ' . $this->user['id'],'id desc');
        // $this->assign('output', $output)->load(false, 'ajax/list', true);
    }

    function add($id = null) {

        // everything return from db always string
        parent::add($id);
    }

    function update_status($id) {
        parent::update_status($id, array(
            'publish' => $_POST ['publish'] ? 1 : 0
        ));
    }

    function update() {
    

        // video here
        //ffmpeg -i $uploaded_file -ss 00:00:01.000 -vframes 1 output.png
        // only owner can edit
        $ret = array(
            'error' => array()
        );

        if (isset($_FILES['image'])) {
            
            $ret['image'] = $data = parent::update_file_field('image', 'media/image/fbtool/image');

            
        } else {

            
            
            $data = array(
                'title' => trim($_POST ['title']),
                'message' => trim($_POST ['message']),
                'publish' => $_POST ['publish'] ? 1 : 0
            );
            
//            if(isset($_POST['image'])){
//                $img = $_POST['image'];
//                $img = str_replace('data:image/png;base64,', '', $img);
//                $img = str_replace(' ', '+', $img);
//                $fileData = base64_decode($img);
//                //saving
//                $data['image'] = 'media/images/magicscan/' . $_POST['image_name'] . '.jpg';
//                // check exist then delete old thumbnail if update
//                file_put_contents(SITE_PATH . $data['image'], $fileData);
//            }
            


            if (empty($data ['title']))
                $ret ['error'] ['title'] = array(
                    'msg' => t('Tiêu đề rỗng'),
                    'type' => 'error'
                );

            if (empty($data ['message']))
                $ret ['error'] ['message'] = array(
                    'msg' => t('Lời nhắn rỗng'),
                    'type' => 'error'
                );
        }

        parent::update($data, $ret);
    }

}
