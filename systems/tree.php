<?php
/**
 * Class for generating nested lists
 *
 * example:
 *
 * $tree = new Tree;
 * $tree->add_row(1, 0, '', 'Menu 1');
 * $tree->add_row(2, 0, '', 'Menu 2');
 * $tree->add_row(3, 1, '', 'Menu 1.1');
 * $tree->add_row(4, 1, '', 'Menu 1.2');
 * echo $tree->generate_list();
 *
 * output:
 * <ul>
 * 	<li>Menu 1
 * 		<ul>
 * 			<li>Menu 1.1</li>
 * 			<li>Menu 1.2</li>
 * 		</ul>
 * 	</li>
 * 	<li>Menu 2</li>
 * </ul>
 *
 * @author tupt@sinhvu.com
 */
class Tree {

	/**
	 * variable to store temporary data to be processed later
	 *
	 * @var array
	 */
	public $data;
	public $sub_attr;
	public $label_func;

	/**
	 * We need to make anonymous function work as method
	 * But this method make the class run slower
	 * So we should only use this for many assignments
	 * @param unknown_type $method
	 * @param unknown_type $args
	 */
	/*function __call($method, $args){
        if(is_callable(array($this, $method))) {
            return call_user_func_array($this->$method, $args);
        }
        // else throw exception
    }*/
    
	/**
	 * Add an item
	 *
	 * @param int $id 			ID of the item
	 * @param int $parent 		parent ID of the item
	 * @param string $li_attr 	attributes for <li>
	 * @param string $label		text inside <li></li>
	 */
	function add_row($id, $parent, $li_attr, $label) {
		$this->data[$parent][] = array('id' => $id, 'li_attr' => $li_attr, 'label' => $label);
	}

	/**
	 * Generates nested lists
	 *
	 * @param string $ul_attr
	 * @return string
	 */
	function generate_list($tag='ul', $ul_attr = '') {
		if(!isset($this->label_func))
			$this->label_func = function($label, $has_child){
				return $label;
			};
		return $this->ul($tag, 0, $ul_attr);
	}

	/**
	 * Recursive method for generating nested lists
	 * Uncomment $indent to see it more clearly, but no need, just use browser addon
	 *
	 * @param int $parent
	 * @param string $attr
	 * @return string
	 */
	function ul($tag, $parent, $attr) {
		//static $i = 1;
		//$indent = str_repeat("\t\t", $i);
		if (isset($this->data[$parent])) {
			if ($attr) {
				$attr = ' ' . $attr;
			}
			$html = '';
			//$html .= "\n$indent";
			$html .= "<$tag$attr>";
			//$i++;					
			
			foreach ($this->data[$parent] as $row) {
				$child = $this->ul($tag, $row['id'], $this->sub_attr);
				//$html .= "\n\t$indent";
				$html .= '<li'. $row['li_attr'] . '>';

				$html .= $this->label_func->__invoke($row['label'], $child !== false);
								
				if ($child) {
					//$i--;
					$html .= $child;
					//$html .= "\n\t$indent";
				}
				$html .= '</li>';
			}
			//$html .= "\n$indent";
			$html .= "</$tag>";
			return $html;
		} else {
			return false;
		}
	}

	/**
	 * Clear the temporary data
	 *
	 */
	function clear() {
		$this->data = array();
	}
}