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

class UserController extends FBToolController {
    
    function __construct() {
        if(!isset($_SESSION['user_id'])){
            $this->redirect('index');
        }
        parent::__construct();
    }
    
    
    function index(){
        
        $list_group = db_select_one('tbl_autopost_user', 'group_data', array('user_id' => $_SESSION['user_id']), true);
        $list_group_data = json_decode($list_group, true);
        $this->assign('list_group', $list_group_data);
        $this->load();
    }
    
    function logout(){
        unset($_SESSION['user_id']);
        unset($_SESSION['user_name']);
        $this->redirect('index');
    }
}

