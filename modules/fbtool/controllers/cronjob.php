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

class CronJobController extends FBToolController {

    function __construct() {
        if (isset($_SERVER['HTTP_HOST'])) {
            die;
        }
        parent::__construct();
    }

    // ecomotions
    private $ecomotions = array(":)", ":(", ":P", "=D", ":o", ";)", "8-)", "B|", ">:(", ":/", ":'(", "O:)", ":*", "^_^", "-_-", "o.O", "O.o", ":3", ">:o", ":v", ":poop:", ":|]", "3:)", ":putnam:", "<3");

    function autopost() {
        // init facebook
        require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
        $fb = new Facebook(array('fileUpload' => false));
        // get time
        $timestamp = time(); // + 20*3600;
        $campaigns = db_select('tbl_facebook_campaign', array('id', 'post_interval', 'post_ids'), array('status' => 0, 'publish' => 1, 'timestamp <= ' . $timestamp));

        foreach ($campaigns as $campaign) {

            // get interval, not exceed 10 seconds
            $post_delay = min(array(MAX_POST_DELAY, +$campaign['post_interval']));

            // set campaign as online
            db_update('tbl_facebook_campaign', array('status' => 1), array('id' => $campaign['id']));

            $post_ids = explode(',', $campaign['post_ids']);

            // get all posts belong to campaign
            $posts = db_select('tbl_facebook_posts', array('*'), array('id' => $post_ids, 'publish' => 1));

            // # loop all posts
            foreach ($posts as $post) {
                // prepare data, before each post, check publish again incase user stop campaign immediately, when it online
                // user can't change datetime or anything but publish
                $campaign_publish = db_select_one('tbl_facebook_campaign', 'publish', array('id' => $campaign['id']), true);
                // if campaign is not publish, continue to other campaign
                if (!$campaign_publish)
                    continue 2;
                // set post to online
                db_update('tbl_facebook_posts', array('online' => 1), array('id' => $post['id']));
                $post_data = $this->get_postdata($post);
                // now we get all the group to post
                $group_cat_ids = explode(',', $post['group_cat_ids']);
                $list_group_ids = db_select('tbl_facebook_group_cat', 'group_ids', array('publish' => 1, 'id' => $group_cat_ids), true);
                $list_group_ids = array_unique(explode(',', implode(',', $list_group_ids)));
                // get group that access token is not expired
                $list_group = db_select('tbl_facebook_groups', array('*'), array('publish' => 1, 'token_expired' => 0, 'id' => $list_group_ids));
                // # loop all groups
                foreach ($list_group as $facebook_group) {
                    // update for this group by copy array
                    $post_data_params = $post_data;
                    $post_data_params['to'] = $facebook_group['fb_id'];
                    $post_data_params['access_token'] = $facebook_group['access_token'];
                    // random message
                    if (isset($post_data_params['message'])) {
                        $ecomotions_str = $this->replace_ecomotions();
                        $post_data_params['message'] = str_replace('[r]', $ecomotions_str, $post_data_params['message']);
                        //$post_data_params['message'] = preg_replace_callback('/\[r\]/i', array($this, 'replace_ecomotions'), $post_data_params['message']);
                    }
                    try {
                        $ret = $fb->api('/' . $facebook_group['fb_id'] . '/feed', 'POST', $post_data_params);
                        //$ret = json_encode($post_data_params, JSON_PRETTY_PRINT);
                        echo 'Successfully posted to Facebook';
                        // need update result to campaign, as list of post including title and link?
                        print_r($ret);
                        echo "\n";
                        // sleep to next post
                        usleep($post_delay);
                    } catch (Exception $e) {
                        db_update('tbl_facebook_groups', array('token_expired' => 1), array('id' => $facebook_group['id']));
                        echo $e->getMessage();
                        echo "\n";
                    }
                }
                // # end loop all groups
                // set post to offline, in the mean while, may be other cronjob set it to online, but it is already run
                // so it is still able to update for the next cronjob
                db_update('tbl_facebook_posts', array('online' => 0), array('id' => $post['id']));

                // # end loop posts
            }
            // set campaign status to finish
            db_update('tbl_facebook_campaign', array('status' => 2), array('id' => $campaign['id']));
        }
    }

    // this is for user :D, by repeat each 10 second, so there are not so many jobs left
    function user_autopost() {
        // init facebook
        require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
        $fb = new Facebook(array('fileUpload' => false));

        // get all cronjob that is waiting to run: publish = 1, and not yet finish(may be running, or not run)
        $jobs = db_select('tbl_autopost_cronjob', array('id', 'user_id', 'data', 'result_data', 'running', 'runat', 'stopat'), array('finish != 2', 'publish' => 1));

        // each time do a post, should check status of job again, to make it realtime
        foreach ($jobs as $job) {

            // check the range, if it is out of the range, finish it
            $timestamp = time(); // + 20*3600;
            if ($timestamp < +$job['runat']) {
                // not run yet
                continue;
            }



//            if($timestamp > +$job['stopat']){
//                // finish then
//                db_update('tbl_autopost_cronjob', array('finish' => 2), array('id' => $job['id']));
//                continue;
//            }
            // if cronjob is running then break;
            // else re run it :D
            if ($job['running']) {
                continue;
            }

            $data = json_decode($job['data'], true);
            $result_data = json_decode($job['result_data'], true);
            $total_group_number = count($data['groups']);
            $current_group_number = count($result_data);
            if ($current_group_number === 0) {
                $current_group_number = 1;
            }
            // get interval, not exceed 30 seconds
            $post_delay = min(array(30, +$data['send_interval']));
            //$post_delay = 1; // fake
            // set cronjob to running status
            db_update('tbl_autopost_cronjob', array('finish' => 1, 'running' => 1), array('id' => $job['id']));

            // should get access token from user, in case of invalid token
//            $access_token = db_select_one('tbl_autopost_user', 'access_token', array('user_id' => $job['user_id']));
//            if (!$access_token) {
//                $access_token = $data['access_token'];
//            }

            $access_token = $data['access_token'];

            // we extract random link :v
            $link_urls = explode("\n", $data['link_url']);

            $total_link_number = count($link_urls);


            $post = array(
                'message' => $data['message'],
                //'link' => $data['link'],
//                'picture' => $data['picture_url'],
//                'name' => $data['link_title'],
//                'caption' => $data['link_caption'],
//                'description' => $data['link_description'],
                'type' => 5 // link
            );

            // # loop all groups, just begin at the current group
            for ($group_ind = $current_group_number - 1; $group_ind < $total_group_number; ++$group_ind) {

                $facebook_group = $data['groups'][$group_ind];
                // now we get the current_result and current url post
                if (!isset($result_data[$group_ind])) {
                    $result_data[$group_ind] = array(); // init empty result
                    // next time we can create list of random number
                    $rand_link_number = mt_rand(0, $total_link_number - 1);
                } else {
                    // if we find any id then break
                    $posted_found = false;
                    foreach ($result_data[$group_ind] as $posted_id) {
                        if ($posted_id != "") {
                            $posted_found = true;
                            break;
                        }
                    }
                    if ($posted_found) {
                        // next time we can create list of random number
                        $rand_link_number = -1;
                    } else {
                        // next time we can create list of random number
                        $rand_link_number = mt_rand(0, $total_link_number - 1);
                    }
                }

                $current_link_number = count($result_data[$group_ind]);


                // # loop all posts
                for ($link_ind = $current_link_number; $link_ind < $total_link_number; ++$link_ind) {

                    // continue until we find random number
                    if ($link_ind != $rand_link_number) {
                        $result_data[$group_ind][] = "";
                        continue;
                    }

                    // start the next link, incase of resume :D
                    $link_url = $link_urls[$link_ind];
                    // prepare data, before each post, check publish again incase user stop campaign immediately, when it online
                    // user can't change datetime or anything but publish
                    $cronjob_publish = db_select_one('tbl_autopost_cronjob', 'publish', array('id' => $job['id']), true);
                    // if cronjob is not publish, continue to other cronjob, so the result will not be update :D
                    if (!$cronjob_publish) // event remove can make publish to false :D
                        continue 3;

                    // update link url
                    $post['link'] = $link_url;

                    // update for this group by copy array
                    $post_data_params = $this->get_postdata($post);
                    $post_data_params['to'] = $facebook_group['id'];
                    $post_data_params['access_token'] = $access_token;
                    // random message
                    if (isset($post_data_params['message'])) {
                        $ecomotions_str = $this->replace_ecomotions();
                        $post_data_params['message'] = str_replace('[r]', $ecomotions_str, $post_data_params['message']);
                    }
                    try {
                        $ret = $fb->api('/' . $facebook_group['id'] . '/feed', 'POST', $post_data_params);
                        //$ret = array('id' => '700801583356379_702008673235670'); // fake to test
                        echo 'Successfully posted to Facebook';
                        // need update result to campaign, as list of post including title and link?
                        print_r($ret); // id is the post
                        echo "\n";

                        $post_id = $ret['id'];
                        // now update the result_data, and running_percent
                        $result_data[$group_ind][] = $post_id;



//                        if ($data['leave_group_if_pending_post']) {
//                            // fake
//                            // continue 2;
//                            $result = $fb->api("/" . $post_id, 'GET', array('access_token' => $access_token));
//                            if (!array_key_exists("actions", $result)) {
//                                // pending post
//                                // leave the group - un join?, still update result but continue to next group, to see why
//                                continue 2;
//                            }
//                        }
                        // sleep to next post
                        sleep($post_delay);
                    } catch (Exception $e) {
                        // may be token is invalid, stop all
                        echo "error:" . $e->getMessage();
                        echo "\n";
                        $result_data[$group_ind][] = "";
                        // break on error ?
                        //break 2;
                    }

                    // update percent now
                    $running_percent = round(((($group_ind + 1) * $total_link_number) / ($total_group_number * $total_link_number)) * 100);
                    db_update('tbl_autopost_cronjob', array(
                        'running_percent' => $running_percent,
                        'result_data' => json_encode($result_data)
                            ), array('id' => $job['id']));
                }// # end loop posts
            }// # end loop all groups
            // set cronjob as finish
            // set cronjob to running status
            db_update('tbl_autopost_cronjob', array('finish' => 2), array('id' => $job['id']));
        }
    }

    // this is for user :D, by repeat each 10 second, so there are not so many jobs left
    function user_autodelete() {
        // init facebook
        require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
        $fb = new Facebook(array('fileUpload' => false));

        // get all cronjob that is waiting to run: publish = 1, and not yet finish(may be running, or not run)
        $jobs = db_select('tbl_autopost_cronjob', array('id', 'user_id', 'data', 'result_data', 'deleting'), array('deleted' => 1));

        // each time do a post, should check status of job again, to make it realtime
        foreach ($jobs as $job) {

            // if cronjob is running then break;
            // else re run it :D
            if ($job['deleting']) {
                continue;
            }

            $data = json_decode($job['data'], true);
            $result_data = json_decode($job['result_data'], true);
            $total_group_number = count($data['groups']);
            $current_group_number = count($result_data);
            if ($current_group_number === 0) {
                $current_group_number = 1;
            }
            // get interval, not exceed 30 seconds
            $post_delay = min(array(30, +$data['send_interval']));
            //$post_delay = 1; // fake
            // set cronjob to running status
            db_update('tbl_autopost_cronjob', array('deleting' => 1), array('id' => $job['id']));

            // should get access token from user, in case of invalid token
            $access_token = db_select_one('tbl_autopost_user', 'access_token', array('user_id' => $job['user_id']));
            if (!$access_token) {
                $access_token = $data['access_token'];
            }
            $post_data_params = array(
                'access_token' => $access_token
            );

            // we extract random link :v
            $link_urls = explode("\n", $data['link_url']);

            $total_link_number = count($link_urls);

            // # loop all groups, just begin at the current group
            for ($group_ind = $current_group_number - 1; $group_ind >= 0; --$group_ind) {

                $current_link_number = count($result_data[$group_ind]);

                // # loop all posts
                for ($link_ind = $current_link_number - 1; $link_ind >= 0; --$link_ind) {

                    $current_post_id = $result_data[$group_ind][$link_ind];
                    if ($current_post_id == "") {
                        array_pop($result_data[$group_ind]);
                        continue;
                    }

                    try {
                        $ret = $fb->api('/' . $current_post_id, 'DELETE', $post_data_params);
                        //$ret = array('id' => $current_post_id); // fake to test
                        echo 'Successfully deleted the post';
                        // need update result to campaign, as list of post including title and link?
                        print_r($ret); // id is the post
                        echo "\n";

                        // now update the result_data, and running_percent
                        array_pop($result_data[$group_ind]);

                        // update percent now
                        $running_percent = round(((($group_ind + 1) * $total_link_number) / ($total_group_number * $total_link_number)) * 100);
                        db_update('tbl_autopost_cronjob', array(
                            'running_percent' => $running_percent,
                            'result_data' => json_encode($result_data)
                                ), array('id' => $job['id']));

                        if ($data['leave_group_if_pending_post']) {
                            // fake
                            // continue 2;
                            $result = $fb->api("/" . $post_id, 'GET', array('access_token' => $access_token));
                            if (!array_key_exists("actions", $result)) {
                                // pending post
                                // leave the group - un join?, still update result but continue to next group, to see why
                                continue 2;
                            }
                        }
                        // sleep to next post
                        sleep($post_delay);
                    } catch (Exception $e) {
                        // may be token is invalid, stop all
                        echo $e->getMessage();
                        echo "$current_post_id\n";
                        array_pop($result_data[$group_ind]);
                        // break on error ?
                        //break 2;
                    }
                }// # end loop posts

                array_pop($result_data);
            }// # end loop all groups
            // delete the cronjob after success ?
            db_delete('tbl_autopost_cronjob', array('id' => $job['id']));
        }
    }

    private function get_postdata($post) {
        // message
        if ($post['type'] == 0) {
            $postdata = array(
                'message' => $post['message']
            );
        } else if ($post['type'] == 1) {  // link
            $postdata = array_filter(array(
                'message' => $post['message'],
                'link' => $post['link'],
                'picture' => $post['picture'],
                'name' => $post['name'],
                'caption' => $post['caption'],
                'description' => $post['description']
            ));
        } else if ($post['type'] == 2) { // image
            $postdata = array(
                'message' => $post['message'],
                'url' => $post['picture']
            );
        } else if ($post['type'] == 5) {
            $postdata = array_filter(array(
                'message' => $post['message'],
                'link' => $post['link']
            ));
        } else {  // video
            $postdata = array(
                'title' => $post['name'],
                'description' => $post['description'],
                'file_url' => $post['picture'],
            );
        }

        return $postdata;
    }

    private function replace_ecomotions() {
        $length = count($this->ecomotions) - 1;
        $str = '';
        for ($i = 0; $i < 5; ++$i) {
            $str .= ' ' . $this->ecomotions[mt_rand(0, $length)];
        }
        return $str;
    }

    function timestamp() {
        // just for test
        echo "ngon";
    }

    function test() {

        require_once(APP_PATH . "lib/facebook/facebook.php"); // set the right path
        $fb = new Facebook(array('fileUpload' => false));

        $post_data_params = array(
            'link' => 'https://apps.facebook.com/1123874981002185/',
            'picture' => 'http://hotfunapps.com/soulmates/images/ogshare.jpg',
//            'message' => 'It is of utmost importance that you possess car insurance so that you can protect yourselves as well as others riding in that vehicle in the event of an accident. Here are some important tips to get low premium auto insurances.',
            'access_token' => 'EAAKYGWRCAu8BAKKqMJYZAa1nMBZCLQInogs4TrKWtwFmwP2ZCA3IoilMDMBUtHDYtX5eIZB85d5K7BX1r8WUaZCPdtVVDxYs1IbRbOHwnLezx7wEk8A9ZCD0cMpufQ0RJJmfX9VEa1ZAAKuIqDZBbw912lRZAumPhj1XEbXdExmwU3AZDZD'
        );

        try {

            $ret = $fb->api('/' . '700801583356379' . '/feed', 'POST', $post_data_params);
            //$ret = json_encode($post_data_params, JSON_PRETTY_PRINT);
            echo 'Successfully posted to Facebook';
            // need update result to campaign, as list of post including title and link?
            print_r($ret);
            echo "\n";
        } catch (Exception $e) {
            echo $e->getMessage();
            echo "\n";
        }
    }

}
