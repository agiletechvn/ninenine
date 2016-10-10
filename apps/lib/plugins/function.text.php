<?php
function text_cut($text, $len, $symbol="..."){
	$str = trim($text);
	if(strlen($str) > $len) 
		$str = preg_replace('/\s\S*$/', $symbol, substr($str, 0, $len)) ; 
	return $str;
}

function text_convert_vn($text) {    
    return  
    	str_replace(array('â','ẩ','ẫ','ầ','ấ','ậ','ẳ','ẵ','ằ','ắ','ặ','ă','ả','ã','ã','à','à','á','á','ạ'),'a',
		str_replace(array('ể','ễ','ễ','ề','ế','ệ','ệ','ê','ẻ','ẽ','è','é','ẹ'),'e',
    	str_replace(array('ỉ','ĩ','ì','í','ị'),'i',
    	str_replace(array('ồ','ộ','ộ','ổ','ỗ','ố','ô','ờ','ờ','ớ','ở','ỡ','ợ','ơ','ỏ','õ','ò','ó','ọ'),'o',
     	str_replace(array('ử','ữ','ừ','ứ','ự','ự','ư','ủ','ũ','ù','ú','ụ'),'u', 
    	str_replace(array('ỷ','ỹ','ỳ','ý','ỵ'), 'y', 
    	str_replace('đ', 'd', trim(mb_strtolower($text,'UTF-8')))))))));        
}

function text_slug_vn($text){
	$text = preg_replace('/[^a-zA-Z0-9\s]/','',text_convert_vn($text));
	return rtrim(preg_replace('/[\s]+/', '-', $text), '-');
}

function text_bit($int){
    $format = '%0' . PHP_INT_SIZE . "b";
    return sprintf("b'$format'", $int);
    // insert b"00000001" is equal to insert 1 :D
}

