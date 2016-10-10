<?php

if(($len = strlen($args[0])) > 13) 
	$args = array('article', 'index', 'detail', substr($args[0], $len - 13));
	