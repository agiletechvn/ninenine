<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of notification
 * Better Notification system should use event server
 * @author TuPT
 */
class NotificationController extends AdminController {
    //put your code here
    
    protected function set_notification(){
        $notifications = array('all' => true, 'list'=>array(),'limit'=> MAX_NOTIFICATION_LIMIT);
        trigger('admin.notification', $notifications);
        // dont assign notification, so render will remain
        $this->assign('all_notifications', $notifications['list']);
    }
    
    function all(){
        $this->page_title='Notification';
	$this->page_desc='All notification information';
        $this->load();
    }
    
}
