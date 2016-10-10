<?php

define('MF_NEWLINE', '');
include MF_BASE . 'lexer.php';
include MF_BASE . 'parser.php';
include MF_BASE . 'ast.php';


function mf_compile($node, $fp=null){
	if (!is_null($fp))
		$compiler = new MF_FileCompiler($fp);
	else
		$compiler = new MF_StringCompiler();
	$node->compile($compiler);
	if (is_null($fp))
		return $compiler->getCode();
}


class MF_Compiler{
	function format($format, $arg = NULL){
		$this->raw(sprintf($format, $arg));
	}

	function string($value){
		$value = str_replace(array('\n','\t'), '', addcslashes($value, "\t'"));
		$value = str_replace(array('<bn>','<bt>'), array('\n','\t'), $value);
		$this->format("'%s'", $value);
	}

	function repr($value){
		if (is_int($value) || is_float($value))
			$this->raw($value);
		elseif (is_null($value))
			$this->raw('NULL');
		elseif (is_bool($value))
			$this->raw(value ? 'true' : 'false');
		elseif (is_array($value)) {
			$this->raw('array(');
			$i = 0;
			foreach ($value as $key => $value) {
				if ($i++)
					$this->raw(',');
				$this->repr($key);
				$this->raw('=>');
				$this->repr($value);	
			}
			$this->raw(')');
		}
		else
			$this->string($value);
	}

        // should use $c[\'::parent\']=$c; ?? may be copy memory
	function pushContext(){
		$this->raw('$c[\'::parent\']=&$c;' . MF_NEWLINE);
	}

	function popContext(){
		$this->raw('$c=$c[\'::parent\'];' . MF_NEWLINE);
	}

	function addDebugInfo($node)	{
		if(MF_NEWLINE) $this->raw("/* LINE:$node->lineno */" . MF_NEWLINE);
	}
}


class MF_FileCompiler extends MF_Compiler{
	private $fp;

	function __construct($fp){
		$this->fp = $fp;
	}

	function raw($string){
		fwrite($this->fp, $string);
	}
}


class MF_StringCompiler extends MF_Compiler{
	private $source;

	function __construct(){
		$this->source = '';
	}

	function raw($string){
		$this->source .= $string;
	}

	function getCode(){
		return $this->source;
	}
}
