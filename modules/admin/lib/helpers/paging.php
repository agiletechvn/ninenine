<?php
// set default arguments
$link = $args['link'] . (strpos($args['link'], '?') ?  '&' : '?') . 'page=';
$page = $args['page'];
$total = $args['total'];
$rows_per_page = $args['rows_per_page'];
$numpages =ceil($total / $rows_per_page); 
$range = isset($pager['range']) ? $pager['range'] : 5;
$jump = isset($pager['jump']) ? $pager['jump'] : 2;
$distant = $range - $jump - 1;
$start_page = max(array($page + $distant > $numpages ? $numpages - $range + 1 : $page - $jump, 1)); 
if($numpages < 2) return;
// first	
$return = '<div class="wrap_paginate"><b>Phân trang cho table, tổng cộng '
			. $total.' dòng, '.$rows_per_page
			. ' dòng / trang</b><div class="dataTables_paginate paging_bootstrap pagination">'
			. '<ul><li><a href="' . $link . '1" class="item"><span>' . t('First') . '</span></a></li>';
// prev
if($page > $jump + 1 && $numpages > $range)
	$return .= '<li class="prev"><a href="' . $link . ($page-1) . '" class="item"><span>' . t('Prev') . '</span></a></li>';
// paging
for($i=$start_page; $i<= min($numpages, $start_page + $range - 1); $i++){
	$return .= '<li';
	if($i == $page) $return .= ' class="active"';
	$return .= '><a href="' . $link . $i . '">';
	$return .= '<span class="item">' . $i . '</span></a></li>';
}
// next
if($numpages > $range && $page < $numpages - $distant)
	$return .= '<li class="next"><a href="' . $link . ($page+1) . '" class="item"><span>' . t('Next') . '</span></a></li>';
// last
$return .= '<li><a href="' . $link . $numpages 
		. '" class="item"><span>' . t('Last') . '</span></a></li></ul></div></div>';
