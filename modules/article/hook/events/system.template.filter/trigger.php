<?php

function get_value(){
	$params = func_get_args();
	$a =  array_shift($params);
	return $a[implode('_', $params)];
}

$args['getvalue'] = 'get_value';