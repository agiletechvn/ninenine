<?php

class IndexController extends AdminController {

    // for protected variables which is used in paginating, may be put them all in array option
    // override variable groups
    protected $groups = array('editor');
    protected $table = 'article';
    protected $index_column = 'id';
    protected $columns = array(null, "IF(thumb_link IS NULL OR thumb_link = '', img_link, thumb_link) AS img_link",
        //'title', 'description', 'author', 'hits', 'publish','section','category');
        'title', 'description', 'author', 'likes', 'hits', 'publish', 'secid');
    //protected $searches = array(2, 3); // index of $columns arrray
    protected $orders = array(2); // which column allow to sort
    protected $translations = array('title', 'description', 'content'); // which column need translate
    protected $file_fields = array('img');

    function add($id = null) {

        $sections = array();
        $list = db_query('select id, title from section');
        foreach ($list as $v)
            $sections[$v['id']] = array('title' => $v['title'], 'categories' => array());
        $list = db_query('select id, secid, title from category');
        foreach ($list as $v)
            $sections[$v['secid']]['categories'][] = $v;


        //print_r($sections);

        $this->assign(
                'sections', $sections, 'ui_map', array(
            'content' => array(
                'ckeditor',
                'data-language=' . LANGUAGE,
                'data-extra-plugins=album'
            ),
            'description' => 'autogrow'
                )
        );

        parent::add($id, array('publish' => 0));
    }

    function index() {
        
        $this->assign('sections', db_query('select id, title from section'))
                ->breadcrumb(t('Add new article'))
                ->load();
    }

    function all() {
        // why we put search option as protected variable (?)
        // Because other classes can get benefit from this, so we don't have to re-copy array option
        $this->searches = function($sSearch) {
            return "MATCH (description,title) AGAINST ('$sSearch')";
        };
        //$where = ($catid = @intval($_GET['catid'])) ? "catid = $catid" : "";
        if ($secid = @intval($_GET['secid']))
            $where = "secid = $secid";

        parent::all($where, 'id desc');
    }

    // for inline edit
    function edit($id) {
        $this->assign('edit_id', $id)->index();
    }

    // custom update when import data
    function update() {
        $ret = array('error' => array());
        $error_count = 0;
        $need_trans = false;
        if (isset($_FILES['img'])) {
            if ($id = intval(@$_POST['id'])) {
                $row = db_query_one("select img from {$this->table} where {$this->index_column} = $id limit 1");

                //Path
                $filepath = MEDIA_PATH . 'images' . DS . 'article' . DS;

                if ($row['img']) {
                    @unlink($filepath . $row['img']);
                }

                $image = $_FILES['img'];
                $imageName = basename($image['name']);

                if (!file_exists($filepath)) {
                    mkdir($filepath);
                }

                //Save file
                move_uploaded_file($image['tmp_name'], $filepath . $imageName);

                list($width, $height) = getimagesize($filepath . $imageName);

                db_excute("update {$this->table} set 
				    	img_link = 'media/images/article/$imageName'
			    		where {$this->index_column} = $id");
            }
        } else {

            // mapping data
            $data = array(
                'title' => trim($_POST['title']),
                'description' => trim($_POST['description']),
                'alias' => trim($_POST['alias']),
                'order' => intval($_POST['order']),
                'catid' => intval($_POST['catid']),
                'tag' => trim($_POST['tag']),
                'publish' => $_POST['publish'],
                'content' => trim($_POST['content'])
            );

            // check error
            if (empty($data['title']))
                $ret['error']['title'] = array('msg' => t('Tên bài viết rỗng'), 'type' => 'error');


            if (($error_count = $this->get_error_count($ret)) > 0) {
                $ret['msg'] = $this->msg('Cập nhật nội dung thất bại', 'Dữ liệu nhập ko đúng', array('return' => true, 'type' => 'error'));
            } else {

                // need translate
                $need_trans = true;

                // process import
                $import = intval($_POST['import']);

                if ($import == 1) {
                    include APP_PATH . 'lib' . DS . 'plugins' . DS . 'FastImage.php';
                    // import thumbnail
                    $url = $_POST['img_import'];
                    if ($url) {
                        //fastest way to check image is valid
                        $image = new FastImage($url);
                        if ($size = $image->getSize()) {
                            $parsed = parse_url($url);
                            if (isset($parsed['scheme'])) {
                                $img_import_name = substr($parsed['path'], strrpos($parsed['path'], '/') + 1);
                                $img_import_path = MEDIA_PATH . 'images' . DS . 'article' . DS . $img_import_name;
                                file_put_contents($img_import_path, file_get_contents($url));

                                $data['img_link'] = 'media/images/article/' . $img_import_name;
                            }
                            list($data['width'], $data['height']) = $size;
                        }
                    }
                    // config for content;
                    include APP_PATH . 'lib' . DS . 'plugins' . DS . 'simple_html_dom.php';
                    $html = str_get_html($data['content']);
                    foreach ($html->find('img') as $img_element) {
                        $url = $img_element->src;
                        $parsed = parse_url($url);
                        if (isset($parsed['scheme'])) {
                            $img_import_name_temp = substr($parsed['path'], strrpos($parsed['path'], '/') + 1);
                            $img_import_path = MEDIA_PATH . 'images' . DS . 'article' . DS . $img_import_name_temp;
                            file_put_contents($img_import_path, file_get_contents($url));
                            $img_element->src = SITE_ROOT . 'media/images/article/' . $img_import_name_temp;
                        }
                    }
                    $ret['imported'] = $data['content'] = (string) $html;
                }

                // update category
                $cat = db_query_one('select title, secid, section from category where id = ' . $data['catid'] . ' limit 1');

                if ($cat) {
                    $data['category'] = $cat['title'];
                    $data['secid'] = $cat['secid'];
                    $data['section'] = $cat['section'];
                }


                include_once APP_PATH . 'lib' . DS . 'plugins' . DS . 'function.text.php';
                $tag_slug = text_convert_vn($data['tag']);
                // The FULLTEXT parser determines where words start and end by looking for certain delimiter 
                // characters; for example, “ ” (space), “,” (comma), and “.” (period)
                // force fulltext to search by delimeter, therefore we have fulltext works like array of btree
                $data['tag_slug'] = preg_replace('/[ ]+/', '-', $tag_slug);
                // update for tag table
                $tags = explode(',', $data['tag']);
                $tag_slugs = explode(',', $data['tag_slug']);
                for ($i = 0, $len = count($tag_slugs); $i < $len;  ++$i) {
                    $tag_id = trim($tag_slugs[$i]);
                    // update tag only when tag is more than 3 chars
                    if (strlen($tag_id) > 3) {
                        $tag_title = trim($tags[$i]);
                        db_excute("INSERT INTO tags (slug, title)  
								VALUES ('$tag_id', '$tag_title')
	  							ON DUPLICATE KEY UPDATE title='$tag_title'");
                    }
                }

                // check wherether insert or update
                if (isset($_POST['id']) && ($id = intval($_POST['id']))) {

                    // update image_name by title?

                    db_update($this->table, $data, $this->index_column . " = '$id'");
                } else {
                    $data['modified'] = date('y-m-d h:i:s');
                    $data['author'] = $this->user['name'];
                    db_insert($this->table, $data);
                    $ret['id'] = $id = db_insert_id();
                }
            }
        }

        if ($error_count == 0) {
            if ($msg = db_error())
                $ret['msg'] = $this->msg('Cập nhật nội dung thất bại', $msg, array('return' => true, 'type' => 'error'));
            else {
                $ret['msg'] = $this->msg('', 'Cập nhật nội dung thành công', array('return' => true));
                if ($need_trans)
                // update translate when update content, not image
                    $this->update_trans($id);
            }
        }

        $this->json($ret);
    }

    function update_status($id) {
        parent::update_status($id, array('publish' => $_POST['publish']));
    }

    private function fix_url($parsed_url, $url) {
        // must use false to avoid 0 position matching
        if (strpos($url, 'http://') !== false)
            return $url;
        else if ($url[0] == '/')
            return $parsed_url['scheme'] . '://' . $parsed_url['host'] . $url;
        else {
            $abs_url = preg_replace('/(?=\/)[^\/]+$/', '', $parsed_url['path']);
            return $parsed_url['scheme'] . '://' . $parsed_url['host'] . $abs_url . $url;
        }
    }

    function import() {
        $ret = array();
        $link_import = $_POST['link_import'];
        $parse = parse_url($link_import);
        $type_import = str_replace('www.', '', $parse['host']);
        $sel_import = db_query_one("select title, img, description, content from article_import 
						where domain ='$type_import' limit 1");

        if ($sel_import) {

            include APP_PATH . 'lib' . DS . 'plugins' . DS . 'simple_html_dom.php';

            $html = file_get_html($link_import);

            foreach ($html->find('script') as $node) {
                $node->outertext = '';
            }

            $article = array();
            $title_elements = $html->find($sel_import['title']);
            if (isset($title_elements[0]))
                $article['title'] = trim($title_elements[0]->plaintext);

            $img_elements = $html->find($sel_import['img']);
            if (isset($img_elements[0]))
                $article['img'] = @$this->fix_url($parse, $img_elements[0]->src);

            $description_elements = $html->find($sel_import['description']);
            if (isset($description_elements[0]))
                $article['description'] = trim($description_elements[0]->plaintext);

            $content_elements = $html->find($sel_import['content']);
            foreach ($content_elements[0]->find('img') as $img_node)
                $img_node->src = $this->fix_url($parse, $img_node->src);

            $article['content'] = @trim($content_elements[0]->innertext);

            $ret['type'] = 'success';
            $ret['data'] = $article;
        } else {
            $ret['type'] = 'error';
            $ret['msg'] = t('Bạn chưa cấu hình nguồn nhập. Hãy vào đây để thêm cấu hình')
                    . '<br/><a class="btn" href="' . LANGUAGE . '/admin/article/import"><i class="icon-cog"></i> Settings</a>';
        }
        $this->json($ret);
    }

}
