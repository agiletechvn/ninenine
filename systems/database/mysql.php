<?php
// +--------------------------------------------------------------------------+
// | Authors	: Tung, Nguyen Dam ; 		Tu, Pham Thanh                    |
// | Email		: mask_final@yahoo.com;		miss_all_old_friends@yahoo.com    | 								
// | Mobile		: (+84) 936 885 466;		(+84) 1214 149 420                |
// | Date		: 11/2011												      |
// | Website	: http://maskfinalphp.com									  |						
// +--------------------------------------------------------------------------+
// | Copyrights (C) 2011 by MASKFINAL                                         |
// | All rights reserved                                                      |
// +--------------------------------------------------------------------------+


/**
 * if you use multi database you must use mysqli
 * or if you want a faster and safer :D
 * @return void
 */
function db_connect(){
	if(!defined('DB_CONNECTED')){
		mysql_set_charset(CHARSET, mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD));
		//mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);
		mysql_select_db(DB_NAME);		
		define('DB_CONNECTED', TRUE);
	}
}

function db_close(){
    mysql_close();
}

/**
 * 
 * @param $args
 * @return string
 */
function db_quote($value) {
	// Stripslashes
	if (get_magic_quotes_gpc()) {
		$value = stripslashes($value);
	}
	// Quote if not a number or a numeric string
	if (is_string($value) || !is_numeric($value)) {
		$value = "'" . mysql_real_escape_string($value) . "'";
	}
	return $value;
}

/**
 * 
 * Enter description here ...
 * @param unknown_type $table_name
 * @param unknown_type $data
 * @param unknown_type $action
 * @param unknown_type $where
 */
function db_auto_execute($table_name, $data, $action='INSERT', $where='') {
        if(!is_array($data) || empty($data))
            return true; // default should be success, 'cos there no db error :D
	switch ($action) {
		case 'INSERT': $sql = 'INSERT INTO '; break;
		case 'UPDATE': $sql = 'UPDATE '; break;
	}
	$sql .= $table_name;
	$sql .= ' SET ';
	foreach ($data as $key => $value) 
		$d[] = "`$key` = " . db_quote($value);	
	$sql .= implode(', ', $d);
	if ($action == 'UPDATE') 
		$sql .= " WHERE $where";
	return db_excute($sql);	
}

/**
 * 
 * No insert all method 'cos it is so confused to know about columns ...
 * @param unknown_type $table_name
 * @param unknown_type $data
 */
function db_insert($table_name, $data) {
	return db_auto_execute($table_name, $data, 'INSERT');
}


/**
 * 
 * Enter description here ...
 * @param unknown_type $table_name
 * @param unknown_type $data
 * @param unknown_type $where
 */
function db_update($table_name, $data, $where) {
	return db_auto_execute($table_name, $data, 'UPDATE', db_where($where));
}


/**
 * In most cases, AND clause is used, but also support OR clause
 * And you can use special field like or, and to integrated OR and AND clause together
 * @param type $where
 * @param type $and_clause
 * @return string
 */
function db_where($where, $and_clause = true){
    if(is_array($where)){
        $d = array();
        foreach ($where as $key => $value) { 
            // if you use these special key, you have to quote column with ``
            if($key === 'and')
                $d[] = db_where($value);
            elseif($key === 'or')
                $d[] = db_where($value, false);
            else {
                if(is_numeric($key))
                    // we put where clause aready
                    $d[] = db_sanitize_column($value);
                else {
                    $key = db_sanitize_column($key);
                    if(is_array($value)){
                        // if is clause
                        array_walk($value, function(&$item) {
                            $item = db_quote($item);
                        });
                        // may be in, not in, do nothing
                        $d[] = $key . ' in (' . implode (', ', $value) . ')';
                    } else {
                        // or operation like =, >=, <=, !=, <>
                        if(strpos('=><', substr($key, -1)) === false)
                                $key .= ' =';
                        // other don't support
                        $d[] = $key . ' ' . db_quote($value);
                    }
                }
            }
        }
        
        if(!empty($d))
            return '(' . implode($and_clause ? ' AND ' : ' OR ', $d) . ')';
        else
            return '';
    } else 
        return $where;
}

/**
 * Keyword must be Uppercase, then column name is normal case
 * For as, not keyword, these two words used frequently so we support, 
 * but too much keywords supported will slow down the system
 * @param type $column
 * @return type
 */
function db_sanitize_column($column){
    //'/(?:([\'"]).*?\1|\d+|as|not|([0-9a-z\$_]+))(?![\(a-z0-9\$_])/'
    // by priority, value (string or numeric or quoted column) with be match first, then as key word, finally is column name
    return preg_replace_callback('/(?:([\'`"]).*?\1|\d+|as|not|([a-z][0-9a-zA-Z\$_]*))(?![\(a-z0-9\$_])/', function($m){
        return isset($m[2]) ? '`' . $m[2] . '`' : $m[0];
    },trim($column));
}

/**
 * we don't want to change a current array, even it wastes memory
 * @param type $columns
 */
function db_sanitize_columns($columns){
    foreach($columns as &$item) 
        $item = db_sanitize_column($item);
    // it not change, array will remain, else it will create new
    return $columns;
}


/**
 * 
 * @param type $table_name
 * @param type $data
 * @param type $where
 * @param type $one_field
 * @param type $limit
 * @param type $order
 */
function db_select_sql($table_name, $data, $where = null, $limit = 0, $order = null){
    
    // short code for one field
    if(is_string($data))
        $data = array($data);
    
    $sql = 'SELECT ' . implode(', ', db_sanitize_columns($data)) . ' FROM '. $table_name;
    if($where = db_where($where)) // prevent empty cause crash
         $sql .= ' WHERE ' . $where;
    if(!empty($order))
        $sql .= ' ORDER BY ' . $order;
    if($limit)
        $sql .= ' LIMIT ' . $limit;
    
    // return sql for later usage
    return $sql;
}

/**
 * 
 * @param type $table_name
 * @param type $data_t
 * @param type $data
 * @param type $where
 * @param type $limit
 * @param type $order
 * @return type
 */
function db_select_sql_t($table_name, $data_t, $data, $where = null, $limit = 0, $order = null) {    
    if (is_string($data))
        $data = array($data);
    
    if (is_string($data_t))
        $data_t = array($data_t);
    
    foreach($data_t as $field_t){
        $data[] = db_t($table_name, $field_t);
    }
    
    return db_select_sql($table_name, $data, $where, $limit, $order);
}

/**
 * 
 * @param string $table_name , must add backtick manually, but rarely we know, 'cos have prefix tbl_
 * @param array $data
 * @param string or array $where
 * @param type $one_field
 * @return type
 */
function db_select($table_name, $data = '*', $where = null, $one_field = false, $limit = 0, $order = null){
    return db_query(db_select_sql($table_name, $data, $where, $limit, $order), $one_field);
}


/**
 * 
 * @param type $table_name
 * @param type $data_t
 * @param type $data
 * @param type $where
 * @param boolean $one_field
 * @param int $limit
 * @param type $order
 * @return type
 */
function db_select_t($table_name, $data_t, $data = '*', $where = null, $one_field = false, $limit = 0, $order = null) {    
    return db_query(db_select_sql_t($table_name, $data_t, $data, $where, $limit, $order), $one_field);
}

/**
 * 
 * @param string $table_name
 * @param array $data
 * @param string or array $where
 * @param type $one_field
 * @return type
 */
function db_select_one($table_name, $data = '*', $where = null, $one_field = false, $order = null){
    return db_query_one(db_select_sql($table_name, $data, $where, 1, $order), $one_field);
}

/**
 * 
 * @param type $table_name
 * @param type $data_t
 * @param type $data
 * @param type $where
 * @param type $one_field
 * @param type $order
 * @return type
 */
function db_select_one_t($table_name, $data_t, $data = '*', $where = null, $one_field = false, $order = null) {
    return db_query_one(db_select_sql_t($table_name, $data_t, $data, $where, 1, $order), $one_field);
}

// must have where
function db_delete($table_name, $where){
    $sql = 'DELETE FROM ' . $table_name . ' WHERE ' . db_where($where);
    return db_excute($sql);
}
	
/**
 * 
 * @param $sql
 * @param $_
 * @return array
 */
function db_query($sql, $one_field = false){
	$ret = array();
	if($query = mysql_query($sql)){
		if($one_field)
			while ($row = mysql_fetch_row($query)) $ret[] = $row[0];	
		else
			while($row = mysql_fetch_assoc($query)) $ret[] = $row;
	}
	return $ret;
}


/**
 * 
 * Enter description here ...
 * @param unknown_type $sql
 * @param unknown_type $one_field
 */
function db_query_one($sql, $one_field = false){
	return ($query = mysql_query($sql)) ? ($one_field ? @mysql_result($query, 0, 0) : mysql_fetch_assoc($query)) : NULL;
}

/**
 * 
 * @param $sql
 * @return resource
 */
function db_excute($sql){
	return mysql_query($sql);
}

/**
 * 
 * @return int
 */
function db_insert_id(){
	return mysql_insert_id();
}

/**
 * 
 * Enter description here ...
 */
function db_error(){
	return mysql_error();
}

/**
 * 
 * Enter description here ...
 * @param unknown_type $str
 */
function db_filter($str){
 	return str_replace(array("'", '"', '<', '>'), array("&#39;", "&quot;", '&lt;', '&gt;'), $str);
}

/**
 * 
 * Enter description here ...
 * @param string $sql
 * @param bool $one
 * @param string $lang
 */
function db_query_t($sql, $one=false, $lang=LANGUAGE){
	preg_match('/from\s+(\w+)/i', $sql, $matches);	
	$table = $matches[1];
	preg_match('/t\(([\w,]+)\)/', $sql, $matches);

	$fields = explode(',', $matches[1]);	
	$trans = '';
	foreach ($fields as $k => $field){
		if($k>0)
			$trans .= ',';
		$trans .= db_t($table, $field, $lang);
	}	
	
	$sql = str_replace($matches[0], $trans, $sql);		
	return $one ? db_query_one($sql) : db_query($sql);
}

/**
 * 
 * user / so the table name can not contain that character
 */
function db_t($table, $field, $lang = LANGUAGE) {
    return ($lang === DEFAULT_LANGUAGE) ? "$field AS $field" : "IFNULL((SELECT str FROM translate WHERE tid=concat('{$table}/{$field}/',id) AND lang='$lang'),$field) AS $field";
}