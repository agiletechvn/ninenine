<?php
// FCK Editor
include(THEME_PATH . 'administrator' . DS . 'fckeditor' . DS . 'fckeditor.php');	

$return = array();
foreach($args as $k => $v){
	$oFCKeditor = new FCKeditor($k) ; 
	$oFCKeditor->BasePath = SITE_ROOT . 'themes/administrator/fckeditor/';
	$oFCKeditor->Config['AutoDetectLanguage'] = false ;
	$oFCKeditor->Config['DefaultLanguage']	= LANGUAGE;
	$oFCKeditor->Config['SkinPath'] 		= $oFCKeditor->BasePath . 'editor/skins/office2003/';
	$oFCKeditor->Value 						= $v;
	$oFCKeditor->Height 					= 400;
	$oFCKeditor->Width 						= '90%';
	$return[$k] = $oFCKeditor->CreateHtml() ;	
}

	