<?php

class ServiceController extends FBToolController {
    
    
    function exporter($profileid) {

        if (is_numeric($profileid)) {
            db_connect();
            
            $uids = db_query_one('select uid from tbl_facebook_uid where profileid = ' . $profileid . ' limit 1', true);
            header("Content-Type:text/plain");
            echo $uids;
        }
    }
    
    function extract($content, $tag, $key, $value){
        $re = '% # Match a Tag element having attribute key="value".
            <'.$tag.'\b             # Start of outer start tag.
            [^>]*?             # Lazily match up to id attrib.
            \b'.$key.'\s*+=\s*+      # id attribute name and =
            ([\'"]?+)          # $1: Optional quote delimiter.
            \b' . $value . '\b        # specific attribute value to be matched.
            (?(1)\1)           # If open quote, match same closing quote
            [^>]*+>            # remaining outer Tag start tag.
            (                  # $2: Tag contents. (may be called recursively!)
              (?:              # Non-capture group for Tag contents alternatives.
              # Tag contents option 1: All non-Tag, non-comment stuff...
                [^<]++         # One or more non-tag, non-comment characters.
              # Tag contents option 2: Start of a non-Tag tag...
              | <            # Match a "<", but only if it
                (?!          # is not the beginning of either
                  /?'.$tag.'\b    # a start or end tag,
                | !--        # or an HTML comment.
                )            # Ok, that < was not a Tag or comment.
              # Tag contents Option 3: an HTML comment.
              | <!--.*?-->     # A non-SGML compliant HTML comment.
              # Tag contents Option 4: a nested Tag element!
              | <'.$tag.'\b[^>]*+>  # Inner Tag element start tag.
                (?2)           # Recurse group 2 as a nested subroutine.
                </'.$tag.'\s*>      # Inner Tag element end tag.
              )*+              # Zero or more of these contents alternatives.
            )                  # End 2$: Tag contents.
            </'.$tag.'\s*>          # Outer Tag end tag.
            %isx';

        if (preg_match_all($re, $content, $matches))
            return  $matches[0];
    }
    
    function file_get_contents_curl($url, $proxy, $cookie){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        // user agent, doesn't matter
        curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        
        // proxy
        if($proxy)
            curl_setopt($ch, CURLOPT_PROXY, $proxy);
        if($cookie)
            // cookie, khac gi trinh duyet ?
            curl_setopt($ch, CURLOPT_COOKIE, $cookie);
        
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $data = curl_exec($ch);
            $info = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

            //checking mime types
            if(strstr($info,'text/html')) {
                    // html 
                    curl_close($ch);
                    return $data;
            } else {
                // co the la json, nhung bon no toan tra ve text/html
                    return $data;
            }
    }
    
    function getprofile($id){

        if ($this->is_callback()) {
             //$url = 'https://www.facebook.com/search/228458913833525/likers';
            $url = "https://www.facebook.com/$id/info?collection_token=100003875700350%3A2327158227%3A8";
            //$proxy = $this->nextProxy();
            //$proxy = $this->nextProxy();
            if(isset($_GET['cookie'])){
                $cookie = $_GET['cookie'];
            } else {
                $cookie = 'locale=en_US; datr=ErOSU8zdzxrpUsjcshpqLGES; lu=ggPtNHrokf7csE5aQEFHoSBg; s=Aa5sBA1QoXtdOCPS.BTlW33; csm=2; xs=230%3AVT0LfHslrVPUKQ%3A2%3A1402301943%3A11790; fr=0HvKkQ7k05ru4btYo.AWXLTWhu-XQlXo1y1IAhYId1YW8.BTkrMj.0u.FOV.AWWw_DYw; c_user=100002122530378; act=1402458921761%2F21; p=-2; presence=EM402459095EuserFA21B02122530378A2EstateFDsb2F1402400945450Et2F_5b_5dElm2FnullEuct2F1402399430842EtrFA2loadA2EtwF925565370EatF1402458963115G402459095717CEchFDp_5f1B02122530378F126CC';
            }

            $html = $this->file_get_contents_curl($url, null, $cookie);

            $matches = $this->extract($html, "code", "class", "hidden_elem");
            foreach ($matches as &$match) {
                $match = preg_replace('%^.*?<!--\s*|\s*-->.*?$%', '', $match);
            }
            echo "<code>",implode('', $matches),"</code>";
        } else{
            $this->load(false);
        }
    }
    
    
    function getgroupid($id){

             //$url = 'https://www.facebook.com/search/228458913833525/likers';
            $url = "https://www.facebook.com/groups/$id/";
            //$proxy = $this->nextProxy();
            //$proxy = $this->nextProxy();
            if(isset($_GET['cookie'])){
                $cookie = $_GET['cookie'];
            } else {
                $cookie = 'locale=en_US; datr=ErOSU8zdzxrpUsjcshpqLGES; lu=ggPtNHrokf7csE5aQEFHoSBg; s=Aa5sBA1QoXtdOCPS.BTlW33; csm=2; xs=230%3AVT0LfHslrVPUKQ%3A2%3A1402301943%3A11790; fr=0HvKkQ7k05ru4btYo.AWXLTWhu-XQlXo1y1IAhYId1YW8.BTkrMj.0u.FOV.AWWw_DYw; c_user=100002122530378; act=1402458921761%2F21; p=-2; presence=EM402459095EuserFA21B02122530378A2EstateFDsb2F1402400945450Et2F_5b_5dElm2FnullEuct2F1402399430842EtrFA2loadA2EtwF925565370EatF1402458963115G402459095717CEchFDp_5f1B02122530378F126CC';
            }

            $html = $this->file_get_contents_curl($url, null, $cookie);

             preg_match('/group_id=(\d+)/', $html,$match) ;
             
             print_r($match[1]);
        
    }
    
   
    
    
    function getprofiles($uidstr=null) {
        if($uidstr){
            require_once(APP_PATH . 'lib/facebook/facebook.php');
            $config = array(
                'appId' => '567879943250976',
                'secret' => 'cde703ee98b9aff1d5df4c5714ebd720',
                'allowSignedRequest' => false // optional but should be set to false for non-canvas apps
            );

            $facebook = new Facebook($config);
            //$user_list = array();
            //foreach($posted_uid_arr as $uid){
               // $user_profile = $facebook->api("/$uidstr", 'GET');
                //$user_list[] = $user_profile;
            //}
                
                 $access_token = $facebook->getAccessToken();
                 echo $access_token;

            //$this->json($user_profile);
        } else {
            $this->load(false);
        }
    }
    
}

