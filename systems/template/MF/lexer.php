<?php

function mf_tokenize($source, $filename=NULL){
	$lexer = new MF_Lexer($source, $filename);
	return new MF_TokenStream($lexer, $filename);
}


class MF_Lexer{
	private $cursor;
	private $position;
	private $end;
	private $pushedBack;
	public $code;
	public $lineno;
	public $filename;

	const POSITION_DATA = 0;
	const POSITION_BLOCK = 1;
	const POSITION_VAR = 2;

	const REGEX_NAME = '/[A-Za-z_@][A-Za-z0-9_\]\[]*/A';
	const REGEX_NUMBER = '/[0-9]+(?:\.[0-9])?/A';
	const REGEX_STRING = '/(?:"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'([^\'\\\\]*(?:\\\\.[^\'\\\\]*)*)\')/Asm';
	const REGEX_OPERATOR = '/<=?|>=?|(?:=|!)=|[(){}.,%*\/+~|-]|\[|\]/A'; // >=, <=, !=, ==, >, <

	function __construct($code, $filename=NULL){
                // move to one line, just use space to seperate like raw html
		$this->code = preg_replace('/(\r\n|\r|\n)/', ' ', $code);
            
		$this->filename = $filename;
		$this->cursor = 0;
		$this->lineno = 1;
		$this->pushedBack = array();
		$this->end = strlen($this->code);
		$this->position = self::POSITION_DATA;
	}

	/**
	 * parse the nex token and return it.
	 */
	function nextToken(){
		// do we have tokens pushed back?  get one
		if (!empty($this->pushedBack))
			return array_shift($this->pushedBack);
		// have we reached the end of the code?
		if ($this->cursor >= $this->end)
			return MF_Token::EOF($this->lineno);
		// otherwise dispatch to the lexing functions depending
		// on our current position in the code.
		switch ($this->position) {
		case self::POSITION_DATA:
			$tokens = $this->lexData(); break;
		case self::POSITION_BLOCK:
			$tokens = $this->lexBlock(); break;
		case self::POSITION_VAR:
			$tokens = $this->lexVar(); break;
		}

		// if the return value is not an array it's a token
		if (!is_array($tokens))
			return $tokens;
		// empty array, call again
		elseif (empty($tokens))
			return $this->nextToken();
		// if we have multiple items we push them to the buffer
		elseif (count($tokens) > 1) {
			$first = array_shift($tokens);
			$this->pushedBack = $tokens;
			return $first;
		}
		// otherwise return the first item of the array.
		return $tokens[0];
	}

	private function lexData()	{
		$match = NULL;

		// if no matches are left we return the rest of the template
		// as simple text token
		if (!preg_match('/(.*?)(\{[%#]|\$(?![\$\(\.]))/A', $this->code, $match,
			        NULL, $this->cursor)) {
			$rv = MF_Token::Text(substr($this->code, $this->cursor),
			                       $this->lineno);
			$this->cursor = $this->end;
			return $rv;
		}
		$this->cursor += strlen($match[0]);

		// update the lineno on the instance
		$lineno = $this->lineno;
		$this->lineno += substr_count($match[0], '\n');

		// push the template text first
		$text = $match[1];
		if (!empty($text)) {
			$result = array(MF_Token::Text($text, $lineno));
			$lineno += substr_count($text, '\n');
		}else
			$result = array();

		// block start token, let's return a token for that.
		if (($token = $match[2]) !== '$') {
			// if our section is a comment, just return the text
			if ($token[1] == '#') {
				if (!preg_match('/.*?#\}/A', $this->code, $match,
						NULL, $this->cursor))
					throw new MF_SyntaxError('unclosed comment',
								   $this->lineno);
				$this->cursor += strlen($match[0]);
				$this->lineno += substr_count($match[0], '\n');
				return $result;
			}
			$result[] = new MF_Token(MF_Token::BLOCK_START_TYPE,
			                           '', $lineno);
			$this->position = self::POSITION_BLOCK;
		} elseif (isset($this->code[$this->cursor]) &&
		         $this->code[$this->cursor] == '{') {
			$this->cursor++;
			$result[] = new MF_Token(MF_Token::VAR_START_TYPE,
			                           '', $lineno);
			$this->position = self::POSITION_VAR;
		}

		// inline variable expressions.  If there is no name next we
		// fail silently.  $ 42 could be common so no need to be a
		// dickhead.
		elseif (preg_match(self::REGEX_NAME, $this->code, $match,
			            NULL, $this->cursor)) {
			$result[] = new MF_Token(MF_Token::VAR_START_TYPE,
						   '', $lineno);
			$result[] = MF_Token::Name($match[0], $lineno);
			$this->cursor += strlen($match[0]);

			// allow attribute lookup
			while (isset($this->code[$this->cursor]) &&
			       $this->code[$this->cursor] === '.') {
				++$this->cursor;
				$result[] = MF_Token::Operator('.', $this->lineno);
				if (preg_match(self::REGEX_NAME, $this->code,
					      $match, NULL, $this->cursor)) {
					$this->cursor += strlen($match[0]);
					$result[] = MF_Token::Name($match[0],
								     $this->lineno);
				}elseif (preg_match(self::REGEX_NUMBER, $this->code,
						    $match, NULL, $this->cursor)) {
					$this->cursor += strlen($match[0]);
					$result[] = MF_Token::Number($match[0],
								       $this->lineno);
				}else {
					--$this->cursor;
					break;
				}
			}
			$result[] = new MF_Token(MF_Token::VAR_END_TYPE,
						   '', $lineno);
		} 
		
		return $result;
	}

	private function lexBlock()	{
		$match = NULL;
		if (preg_match('/\s*%\}/A', $this->code, $match, NULL, $this->cursor)) {
			$this->cursor += strlen($match[0]);
			$lineno = $this->lineno;
			$this->lineno += substr_count($match[0], '\n');
			$this->position = self::POSITION_DATA;
			return new MF_Token(MF_Token::BLOCK_END_TYPE, '', $lineno);
		}
		return $this->lexExpression();
	}

	private function lexVar(){
		$match = NULL;
		if (preg_match('/\s*\}/A', $this->code, $match, NULL, $this->cursor)) {
			$this->cursor += strlen($match[0]);
			$lineno = $this->lineno;
			$this->lineno += substr_count($match[0], '\n');
			$this->position = self::POSITION_DATA;
			return new MF_Token(MF_Token::VAR_END_TYPE, '', $lineno);
		}
		return $this->lexExpression();
	}

	private function lexExpression(){
		$match = NULL;

		// skip whitespace
		while (preg_match('/\s+/A', $this->code, $match, NULL,
			          $this->cursor)) {
			$this->cursor += strlen($match[0]);
			$this->lineno += substr_count($match[0], '\n');
		}

		// sanity check
		if ($this->cursor >= $this->end)
			throw new MF_SyntaxError('unexpected end of stream',
			                           $this->lineno, $this->filename);

		// first parse operators
		if (preg_match(self::REGEX_OPERATOR, $this->code, $match, NULL,
			       $this->cursor)) {
			$this->cursor += strlen($match[0]);
			return MF_Token::Operator($match[0], $this->lineno);
		}

		// now names
		if (preg_match(self::REGEX_NAME, $this->code, $match, NULL,
			       $this->cursor)) {
			$this->cursor += strlen($match[0]);
			return MF_Token::Name($match[0], $this->lineno);
		}

		// then numbers
		elseif (preg_match(self::REGEX_NUMBER, $this->code, $match,
		                    NULL, $this->cursor)) {
			$this->cursor += strlen($match[0]);
			$value = (float)$match[0];
			if ((int)$value === $value)
				$value = (int)$value;
			return MF_Token::Number($value, $this->lineno);
		}

		// and finally strings
		elseif (preg_match(self::REGEX_STRING, $this->code, $match,
		                    NULL, $this->cursor)) {
			$this->cursor += strlen($match[0]);
			$this->lineno += substr_count($match[0], '\n');
			$value = stripcslashes(substr($match[0], 1, strlen($match[0]) - 2));
			return MF_Token::String($value, $this->lineno);
		}

		// unlexable
		throw new MF_SyntaxError("Unexpected character '" .
		                           $this->code[$this->cursor] . "'.",
					   $this->lineno, $this->filename);
	}
}


/**
 * Wrapper around a lexer for simplified token access.
 */
class MF_TokenStream{
	private $pushed;
	private $lexer;
	public $filename;
	public $current;
	public $eof;

	function __construct($lexer, $filename)	{
		$this->pushed = array();
		$this->lexer = $lexer;
		$this->filename = $filename;
		$this->next();
	}

	function push($token)	{
		$this->pushed[] = $token;
	}

	/**
	 * set the pointer to the next token and return the old one.
	 */
	function next()	{
		if (!empty($this->pushed))
			$token = array_shift($this->pushed);
		else
			$token = $this->lexer->nextToken();
		$old = $this->current;
		$this->current = $token;
		$this->eof = $token->type === MF_Token::EOF_TYPE;
		return $old;
	}

	/**
	 * Look at the next token.
	 */
	function look()	{
		$old = $this->next();
		$new = $this->current;
		$this->push($old);
		$this->push($new);
		return $new;
	}

	/**
	 * Skip some tokens.
	 */
	function skip($times=1){
		for ($i = 0; $i < $times; ++$i)
			$this->next();
	}

	/**
	 * expect a token (like $token->test()) and return it or raise
	 * a syntax error.
	 */
	function expect($primary, $secondary=NULL){
		$token = $this->current;
		if (!$token->test($primary, $secondary))
			throw new MF_SyntaxError('unexpected token',
						   $this->current->lineno);
		$this->next();
		return $token;
	}

	/**
	 * Forward that call to the current token.
	 */
	function test($primary, $secondary=NULL){
		return $this->current->test($primary, $secondary);
	}
}


/**
 * Simple struct for tokens.
 */
class MF_Token{
	public $type;
	public $value;
	public $lineno;

	const TEXT_TYPE = 0;
	const EOF_TYPE = -1;
	const BLOCK_START_TYPE = 1;
	const VAR_START_TYPE = 2;
	const BLOCK_END_TYPE = 3;
	const VAR_END_TYPE = 4;
	const NAME_TYPE = 5;
	const NUMBER_TYPE = 6;
	const STRING_TYPE = 7;
	const OPERATOR_TYPE = 8;

	function __construct($type, $value, $lineno)	{
		$this->type = $type;
		$this->value = $value;
		$this->lineno = $lineno;
	}

	/**
	 * Test the current token for a type.  The first argument is the type
	 * of the token (if not given MF_Token::NAME_NAME), the second the
	 * value of the token (if not given value is not checked).
	 * the token value can be an array if multiple checks shoudl be
	 * performed.
	 */
	function test($type, $values=NULL){
		if (is_null($values) && !is_int($type)) {
			$values = $type;
			$type = self::NAME_TYPE;
		}
		return ($this->type === $type) && (
			is_null($values) ||
			(is_array($values) && in_array($this->value, $values)) ||
			$this->value == $values
		);
	}

	static function Text($value, $lineno){
		return new MF_Token(self::TEXT_TYPE, $value, $lineno);
	}

	static function EOF($lineno)	{
		return new MF_Token(self::EOF_TYPE, '', $lineno);
	}

	static function Name($value, $lineno){
		return new MF_Token(self::NAME_TYPE, $value, $lineno);
	}

	static function Number($value, $lineno){
		return new MF_Token(self::NUMBER_TYPE, $value, $lineno);
	}

	static function String($value, $lineno){
		return new MF_Token(self::STRING_TYPE, $value, $lineno);
	}

	static function Operator($value, $lineno){
		return new MF_Token(self::OPERATOR_TYPE, $value, $lineno);
	}
}
