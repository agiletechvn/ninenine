<?php

class MF_Exception extends Exception {}


/**
 * This exception is raised when the template engine is unable to
 * parse or lex a template.  Because the getFile() method and similar
 * methods are final we can't override them here but provide the real
 * filename and line number as public property.
 */
class MF_SyntaxError extends MF_Exception{
	public $lineno;
	public $filename;

	function __construct($message, $lineno, $filename=null){
		parent::__construct($message);
		$this->lineno = $lineno;
		$this->filename = $filename;
	}
}


/**
 * Thrown when MF encounters an exception at runtime in the Twig
 * core.
 */
class MF_RuntimeError extends MF_Exception{
	function __construct($message){
		parent::__construct($message);
	}
}


/**
 * Raised if the loader is unable to find a template.
 */
class MF_TemplateNotFound extends MF_Exception{
	public $name;

	function __construct($name){
		parent::__construct('Template not found: ' . $name);
		$this->name = $name;
	}
}
