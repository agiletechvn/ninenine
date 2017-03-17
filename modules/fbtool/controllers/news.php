<?php

/*
 * Copyright 2015 tupt.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class NewsController extends FBToolController {

    function index() {
        
    }

    function detail($id = 0) {
        if ($id) {
            $v = db_select_one('tbl_shorten_url', '*', array('id' => $id));
            $v['shorten_url'] = ($v['domain'] ? 'http://' . $v['domain'] . '/' : SITE_ROOT) . str_replace('.x', '-' . $v['id'] . '.x', $v['shorten_url']);
            $isMobile = isset($_GET['m']) || (preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|palm|phone|iphone|pie|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]));
            if ($isMobile) {
                $redirect = $v['alt_link_url'];
                if (substr($redirect, 0, 4) !== "http") {
                    $redirect = "http://" . $redirect;
                }
                header('Location: ' . $redirect);
            } else {

                header('Location: ' . $v['link_url']);
                return;
                // get response from get request
                include APP_PATH . 'lib/plugins/class.curlCrawler.php';
                $curl_crawler = new CURLCrawler();
                $resp = $curl_crawler->get($v['link_url']);
                $ret = $resp['content'];

                $ret = preg_replace('#<meta\s+property="og:url"\s+content="[^"]+">#', '<meta property="og:url" content="' . $v['shorten_url'] . '">', $ret);
                $ret = preg_replace('#<meta\s+property="og:type"\s+content="[^"]+">#', '<meta property="og:type" content="video.movie">' . "\n" . '<meta property="og:locale" content="en_US" />', $ret);                                

                $ret = preg_replace('#<meta\s+property="al:ios:app_name"\s+content="[^"]+">#','',$ret);
                $ret = preg_replace('#<meta\s+property="al:ios:app_store_id"\s+content="[^"]+">#','',$ret);
                $ret = preg_replace('#<meta\s+property="al:ios:url"\s+content="[^"]+">#','',$ret);
                $ret = preg_replace('#<meta\s+property="al:android:app_name"\s+content="[^"]+">#','',$ret);
                $ret = preg_replace('#<meta\s+property="al:android:package"\s+content="[^"]+">#','',$ret);
                $ret = preg_replace('#<meta\s+property="al:android:url"\s+content="[^"]+">#','',$ret);
                        
                if ($v['image_url']) {
                    list($width, $height) = getimagesize($v['image_url']);
                    if ($width && $height) {
                        $ret = preg_replace('#<meta\s+property="og:image"\s+content="[^"]+">#', '<meta property="og:image" content="' . $v['image_url'] . '">', $ret);
                        $ret = preg_replace('#<meta\s+property="og:image:width"\s+content="\d+">#', '<meta property="og:image:width" content="' . $width . '">', $ret);
                        $ret = preg_replace('#<meta\s+property="og:image:height"\s+content="\d+">#', '<meta property="og:image:height" content="' . $height . '">', $ret);
                    }
                    echo $ret;
                } else {
//                    header('Location: ' . $v['link_url']);
                    echo $ret;
                }

                //$resp = $curl_crawler->get($v['link_url']);
                //echo $resp['content'];
                // crawler then output
                // header('Location: ' . $v['link_url']);
                //$v['shorten_url'] = ($v['domain'] ? 'http://' . $v['domain'] . '/' : SITE_ROOT) . str_replace('.x', '-' . $v['id'] . '.x', $v['shorten_url']);
                //$this->assign($v)->load(false);
            }
        }
    }

    function test() {
        $ret = ' <meta property="og:site_name" content="Vimeo">
  <meta property="og:url" content="https://vimeo.com/59913414">
  <meta property="og:type" content="video">
  <meta property="og:title" content="sexy promo">
  <meta property="og:description" content="This is &quot;sexy promo&quot; by stikhomirov on Vimeo, the home for high quality videos and the people who love them.">
  <meta property="og:image" content="https://i.vimeocdn.com/video/416626535_1280x720.jpg">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:video:url" content="https://player.vimeo.com/video/59913414?autoplay=1">
  <meta property="og:video:secure_url" content="https://player.vimeo.com/video/59913414?autoplay=1">
  <meta property="og:video:type" content="text/html">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  <meta property="og:video:url" content="https://vimeo.com/moogaloop.swf?clip_id=59913414&amp;autoplay=1">
  <meta property="og:video:secure_url" content="https://vimeo.com/moogaloop.swf?clip_id=59913414&amp;autoplay=1">
  <meta property="og:video:type" content="application/x-shockwave-flash">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  <meta property="al:ios:app_name" content="Vimeo">
  <meta property="al:ios:app_store_id" content="425194759">
  <meta property="al:ios:url" content="vimeo://app.vimeo.com/videos/59913414">
  <meta property="al:android:app_name" content="Vimeo">
  <meta property="al:android:package" content="com.vimeo.android.videoapp">
  <meta property="al:android:url" content="vimeo://app.vimeo.com/videos/59913414">
  <meta property="al:web:should_fallback" content="true">
  <meta property="video:tag" content="girl">';

        $ret = preg_replace('#<meta\s+property="og:image"\s+content="[^"]+">#', '<meta property="og:image" content="hehe.jpg">', $ret);
        $ret = preg_replace('#<meta\s+property="og:image:width"\s+content="\d+">#', '<meta property="og:image:width" content="123">', $ret);
        $ret = preg_replace('#<meta\s+property="og:image:height"\s+content="\d+">#', '<meta property="og:image:height" content="123">', $ret);

        echo $ret;
    }

}
