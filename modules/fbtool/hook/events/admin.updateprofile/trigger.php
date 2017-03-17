<?php


if (isset($_SESSION['user']['id'])){
    if($_SESSION['user']['group'] == 'customer')
        db_update('tbl_users', $args, 'id=' . $_SESSION['user']['id']);
    if (!$msg = db_error())
        $_SESSION['user']['theme'] = $data['theme'];
    unset($args);
}
