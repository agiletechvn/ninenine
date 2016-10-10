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
$GLOBALS['theme'] = 'fflives';

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '123456');
define('DB_NAME', 'fflives');


// may be array for hook name
hook('admin.menu,admin.config,translate.dirs', array('fflives'));

hook('admin.menu', array('translate'));

define('TRANS_LANGUAGES', 'zh=中文');

define('MAX_THUMB_WIDTH', 100);
define('MAX_THUMB_WIDTH', 100);

define('VI_SEARCH_ACCESS_KEY', '319213b7bebd84e1a9435ee0845c3732');
define('VI_SEARCH_SECRET_KEY', '35cbc26d25369e5940ef37f4a6d31cd8');