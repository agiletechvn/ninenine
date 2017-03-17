<?php
// override first profile menu
if($_SESSION['user']['group'] === 'fbtool'){ 
    
    $args['profile_menu'][0] = '<li><a href="'.LANGUAGE.'/admin/fbtool/customer/profile/'.$_SESSION['user']['id']
                        .'"><i class="icon-user"></i> '.t('My Profile').'</a></li>';

}