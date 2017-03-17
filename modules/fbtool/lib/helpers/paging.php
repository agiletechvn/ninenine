<?php
// set default arguments
$link = $args['link'] . (strpos($args['link'], '?') ?  '&' : '?') . 'page=';
$page = isset($args['page']) ? $args['page'] : (isset($_GET['page']) ? +$_GET['page'] : 1);
$numpages = $args['numpages']; 
$range = isset($args['range']) ? $args['range'] : 5;
$jump = isset($args['jump']) ? $args['jump'] : 2;
$distant = $range - $jump - 1;
$start_page = max(array($page + $distant > $numpages ? $numpages - $range + 1 : $page - $jump, 1)); 
$stop_page = min($numpages, $start_page + $range - 1);
if($numpages < 2) return;

$total = $args['total'];

// first
$return = '<div class="wp-pagenavi"><span class="pages">Trang 1 đến trang ' . $numpages .
        ', tổng số dòng '.$total.'.</span>';

$return .= '<a class="label label-default" rel="prev" href="' . $link .  '1">first</a>';

// prev
if($page > $jump + 1 && $numpages > $range)
	$return .= '<a class="previouspostslink label label-default" rel="prev" href="' . $link . ($page-1) . '">«</a>';

// paging, not all same type
for($i=$start_page; $i<= $stop_page; $i++)
		$return .= $i == $page 
                    ? '<span class="current label label-info">'.$i.'</span>'
                    : '<a class="page larger label label-default" href="' . $link . $i . '">'.$i.'</a>';
// next
if($numpages > $range && $page < $numpages - $distant)
	$return .= '<a class="nextpostslink label label-default" rel="next" href="' . $link . ($page+1) . '">»</a>';

$return .= '<a class="label label-default" rel="prev" href="' . $link . $numpages . '">last</a>';
	
// last
$return .= '</ul></div>';
