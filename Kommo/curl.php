<?php  
	global $outheaders,$RetCode,$cookies_arr;
	if (!function_exists('c_addtolog')):
		function c_addtolog($s)
		{
			addtolog($s);
		}
	endif;
	//--------------------------------------------------------------------------
	function get_page_curl( $url, $post=0, $data=null, $header = 1, $user='', $password='' )
	{
	
		global $outheaders,$RetCode,$location,$cookies_arr;
		if (!isset($outheaders)) $outheaders = set_outheaders();
		c_addtolog('get_page_curl $url='.$url);
		c_addtolog('$outheaders='.print_r($outheaders,1));
//		c_addtolog('$post='.$post.' $header='.$header);
		if (!isset($cookies_arr)) $cookies_arr = array();
		$arr 	= explode('/',$url);
		$location = '';
		$process = curl_init($url);
		if( ($post==1) )
		{
			if (is_array($data))	c_addtolog('$data(1)='.print_r($data,1));
			else 					c_addtolog('$data(2)='.$data);
			curl_setopt($process, CURLOPT_POSTFIELDS, $data);
			curl_setopt($process, CURLOPT_POST, 1);
		}
		curl_setopt($process, CURLOPT_URL, $url);
		curl_setopt($process, CURLOPT_HEADER, 0); //$header);
		curl_setopt($process, CURLOPT_USERAGENT,'amo-oAuth-client/1.0');
		curl_setopt($process, CURLOPT_HTTPHEADER, $outheaders);
		curl_setopt($process, CURLOPT_RETURNTRANSFER, 1);
		// игнорируем сертификаты при работе с SSL
		curl_setopt($process, CURLOPT_SSL_VERIFYPEER, 1);
		curl_setopt($process, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($process, CURLOPT_CONNECTTIMEOUT, 10);

//		$cookie_jar = tempnam('./','cookie1'); 		
//		curl_setopt($process, CURLOPT_COOKIEFILE, $cookie_jar);
//		curl_setopt($process, CURLOPT_COOKIEJAR, $cookie_jar);
		
		$return = curl_exec($process);

//		c_addtolog('Передача...');
		$curl_ch_info = curl_getinfo($process);
//		c_addtolog('$curl_ch_info='.print_r($curl_ch_info,1));
		
		c_addtolog('$curl_ch_info[url]='.$curl_ch_info['url']);
//		c_addtolog('$curl_ch_info[content_type]='.$curl_ch_info['content_type']);
		c_addtolog('$curl_ch_info[http_code]='.$curl_ch_info['http_code']);
//		c_addtolog('$return='.$return);
		$RetCode = $curl_ch_info['http_code'];

		$pos  = strpos($return,"<!DOCTYPE");
		if ($pos===false) $pos  = strpos($return,"<!doctype");
		if ($pos===false) $pos  = strpos($return,"<html");
		if ($pos>0) $pos  = strpos($return,"\n\r");
		if ($pos===false) { 
			if (strpos($return,'JFIF')==6 ) { $headers = ''; $pos = 0; } else
			if (strpos($return,'GIF'))  { $headers = ''; $pos = strpos($return,'GIF'); } else
			{ $headers = $return; $pos = strlen($return); };
		} else  
			if ($pos>0) { $headers = substr($return, 0   , $pos-1);} else
			{ $headers = ''; $pos = 0; };

		if (strpos($return,'?PNG')>0)  $pos = strpos($return,'?PNG');
		if($count = preg_match_all("~Set-Cookie:\s*([^=]+)=([^\s;]+)~si", $headers, $matches))
		{
			$new_cookies_arr = array();
			for ($i=0; $i<$count; $i++){
				$cookies_arrmatches[1][$i] = $matches[2][$i];
				$new_cookies_arr[$matches[1][$i]] = $matches[2][$i];
			};
			$cookies_arr = array_merge( $cookies_arr, $new_cookies_arr);
		};
		$pos = strpos($headers, "location:");
		if($pos>0) {
			$pos = strpos($headers, " ", $pos+1);
			$location = substr($headers, $pos+1, strlen($headers)-$pos-1);
			$pos = strpos($location, "\r");
			if ($pos>0) $location = substr($location, 0, $pos);
		};
		if (strlen($curl_ch_info['redirect_url'])>5) $location = $curl_ch_info['redirect_url'];
		
		curl_close($process);
		
		c_addtolog('$return='.$return);
		return $return;
	}
	//--------------------------------------------------------------------------
	function set_cookies($names=array())
	{
		global $proxy,$need_proxy,$all_useragents,$numproxy, $cookies,$headers;
		global $cookies_arr;
		$cookies = '';
		if (isset($cookies_arr)){
			foreach($cookies_arr as $key =>$value) {
				if ((count($names)==0) || in_array($key,$names)) {
					if (strpos($value,'deleted')===false) 
					if ($key!='0')	$cookies .= $key.'='.$value.';';
				};
			}
		}
		$s = '';
		foreach ($names as $key => $value){
			if ($key!='0') $s.= '/'.$key.':'.$value;
		};
		$s = '';
		if (is_array($cookies_arr) && count($cookies_arr)>0)
		foreach ($cookies_arr as $key => $value){
			if ($key!='0') $s.= '/'.$key.':'.$value;
		};
		$pos = strlen($cookies);
		$cookies = substr($cookies,0,$pos-1);
		return $cookies;
	}
	//--------------------------------------------------------------------------
	function set_outheaders() 
	{
//		$h['Accept']			= "Accept: */*";
//		$h['Accept']			= "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
//		$h['Accept-Language']	= "Accept-Language: en-US,en;q=0.5";
//		$h['Accept-Encoding']	= "Accept-Encoding: deflate, gzip, br";
//		$h['Accept-Encoding']	= "Accept-Encoding: br";
//		$h['Accept-Encoding']	= "Accept-Encoding: ";
//		$h['Connection']		= "Connection:keep-alive";
//		$h['pragma']			= 'pragma: no-cache';
//		$h['sec-ch-ua-mobile'] 	= 'sec-ch-ua-mobile:?0';
//		$h['sec-ch-ua-platform']= 'sec-ch-ua-platform: "Windows"';
//		$h['sec-fetch-dest']	= 'sec-fetch-dest: document';
//		$h['sec-fetch-mode']	= 'sec-fetch-mode: navigate';
//		$h['sec-fetch-site']	= 'sec-fetch-site: same-origin';
		//$h['User-Agent']		= 'User-Agent: Mozilla/5.0 (Windows NT 5.1; rv:48.0) Gecko/20100101 Firefox/48.0';
//		$h['upgrade-insecure-requests'] = 'upgrade-insecure-requests: 1';
		$h['User-Agent']		= 'User-Agent: Kommo-oAuth-client/1.0';
		$h['Content-Type']		= 'Content-Type:application/json';
		
		return $h;
	}

	function multicurl($urls=[])
	{
		global $outheaders,$RetCode,$location,$cookies_arr;
		
		$multi = curl_multi_init();
		$channels = array();
 
		foreach ($urls as $url) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			curl_setopt($ch, CURLOPT_USERAGENT,'amo-oAuth-client/1.0');
			curl_setopt($ch, CURLOPT_HTTPHEADER, $outheaders);
			
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

			curl_multi_add_handle($multi, $ch);
 
			$channels[$url] = $ch;
			c_addtolog('multicurl url=='.$url);
		}
 
		$active = null;
		do {
			$mrc = curl_multi_exec($multi, $active);
			c_addtolog('multicurl $mrc='.$mrc);
		} while ($mrc == CURLM_CALL_MULTI_PERFORM);
		c_addtolog('multicurl 1111111111111111111111111111111111111');
		while ($active && $mrc == CURLM_OK) {
			if (curl_multi_select($multi) == -1) {
				continue;
			}

			do {
				$mrc = curl_multi_exec($multi, $active);
			c_addtolog('multicurl $mrc='.$mrc);
			} while ($mrc == CURLM_CALL_MULTI_PERFORM);
		}
		c_addtolog('multicurl WHILE!');
 
		foreach ($channels as $channel) {
			echo curl_multi_getcontent($channel);
			c_addtolog('multicurl curl_multi_getcontent($channel)='.curl_multi_getcontent($channel));
			curl_multi_remove_handle($multi, $channel);
		}
 
		curl_multi_close($multi);
		c_addtolog('multicurl END!');
	};	