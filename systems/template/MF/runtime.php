<?php

$GLOBALS['mf_filters'] = array(
    // formatting filters
    'date' => 'mf_date_format_filter',
    'numberformat' => 'number_format',
    'moneyformat' => 'money_format',
    'filesizeformat' => 'mf_filesize_format_filter',
    'format' => 'mf_format',
    // numbers
    'even' => 'mf_is_even_filter',
    'odd' => 'mf_is_odd_filter',
    // escaping and encoding
    'escape' => 'mf_htmlspecialchars',
    'e' => 'mf_htmlspecialchars',
    'urlencode' => 'mf_urlencode_filter',
    // string filters
    'title' => 'mf_title_string_filter',
    'capitalize' => 'mf_capitalize_string_filter',
    'upper' => 'strtoupper',
    'lower' => 'strtolower',
    'strip' => 'trim',
    'rstrip' => 'rtrim',
    'lstrip' => 'ltrim',
    // array helpers
    'join' => 'mf_join_filter',
    'reverse' => 'array_reverse',
    'length' => 'count',
    'count' => 'count',
    // iteration and runtime
    'default' => 'mf_default_filter',
    'keys' => 'array_keys',
    'items' => 'mf_get_array_items_filter',
    // translate and strip tag
    't' => 't',
    's' => 'mf_strip_tags',
    // for system variable, you have to assign from controller, don't access it directly 
    // system function 
    'php' => 'mf_php'
);

class MF_LoopContextIterator implements Iterator {

    public $c;
    public $seq;
    public $idx;
    public $length;
    public $parent;

    function __construct(&$c, $seq, $parent) {
        $this->c = $c;
        $this->seq = $seq;
        $this->idx = 0;
        $this->length = count($seq);
        $this->parent = $parent;
    }

    function rewind() {
        
    }

    function key() {
        
    }

    function valid() {
        return $this->idx < $this->length;
    }

    function next() {
        $this->idx++;
    }

    function current() {
        return $this;
    }

}

function mf_missing_filter($name) {
    //print_r($GLOBALS['mf_filters']);
    throw new MF_RuntimeError("filter '$name' does not exist.");
}

function mf_get_attribute($obj, $item) {
    if (is_array($obj))
        return @$obj[$item];
    elseif (is_object($obj)) {
        if (method_exists($obj, $item))
            return call_user_func(array($obj, $item));
        if (property_exists($obj, $item)) {
            $tmp = get_object_vars($obj);
            return $tmp[$item];
        }
        if (method_exists($obj, $method = 'get' . ucfirst($item)))
            return call_user_func(array($obj, $method));
    }
    return NULL;
}

function mf_iterate(&$c, $seq) {
    $parent = isset($c['loop']) ? $c['loop'] : null;
    $seq = mf_make_array($seq);
    $c['loop'] = array('parent' => $parent, 'iterated' => false);
    return new MF_LoopContextIterator($c, $seq, $parent);
}

function mf_set_loop_context(&$c, $iterator, $target) {
    $c[$target] = $iterator->seq[$iterator->idx];
    $c['loop'] = mf_make_loop_context($iterator);
}

function mf_set_loop_context_multitarget(&$c, $iterator, $targets) {
    $values = $iterator->seq[$iterator->idx];
    if (!is_array($values))
        $values = array($values);
    $idx = 0;
    foreach ($values as $value) {
        if (!isset($targets[$idx]))
            break;
        $c[$targets[$idx++]] = $value;
    }
    $c['loop'] = mf_make_loop_context($iterator);
}

function mf_make_loop_context($iterator) {
    return array(
        'parent' => $iterator->parent,
        'length' => $iterator->length,
        'index0' => $iterator->idx,
        'index' => $iterator->idx + 1,
        'revindex0' => $iterator->length - $iterator->idx - 1,
        'revindex' => $iterator->length - $iterator->idx,
        'first' => $iterator->idx == 0,
        'last' => $iterator->idx == $iterator->length - 1,
        'iterated' => true
    );
}

function mf_make_array($object) {
    if (is_array($object))
        return array_values($object);
    elseif (is_object($object)) {
        $result = array();
        foreach ($object as $value)
            $result[] = $value;
        return $result;
    }
    return array();
}

function mf_date_format_filter($timestamp, $format = 'd/m/Y') {
    return date($format, is_string($timestamp) ? strtotime($timestamp) : $timestamp);
}

function mf_urlencode_filter($url, $raw = false) {
    return $raw ? rawurlencode($url) : urlencode($url);
}

function mf_join_filter($value, $glue = '') {
    return implode($glue, $value);
}

function mf_default_filter($value, $default = '') {
    return is_null($value) ? $default : $value;
}

function mf_get_array_items_filter($array) {
    $result = array();
    foreach ($array as $key => $value)
        $result[] = array($key, $value);
    return $result;
}

function mf_filesize_format_filter($value) {
    $value = max(0, (int) $value);
    $places = strlen($value);
    if ($places <= 9 && $places >= 7) {
        $value = number_format($value / 1048576, 1);
        return "$value MB";
    }
    if ($places >= 10) {
        $value = number_format($value / 1073741824, 1);
        return "$value GB";
    }
    $value = number_format($value / 1024, 1);
    return "$value KB";
}

function mf_is_even_filter($value) {
    return $value % 2 == 0;
}

function mf_is_odd_filter($value) {
    return $value % 2 == 1;
}

function mf_format($value, $format) {
    return sprintf($format, $value);
}

function mf_htmlspecialchars($value, $allow_tags = null) {
    $value = htmlspecialchars($value);
    if ($allow_tags)
        $value = preg_replace('#&lt;(/?(?:' . $allow_tags . '))&gt;#', '<\1>', $value);
    return $value;
}

/**
 * No need to check for speed, because this function is vital to website, and it is as fast as strip_tags
 * Beside, it could be faster than htmlspecialchars function, with smaller result of string
 * @param type $value
 * @param type $allow_tags
 * @return type
 */
function mf_strip_tags($value, $allow_tags = null) {
    if ($allow_tags) {
        $tag_list = explode('|', $allow_tags);
        $tags = array();
        foreach ($tag_list as $v) {
            $v = trim($v);
            $kp = explode('[', $v, 2);
            if (isset($kp[1])) {
                $attrs = explode(',', rtrim($kp[1], ']'));
                foreach ($attrs as &$attr) 
                    $attr = trim($attr);                
            } else 
                $attrs = false; // smaller than array
            
            $tags[$kp[0]] = $attrs;
        }

        $value = preg_replace_callback('#</?(\w+)\s*([^>]*)\s*>#', function($m) use($tags) {
            if (isset($tags[$m[1]])) {
                $value = '<' . $m[1];
                $attrs = $tags[$m[1]];
                if ($m[2]) {
                    $attr_value = trim(preg_replace_callback('#([\w\d_]+)\s*=\s*([\'"])(?:.*?)\2#', function($m) use ($attrs) {
                        if ($attrs && in_array($m[1], $attrs)) 
                            return $m[0];                                
                        return '';
                    }, $m[2]));
                    // default close tag should not be seperated by space
                    if ($attr_value) 
                        $value .= $attr_value[0] === '/' ? '/' : ' ' . $attr_value;                    
                }
                $value .= '>';
                return $value;
            }
            // remove empty
            return '';
        }, $value);
        
        return $value;
    }
    // default strip_tags function
    return strip_tags($value);
}

// add multibyte extensions if possible
if (function_exists('mb_get_info')) {

    function mf_upper_filter($string) {
        return mb_strtoupper($string, CHARSET);
    }

    function mf_lower_filter($string) {
        return mb_strtolower($string, CHARSET);
    }

    function mf_title_string_filter($string) {
        return mb_convert_case($string, MB_CASE_TITLE, CHARSET);
    }

    function mf_capitalize_string_filter($string) {
        return mb_strtoupper(mb_substr($string, 0, 1, CHARSET)) .
                mb_strtolower(mb_substr($string, 1, null, CHARSET));
    }

    // override the builtins
    $GLOBALS['mf_filters']['upper'] = 'mf_upper_filter';
    $GLOBALS['mf_filters']['lower'] = 'mf_lower_filter';
}

// and byte fallback
else {

    function mf_title_string_filter($string) {
        return ucwords(strtolower($string));
    }

    function mf_capitalize_string_filter($string) {
        return ucfirst(strtolower($string));
    }

}

// callback to system php function
function mf_php() {
    $args = func_get_args();
    // first param is value
    $value = array_shift($args);
    // the second is function name
    $func = array_shift($args);
    // put value as first param for function
    array_unshift($args, $value);
    // pass param to php function
    return call_user_func_array($func, $args);
}

// we force this to make user save their memory
trigger('system.template.filter', $GLOBALS['mf_filters'], false);
