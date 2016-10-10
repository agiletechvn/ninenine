<?php

/**
 * the question contain all attribute in a single row, with some for all, some for some
 * So we have to use some javascript for filter attribute
 * This helps improve performance a lot instead of extra attribute
 * While other group value are seperated by , for potential answers, we seperate it by |
 */
class EmbellishmentController extends FFLivesController {

    var $config = array(
        'groups' => array('admin'),
        'table' => 'tbl_embellishment',
        'index_column' => 'id',
        'columns' => array(null, 'thumb_img', 'color', 'type', 'font_family',
            'font_file_eot', 'font_file_ttf', 'font_file_woff', 'font_file_svg', 'publish')
    );
    protected $types = array(
        1 => "Background",
        2 => "Text",
        3 => "Colors",
        4 => "Frame & Borders",
        5 => "Magazine Articles",
        6 => "123 ♥ →",
        7 => "Effects & Textures",
        8 => "Patterns & Overlays"
    );

    function index($survey_id = 0) {

        $this->breadcrumb('Add Embellishment')
                ->assign(
                        'types', $this->types
                )
                ->load();
    }

    function all() {
        if ($type = @intval($_GET['type']))
            $where = "type = $type";

        $this->assign('types', $this->types);

        parent::all($where, 'id desc');
    }

    function add($id = null) {

        $this->assign(
                'types', $this->types
        );

        parent::add($id);
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
        } else {
            // mapping data
            $data = array(
                'name' => trim($_POST['name']),
                'type' => trim($_POST['type']),
                'display' => intval($_POST['display']),
                'page_number' => trim($_POST['page_number']),
                'required' => $_POST['required'],
                'potential_answers' => trim($_POST['potential_answers']),
                'star_count' => intval($_POST['star_count']),
                'thumb_width' => intval($_POST['thumb_width']),
                'thumb_height' => intval($_POST['thumb_height']),
                'custom_rating' => trim($_POST['custom_rating']),
                'survey_id' => intval($_POST['survey_id']),
            );

            if (empty($data['name']))
                $ret['error']['name'] = array('msg' => t('Tiêu đề rỗng'), 'type' => 'error');
        }

        parent::update($data, $ret);
    }

    function update_status($id) {
        parent::update_status($id, array('publish' => $_POST['publish']));
    }

}
