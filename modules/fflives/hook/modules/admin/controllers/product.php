<?php

class ProductController extends FFLivesController {

    var $groups = array('admin');
    protected $table = 'tbl_products';
    protected $index_column = 'id';
    protected $columns = array(null, 'thumb_img', 'name', 'description', 'price', 'publish');
    protected $searches = array(2); // index of $columns arrray
    protected $orders = array(2); // which column allow to sort
    // no need to be appears on table, for album, should remain for later use, 'cos delete album takes time
    protected $file_fields = array('main_img');

    function index() {

        $this->breadcrumb('Add Product')
                ->load();
    }

    private function base64_to_jpeg($base64_string, $output_file) {
        $ifp = fopen($output_file, "wb");

        $data = explode(',', $base64_string);

        fwrite($ifp, base64_decode($data[1]));
        fclose($ifp);

        return $output_file;
    }

    function crop() {
        if (isset($_POST['img'])) {
            $base64_string = $_POST['img'];
            $output_file = 'themes/fflives/images/temp.png';
            $this->base64_to_jpeg($base64_string, SITE_PATH . $output_file);
            echo SITE_ROOT . $output_file;
        }
    }

    function all() {

//        if (isset($_GET['color']) || isset($_GET['img'])) {
//            require_once MODULE_PATH . 'fflives/lib/ViSearch/ViSearch.php';
//            $service = new ViSearch(VI_SEARCH_ACCESS_KEY, VI_SEARCH_SECRET_KEY);
//            $limit = +$_GET['iDisplayLength'];
//            $page = floor(+$_GET['iDisplayStart'] / $limit) + 1;
//            // img is higher priority
//            if(isset($_GET['img'])) {
//                $output_file = $_GET['img'];
//                $image = new Image($output_file);
//                $ret = $service->uploadsearch($image, $page, $limit, array(), array(), true, 1, 0.3);
//            }else {
//                $color = substr($_GET['color'], 1);
//                $ret = $service->colorsearch($color, $page, $limit);
//            } 
//
//            $sIndexColumn = db_sanitize_column($this->index_column);
//            $iTotal = db_query_one("SELECT COUNT($sIndexColumn) FROM  " . $this->table, true);
//            $img_names = array();
//            foreach ($ret->result as $item) {
//                $img_names[] = $item->im_name;
//            }
//            $rResult = db_select($this->table, array_filter($this->columns), array('img_name' => $img_names), false, 0, "field(img_name,'" . implode("','", $img_names) . "')");
//
//            $output = array(
//                'sEcho' => +$_GET['sEcho'],
//                'iTotalRecords' => $iTotal,
//                'iTotalDisplayRecords' => $ret->total,
//                'aaData' => $rResult
//            );
//        } else {
        $where = array();
        $output = $this->get_ouput($where, 'id DESC');
//        }
        $this->assign('output', $output)->load(false, 'ajax/list', true);
    }

    function add($id = null) {
        parent::add($id);
    }

    protected function delete_files($file_fields) {

//        $images = array();
//        foreach ($file_fields as $file_field) {
//            if ($file_field && strpos($file_field, 'http') !== 0) {
//                $images[] = basename($file_field);
//            }
//        }
//        if (count($images) > 0) {
//            require_once MODULE_PATH . 'fflives/lib/ViSearch/ViSearch.php';
//            $service = new ViSearch(VI_SEARCH_ACCESS_KEY, VI_SEARCH_SECRET_KEY);
//            $service->remove($images);
//        }
        // call parent delete
        parent::delete_files($file_fields);
    }

    function update() {

        $ret = array('error' => array());

        if (isset($_FILES['main_img'])) {
            $data = parent::update_file_field('main_img');
            include APP_PATH . 'lib/plugins/function.resizeImages.php';
            $image_ext = pathinfo($data['main_img'], PATHINFO_EXTENSION);
            $data['thumb_img'] = $data['main_img'] . '.thumb.' . $image_ext;
            resize(SITE_PATH . $data['main_img'], SITE_PATH . $data['thumb_img'], MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT);
            // return data
            $ret['data'] = $data;

            // get name of image then call update service
//            require_once MODULE_PATH . 'fflives/lib/ViSearch/ViSearch.php';
//            $service = new ViSearch(VI_SEARCH_ACCESS_KEY, VI_SEARCH_SECRET_KEY);
//            $images = array(array('im_name' => basename($ret['data']), 'im_url' => SITE_ROOT . $ret['data']));
//            // calls the /insert endpoint to index the image
////            $response = $service->update($images);
//            if ($id = +(@$_POST['id'])) {
//                $service->update($images);
//            } else {
//                $service->insert($images);
//            }
        } else {
            $data = array(
                'name' => trim($_POST['name']),
                'description' => trim($_POST['description']),
                'price' => @trim($_POST['price']),
//				'old_price' => @trim($_POST['old_price']),
                'sold_out' => $_POST['sold_out'],
                'publish' => $_POST['publish']
            );

            if (empty($data['name']))
                $ret['error']['name'] = array('msg' => t('Tên sản phẩm rỗng'), 'type' => 'error');
        }

        parent::update($data, $ret);
    }

    function update_status($id) {
        $id = intval($id);
        parent::update_status($id, array('publish' => $_POST['publish']));
    }

}
