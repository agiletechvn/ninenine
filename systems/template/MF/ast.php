<?php

class MF_Node{
	public $lineno;

	function __construct($lineno){
		$this->lineno = $lineno;
	}

	function compile($compiler){
	}
}


class MF_NodeList extends MF_Node{
	public $nodes;

	function __construct($nodes, $lineno)	{
		parent::__construct($lineno);
		$this->nodes = $nodes;
	}

	function compile($compiler)	{
		foreach ($this->nodes as $node)
			$node->compile($compiler);
	}

	static function fromArray($array, $lineno)	{
		return count($array) == 1 ? $array[0] : new MF_NodeList($array, $lineno);
	}
}


class MF_Module extends MF_Node{
	public $body;
	public $extends;
	public $blocks;
	public $filename;
	public $id;
	public $is_master;

	function __construct($body, $extends, $blocks, $filename){
		parent::__construct(1);
		$this->body = $body;
		$this->extends = $extends;
		$this->blocks = $blocks;
		$this->filename = $filename;
		$this->is_master = $filename === @$GLOBALS['mf_master_file'];
	}
	
	private function get_master($name){
		return preg_replace('/_[^_]+$/', '_master', tpl_hash($name));
	}

	function compile($compiler){
		$compiler->raw('<?php ');
		if (!is_null($this->extends)) 
			$compiler->raw('$this->requireTemplate($GLOBALS[\'mf_master_file\']);' . MF_NEWLINE);
		$compiler->raw('class __MFTemplate_' . ($this->is_master
			? $this->get_master($this->filename)
			: tpl_hash($this->filename)));
		if (!is_null($this->extends))
			$compiler->raw(' extends __MFTemplate_' . $this->get_master($this->extends) . '{' . MF_NEWLINE);
		else {
			$compiler->raw('{' . MF_NEWLINE . 'function render(&$c){' . MF_NEWLINE);
			$this->body->compile($compiler);
			$compiler->raw('}' . MF_NEWLINE);
		}

		foreach ($this->blocks as $node)
			$node->compile($compiler);

		$compiler->raw('}' . MF_NEWLINE);
	}
}


class MF_Print extends MF_Node {
	public $expr;

	function __construct($expr, $lineno){
		parent::__construct($lineno);
		$this->expr = $expr;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->raw('echo ');
		$this->expr->compile($compiler);
		$compiler->raw(';');
	}
}


class MF_Text extends MF_Node{
	public $data;

	function __construct($data, $lineno)	{
		parent::__construct($lineno);
		$this->data = $data;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->raw('echo ');
		$compiler->string($this->data);
		$compiler->raw(';');
	}
}


class MF_ForLoop extends MF_Node{
	public $is_multitarget;
	public $item;
	public $seq;
	public $body;
	public $else;

	function __construct($is_multitarget, $item, $seq, $body, $else, $lineno){
		parent::__construct($lineno);
		$this->is_multitarget = $is_multitarget;
		$this->item = $item;
		$this->seq = $seq;
		$this->body = $body;
		$this->else = $else;
		$this->lineno = $lineno;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->pushContext();
		$compiler->raw('foreach(mf_iterate($c,');
		$this->seq->compile($compiler);
		$compiler->raw(') as $iterator){' . MF_NEWLINE);
		if ($this->is_multitarget) {
			$compiler->raw('mf_set_loop_context_multitarget($c,$iterator,array(');
			$idx = 0;
			foreach ($this->item as $node) {
				if ($idx++)
					$compiler->raw(',');
				$compiler->repr($node->name);
			}
			$compiler->raw('));' . MF_NEWLINE);
		}
		else {
			$compiler->raw('mf_set_loop_context($c,$iterator,');
			$compiler->repr($this->item->name);
			$compiler->raw(');' . MF_NEWLINE);
		}
		$this->body->compile($compiler);
		$compiler->raw('}' . MF_NEWLINE);
		if (!is_null($this->else)) {
			$compiler->raw('if(!$c[\'loop\'][\'iterated\']){' . MF_NEWLINE);
			$this->else->compile($compiler);
			$compiler->raw('}');
		}
		$compiler->popContext();
	}
}


class MF_IfCondition extends MF_Node{
	public $tests;
	public $else;

	function __construct($tests, $else, $lineno){
		parent::__construct($lineno);
		$this->tests = $tests;
		$this->else = $else;
	}

	function compile($compiler)	{
		$compiler->addDebugInfo($this);
		$idx = 0;
		foreach ($this->tests as $test) {
			$compiler->raw(($idx++ ? '}' . MF_NEWLINE . 'else' : '') . 'if(');
			$test[0]->compile($compiler);
			$compiler->raw('){' . MF_NEWLINE);
			$test[1]->compile($compiler);
		}
		if (!is_null($this->else)) {
			$compiler->raw('}else{' . MF_NEWLINE);
			$this->else->compile($compiler);
		}
		$compiler->raw('}' . MF_NEWLINE);
	}
}


class MF_Block extends MF_Node{
	public $name;
	public $body;
	public $parent;

	function __construct($name, $body, $lineno, $parent=NULL){
		parent::__construct($lineno);
		$this->name = $name;
		$this->body = $body;
		$this->parent = $parent;
	}

	function replace($other){
		$this->body = $other->body;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->format('function block_%s($c){'  . MF_NEWLINE,
				  $this->name);
		if (!is_null($this->parent))
			$compiler->raw('$c[\'::superblock\']=array($this,' .
				       "'parent::block_$this->name');" . MF_NEWLINE);
		$this->body->compile($compiler);
		$compiler->format('}' . MF_NEWLINE . MF_NEWLINE);
	}
}


class MF_BlockReference extends MF_Node{
	public $name;

	function __construct($name, $lineno){
		parent::__construct($lineno);
		$this->name = $name;
	}

	function compile($compiler)	{
		$compiler->addDebugInfo($this);
		$compiler->format('$this->block_%s($c);' . MF_NEWLINE, $this->name);
	}
}


class MF_Parent extends MF_Node{
	public $block_name;

	function __construct($block_name, $lineno){
		parent::__construct($lineno);
		$this->block_name = $block_name;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->raw('parent::block_' . $this->block_name . '($c);' . MF_NEWLINE);
	}
}


class MF_Include extends MF_Node{
	public $expr;

	function __construct($expr, $lineno)	{
		parent::__construct($lineno);
		$this->expr = $expr;
	}

	function compile($compiler){
		$compiler->addDebugInfo($this);
		$compiler->raw('mf_get_current_template()->loader->getTemplate(');
		$this->expr->compile($compiler);
		$compiler->raw(')->display($c);'. MF_NEWLINE);
	}
}


class MF_Expression extends MF_Node{

}


class MF_ConditionalExpression extends MF_Expression{
	public $expr1;
	public $expr2;
	public $expr3;

	function __construct($expr1, $expr2, $expr3, $lineno){
		parent::__construct($lineno);
		$this->expr1 = $expr1;
		$this->expr2 = $expr2;
		$this->expr3 = $expr3;
	}

	function compile($compiler){
		$compiler->raw('(');
		$this->expr1->compile($compiler);
		$compiler->raw(') ? (');
		$this->expr2->compile($compiler);
		$compiler->raw(') ; (');
		$this->expr3->compile($compiler);
		$compiler->raw(')');
	}
}


class MF_BinaryExpression extends MF_Expression{
	public $left;
	public $right;

	function __construct($left, $right, $lineno){
		parent::__construct($lineno);
		$this->left = $left;
		$this->right = $right;
	}

	function compile($compiler){
		$compiler->raw('(');
		$this->left->compile($compiler);
		$compiler->raw(') ');
		$this->operator($compiler);
		$compiler->raw(' (');
		$this->right->compile($compiler);
		$compiler->raw(')');
	}
}


class MF_OrExpression extends MF_BinaryExpression{
	function operator($compiler){
		return $compiler->raw('||');
	}
}


class MF_AndExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('&&');
	}
}

class MF_AddExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('+');
	}
}

class MF_SubExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('-');
	}
}

class MF_ConcatExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('.');
	}
}

class MF_MulExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('*');
	}
}


class MF_DivExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('/');
	}
}


class MF_ModExpression extends MF_BinaryExpression{
	function operator($compiler)	{
		return $compiler->raw('%');
	}
}

class MF_CompareExpression extends MF_Expression{
	public $expr;
	public $ops;

	function __construct($expr, $ops, $lineno)	{
		parent::__construct($lineno);
		$this->expr = $expr;
		$this->ops = $ops;
	}

	function compile($compiler)	{
		$this->expr->compile($compiler);
		$i = 0;
		foreach ($this->ops as $op) {
			if ($i) $compiler->raw(')&&($tmp' . $i);
			list($op, $node) = $op;
			$compiler->raw($op . '($tmp' . ++$i . '=');
			$node->compile($compiler);
		}
		$compiler->raw(')');
	}
}


class MF_UnaryExpression extends MF_Expression{
	public $node;

	function __construct($node, $lineno)	{
		parent::__construct($lineno);
		$this->node = $node;
	}

	function compile($compiler)	{
		$compiler->raw('(');
		$this->operator($compiler);
		$this->node->compile($compiler);
		$compiler->raw(')');
	}
}


class MF_NotExpression extends MF_UnaryExpression{
	function operator($compiler){
		$compiler->raw('!');
	}
}


class MF_NegExpression extends MF_UnaryExpression{
	function operator($compiler){
		$compiler->raw('-');
	}
}


class MF_PosExpression extends MF_UnaryExpression{
	function operator($compiler){
		$compiler->raw('+');
	}
}


class MF_Constant extends MF_Expression{
	public $value;

	function __construct($value, $lineno){
		parent::__construct($lineno);
		$this->value = $value;
	}

	function compile($compiler){
		$compiler->repr($this->value);
	}
}

class MF_ArrayExpression extends MF_Expression{
	public $value;

	function __construct($value, $lineno)	{
		parent::__construct($lineno);
		$this->value = $value;
	}

	function compile($compiler)	{
		$tmp = explode('[', str_replace(']', '\')', $this->value));
		$ret = sprintf('@$c[\'%s\']', substr(array_shift($tmp),1));
		foreach($tmp as $v)
			$ret = sprintf('mf_get_attribute(%s,\'%s', $ret, $v);
		$compiler->raw($ret);
	}
}


class MF_NameExpression extends MF_Expression{
	public $name;

	function __construct($name, $lineno)	{
		parent::__construct($lineno);
		$this->name = $name;
	}

	function compile($compiler)	{
		$this->name[0] == '@' 
		? $compiler->format('@constant(\'%s\')', substr($this->name, 1))
		: $compiler->format('@$c[\'%s\']', $this->name);
	}
}


class MF_AssignNameExpression extends MF_NameExpression{
	
	function compile($compiler)	{
		$compiler->format('$c[\'%s\']', $this->name);
	}
}


class MF_GetAttrExpression extends MF_Expression{
	public $node;
	public $attr;

	function __construct($node, $attr, $lineno)	{
		parent::__construct($lineno);
		$this->node = $node;
		$this->attr = $attr;
	}

	function compile($compiler)	{
		$compiler->raw('mf_get_attribute(');
		$this->node->compile($compiler);
		$compiler->raw(',');
		$this->attr->compile($compiler);
		$compiler->raw(')');
	}
}


class MF_FilterExpression extends MF_Expression{
	public $node;
	public $filters;

	function __construct($node, $filters, $lineno)	{
		parent::__construct($lineno);
		$this->node = $node;
		$this->filters = $filters;
		
	}

	function compile($compiler)	{
		$postponed = array();
		for ($i = count($this->filters) - 1; $i >= 0; --$i) {
			list($name, $attrs) = $this->filters[$i];
			if (!isset($GLOBALS['mf_filters'][$name])) {
				$compiler->raw('mf_missing_filter(');
				$compiler->repr($name);
				$compiler->raw(',');
			} else
				$compiler->raw($GLOBALS['mf_filters'][$name] . '(');
			$postponed[] = $attrs;
		}
		$this->node->compile($compiler);
		
		foreach ($postponed as $attributes) {
			foreach ($attributes as $node) {
				$compiler->raw(',');
				$node->compile($compiler);
			}
			$compiler->raw(')');
		}
	}
}
