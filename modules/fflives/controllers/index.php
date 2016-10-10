<?php

/*
 * Copyright 2015 tupt.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class IndexController extends FFLivesController {

//    private $data = ["160577783", "160086927", "160818894", "160718464", "160668365", "159912872", "157510498", "160553311", "159858041", "158898307", "158257428", "158122252", "161045837", "160064371", "158883599", "159179473", "158687008", "160151467", "160577572", "160924179", "158778065", "160577949", "160455835", "158983117", "157099259", "160016429", "161380101", "158796365", "159397035", "160101388", "159834928", "160713919", "159836196", "157867688", "160605778", "157895122", "159929846", "158534703", "159931556", "158685930"];

    private $data = ["154055166", "153832637", "151448077", "151242969", "153344540", "149772859", "153839093", "153855186", "143693716", "149297664", "152348705", "147200169", "143060472", "153027504", "147254499", "150774930", "151875810", "153339653", "149677863", "147311611", "150398407", "153462620", "150760435", "153675932", "147375495", "148453201", "147781901", "153091956", "143095776", "150658570", "147719764", "151985900", "152543374", "151233572", "146014737", "151690683", "147232040", "153992939", "154026220", "151753756"];

//    private $embellishment_data = [
//        '6'=>["36466833", "36466843", "36466866", "36466840", "36466852", "36466859", "36466861", "36466874", "36466846", "36466879", "36466832", "36466855", "36466853", "36466864", "36466845", "36466871", "36466863", "36466889", "36466862", "36466828", "36466891", "36466849", "36466882", "36466883", "36466820", "36466876", "36466848", "36466851", "36466835", "36466869", "36466826", "36466850", "36466854", "36466830", "36466842"],
//        '7' =>["34185809", "34185761", "34185728", "34185782", "34185756", "34185735", "34185718", "34185743", "34185746", "34185765", "34185793", "34185815", "34185771", "34185802", "34185798", "34185723", "34185752", "34185775", "34186542", "34186624", "34186547", "34186645", "34186636", "34186534", "34186538", "34186580", "34186595", "34186643", "34186573", "34186566", "34186532", "34186640", "34186604", "34186553", "34186613"],
//        '8'=>["34591317", "34591151", "34591347", "34591336", "34591166", "34591157", "34591621", "34591607", "34591618", "34591611", "34591645", "34591630", "34227243", "34227235", "34592005", "34592000", "34591980", "34591971", "34592013", "34591987", "34227252", "34591995", "34592045", "34592023", "34227259", "34227270", "34592031", "34591190", "34591180", "34591185", "34591563", "34591578", "34591651", "34591659", "34591663"]
//    ];

    function call_delete() {
        parent::call_delete();
    }

    function digest() {
        // binary
        $digest = openssl_digest("mysecretkeymyapp/mystream1370781049", "md5", true);
        $key = base64_encode($digest);
        $key = str_replace('+/', '-_', $key);
        $key = str_replace('=', '', $key);
        echo time();
        echo $key;
    }

    function test() {
        $this->load();
    }

    function test1() {
        $pattern = '#\d{2}-[A-Z\d]{5}#';
        $string = "Töm EB-Filtret.. 02-PU567 , 02-HS317, 02-HS317";
        preg_match_all($pattern, $string, $out);
        print_r($out);
    }

    function update() {

        $ids = db_select('tbl_products', 'id', null, true, 40);
        $ind = 0;
        foreach ($ids as $id) {
            $img = $this->data[$ind] . '.png';
            $main_img = "themes/fflives/images/data/$img";
            db_update('tbl_products', array('img_name' => $img, 'main_img' => $main_img), array('id' => $id));
            $ind++;
        }
    }

    protected function delete_file() {
        echo 'children';
        parent::delete_file();
    }

    private function base64_to_jpeg($base64_string, $output_file) {
        $ifp = fopen($output_file, "wb");

        $data = explode(',', $base64_string);

        fwrite($ifp, base64_decode($data[1]));
        fclose($ifp);

        return $output_file;
    }

    function creation($id) {

        if ($id) {
            $ret = db_select_one('tbl_user_creation', array('template_id', 'data'), array('id' => $id));
            $this->json($ret);
        }
    }

    function save() {

        $title = $_POST['title'];
        $cat_id = $_POST['creation_cat'];
        $user_id = $_SESSION['user']['id'];
        $data = $_POST['data'];

        $template_id = $_POST['template_id'];

        $post_data = array(
            'cat_id' => $cat_id,
            'title' => $title,
            'user_id' => $user_id,
            'data' => $data,
            'template_id' => $template_id
        );

        $id = db_select_one('tbl_user_creation', 'id', array('title' => $title), true);

        if ($id) {
            db_update('tbl_user_creation', $post_data, array('id' => $id));
        } else {
            db_insert('tbl_user_creation', $post_data);
            $id = db_insert_id();
        }

        if (isset($_POST['main_img'])) {
            $base64_string = $_POST['main_img'];
            $output_file = 'media/images/fflives/creation/creation_' . $id . '.png';
            $this->base64_to_jpeg($base64_string, SITE_PATH . $output_file);
            db_update('tbl_user_creation', array('main_img' => $output_file), array('id' => $id));
        }

        $post_data['id'] = $id;
        // return clients
        $this->json($post_data);
    }

    function fix() {
        $products = db_select('tbl_products', array('id', 'main_img'));
        foreach ($products as $v) {
            $img_id = basename($v['main_img'], '.png');
            db_update('tbl_products', array('thumb_img' => "themes/fflives/images/data/thumb/$img_id.jpg"), array('id' => $v['id']));
        }
    }

    function index($limit = 30) {
        $page = isset($_GET['page']) ? +$_GET['page'] : 1;

        $creation_cats = db_select('tbl_creation_cat', '*');
        $creations = db_select('tbl_user_creation', array('id', 'title', 'main_img'), array('user_id' => $_SESSION['user']['id']));
        foreach($creations as &$v){
            $v['main_img'] .= '?t=' . uniqid();
        }
        $templates = db_select('tbl_template_creation', array('id', 'title', 'main_img'));

        $total = ceil(db_select_one('tbl_products', 'COUNT(*)', array('publish' => 1), true) / $limit);
        $products = db_select('tbl_products', array('id', 'name', 'main_img', 'thumb_img'), array('publish' => 1), false, ($page - 1) * $limit . ',' . $limit, 'id DESC');
//        foreach ($products as &$product) {
//            $product['img_id'] = basename($product['main_img'], '.png');
//        }
        $pager = array(
            'numpages' => $total,
            'link' => SITE_ROOT . 'index.html?ajax'
        );
        $this->assign(
                'templates', $templates, 'data', $products, 'creation_cat', $creation_cats, 'PAGING', helper('paging', $pager), 'creations', $creations
        );

        if (isset($_GET['creation_id'])) {
            $this->assign('creation_id', $_GET['creation_id']);
        }

        
        if ($this->is_callback() || isset($_GET['ajax'])) {
            $this->load(false, 'ajax/product_list');
        } else {
            $this->load();
        }
    }

    function get_embellishment($type) {

        $data = db_select('tbl_embellishment', '*', array('type' => $type));
        $this->assign(
                'type', $type, 'data', $data
        );

        $tpl = 'embellishment_list';
        switch ($type) {
            case '3':                
                if(isset($_GET['shape'])){
                    $shape = $_GET['shape'];
                    $tpl = "embellishment_color_shape";
                } else{
                    $shape = 'square';
                    $tpl = "embellishment_list_color";
                }
                $font = isset($_GET['font']) ? $_GET['font'] : 'fa fa-square';
                $size = isset($_GET['size']) ? $_GET['size'] : 50;
                $this->assign('shape', $shape, 'font', $font, 'size', $size);
                break;
            case '2':
                $color_samples = ["#660000", "#de6318", "#d3d100", "#8c8c00", "#293206", "#34e3e5", "#205260", "#1c0946", "#46008c", "#33151a", "#e30e5c", "#3d1f00", "#5e1800", "#000000", "#980000", "#ff7f00", "#ffff00", "#88ba41", "#006700", "#65f3c9", "#318c8c", "#31318c", "#5e318c", "#520f41", "#ff59ac", "#8c5e31", "#8c4600", "#505050", "#ff0000", "#ffa000", "#eed54f", "#778c62", "#00ae00", "#77f6a7", "#628c8c", "#4a73bd", "#77628c", "#840e47", "#ef8cae", "#8e7032", "#d1b45b", "#828283", "#e32636", "#ffc549", "#ffff6d", "#8c8c62", "#00ff00", "#b2ffff", "#62778c", "#589ad5", "#ac59ff", "#8c6277", "#ead0cd", "#8c7762", "#e2db9a", "#b5b5b6", "#fa624d", "#ffc898", "#ffffae", "#96d28a", "#a9ff00", "#d8ffb2", "#bdd6bd", "#a1c4e9", "#a297e9", "#c6a5b6", "#ffdfef", "#c69c7b", "#ffffff", "#e7e7e7"];                
                $this->assign('color_samples', $color_samples);
                $tpl = "embellishment_list_text";
                break;
            default:
                break;
        }

        $this->load(false, 'ajax/' . $tpl);
    }

    function csv() {
        // output headers so that the file is downloaded rather than displayed
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=fflives.csv');

        // create a file pointer connected to the output stream
        $output = fopen('php://output', 'w');

        // output the column headings
        fputcsv($output, array('im_name', 'im_url'));

        // fetch the data
        foreach ($this->data as $id) {
            $im_name = "$id.png";
            $im_url = SITE_ROOT . "themes/fflives/images/data/$id.png";
            fputcsv($output, array($im_name, $im_url));
        }
    }

    function custom() {
        $this->load();
    }

    function download() {

        // script
        "Array.prototype.slice.call(document.querySelectorAll('a.grid.autosize._626>img')).map(function(img){
         return img.src.match(/(\d+)\.jpg$/)[1];
         });";

        $path = THEME_PATH . 'fflives/images/data/';
        $thumb_path = $path . 'thumb/';
        foreach ($this->data as $id) {
            //preg_match('#([\d]+)\.jpg#', $v, $match);
            //$id = $match[1];
            $thumb = "http://ak2.polyvoreimg.com/cgi/img-thing/size/s/tid/$id.jpg";
            $image = "http://ak2.polyvoreimg.com/cgi/img-thing/mask/1/size/orig/tid/$id.png";
            $image_orig = "http://ak2.polyvoreimg.com/cgi/img-thing/mask/1/size/orig/tid/$id.jpg";
            file_put_contents($thumb_path . "$id.jpg", file_get_contents($thumb));
            file_put_contents($path . "$id.png", file_get_contents($image));
            file_put_contents($path . "$id.jpg", file_get_contents($image_orig));
        }
    }

    function download_embellishment($types) {

        $type_arr = explode(',', $types);

        foreach ($type_arr as $v) {
            $type = (string) $v;
            $path = THEME_PATH . 'fflives/images/embellishment/data/' . $type . "/";
            $thumb_path = $path . 'thumb/';

            if (!file_exists($thumb_path)) {
                mkdir($thumb_path, 0777, true);
            }

            foreach ($this->embellishment_data[$type] as $id) {
                echo "Downloading item with id $id\n";
                $thumb = "http://ak2.polyvoreimg.com/cgi/img-thing/size/s/tid/$id.jpg";
                $image = "http://ak2.polyvoreimg.com/cgi/img-thing/size/orig/tid/$id.png";
                $image_orig = "http://ak2.polyvoreimg.com/cgi/img-thing/size/orig/tid/$id.jpg";
                file_put_contents($thumb_path . "$id.jpg", file_get_contents($thumb));
                file_put_contents($path . "$id.png", file_get_contents($image));
                file_put_contents($path . "$id.jpg", file_get_contents($image_orig));
            }
        }
    }

    function fix_embellishment() {

        $urls = db_select('tbl_embellishment', 'main_img', array('type' => 1), true);
        $path = THEME_PATH . 'fflives/images/embellishment/data/1/';

        foreach ($urls as $url) {
            $id = pathinfo($url, PATHINFO_FILENAME);
            $image = "http://ak2.polyvoreimg.com/cgi/img-thing/size/orig/tid/$id.png";
            $image_orig = "http://ak2.polyvoreimg.com/cgi/img-thing/size/orig/tid/$id.jpg";
            file_put_contents($path . "$id.png", file_get_contents($image));
            file_put_contents($path . "$id.jpg", file_get_contents($image_orig));
        }
    }

}
