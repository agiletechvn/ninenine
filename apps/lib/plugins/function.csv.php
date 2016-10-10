<?php
function csv2array($file){
    $lines = file($file);
    $csv = array();
    $ch0 = chr(0);

    $csv['cols'] = str_getcsv(str_replace($ch0,'',  array_shift($lines)));
    foreach($lines as $line)
        if($line = str_replace($ch0,'',$line))
            $csv['rows'][] = str_getcsv(str_replace($ch0,'',$line));
    return $csv;
}


