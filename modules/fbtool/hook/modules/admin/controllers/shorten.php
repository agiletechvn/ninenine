<?php

class ShortenController extends FBToolController {

    // override variable groups
    protected $groups = array('admin');
    protected $table = 'tbl_shorten_url';
    protected $index_column = 'id';
    protected $columns = array(null, 'link_url', 'link_title','account', 'image_url', 'link_description', 'shorten_url', 'id', 'domain');
    protected $searches = array(1, 2, 3); // index of $columns arrray
    protected $orders = array(1, 3); // which column allow to sort

    function index() {
        // custom breadcrumb button, should be placed in parent class
        $this->breadcrumb(t('Add shorten URL'))->load();
    }

    function all() {
        $output = $this->get_ouput();

        foreach ($output['aaData'] as &$v) {
            $v['shorten_url'] = ($v['domain'] ? 'http://' . $v['domain'] . '/' : SITE_ROOT) . str_replace('.x', '-' . $v['id'] . '.x', $v['shorten_url']);
        }
        $this->assign('output', $output)->load(false, 'ajax/list', true);
    }

    function add($id = null) {
        $domains = explode("\n", db_select_one('config', 'options', array('name' => 'shorten_domain'), true));
        $domains = array_map('trim', $domains);
        array_unshift($domains, "");
        $this->assign('domains', array_combine($domains, $domains));
        parent::add($id);
    }

    private function random_string() {
        $key1 = '0123456789';
        $key2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $url = '';
        for ($i = 0; $i < 11; $i++) {
            $url .= $i == 5 ? '-' : $key1[mt_rand(0, strlen($key1) - 1)];
        }
        $url .= '.x?i=';
        for ($i = 0; $i < 4; $i++) {
            $url .= $key2[mt_rand(0, strlen($key2) - 1)];
        }
        return $url;
    }

    function update() {

        $ret = array('error' => array());

        // mapping data
        $data = array(
            'link_url' => trim($_POST['link_url']),
            'account' => trim($_POST['account']),
            'alt_link_url' => trim($_POST['alt_link_url']),
            'image_url' => trim($_POST['image_url']),
            'link_title' => trim($_POST['link_title']),
            'domain' => trim($_POST['domain']),
            'link_description' => trim($_POST['link_description'])
        );

        if (!isset($_POST['id']) || !$_POST['id']) {
            $data['shorten_url'] = $this->random_string();
        }
        // get random shorten url

        if (empty($data['link_url']))
            $ret['error']['link_url'] = array('msg' => t('Link URL is empty'), 'type' => 'error');



        parent::update($data, $ret);
    }

}
