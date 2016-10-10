<?php

/**
 * Must have type to indentify
 * No need to put on controller class to improve performance
 * @param type $html
 * @param type $callback
 * @param type $tag
 * @return type
 */
function process_custom_tag($html, $callback, $tag='widget'){
    $reg = '#<'.$tag.'\s*([^>]+)\s*/?>|(</'.$tag.'>)#';
    // just like global declare but for anonymous, we use 'use' keyword
    return preg_replace_callback($reg, function($match) use($callback){
        // end tag, good way to store a static variable so we remember the previous call
        static $attr;
        if(isset($match[2]))
            return call_user_func($callback, $attr, true);
        preg_match_all('#([a-z_0-9A-Z]+)\s*=\s*"([^"]+)"#', $match[1], $attr);
        // open tag
        return call_user_func($callback, $attr = array_combine($attr[1], $attr[2]), false);
    }, $html);
}