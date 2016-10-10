<?php

$args ['#01'] = array(
    'title' => t('System Panel'),
    'class' => 'system',
    'group' => array(
        'admin'
    ),
    'icon' => 'cog',
    'url' => '/admin/index',
    'children' => array(
        '/admin/user' => array(
            'title' => t('System Users'),
            'icon' => 'briefcase',
            'desc' => t('System Users'),
        ),
        '/admin/config' => array(
            'title' => t('System Config'),
            'icon' => 'cog',
            'desc' => t('System config'),
        ),
        '/admin/menu' => array(
            'title' => t('Menu Management'),
            'icon' => 'sitemap',
            'desc' => t('Menu Management')
        ),
        '/admin/media' => array(
            'title' => t('Media Management'),
            'desc' => t('Media Management')
        )
    )
);

$args['#0'] = array(
    'title' => t('FFlives'),
    'icon' => 'facetime-video',
    'group' => array('admin'),
    'children' => array(
        '/admin/fflives/product' => array(
            'title' => t('Product'),
            'icon' => 'bar-chart',
            'desc' => t('Product List')
        ),
       '/admin/fflives/embellishment' => array(
            'title' => t('Embellishment'),            
            'desc' => t('Embellishment')
        ),
        '/admin/fflives/creation_cat' => array(
            'title' => t('Creation Category'),            
            'desc' => t('Creation Category')
        ),
    )
);


    





		

