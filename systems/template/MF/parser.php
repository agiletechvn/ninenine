<?php

function convert_special_tag($str){
	return str_replace(array('\n', '\t'), array('<bn>', '<bt>'), $str);
}

function mf_parse_lang($m) {
	return convert_special_tag(t($m[1]));
}

function mf_parse_script($m) {
	include_once APP_PATH . 'lib' . DS . 'plugins' . DS . 'class.javascriptPacker.php';
	$packer = new JavaScriptPacker($m[0], 0);
	return convert_special_tag($packer->pack());
}

function mf_parse_style($m) {
	include_once APP_PATH . 'lib' . DS . 'plugins' . DS . 'function.cssCompress.php';
	return css_compress($m[0]);
}
	
function mf_parse_short_path($m) {	
        $m2 =  trim($m[2]);
        // if we have (, it is regular expression or background-image or function, should return the same
        if($m2 === '(')
            return $m[0];
	return $m[1] . $m2 . $m[3] . (isset($m[4]) ? 'themes/' . $GLOBALS['theme'] : (REWRITE_MODE?'':'?rt=').LANGUAGE) . '/';
}
	
function mf_parse($source, $filename=NULL){
	
	if(isset($GLOBALS['tpl_compress_func']))
		$source = $GLOBALS['tpl_compress_func']($source);
	else {
		$source = preg_replace_callback('/<script[^>]*>[\s\S]*?<\/script>/', 'mf_parse_script', $source);
		$source = preg_replace_callback('/<style[^>]*>[\s\S]*?<\/style>/', 'mf_parse_style', $source);
		$source = preg_replace_callback('/([\w_\d]+)(\s*[=\(]\s*)("|\')?(~)?\//', 'mf_parse_short_path', $source);
		$source = preg_replace_callback('/{{\s*(.+?)\s*}}/', 'mf_parse_lang', $source);
		$source = preg_replace(array('/>\s+</', '/\n\s+/', '/<head>/i'),
							   array('><', '', '<head><base href="$@SITE_ROOT">'), $source);
	}
	$parser = new MF_Parser(mf_tokenize($source, $filename));
	return $parser->parse();
}


class MF_Parser{
	public $stream;
	public $blocks;
	public $extends;
	public $current_block;
	private $handlers;

	function __construct($stream)	{
		$this->stream = $stream;
		$this->blocks = array();
		$this->current_block = NULL;
		$this->handlers = array(
			'for' =>        array($this, 'parseForLoop'),
			'if' =>         array($this, 'parseIfCondition'),
			'include' =>	array($this, 'parseInclude'),
			'block' =>	array($this, 'parseBlock'),
			'parent' =>	array($this, 'parseParent')
		);
	}

	function parseForLoop($token){
		$lineno = $token->lineno;
		list($is_multitarget, $item) = $this->parseAssignmentExpression();
		$this->stream->expect('in');
		$seq = $this->parseExpression();
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		$body = $this->subparse(array($this, 'decideForFork'));
		if ($this->stream->next()->value == 'else') {
			$this->stream->expect(MF_Token::BLOCK_END_TYPE);
			$else = $this->subparse(array($this, 'decideForEnd'), true);
		}else
			$else = NULL;
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		return new MF_ForLoop($is_multitarget, $item, $seq, $body, $else,
					$lineno);
	}

	function decideForFork($token){
		return $token->test(array('else', 'endfor'));
	}

	function decideForEnd($token){
		return $token->test('endfor');
	}

	function parseIfCondition($token){
		$lineno = $token->lineno;
		$expr = $this->parseExpression();
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		$body = $this->subparse(array($this, 'decideIfFork'));
		$tests = array(array($expr, $body));
		$else = NULL;

		while (true) {
			switch ($this->stream->current->value) {
			case 'else':
				$this->stream->next();
				$this->stream->expect(MF_Token::BLOCK_END_TYPE);
				$else = $this->subparse(array($this, 'decideIfEnd'));
				break;
			case 'elseif':
				$this->stream->next();
				$expr = $this->parseExpression();
				$this->stream->expect(MF_Token::BLOCK_END_TYPE);
				$body = $this->subparse(array($this, 'decideIfFork'));
				$tests[] = array($expr, $body);
				continue 2;
			}
			$this->stream->next();
			break;
		}
		

		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		return new MF_IfCondition($tests, $else, $lineno);
	}

	function decideIfFork($token){
		return $token->test(array('elseif', 'else', 'endif'));
	}

	function decideIfEnd($token){
		return $token->test('endif');
	}

	function parseBlock($token){
		$lineno = $token->lineno;
		$name = $this->stream->expect(MF_Token::NAME_TYPE)->value;
		if (isset($this->blocks[$name]))
			throw new MF_SyntaxError("block '$name' defined twice.",
						   $lineno);
		$this->current_block = $name;
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		$body = $this->subparse(array($this, 'decideBlockEnd'), true);
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		$block = new MF_Block($name, $body, $lineno);
		$this->blocks[$name] = $block;
		$this->current_block = NULL;
		return new MF_BlockReference($name, $lineno);
	}

	function decideBlockEnd($token){
		return $token->test('endblock');
	}

        /**
         * 
         * @param type $token
         * @return \MF_Include
         */
	function parseInclude($token){
		$expr = $this->parseExpression();
                // we correct abs_path not to depend on absolute path of system
                // for relative include, should do at loader level
                // some time we don't receive value 'cos it is other expression, not include expr
                if(isset($expr->value))
                    $expr->value = /*$expr->value[0] === '~' // current view path (in hook path processing)
                        ? abs_path(defined('HOOK_PATH') ? (HOOK_PATH . 'views' . DS) : VIEW_PATH) 
                            . substr($expr->value, 2)
                        : */abs_path(VIEW_PATH) . $expr->value;
                
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		return new MF_Include($expr, $token->lineno);
	}

	function parseParent($token){
		if (is_null($this->current_block))
			throw new MF_SyntaxError('parent outside block', $token->lineno);
		$this->stream->expect(MF_Token::BLOCK_END_TYPE);
		return new MF_Parent($this->current_block, $token->lineno);
	}

	function parseExpression(){
		return $this->parseConditionalExpression();
	}

	function parseConditionalExpression(){
		$lineno = $this->stream->current->lineno;
		$expr1 = $this->parseOrExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '?')) {
			$this->stream->next();
			$expr2 = $this->parseOrExpression();
			$this->stream->expect(MF_Token::OPERATOR_TYPE, ':');
			$expr3 = $this->parseConditionalExpression();
			$expr1 = new MF_ConditionalExpression($expr1, $expr2, $expr3,
								$this->lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $expr1;
	}

	function parseOrExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseAndExpression();
		while ($this->stream->test('or')) {
			$this->stream->next();
			$right = $this->parseAndExpression();
			$left = new MF_OrExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseAndExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseCompareExpression();
		while ($this->stream->test('and')) {
			$this->stream->next();
			$right = $this->parseCompareExpression();
			$left = new MF_AndExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseCompareExpression(){
		static $operators = array('==', '!=', '<', '>', '>=', '<=');
		$lineno = $this->stream->current->lineno;
		$expr = $this->parseAddExpression();
		$ops = array();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, $operators))
			$ops[] = array($this->stream->next()->value,
				       $this->parseAddExpression());

		if (empty($ops))
			return $expr;
		return new MF_CompareExpression($expr, $ops, $lineno);
	}

	function parseAddExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseSubExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '+')) {
			$this->stream->next();
			$right = $this->parseSubExpression();
			$left = new MF_AddExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseSubExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseConcatExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '-')) {
			$this->stream->next();
			$right = $this->parseConcatExpression();
			$left = new MF_SubExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseConcatExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseMulExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '~')) {
			$this->stream->next();
			$right = $this->parseMulExpression();
			$left = new MF_ConcatExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseMulExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseDivExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '*')) {
			$this->stream->next();
			$right = $this->parseDivExpression();
			$left = new MF_MulExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseDivExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseModExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '/')) {
			$this->stream->next();
			$right = $this->parseModExpression();
			$left = new MF_DivExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseModExpression(){
		$lineno = $this->stream->current->lineno;
		$left = $this->parseUnaryExpression();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '%')) {
			$this->stream->next();
			$right = $this->parseUnaryExpression();
			$left = new MF_ModExpression($left, $right, $lineno);
			$lineno = $this->stream->current->lineno;
		}
		return $left;
	}

	function parseUnaryExpression(){
		if ($this->stream->test('not'))
			return $this->parseNotExpression();
		if ($this->stream->current->type == MF_Token::OPERATOR_TYPE) {
			switch ($this->stream->current->value) {
			case '-':
				return $this->parseNegExpression();
			case '+':
				return $this->parsePosExpression();
			}
		}
		return $this->parsePrimaryExpression();
	}

	function parseNotExpression(){
		$token = $this->stream->next();
		$node = $this->parseUnaryExpression();
		return new MF_NotExpression($node, $token->lineno);
	}

	function parseNegExpression(){
		$token = $this->stream->next();
		$node = $this->parseUnaryExpression();
		return new MF_NegExpression($node, $token->lineno);
	}

	function parsePosExpression(){
		$token = $this->stream->next();
		$node = $this->parseUnaryExpression();
		return new MF_PosExpression($node, $token->lineno);
	}

	function parsePrimaryExpression($assignment=false){
		$token = $this->stream->current;
		switch ($token->type) {
		case MF_Token::NAME_TYPE:
			$this->stream->next();
			switch ($token->value) {
			case 'true':
				$node = new MF_Constant(true, $token->lineno);
				break;
			case 'false':
				$node = new MF_Constant(false, $token->lineno);
				break;
			case 'none':
				$node = new MF_Constant(NULL, $token->lineno);
				break;
			default:
				$cls = $assignment ? 'MF_AssignNameExpression'
						   : 'MF_NameExpression';
				$node = new $cls($token->value, $token->lineno);
			}
			break;
		case MF_Token::NUMBER_TYPE:
		case MF_Token::STRING_TYPE:
			$this->stream->next();
			$node = new MF_Constant($token->value, $token->lineno);
			break;
		default:
			if ($token->test(MF_Token::OPERATOR_TYPE, '(')) {
				$this->stream->next();
				$node = $this->parseExpression();
				$this->stream->expect(MF_Token::OPERATOR_TYPE, ')');
			} else
				throw new MF_SyntaxError('unexpected token',
							   $token->lineno);
		}
		if (!$assignment)
			$node = $this->parsePostfixExpression($node);

		return $node;
	}

	function parsePostfixExpression($node){
		$stop = false;
		while (!$stop && $this->stream->current->type ==
				  MF_Token::OPERATOR_TYPE)
			switch ($this->stream->current->value) {
			case '.':
			case '[':
				$node = $this->parseSubscriptExpression($node);
				break;
			case '|':
				$node = $this->parseFilterExpression($node);						
				break;
			default:
				$stop = true;
				break;
			}
		return $node;
	}

	function parseSubscriptExpression($node){
		$token = $this->stream->next();
		$lineno = $token->lineno;

		if ($token->value == '['){
			$token = $this->stream->next();
			$arg = $this->parseExpression();
			$this->stream->expect(MF_Token::OPERATOR_TYPE, ']');
		} elseif ($token->value == '.') {					
			$token = $this->stream->next();
			if ($token->type == MF_Token::NAME_TYPE ||
			    $token->type == MF_Token::NUMBER_TYPE) {
			    $cls = $token->value[0] == '@' ? 'MF_ArrayExpression'
						   : 'MF_Constant';	
				$arg = new $cls($token->value, $lineno);			
			} else
				throw new MF_SyntaxError('expected name or number',
							   $lineno);
			
		}
		return new MF_GetAttrExpression($node, $arg, $lineno);
	}

	function parseFilterExpression($node){
		
		$lineno = $this->stream->current->lineno;
		$filters = array();
		while ($this->stream->test(MF_Token::OPERATOR_TYPE, '|')) {
			$this->stream->next();
			$token = $this->stream->expect(MF_Token::NAME_TYPE);
			$args = array();
			if ($this->stream->test(MF_Token::OPERATOR_TYPE, '(')) {
				$this->stream->next();
				while (!$this->stream->test(MF_Token::OPERATOR_TYPE, ')')) {
					if (!empty($args))
						$this->stream->expect(MF_Token::OPERATOR_TYPE, ',');
					$args[] = $this->parseExpression();
				}
				$this->stream->next();
			}
			$filters[] = array($token->value, $args);
		}

		return new MF_FilterExpression($node, $filters, $lineno);
	}

	function parseAssignmentExpression()	{
		$lineno = $this->stream->current->lineno;
		$targets = array();
		$is_multitarget = false;
		while (true) {
			if (!empty($targets))
				$this->stream->expect(MF_Token::OPERATOR_TYPE, ',');
			if ($this->stream->test(MF_Token::OPERATOR_TYPE, ')') ||
			    $this->stream->test(MF_Token::VAR_END_TYPE) ||
			    $this->stream->test(MF_Token::BLOCK_END_TYPE) ||
			    $this->stream->test('in'))
					break;
			    
			$targets[] = $this->parsePrimaryExpression(true);
			if (!$this->stream->test(MF_Token::OPERATOR_TYPE, ','))
				break;
			$is_multitarget = true;
		}
		if (!$is_multitarget && count($targets) == 1)
			return array(false, $targets[0]);
		return array(true, $targets);
	}

	function subparse($test, $drop_needle=false)	{
		$lineno = $this->stream->current->lineno;
		$rv = array();
		while (!$this->stream->eof) {
			switch ($this->stream->current->type) {
			case MF_Token::TEXT_TYPE:
				$token = $this->stream->next();
				$rv[] = new MF_Text($token->value, $token->lineno);
				break;
			case MF_Token::VAR_START_TYPE:
				$token = $this->stream->next();
				$expr = $this->parseExpression();
				$this->stream->expect(MF_Token::VAR_END_TYPE);
				$rv[] = new MF_Print($expr, $token->lineno);
				break;
			case MF_Token::BLOCK_START_TYPE:
				$this->stream->next();
				$token = $this->stream->current;
				if ($token->type !== MF_Token::NAME_TYPE)
					throw new MF_SyntaxError('expected directive',
					                           $token->lineno);
				if (!is_null($test) && call_user_func($test, $token)) {
					if ($drop_needle)
						$this->stream->next();
					return MF_NodeList::fromArray($rv, $lineno);
				}
				if (!isset($this->handlers[$token->value]))
					throw new MF_SyntaxError('unknown directive',
								   $token->lineno);
				$this->stream->next();
				$node = call_user_func($this->handlers[$token->value],
						       $token);
				if (!is_null($node))
					$rv[] = $node;
				break;
			default:
				assert(false, 'Lexer or parser ended up in ' .
				       'unsupported state.');
			}
		}

		return MF_NodeList::fromArray($rv, $lineno);
	}

	function parse(){
		try {
			$body = $this->subparse(NULL);
		} catch (MF_SyntaxError $e) {
			if (is_null($e->filename))
				$e->filename = $this->stream->filename;
			throw $e;
		}

		if ($this->stream->filename == @$GLOBALS['mf_tpl_file']){
			$this->extends = $GLOBALS['mf_master_file'];
			foreach ($this->blocks as $block)
				$block->parent = $this->extends;
		} else 
			$this->extends = NULL;
		
		return new MF_Module($body, $this->extends, $this->blocks,
				       $this->stream->filename);
	}
}
