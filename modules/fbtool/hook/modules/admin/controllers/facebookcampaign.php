<?php

class FacebookCampaignController extends FBToolController{
	
        var $config = array(
            'groups' => array('fbtool'),
            'table' => 'tbl_facebook_campaign',
            'index_column' => 'id',
            'columns' => array(null, 'name', 'description','reg_date', 'reg_time', 'publish', 'status'),
            'searches' => array(1), // index of $columns arrray	
            'orders' => array(1) // which column allow to sort	
        );
	
	function index(){
		$this->breadcrumb('Add Facebook Campaign')->load();
	}
	
	function all(){	            
            $where = 'user_id = ' . $this->user['id'];
            parent::all($where);	
	}
    
        
        
        function search_post(){
            if(isset($_GET['term'])){
                $search = $_GET['term'];
                $list = db_select('tbl_facebook_posts', 
                        array('id','name'), 
                        array("name LIKE '%$search%'",'user_id'=>$this->user['id'],'publish'=>1), false, 20);
               
                 $this->json($list);
            }
        }
	
	function add($id=null){	        
            
            parent::add($id, null, function(&$row){
                // remember callback function cant access outside var unless we use `use` var
                // dont search coupon from db when add
                if($row['id']){
                    $list = db_select('tbl_facebook_posts', 
                            array('id','name'),
                            array('id IN ('.$row['post_ids'].')','publish'=>1));
                    $this->assign('list_posts', $list);
                }
                
            });
	}
	
	function update(){
            
            $ret = array('error'=>array());
        
            // mapping data
            $data = array(
                    'name' => trim($_POST['name']),
                    'user_name' => $this->user['name'],            
                    'user_id' => $this->user['id'],
                
                    'reg_date' => trim($_POST['reg_date']),
                    'reg_time' => trim($_POST['reg_time']),
                
                    'description' => trim($_POST['description']),
                    'publish'=>$_POST['publish'],
                    'post_interval' => +$_POST['post_interval'],
                    'post_ids' => is_array($_POST['post_ids']) ? implode(',', $_POST['post_ids']) : $_POST['post_ids']
            );	
            
            // calculate timestamp based on user time zone
            $gmt_zone = db_select_one('tbl_users', 'gmt_zone', array('id' => $data['user_id']), true);
            if(!$gmt_zone)
                $gmt_zone = DEFAULT_TIMEZONE;
            date_default_timezone_set($gmt_zone);
            $timestamp = strtotime($data['reg_date'] . ' ' . $data['reg_time']);
            // run before 10 minutes, then repeat cronjob each 10 minutes
            $run_timestamp = $timestamp - CRONJOB_INTERVAL;
            date_default_timezone_set(DEFAULT_TIMEZONE);
            // update timestamp to run
            $data['timestamp'] = $run_timestamp;

            if(empty($data['name']))
                    $ret['error']['name'] = array('msg'=>t('Tiêu đề rỗng'), 'type'=>'error');   

            parent::update($data, $ret);
	}
	
	function update_status($id){
		parent::update_status($id, array('publish'=>$_POST['publish']));
	}
        
       
        
	
}

