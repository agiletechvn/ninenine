<?php
/*
	USES:
	@include SYS_PATH . 'csrf.php';
	$this->csrf = new CSRF('7dd9188160ee6824f5d596938c38dbf178e1bcfd');
	$this->assign('token', $this->csrf->token);
	$this->csrf->excute(false);
*/

class CSRF{
	private $keys;
	public 	$uri;
	public 	$token;
	
	function __construct($key){
		$this->keys = $key;
		
		if(!isset($_SESSION))
			session_start();
			
		if(isset($_SESSION['csrf_time']))
			unset($_SESSION['csrf_time']);	
			
		$_SESSION['csrf_time'] = time();
					
		$this->uri 	= preg_replace('/((\?|&)?token=(.*)==?)/', '', $_SERVER['REQUEST_URI']);
		
		$this->encypt();
	}
	
	private function encypt(){		
		$output["CSRF"] 		= $this->csrfKey(array($this->uri, $_SESSION['csrf_time']));		
		$output["CSRF_KEY"]	 	= base64_encode($this->uri);
		$output["CSRF_TIME"] 	= base64_encode($_SESSION['csrf_time']);	
			
		$this->token = $output["CSRF"] . '|' . $output["CSRF_KEY"] . '|' . $output["CSRF_TIME"];		
		
		return $this->token;
	}
	
	private function decrypt(){
		if($_SERVER['REQUEST_METHOD'] == 'POST')
			$token = @$_POST['token'];
			
		if($_SERVER['REQUEST_METHOD'] == 'GET')
			$token = @$_GET['token'];	
		
		$tokens 			= preg_split('/\|/u', $token);
		$input["CSRF"] 		= @$tokens[0];
		$input["CSRF_KEY"] 	= base64_decode(@$tokens[1]);			
		$input["CSRF_TIME"]	= base64_decode(@$tokens[2]);	
		
		$CSRF = $this->csrfKey(array($input["CSRF_KEY"], $input["CSRF_TIME"]));
		
		if($CSRF != $input["CSRF"]){
			// Router::dead_link();
			header('HTTP/1.0 500 Forbidden');
			die("Request forbidden!");
		}
	}
	
	private function csrfKey($attr = array()){
		$str = 	$_SERVER['REMOTE_ADDR'] . 
				$_SERVER['HTTP_USER_AGENT'] . 								 
				$_SERVER['SERVER_PROTOCOL'] .
				$_SERVER['HTTP_ACCEPT'] .
				$_SERVER['HTTP_HOST']. 
				session_id() .
				$this->keys;
				
		foreach($attr as $val)
			$str .= $val;
		
		return sha1($str);
	}	
	
	public function excute($flag = TRUE){
		if($flag == TRUE)
			$this->decrypt();
		else
			if(isset($_GET['token']) || isset($_POST['token'])) $this->decrypt();
	}	
}
