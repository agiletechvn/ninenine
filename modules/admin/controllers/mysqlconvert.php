<?php

class MySqlConvertController extends AdminController{
	
	// override variable groups
	protected $groups = array('admin');
	
	function index(){
		$this->load();
	}
	
	
	/**
	 * count view action by statistic from action
	 * Enter description here ...
	 */
	function view(){
		$database = DB_NAME;
		header("Content-type: text/plain; charset=utf-8");
		if($database){			
			echo "SET SQL_MODE=\"NO_AUTO_VALUE_ON_ZERO\";
SET time_zone = \"+00:00\";\n\n
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;\n\n\n";
			echo "\n--\r\n-- Database: `$database`\r\n--\n";
			
			$tables = db_query("select table_name from information_schema.tables where table_schema = '$database'");
			foreach($tables as $v){		
				echo "\n-- ----------------------------------------------------------\n";
				$table = $v['table_name'];	
				$create_table = db_query_one("show create table $database.$table");
				echo "\n--\r\n-- Table structure for table `$table`\r\n--\n\n";
				echo str_replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS', $create_table['Create Table']),';';
				
				$rows = db_query('select * from ' . $table);
				$numItems1 = count($rows);
				$i1 = 0;
				if($numItems1==0)
					continue;
				
				echo "\n\n--\r\n-- Dumping data for table `$table`\r\n--\n";
				$columns = db_query("select COLUMN_NAME, NUMERIC_PRECISION from information_schema.columns where table_schema = '$database' and table_name = '$table'");

				echo "\r\nINSERT INTO `$table` (";
				$numItems = count($columns);				
				$i = 0;
				
				foreach($columns as $v){
					echo '`' , $v['COLUMN_NAME'] , '`';
					if (++$i !== $numItems)
						echo ', ';					
				}				
				echo ")  VALUES\r\n";		
				foreach ($rows as $row){
					$numItems = count($row);				
					$i = 0;
					echo  '(';
					foreach($row as $v){
						if(!$columns[$i]['NUMERIC_PRECISION'])
							$v = "'" . str_replace(array("'", "\r", "\n"),array("\\'", "\\r", "\\n"), $v) . "'";																
						echo $v;	
						if (++$i !== $numItems)
							echo ', ';													
					}
					echo ')';
					if (++$i1 !== $numItems1)
						echo ",\r\n";	
				}
				echo ";\r\n";
			}

			echo "\n\n\n/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;";
		}
	}
	
	
}