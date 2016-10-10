<?php
function resize($img, $newFileName, $w = false, $h = false,$hook=null) {
	//Check if GD extension is loaded
	if (!extension_loaded('gd') && !extension_loaded('gd2')){
		trigger_error("GD is not loaded", E_USER_WARNING);
		return false;
	}
	
	//Get Image size info 
	$imgInfo = getimagesize($img);
	switch ($imgInfo[2]){
		case 1: $im = imagecreatefromgif($img); break;
		case 2: $im = imagecreatefromjpeg($img);  break;
		case 3: $im = imagecreatefrompng($img); break;
		default:  trigger_error('Unsupported filetype!', E_USER_WARNING);  break;
	}
	
	//Get new size
	if(($w != false) && ($h != false)){
		$nWidth		= $w;
		$nHeight 	= $h;
	}elseif($w == false){
		$nHeight 	= $h;
		$per 		= $imgInfo[1]/$nHeight;
		$nWidth		= $imgInfo[0]/$per;
	}else{
		$nWidth 	= $w;
		$per 		= $imgInfo[0]/$nWidth;
		$nHeight	= $imgInfo[1]/$per;
	}
		
	$nWidth = round($nWidth);
	$nHeight = round($nHeight);
	$newImg = imagecreatetruecolor($nWidth, $nHeight);

	/* Check if this image is PNG or GIF, then set if Transparent*/  
	if(($imgInfo[2] == 1) || ($imgInfo[2]==3)){
		imagealphablending($newImg, false);
		imagesavealpha($newImg,true);
		$transparent = imagecolorallocatealpha($newImg, 255, 255, 255, 127);
		imagefilledrectangle($newImg, 0, 0, $nWidth, $nHeight, $transparent);
	}
	imagecopyresampled($newImg, $im, 0, 0, 0, 0, $nWidth, $nHeight, $imgInfo[0], $imgInfo[1]);
	if($hook) $hook($newImg);
	//Generate the file, and rename it to $newFileName
	switch ($imgInfo[2]) {
		case 1: imagegif($newImg,$newFileName); break;
		case 2: imagejpeg($newImg,$newFileName);  break;
		case 3: imagepng($newImg,$newFileName); break;
		default:  trigger_error('Failed resize image!', E_USER_WARNING);  break;
	}
	return $newFileName;
}

