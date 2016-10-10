<?php

		
$args['#1'] = array(
	'title'     =>'Articles',
	'group'	=> array('admin'),
	'icon' => 'book',
	'children'	=> array(
		'/admin/article/section' => array(
			'title' => t('Section'),
			'icon' => 'list-ul',
			'desc' => t('Section')
		),
		'/admin/article/category' => array(
			'title' => t('Category'),
			'icon' => 'list',
			'desc' => t('Category')
		),
                '/admin/article/index' => array(
			'title' => t('Article'),
			'icon'  => 'book',
			'desc'  => t('Article')
		),
                '/admin/article/album' => array(
			'title' => t('Album'),
			'icon'  => 'film',
			'desc'  => t('Album')
		),
                '/admin/article/import' => array(
			'title' => t('Import'),
			'icon'  => 'download',
			'desc'  => t('Import')
		)
	)
);