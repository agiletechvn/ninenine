<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PushNotifications
 *
 * @author TuPT
 */
class IOSPushNotification {

    // We rarely change these informations, so declare them as static members
    // Provide the Host Information.
    static $host = 'gateway.push.apple.com';
    static $port = 2195;
    // Provide the Certificate and Key Data.
    static $cert = '';
    // Provide the Private Key Passphrase (alternatively you can keep this secrete
    // and enter the key manually on the terminal -> remove relevant line from code).
    // Replace XXXXX with your Passphrase

    static $passphrase = '';

    static function send($device_tokens, $data) {
        // Provide the Device Identifier (Ensure that the Identifier does not have spaces in it).
        $body = array();
        $body['aps'] = array(
            'alert' => $data['alert'],
            'badge' => isset($data['badge']) ? $data['badge'] : 0,
            'sound' => isset($data['sound']) ? $data['sound'] : 'none'
        );
        if (isset($data['payload']))
            $body['payload'] = $data['payload'];
        
        $timeout = isset($data['timeout']) ? $data['timeout'] : 30;
        // Encode the body to JSON.
        $json_body = json_encode($body);

        // Create the Socket Stream.

        $context = stream_context_create();

        stream_context_set_option($context, 'ssl', 'local_cert', self::$cert);

        // Remove this line if you would like to enter the Private Key Passphrase manually.

        stream_context_set_option($context, 'ssl', 'passphrase', self::$passphrase);

        // Open the Connection to the APNS Server.
        $socket = stream_socket_client('ssl://' . self::$host . ':' . self::$port, $error, $errstr, 
                $timeout, STREAM_CLIENT_CONNECT | STREAM_CLIENT_PERSISTENT, $context);

        // Check if we were able to open a socket.


        if (!$socket)
            return array('type' => 'error', 'msg' => "APNS Connection Failed: $error $errstr");

        // Build the Binary Notification.
        // if we can count return array, it mean we did these calls
        $ret = array();
        foreach ($device_tokens as $token) {
            $msg = chr(0) . chr(0) . chr(32) . pack('H*', $token) . pack('n', strlen($json_body)) . $json_body;
            // Send the Notification to the Server.
            $result = fwrite($socket, $msg, strlen($msg));
            if ($result)
                $ret[] = array('type' => 'success', 'msg' => 'Delivered Message to APNS', 'token' => $token);
            else
                $ret[] = array('type' => 'error', 'msg' => 'Could not Deliver Message to APNS', 'token' => $token);
        }
        // Close the Connection to the Server.

        fclose($socket);
        return $ret;
    }

}


class AndroidPushNotification{
    
    static $url = 'https://android.googleapis.com/gcm/send';
    static $access_key;
    
    static function send($registration_ids, $data){

        $fields = compact('registration_ids', 'data');
        $headers = array(
            'Authorization: key=' . self::$access_key,
            'Content-Type: application/json'
        );
 
        $ch = curl_init();
        curl_setopt( $ch,CURLOPT_URL, self::$url);
        curl_setopt( $ch,CURLOPT_POST, true );
        curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
        curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
        curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
        $result = curl_exec($ch );
        curl_close( $ch );
        $ret = array();
        if ($result === false) {
            $ret = array('type'=>'error', 'msg' => 'Curl failed: ' . curl_error($ch));
        } else {
            $ret = array('type'=>'success', 'msg' => $result);
        }
        return $ret;
    }
    
}
