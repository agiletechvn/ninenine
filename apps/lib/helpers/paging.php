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

// first
$return = '<span class="pull-right">Page ' . $page . ' of ' . $numpages .
        '</span><ul class="pagination pull-left">';

// prev
if($page > $jump + 1 && $numpages > $range)
	$return .= '<li><a href="' . $link . ($page-1) . '">&laquo;</a></li>';

// paging, not all same type
for($i=$start_page; $i<= $stop_page; $i++)
		$return .= $i == $page 
                    ? '<li class="active"><a href="javascript:void(0)">' . $i . '</a></li>'
                    : '<li><a href="' . $link . $i . '" title="'.$i.'">'.$i.'</a></li>';
// next
if($numpages > $range && $page < $numpages - $distant)
	$return .= '<li><a href="' . $link . ($page+1) . '">&raquo;</a></li>';
	
// last
$return .= '</ul>';
