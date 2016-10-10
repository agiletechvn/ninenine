<?php 
// define node
class Node{
	public $id;
	public $name;
	public $children;
	
	public function Node($id, $name){
		$this->id 		= $id;
		$this->name 	= $name;
	}
}

class Nodes{	
	public $data;
	public $listId = array(); 
	
	// get tree
	// $ret = 1: return tree such as list
	// $ret = 0: return tree such as html
	function __construct($data){	
		$this->data = $data;
			
		$list = $data;
		foreach($list as $key => $val){
			array_push($this->listId, $val['id']);	
			unset($list[$key]);
		}
	}
	
	public function create($ret = 1){
		$idRoot 		= 0;
		$root			= new Node($idRoot, 'Root');
		$arrParent 		= array($idRoot => $root);
		$arrChildren 	= array();
		foreach($this->data as $val){
			$id 	= $val['id'];
			$name 	= $val['name'];
			$pid 	= $val['pid'];
			
			$newNode = new Node($id, $name);
			
			// mark node in parent
			$arrParent[$id] = $newNode;
			
			// mark node in child
			$children = &$arrChildren[$pid];
			if(!isset($children))
				$arrChildren[$pid] = array();
				
			array_push($children, $newNode);			
			
			// if has child then push child to node
			$children = &$arrChildren[$id];
			if(isset($children))
				$newNode->children = $children;
			
			// if has parent then push node to parent
			$parent = &$arrParent[$pid];
			if(isset($parent)){
				if(!isset($parent->children))
					$parent->children = array();
					
				array_push($parent->children, $newNode);
			}
		}
		
		if($ret == 1)
			return $root->children;
		else
			return $this->show($root->children);	
	}
	
	// create tree such as html
	public function show($data){
		$showTree = '';
		foreach($data as $key => $val){
			$showTree .= '<li>';
				$showTree .= $val->name;
				
				if(count($val->children) > 0)
					$showTree .= $this->show($val->children);
				
			$showTree .= '</li>';
		}
		return '<ul>' . $showTree . '</ul>';	
	}
	
	
	// get node of tree
	// $id must exists in data
	public function getNode($data, $id){
		$flag = 0;
		$ret = array();
		
		if(in_array($id, $this->listId)){
			while($flag == 0){
				foreach($data as $key => $val)
					if($val->id == $id){
						$flag = 1;
						array_push($ret, $val);
						return $ret;
						exit();
					}else{
						$temp = $val;			
						unset($data[$key]);
						if(count($temp->children) > 0)
							foreach($temp->children as $child)
								array_push($data, $child);
					}
							
				$this->getNode($data, $id);
			}
		}else{
			return array();
		}
	}
}