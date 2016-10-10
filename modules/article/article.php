<?php

// +--------------------------------------------------------------------------+
// | Authors	: Tung, Nguyen Dam ; 		Tu, Pham Thanh                    |
// | Email		: mask_final@yahoo.com;		miss_all_old_friends@yahoo.com    | 								
// | Mobile		: (+84) 936 885 466;		(+84) 1214 149 420                |
// | Date		: 11/2011												      |
// | Website	: http://maskfinalphp.com									  |						
// +--------------------------------------------------------------------------+
// | Copyrights (C) 2011 by MASKFINAL                                         |
// | All rights reserved                                                      |
// +--------------------------------------------------------------------------+


abstract class ArticleController extends Controller{
    function process_custom_tag($html){
        $reg = '#<widget\s*([^>]+)\s*/?>|(</widget>)#';
        return preg_replace_callback($reg, function($match){
            if(isset($match[2]))
                return '</div>';
            preg_match_all('#([a-z_0-9A-Z]+)\s*=\s*"([^"]+)"#', $match[1], $attr);
            return '<div class="widget">' . 
                    call_user_func('self::custom_tag', array_combine($attr[1], $attr[2]));
        }, $html);
    }
}