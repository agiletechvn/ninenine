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

class SSHController extends FBToolController {
    
      // override variable groups
    protected $groups = array('admin');
    protected $table = 'tbl_ssh_done';
    protected $index_column = 'id';
    protected $columns = array(null,'ip', 'url');
    protected $searches = array(1); // index of $columns arrray
    protected $orders = array(1); // which column allow to sort

    function index() {
        // custom breadcrumb button, should be placed in parent class
        $this->load();
    }

}