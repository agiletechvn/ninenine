<?php
function article_link($img, $path){
	if(substr($img,0,4) === 'http')
		return $img;
	return $path . $img;
}

$args['articlelink'] = 'article_link';