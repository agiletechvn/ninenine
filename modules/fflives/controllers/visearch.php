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

class ViSearchController extends FFLivesController {

    function index() {
        //if ($this->is_callback()) {
            require_once MODULE_PATH . 'fflives/lib/ViSearch/viSearch.php';
            $service = new ViSearch(VI_SEARCH_ACCESS_KEY, VI_SEARCH_SECRET_KEY);
 

            //$base64_string = $_POST['img'];
            //$output_file = 'themes/fflives/images/temp.png';
            //$this->base64_to_jpeg($base64_string, SITE_PATH . $output_file);
            $image = new Image('http://fflives.gobilling.de/themes/fflives/images/temp.png');

//        $ret = $service->colorsearch("fa4d4d");
            $ret = $service->uploadsearch($image, 1, 10, array(), array(), true, 1, 0.3);

            $this->json($ret);
//        } else {
//            $this->load();
//        }
    }

    function base64_to_jpeg($base64_string, $output_file) {
        $ifp = fopen($output_file, "wb");

        $data = explode(',', $base64_string);

        fwrite($ifp, base64_decode($data[1]));
        fclose($ifp);

        return $output_file;
    }

}
