<?php

/*
 * Copyright 2016 tupt.
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

class TemplateController extends FFLivesController {

    function index() {

        $creation_cats = db_select('tbl_creation_cat', '*');
        $creations = db_select('tbl_user_creation', array('id', 'title', 'main_img'), array('user_id' => $_SESSION['user']['id']));
        $templates = db_select('tbl_template_creation', array('id', 'title', 'main_img'));


        $this->assign(
                'templates', $templates, 'creation_cat', $creation_cats, 'creations', $creations
        );


        $this->load('template');
    }

    function save() {

        $title = $_POST['title'];
        $cat_id = $_POST['creation_cat'];
        $data = $_POST['data'];
        $raw_data = $_POST['raw_data'];

        $post_data = array(
            'cat_id' => $cat_id,
            'title' => $title,
            'data' => $data,
            'raw_data' => $raw_data
        );

        $id = db_select_one('tbl_template_creation', 'id', array('title' => $title), true);

        if ($id) {
            db_update('tbl_template_creation', $post_data, array('id' => $id));
        } else {
            db_insert('tbl_template_creation', $post_data);
            $id = db_insert_id();
        }

        if (isset($_POST['main_img'])) {
            $base64_string = $_POST['main_img'];
            $output_file = 'media/images/fflives/template/creation_' . $id . '.png';
            $this->base64_to_jpeg($base64_string, SITE_PATH . $output_file);
            db_update('tbl_template_creation', array('main_img' => $output_file), array('id' => $id));
        }

        $post_data['id'] = $id;
        // return clients
        $this->json($post_data);
    }

    function creation($id, $raw = true) {
        if ($id) {
            $ret = db_select_one('tbl_template_creation', array('id AS template_id', $raw ? 'raw_data AS data' : 'data'), array('id' => $id));
            $this->json($ret);
        }
    }

    private function base64_to_jpeg($base64_string, $output_file) {
        $ifp = fopen($output_file, "wb");

        $data = explode(',', $base64_string);

        fwrite($ifp, base64_decode($data[1]));
        fclose($ifp);

        return $output_file;
    }

}
