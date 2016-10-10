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

class CollectionController extends FFlivesController {

    function index() {
        
        $this->assign('uniq', uniqid());
        
        $this->pager()->load('collection');
    }

    private function pager($page_id = 1, $num = 8) {
        $creations = db_query("select  id, title, main_img
             from tbl_user_creation where publish = 1 order by id desc limit " . ($page_id - 1) * $num . ",$num");
       
        return $this->assign('creations', $creations);
    }

    function add($page_id = 2) {        
        $this->pager($page_id, 8)->load(false, 'include/list_item');
    }

}
