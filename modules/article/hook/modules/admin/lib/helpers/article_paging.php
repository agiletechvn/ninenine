<?php
// set default arguments
$page = $args['page'];
$numpages = $args['numpages']; 
$return = '<select id="article_pager">';
for ($i = 1; $i <= $numpages; $i++){ 
  $return .= '<option value="' . $i . '"';
  if($i == $page)
  	$return .= ' selected = "selected"';
  $return .= ">Page $i</option>";              
}          
$return .= '</select>';
