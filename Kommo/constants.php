<?php

	global $posts;
	global $wpdb,$prefix,$basepath,$baseurl, $debugpath;
	global $user,$headers;

	if (!function_exists('getpath')):
		//--------------------------------------------------------------------------
		function getpath()
		{
			$path = getcwd();  if (strpos($path, ':') > 0) { $path.="\\"; } else { $path.="/";};
			return  $path;
		};
		//--------------------------------------------------------------------------
		function rewritereport($str,$name='debug.log')
		{
			$file = @fopen ($name,"w+");
			if (strlen($str)>0) @fputs($file, trimall($str)."\x0d\x0a");
			@fclose ( $file );
		};
		//--------------------------------------------------------------------------
		function addreport($str,$name='debug.log')
		{
			$file = @fopen ($name,"a+");
			if (strlen($str)>0) @fputs($file, $str."\r\n");
			@fclose ( $file );
		};
		//--------------------------------------------------------------------------
		function rewritelog($arr,$name='debug.log')
		{
			decho('is_array($arr)='.is_array($arr));
			$file = @fopen ($name,"w+");
			if (is_array($arr)) {
				foreach($arr as $a)
				if (strlen($a)>0) 	@fputs($file, trimall($a)."\r\n");
			} else if (strlen($arr)>0)
				if (strlen($arr)>0) @fputs($file, trimall($arr)."\r\n");
			@fclose ( $file );
		};

		//--------------------------------------------------------------------------
		function decho($str) { echo "<br>".$str; };
		//--------------------------------------------------------------------------
		function __rewritereport($name,$str)
		{
			$file = @fopen ($name,"w+");
			if (strlen($str)>0) @fputs($file, $str);
			@fclose ( $file );
		};
		//----------------------------------------------------------------------
		function print_arr($hdr, $arr = array(), $count = 0, $view=1, $name='debug.log') 
		{
			global $basepath,$debugpath;
			$debugpath	= '';
			if ( $count>0 ) $arr = array_slice( $arr, 0, $count );
		__rewritereport('report.txt',print_r($arr,1));

			if (!file_exists('report.txt')) return;
			$file = file('report.txt');
			decho('------------------'.$hdr.'('.count($arr).')------------------------------------');
			foreach($file as $str) {
				$str = str_ireplace("\x0A",'',$str);
				$str = str_ireplace("\x0D",'',$str);
				if (is_string($str))
				$str = str_ireplace("\x20",'&nbsp;',$str);
				if (($str<>'') and ($view))  decho($str);
			};
		};	
		function trimall($str, $substr = '', $charlist = "\t\n\r\x0B")
		{
			return str_ireplace(str_split($charlist), $substr, $str);
		};
		//--------------------------------------------------------------------------
		function __redirect($url)
		{
			$output =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd">';
			$output.='<html><head>';
			$output.='<meta http-equiv="content-type" content="text/html; charset=utf-8">';
			$output.='<meta http-equiv="refresh" content="0;';
			$output.=' url='.$url.'">';
			$output.='<link rel="StyleSheet" type="text/css" href="css/style.css">';
			$output.='</head>';
			$output.='<body>';
			$output.='</body></html>';
			@header("HTTP/1.0 200 OK");
			@header("Content-type: text/html;charset=utf-8");
			@header("Cache-Control: no-cache, must-revalidate, max-age=0");
			@header("Expires: 0");
			@header("Pragma: no-cache");
			print $output;
			die();
		};
		//--------------------------------------------------------------------------
		function __translitURL($str) 
		{
		$tr = array(
        "А"=>"a","Б"=>"b","В"=>"v","Г"=>"g",
        "Д"=>"d","Е"=>"e","Ё"=>"yo","Ж"=>"zh","З"=>"z","И"=>"i",
        "Й"=>"j","К"=>"k","Л"=>"l","М"=>"m","Н"=>"n",
        "О"=>"o","П"=>"p","Р"=>"r","С"=>"s","Т"=>"t",
        "У"=>"u","Ф"=>"f","Х"=>"x","Ц"=>"c","Ч"=>"ch",
        "Ш"=>"sh","Щ"=>"shh","Ъ"=>"j","Ы"=>"y","Ь"=>"",
        "Э"=>"e","Ю"=>"yu","Я"=>"ya","а"=>"a","б"=>"b",
        "в"=>"v","г"=>"g","д"=>"d","е"=>"e","ё"=>"yo","ж"=>"zh",
        "з"=>"z","и"=>"i","й"=>"j","к"=>"k","л"=>"l",
        "м"=>"m","н"=>"n","о"=>"o","п"=>"p","р"=>"r",
        "с"=>"s","т"=>"t","у"=>"u","ф"=>"f","х"=>"x",
        "ц"=>"c","ч"=>"ch","ш"=>"sh","щ"=>"shh","ъ"=>"j",
        "ы"=>"y","ь"=>"","э"=>"e","ю"=>"yu","я"=>"ya", 
        " "=> "-", "."=> "", "І"=> "i",
        "і"=> "i", "Ң"=> "n", "ң"=> "n", 
		"Ү"=> "u", "ү"=> "u", "Қ"=> "q", 
		"қ"=> "q", "Ұ"=> "u",
        "ұ"=> "u", "Ғ"=> "g", "ғ"=> "g", 
		"Ө"=> "o", "ө"=> "o", "Ә"=> "a", 
		"ә"=> "a"			 				
		);
		// Убираю тире, дефисы внутри строки
		$urlstr = trim($str);
		$urlstr = str_replace('–'," ",$urlstr);
		$urlstr = str_replace('-'," ",$urlstr); 
		$urlstr = str_replace('—'," ",$urlstr);

		// Убираю лишние пробелы внутри строки
		$urlstr=preg_replace('/\s+/',' ',$urlstr);
		if (preg_match('/[^A-Za-z0-9_\-]/', $urlstr)) {
			$urlstr = strtr($urlstr,$tr);
			$urlstr = preg_replace('/[^A-Za-z0-9_\-]/', '', $urlstr);
		}
		
		$urlstr = str_replace( '--','-',$urlstr);
		
		if (substr( $urlstr,  0, 1)=='-')
			$urlstr = substr( $urlstr, 1);
		if (substr( $urlstr,  strlen($urlstr)-1, 1)=='-')
			$urlstr = substr( $urlstr, 0, strlen($urlstr)-1);

		return strtolower($urlstr);
		}
		//-------------------------------------------------------
		function addtolog($str, $name = 'debug.log') 
		{
			if (file_exists($name)) { 
				if (filesize($name)>(50*1024*1024)) { unlink($name);  $file = fopen ($name,"w+"); } else
				$file = fopen ($name,"a+"); 
			} else { 
				$file = fopen ($name,"w+");
			};
			@fputs($file, Date('H:i:s').' ');
			@fputs($file, $str);
			fputs($file, "\r\n");
			fclose ( $file );
		}
		//----------------------------------------------------------------------
		function send_header($code='windows-1251'){
		echo '
<!DOCTYPE html>
<html lang="ru">
	<head><meta http-equiv="Content-Type" content="text/html; charset='.$code.'" />
  ';
		echo	getCSS().'</head><body>';
		};
	endif;
	if (!function_exists('getTag')):
	function getTag($tag)
	{
		global $a;
		$pos	= strpos($a,'<'.$tag.'>');
		if ($pos === false ) return '';
		$pos	= strpos($a,'>',$pos)+1;
		if ($pos === false ) return '';
		$pos1	= strpos($a,'</'.$tag,$pos);
		$ret	= '';
		if ($pos1 !== false) $ret = substr($a,$pos,$pos1-$pos);
		return	$ret;

	}		
	function getTagA($tag,$a)
	{
		global $pos1;
		$pos	= strpos($a,'<'.$tag.'/>',$pos1);
		if ($pos !== false ) { decho($tag.'/>!'); return ''; };
		$pos	= strpos($a,'<'.$tag.'>',$pos1);
		$pos	= strpos($a,'>',$pos)+1;
		if ($pos === false ) return '';
		$pos1	= strpos($a,'</'.$tag,$pos);
		$return	= substr($a,$pos,$pos1-$pos);
//		decho($tag.':'.$return);
		$pos1++;
		return	$return;
	}	
	function getAttr($attr)
	{
		global $a;
		$ret	= '';
		$pos	= strpos($a,' '.$attr.'="');
		if ($pos !== false ) { 
			$pos	= strpos($a,'"',$pos)+1;
			$pos1	= strpos($a,'"',$pos);
			$ret	= substr($a,$pos,$pos1-$pos);
//			decho($attr.'='.$ret);
		};
		return	$ret;		
	};
	endif;

	function readIniFile($name='config.ini')
	{
		$file = file_get_contents($name);
//		addtolog('$file='.$file);
		$arr = explode("\x0A",$file);
//		addtolog('$arr='.print_r($arr,1));
		$config = [];
		foreach($arr as $a)
		{
			if (strpos($a,'=')===false) continue;
			$a = explode('=',$a);
			if (strpos($a[1],';')!==false) $a[1] = substr($a[1],0,strpos($a[1],';'));
			$pos = strpos($a[1],'#');
			if ($pos>0) $a[1] = substr($a[1],0,$pos);
			$config[trim($a[0])] = trim($a[1]);
		}
//		addtolog('$config='.print_r($config,1));
		return $config;
	};
	function modifiIniFile($name='config.ini',$key=[])
	{
//		addtolog('modifiIniFile $key='.print_r($key,1));
		$file = file_get_contents($name);
		if (!isset($key['key']) ) return;
//		$arr = explode("\x0A",$file);
		foreach($arr as $ia => $a)
		{
			if (strpos($a,'=')===false) continue;
			$a = explode('=',$a);
			if (strpos($a[1],';')!==false) $a[1] = substr($a[1],0,strpos($a[1],';'));
			$pos = strpos($a[1],'#');
			if ($pos>0) $a[1] = substr($a[1],0,$pos);
			$a[0]  = trim($a[0]);
			$a[1]  = trim($a[1]);
			if ($key['key'] !== $a[0]) continue;
			$arr[$ia] = $a[0]. ' = '.$key['val'];
			$s 	= implode("\x0A",$arr);
//			addtolog('$s=',$s);
			file_put_contents($name,$s);
			break;
		};
	};
