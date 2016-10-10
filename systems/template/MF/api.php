<?php

// we use super global to help the system load on demand
$GLOBALS['mf_current_template'] = NULL;

/**
 * Load the compiler system.  Call this before you access the
 * compiler!
 */
function mf_load_compiler(){
	include_once MF_BASE . '/compiler.php';
}

function mf_get_current_template(){
	return $GLOBALS['mf_current_template'];
}


/**
 * This class wraps a template instance as returned by the compiler and
 * is usually constructed from the `MF_Loader`.
 */
class MF_Template{
	private $instance;
	public $loader;

	function __construct($instance, $loader){
		$this->instance = $instance;
		$this->loader = $loader;
	}

	/**
	 * Render the template with the given context and return it
	 * as string.
	 */
	function render($c=null, $return = true){		
		ob_start();		
		$this->display($c);		
		return $return ? ob_get_clean() : ob_end_clean();
	}

	/**
	 * Works like `render()` but prints the output.
	 */
	function display($c=array()){
		$old = $GLOBALS['mf_current_template'];
		$GLOBALS['mf_current_template'] = $this;
		$this->instance->render($c, false);
		$GLOBALS['mf_current_template'] = $old;
	}
}

/**
 * Class for custom loaders.  Subclasses have to provide a
 * getFilename method.
 */
class MF_Loader{
	public $cache;

	function __construct($cache=null)	{
		$this->cache = $cache;
	}
	
	// we use '/' to make sure the cache files run on every operating systems
	function getFilename($name){
		return SITE_PATH . $name;
	}

	function getTemplate($name){            
            $abs_path = abs_path(defined('HOOK_PATH') ? (HOOK_PATH . 'views' . DS) : VIEW_PATH);
            // for sure, we verify abs_path once more time, may be for assign value that can't be
            // check at build time, so check at runtime
            $cls = $this->requireTemplate($name[0] === '~' // current view path (in hook path processing)
                    ? $abs_path . substr($name, 2)
                    : (($test = substr($name,0,6)) === 'module' || $test === 'apps/v' 
                            ? $name 
                            : $abs_path . $name));
           
            return new MF_Template(new $cls, $this);
	}
	
	// get cache name by language
	function getCacheFilename($name)	{
		return $this->cache . DS . LANGUAGE . '_' . tpl_hash($name) . '.php';
	}

	function requireTemplate($name){
		$cls = '__MFTemplate_' . tpl_hash($name);
		if (!class_exists($cls)) {
			if (is_null($this->cache)) {
				$this->evalTemplate($name);
				return $cls;
			}
			$fn = $this->getFilename($name);
                   
			if (!file_exists($fn))
				throw new MF_TemplateNotFound($name);
			$cache_fn = $this->getCacheFilename($name);
			if (@$GLOBALS['compile_template'] || !file_exists($cache_fn) ||
			    filemtime($cache_fn) < filemtime($fn)) {
				mf_load_compiler();
				$fp = @fopen($cache_fn, 'wb');
				if (!$fp) {
					$this->evalTemplate($name, $fn);
					return $cls;
				}
				$this->compileTemplate($name, new MF_FileCompiler($fp), $fn);
				fclose($fp);
			}
			include $cache_fn;
		}
		return $cls;
	}

	function compileTemplate($name, $compiler=null, $fn=null){
		mf_load_compiler();
		if (is_null($compiler)) {
			$compiler = new MF_StringCompiler();
			$returnCode = true;
		}
		else
			$returnCode = false;
		if (is_null($fn))
			$fn = $this->getFilename($name);

		mf_parse(file_get_contents($fn, $name), $name)->compile($compiler);
		if ($returnCode)
			return $compiler->getCode();
	}

	private function evalTemplate($name, $fn=null){
		$code = $this->compileTemplate($name, null, $fn);
		eval('?>' . $code);
	}
}

