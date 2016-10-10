<?php
// +--------------------------------------------------------------------------+
// | Authors	: Tung, Nguyen Dam ; 		Tu, Pham Thanh                    |
// | Email		: mask_final@yahoo.com;		miss_all_old_friends@yahoo.com    | 								
// | Mobile		: (+84) 936 885 466;		(+84) 1214 149 420                |
// | Date		: 11/2011												      |
// | Website	: http://maskfinalphp.com									  |						
// +--------------------------------------------------------------------------+
// | Copyrights (C) 2011 by MASKFINAL                                         |
// | All rights reserved                                                      |
// +--------------------------------------------------------------------------+

class AccountController extends AdminController{	
	
	protected function check_permission(){
		return TRUE;
	}

	function login(){		
		
		$loginform = array();
		trigger('admin.loginform', $loginform);
		
		if($_SERVER['REQUEST_METHOD'] === 'POST'){
			$username = trim(addslashes($_POST['username']));
			$password = trim(addslashes($_POST['password']));
			// check with default account
			if($username == ADMIN_USERNAME && $password == ADMIN_PASSWORD){
				$_SESSION['user'] = array('name' => $username, 'group' => 'admin', 'theme' => 'gray');
			} else{
				if(!isset($loginform['code']['login']) || !$loginform['code']['login']($username, $password)){
					$sql = "SELECT id, name, `group`, avatar, theme FROM admin_users 
							WHERE block=0 AND username='$username' and password='".md5($password)."'";
					if($user = db_query_one($sql))
						$_SESSION['user'] = $user;
				}
			}
			
			if(@$_SESSION['user']){
				$url = isset($_POST['return_url']) ? $_POST['return_url'] : '/admin/index';	                                
				$this->msg(t('Bạn đã đăng nhập thành công!'), '', array('url'=>$url));
			} else 
				$this->msg(t('Lỗi đăng nhập!'), t('Tài khoản sử dụng không tồn tại.'),array('type'=>'warn'));
		}
		if(isset($_GET['return_url']))
			$this->assign('return_url', $_GET['return_url']);		
		if(isset($loginform['html']))	
			$this->assign('extra_login_html', $loginform['html']);
			
		$this->load(false);
	}
	
	function forget(){
		$email = stripslashes($_POST['email']);
		$password = db_query_one("select password from admin_users where email = '$email'", true);
		if($password){
			$body = "Your password is $password";
			$this->mail($email, SMTP_USER, 'admin', 'Forget Password', $body);
		}
	}
	
	function logout(){
		
            // Unset all of the session variables.
            //$_SESSION = array();

            // If it's desired to kill the session, also delete the session cookie.
            // Note: This will destroy the session, and not just the session data!
            // And we can't access any session data any more, so just remain message session
            /*if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }*/
            // logout could have something else like message ?
            $logoutform = array('redirect' => array(
                'msg'=>t('Bạn đã đăng xuất thành công!'),
                'url' => '/admin/account/login?return_url='.urlencode($_SERVER["HTTP_REFERER"])
            ));
            trigger('admin.logoutform', $logoutform);
            if(!isset($logoutform['code']['logout']) || !$logoutform['code']['logout']()){
                // logout as admin, do something...
                // Finally, destroy the session.
                //session_destroy();
                unset($_SESSION['user']);
            }
            $this->msg($logoutform['redirect']['msg'],'', 
                    array('url'=>$logoutform['redirect']['url']));
            
	}
	
	function updateprofile(){
		$data = array(
			'theme'=>$_POST['theme']
		);
                
                trigger('admin.updateprofile', $data);
                // may be other unset data to tell not update
                if($data){
                    if(isset($_SESSION['user']['id']))
                            db_update('admin_users', $data, 'id='.$_SESSION['user']['id']);
                    if(!$msg = db_error())
                            $_SESSION['user']['theme'] = $data['theme'];
                } 
		//else 
			//echo $msg;
	}
        
}