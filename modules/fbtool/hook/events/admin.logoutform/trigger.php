<?php



$group = $_SESSION['user']['group'];
// logout as system admin
if($group == 'admin')
    $as = 'admin';
else 
    $as = 'fbtool';

$args['redirect']['url'] = '/admin/account/login/'.$as.'?return_url='.urlencode($_SERVER["HTTP_REFERER"]);
 
/*
$args['code']['logout'] = function(){
    // logout as ...
    unset($_SESSION['user']);
    // mark as logout successfully
    return true;
};
 */