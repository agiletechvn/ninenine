<?php

$param = Router::$args[0];

if(isset($param) && in_array($param, array('fbtool', 'admin'))){
    if($param == 'fbtool'){
        $as = 'Customer Account';
        $group = 1;
    }else{
        $as = 'System Administrator';
        $group = 0;
    }
    $args['html']['control'] .= '
    <div class="control-group" style="margin-top:-40px">
       <h4 class="control-label">as</h4>
       <div class="controls">
            <input type="hidden" name="group" value="'.$group.'" />
            <label class="radio line"> '.$as.' </label>
       </div>
    </div>'
    ;
} else {
$args['html']['control'] .= <<<html
<div class="control-group" style="margin-top:-40px">
   <h4 class="control-label">as</h4>
   <div class="controls">
         <label class="radio line">
         <input type="radio" name="group" value="1" /> Customer Account </label>
         <label class="radio line">
         <input type="radio" name="group" value="0" /> System Administrator </label>
      
   </div>
</div> 
html
;
}

$args['html']['script'] .= <<<script
<script>
(function(old){
        
    App.initLogin = function(){
        old();
        var group = $('[name=group]:checked,[name=group]')[0].value;
        // rebind code
        $('#forget-btn').unbind('click').click(function(){
            var email = $('#input-email').val();
            var url;
            if(group == 1){
                url = 'admin/fbtool/customer/forgot';
            }
            if(url){
                $.post(url,{email:email},function(ret){
                    $('#loginform .message').html(ret.msg);
                    $('#loginform').slideDown(200);
                    $('#forgotform').slideUp(200);
                    console.log(ret);
                });
            }
            // stop propagation
            return false;
        });
        var action = $('#loginform').attr('action');
        if(group ==1)
            action += '/customer';
        $('#loginform').attr('action', action);
    };
})(App.initLogin);
        
        
</script>       
script
;        

$args['code']['login'] = function($username,$password){
	$group = intval($_POST['group']);
	if($group == 0) 
		// login as system user
		return false; 
	else {
            // login as merchant
            $sql = "SELECT id, fullname as name, theme, 'fbtool' as `group` FROM tbl_users 
                                                    WHERE email='$username' and password='".md5($password)."'";

            if($user = db_query_one($sql))
                    $_SESSION['user'] = $user;
            
      
            
            return true;
	}
};