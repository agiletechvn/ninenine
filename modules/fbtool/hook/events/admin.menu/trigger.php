<?php

$args ['#0'] = array(
    'title' => 'System Panel',
    'group' => array(
        'admin'
    ),
    'icon' => 'cog',
    'url' => '/admin/index',
    'children' => array(
        '/admin/user' => array(
            'title' => 'System Users',
            'icon' => 'briefcase',
            'desc' => 'System Users',
            'group' => array(
                'admin'
            )
        ),
        '/admin/config' => array(
            'title' => 'System Config',
            'icon' => 'cog',
            'desc' => 'System config',
            'group' => array(
                'admin'
            )
        ),
        '/admin/fbtool/customer' => array(
            'title' => 'Customers',
            'icon' => 'user',
            'desc' => 'Customer Management'
        ),
        '/admin/fbtool/shorten' => array(
            'title' => 'Shorten URL',
            'icon' => 'link',
            'desc' => 'Shorten URL'
        ),
        '/admin/fbtool/image' => array(
            'title' => t('Image Management'),
            'icon' => 'picture',
            'desc' => t('Image Management')
        ),
        '/admin/fbtool/ssh' => array(
            'title' => 'SSH Clicked URL',
            'icon' => 'link',
            'desc' => 'SSH Clicked URL'
        )
    )
);



if ($_SESSION['user']['group'] == 'fbtool') {
    $args ['#01'] = array(
        'title' => 'Facebook Panel',
        'group' => array(
            'fbtool'
        ),
        'icon' => 'qrcode',
        'url' => '/admin/fbtool/campaign',
        'children' => array(
            '/admin/fbtool/facebookcampaign' => array(
                'title' => 'Facebook Campaign',
                'icon' => 'hospital',
                'desc' => 'Facebook Campaign'
            ),
            '/admin/fbtool/facebookgroup' => array(
                'title' => 'Facebook Group',
                'icon' => 'list',
                'desc' => 'Facebook Group'
            ),
            '/admin/fbtool/facebookgroup_cat' => array(
                'title' => 'Facebook Group Category',
                'icon' => 'list-ul',
                'desc' => 'Facebook Group Category'
            ),
            '/admin/fbtool/post' => array(
                'title' => 'Facebook Post',
                'icon' => 'book',
                'desc' => 'Facebook Post'
            )
        )
    );
}


