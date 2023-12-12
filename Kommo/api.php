<?php
	
	// http://127.0.0.1/kommo-2.com/api.php
	// http://127.0.0.1/kommo-2.com/index.php
	
	// https://macbook-cyprus.cy/Kommo/api.php
	// https://macbook-cyprus.cy/Kommo/api.php?action=NewLead&data=ddddd
	
	// https://gtsvmarket.kommo.com/kommo/api.php?action=leadNotes
	global	$directory;
	if (file_exists('stop.txt')) unlink('stop.txt');
	global $directory;
		
	ini_set('error_reporting', E_ALL);
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);

	set_time_limit(0);
	ignore_user_abort(true);
	$path = $_SERVER['DOCUMENT_ROOT'].'/';
	if (strpos($_SERVER['SERVER_NAME'],'127.0.0.1')!==false) $path.= 'kommo/';
	else	$path.= 'Kommo/';
	require_once('constants.php'); 
	require_once('curl.php'); 

	@session_start();
	addtolog('$_REQUEST='.print_r($_REQUEST,1));
	
	$action = ''; if (isset($_REQUEST['action']))	$action = $_REQUEST['action'];

	$config = readIniFile($path.'config.ini');
	$access_token 	= 	$config['access_token'];
	$refresh_token 	= 	$config['refresh_token'];
	$authority_code 	= 	$config['authority_code'];
	$token_type 	= 'Bearer';
  $expires_in 	= '86400';
	$base_url = $config['base_url'];

	// Проверяем и при необходимости обновляем access_token
	refreshTokenIfNeeded();

	function refreshTokenIfNeeded() {
    global $config, $path, $base_url;

    $current_time = time();
    $token_expires_at = $config['token_expires_at']; // предполагаем, что мы сохраняем время истечения токена в конфиге

    if ($current_time > $token_expires_at) {
			 // Логування перед оновленням
			 addtolog("Оновлення token_expires_at. Старе значення: " . $config['token_expires_at']);
        $urlapi = $base_url . 'oauth2/access_token';
        $data = [
            'client_id'     => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'grant_type'    => 'refresh_token',
            'refresh_token' => $config['refresh_token']
        ];

        $data = json_encode($data);
        $response = json_decode(get_page_curl($urlapi, 1, $data), true);

        if (isset($response['access_token'])) {
            $config['access_token'] = $response['access_token'];
            $config['refresh_token'] = $response['refresh_token']; // обновляем, если пришел новый
            $config['token_expires_at'] = $current_time + $response['expires_in']; // обновляем время истечения

            saveConfig($config, $path . 'config.ini'); // предполагаемая функция для сохранения конфига

						  // Логування після оновлення
    addtolog("Конфігурація оновлена. Нове значення token_expires_at: " . $config['token_expires_at']);
        }
    }
}

function saveConfig($config, $file) {
    $newContent = '';
    foreach ($config as $key => $value) {
        $newContent .= "$key=$value\n";
    }

		   // Логування перед збереженням
			 addtolog("Зберігається конфігурація в файл: " . $file);

    file_put_contents($file, $newContent);

		 // Логування після збереження
		 addtolog("Конфігурація збережена.");
}



	$files	= scandir($path);

	$directory	= $path.'kommo.files';
	if (!file_exists($directory)) mkdir($directory,0777);
	
	// $base_url ( redirect_uri ) должен указывать на тот урл,
	// к которому интеграция крепится.
	// $base_url = 'https://gtsvmarket.kommo.com/';
	if (!isset($action) || $action!=='' || $config['authority_flag']== 1 ) {
		
		if ($config['authority_flag'] == 1) :
		
			$urlapi	= $base_url.'oauth2/access_token';		
			$data	= [
				'client_id' 	=>  $config['client_id'],
				'client_secret' =>  $config['client_secret'],
				'grant_type' 	=>  'authorization_code',	// режим работы
				'code' 			=>  $authority_code,		// реальный ключ
				'redirect_uri' 	=>  'https://macbook-pro.es/' 			// redirect_uri должен указывать на тот урл,
															// к которому интеграция крепится.
			];
			print_arr('$data=',$data);
			$data	= json_encode($data);
			decho('$data='.$data);
			decho('$urlapi='.$urlapi);
			addtolog('$_SERVER[REQUEST_URI]='.$_SERVER['REQUEST_URI']);
			addtolog('$urlapi='.$urlapi);
			addtolog('$data='.$data);
			$p		= get_page_curl($urlapi,1,$data);
			if (strpos($p,'{"title":"ErrOAuth2Exception"')!==false) {addtolog('Autorize!'); die(); };
			$p		= json_decode($p,1);
			print_arr('$p=',$p); 
				
			if (isset($p['access_token'])):
				$access_token 	= 	$p['access_token'];
				$refresh_token 	= 	$p['refresh_token'];
				$token_type		= 	$p['token_type'];
				$expiresin		= 	$p['expires_in'];
			endif;	
			
			$s = file_get_contents($path.'config.ini');
			
			// извдекаем значение из  файла (строки, считанной из файла)
			$pos 	= strpos($s, 'access_token');
			$pos 	= strpos($s, '=', $pos)+1;
			$pos1	= strpos($s, "\x0A", $pos);
			$s		= substr($s,0,$pos).$access_token.substr($s,$pos1);
			
			$pos 	= strpos($s, 'refresh_token');
			$pos 	= strpos($s, '=', $pos)+1;
			$pos1	= strpos($s, "\x0A", $pos);
			$s		= substr($s,0,$pos).$refresh_token.substr($s,$pos1);

			// авторизация прошла, обеспечиваем сброс флажка и пишем в файл
			$pos = strpos($s, 'authority_flag');
			if ($pos>0){
				$pos++;	$pos = strpos($s, '=', $pos);
				$s	= substr($s,0,$pos+1).'0';			//	будет authority_flag = 0
			}	
			file_put_contents($path.'config.ini',$s);	// запись нового значения (и всего остального)
		endif;

		$outheaders['Content-Type'] = 'Content-Type:application/json';
	
		$data	= [
			'token_type' 	=> $token_type,		// реальный токен
			'expires_in' 	=> $expires_in,		// время жизни (оно не меняется )
			'access_token' 	=> $access_token,		
			'refresh_token' => $refresh_token
		];	

		$outheaders['Authorization']= 'Authorization: Bearer ' . $access_token;
		$urlapi	= $base_url.'api/v4/account';
		$p	= get_page_curl($urlapi);
//		decho('$p='.$p);
		
		// присутствует фраза, значит, авторзация не прошла, сообщаем, замираем
		if (strpos($p,'Unauthorized!')!==false)
		{
			die(json_encode(['result'=>'error','msg'=>'Unauthorized!']));
		};
		addtolog('авторизован!');	// можно убрать, сообщение в лог, что авторизация ПРОШЛА!
//		decho('авторизован!');	

		$s = file_get_contents($path.'config.ini');
		$pos = strpos($s, 'authority_flag');
		addtolog('$pos='.$pos);
		if ($pos>0)
		{
			$pos++;	$pos = strpos($s, '=', $pos);
			$s	= substr($s,0,$pos+1).'0';
			file_put_contents($path.'config.ini',$s);	// обновляем 
		};
		$p	= json_decode($p,1);
	} else {
		$data	= [
			'access_token' 	=> $access_token,
			'refresh_token' => $refresh_token
		];	
		$_SESSION['data'] = $data;
		addtolog('$data='.print_r($data,1));
	};	
	$outheaders['Authorization']= 'Authorization: Bearer ' . $access_token;
	$outheaders['Content-Type'] = 'Content-Type:application/json';
	
	if (!isset($action)) die();
	addtolog('$action='.$action);
	switch($action)
	{
		case 'sendamo':

			$fullname	= $_REQUEST['fullname'];	// CFV[919096]
			$phone		= $_REQUEST['phone'];		// CFV[919146]
			$email		= $_REQUEST['email'];		// CFV[919148]
			$note		= $_REQUEST['note'];		// CFV[919150]
			$modelinfo	= $_REQUEST['modelinfo'];	// CFV[919204]]
			$arr		= explode(';',$modelinfo);
			$model		= $arr[0];
			$price		= intval(preg_replace('/[^0-9]/', '', $arr[2]));

			$data = [
    			[
        			"name" 	=> $arr[0],
        			"price" => $price,
							"status_id" => 61660347,
							"pipeline_id" => 7555299,
            			"custom_fields_values" => [
							[	"field_id" => 919096,	"values" => [[	"value" 	=> $fullname ]]	],
							[	"field_id" => 919146,	"values" => [[	"value" 	=> $phone 	]] 	],
							[	"field_id" => 919148,	"values" => [[	"value" 	=> $email 	]] 	],
							[	"field_id" => 919150, 	"values" => [[	"value" 	=> $note	]]	],
							[	"field_id" => 919204,	"values" => [[	"value" 	=> $modelinfo]]	]
					]
				]
			];
			
			$p	=	addLead($data);	//			$method = "/api/v4/leads/complex";
			if (isset($p['_embedded']['leads'][0]['id']) && intval($p['_embedded']['leads'][0]['id'])>0) 
					$code	= 'ok';			// ЕСЛИ ID сделки вернулся
			else	$code	= 'error';		// ЕСЛИ ID сделки НЕ вернулся

			die( json_encode( [ 'result'=>$code ] ) );
			break;
	}

	// внизу - несколько подпрограмм
	function getLead($params=[]){
		global 	$outheaders,$RetCode,$cookies_arr,$base_url;
		global	$access_token,$refresh_token;
		$urlapi	= $base_url.'api/v4/leads/'.$id;
		$outheaders['Authorization']= 'Authorization: Bearer ' . $access_token;
		decho('$urlapi='.$urlapi);
		$p		= json_decode(get_page_curl($urlapi),1);
		print_arr('$p=',$p); 
		return	$p;
	};
	function addLead($params=[]){
		global 	$outheaders,$RetCode,$cookies_arr,$base_url;
		global	$access_token,$refresh_token;
		$urlapi	= $base_url.'api/v4/leads';
		$outheaders['Authorization']= 'Authorization: Bearer ' . $access_token;
		decho('$urlapi='.$urlapi);
		addtolog('$params='.print_r($params,1));
		$params = json_encode($params);
		addtolog('$params='.$params);
//		addtolog('$params='.print_r($params,1));
		$p		= json_decode(get_page_curl($urlapi,1,$params),1);
		addtolog('$p='.print_r($p,1)); 
		return	$p;
	};
	
	function getLeads($params = ''){
		global 	$outheaders,$RetCode,$base_url;
		global	$access_token,$refresh_token;
		$urlapi	= $base_url.'api/v4/leads';
		if (strlen($params)>0) $urlapi.='?'.$params;
		$outheaders['Authorization']= 'Authorization: Bearer ' . $access_token;
		decho('$urlapi='.$urlapi);
		$p		= json_decode(get_page_curl($urlapi),1);
		print_arr('$p=',$p); 
		return	$p;
	};

/*
*/