<?php
    // Login
    if ( isset( $_POST["login"] ) && isset( $_POST["password"] ) ) {

        // Install process
        if ( empty( $cms["config"]["admin.mod.php"]["admin_login"] )
         && empty( $cms["config"]["admin.mod.php"]["admin_password"] )
         && ( ! empty( $_POST["login"] ) || ! empty( $_POST["password"] ) ) ) {
            $cms["config"]["admin.mod.php"]["admin_login"]    = $_POST["login"];
            $cms["config"]["admin.mod.php"]["admin_password"] = $_POST["password"];
            $cms["config"]["admin.mod.php"]["admin_salt"]     = cms_admin_pass_gen(8);
            $cms["config"]["admin.mod.php"]["admin_url"]      = "-admin";
            $link = "{$cms['url']['scheme']}://{$cms['url']['host']}{$cms['base_path']}{$cms['config']['admin.mod.php']['admin_url']}";
            
            // Set Locale and Timezone
            $cms["config"]["locale"] = $_POST["locale"];
            $cms["config"]["lang"]   = substr( $cms["config"]["locale"], 0, 2 );
            cms_save_config();

            if ( is_email( $cms["config"]["admin.mod.php"]["admin_login"] ) ) {
                $subject = __( "install_finished" );
                $body  = "<p>" . __( "congrat" ) . "</p>";
                $body .= "<p>" . __( "install_finished" ) . ".</p>";
                $body .= "<p>&nbsp;</p>";
                $body .= "<p>" . __( "login_info" ) . "</p>";
                $body .= "<p>" . __( "login_url" ) . ": <a href='{$link}'>{$link}</a></p>";
                $body .= "<p>" . __( "login" ) . ": {$_POST['login']}</p>";
                $body .= "<p>" . __( "password" ) . ": {$_POST['password']}</p>";
                cms_email( array(
                    "type" => "text/html",
                    "from_email" => "noreply@" . $cms["url"]["host"],
                    "from_name"  => $cms["url"]["host"],
                    "to_email"   => $_POST["login"],
                    "subject"    => $subject,
                    "email_body" => $body,
                ) );
            }
        }
        // Check login and password
        if ( $_POST["login"]    === $cms["config"]["admin.mod.php"]["admin_login"] && 
             $_POST["password"] === $cms["config"]["admin.mod.php"]["admin_password"] )
        {

            $d        = date( "Y-m-d H:i:s" );
            $sess    = sha1( $cms["config"]["admin.mod.php"]["admin_login"] . $cms["config"]["admin.mod.php"]["admin_salt"] . $d );
            
            // Prepend New Session
            if ( ! isset( $cms["config"]["logged"] ) ) {
                $cms["config"]["logged"] = array();
            }
            $cms["config"]["logged"] = array(
                $sess => array(
                    "ip"         => $_SERVER["REMOTE_ADDR"],
                    "date"       => $d,
                    "user_agent" => $_SERVER["HTTP_USER_AGENT"],
                )
            ) + $cms["config"]["logged"];

            // Set Locale and Timezone
            $cms["config"]["locale"] = $_POST["locale"];
            $cms["config"]["lang"]   = substr( $cms["config"]["locale"], 0, 2 );

            if ( cms_save_config() ) {
                
                if ( PHP_VERSION_ID < 70300 ) {
                    setcookie( "sess", $sess, time() + 365 * 24 * 60 * 60 );
                } else {
                    setcookie( "sess", $sess, array( "SameSite" => "Lax", "expires" => time() + 365 * 24 * 60 * 60 ) );
                }
                
                header( "Location: {$cms['base_path']}{$cms['config']['admin.mod.php']['admin_url']}" );
                exit;

            } else {
                
                $error_message = __( "cant_write_config" ) . " .cms/config.php";

            }

        } else {
            
            $error_message = __( "access_denied" );

        }
    }

    // Тема
    if ( isset( $_COOKIE["theme"] ) && $_COOKIE["theme"] === "1" ) {
        $pref_bg = "#e9e0dd";
    } else {
        $pref_bg = "#1e1d1d";
    }
?>
<!doctype html>
<html lang="<?php echo $cms["config"]["lang"]; ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content">
        <title><?php echo $cms['url']['host']; ?></title>
        <link rel="icon" href="<?php echo $cms["base_path"]; ?>img/favicon.svg">
        <style>
            html {
                background-color: <?php echo $pref_bg; ?>;
            }
        </style>


        <?php
        $styles = array();
        foreach( glob( $cms['cms_dir'].'/css/admin.*.css' ) as $file ) {
            preg_match( "/.*(\/admin\.(.+)\.css)/", $file, $m );
            echo "<link rel=stylesheet href='{$cms['base_path']}css{$m[1]}'>\n";
            array_push( $styles, $m[2] );
        }
        echo "<link rel=stylesheet href='{$cms['base_path']}css/admin.css'>";

        echo "<script>\nadmin_styles = " . json_encode( $styles ) . ";\n";
        if ( is_admin() && ! empty( $cms["config"]["locale"] ) ) {
            $lang = json_encode( $cms["lang"] );
            $tr   = json_encode( $cms["tr"] );
            $modules = json_encode( $cms["modules"] );
            if ( is_admin() ) {
                echo "cms = {};
                cms.base_path = '{$cms['base_path']}';
                cms.async_api = true;
                cms.api = '{$cms['base_path']}{$cms['config']['admin.mod.php']['api_url']}';
                cms.locale = '{$cms['config']['locale']}';
                cms.modules = {$modules};
                cms.lang = {$lang};
                cms.tr = {$tr};";
            }
        }
        echo "</script>\n";
        ?>

        <?php do_hook( "admin_header" ); ?>

    </head>


<?php if ( is_admin() ) : ?>

<body class=logged>
    <header>
        <div class=burger>
            <div class=menu-icon>
                <span class=line-1></span>
                <span class=line-2></span>
            </div>
        </div>

        <div class=menu>
            <a href="<?php echo $cms["base_path"]; ?>" data-front target=_blank>
                <?php echo __( "home_link" ); ?>
            </a>
            <div class=clear-cache>
                <?php echo __( "cache_btn" ); ?>
            </div>
            <div class=theme-switcher>
                <?php echo __( "theme_btn" ); ?>
            </div>
            <div data-logout>
                <?php echo __( "logout_btn" ); ?>
            </div>
        </div>
    </header>

    <aside>

<?php
foreach( $cms["admin_sections"] as $section_name => $section ) {
    if ( empty( $section["hide"] ) ) {
        // Не выводим пустые секции
        if ( ! empty( $cms["admin_sections"][$section_name]["items"] ) ) {
            
            echo "<section sort={$section["sort"]}>";
            echo "<div>{$cms['admin_sections'][$section_name]['title']}</div>";

            foreach( $cms["admin_sections"][$section_name]["items"] as $page_name => $page ) {
                if ( empty( $page["hide"] ) ) {
                    $title = __( $page["title"], $page["module"] );
                    // for highlite
                    if ( ! empty( $page["class"] ) ) {
                        $class = "class='{$page['class']}'";
                    } else {
                        $class = "";
                    }
                    if ( empty( $page["url"] ) ) {
                        echo "<a href=#{$page_name} {$class} sort={$page['sort']}>{$title}</a>";
                    } else {
                        echo "<a href='{$page['url']}' target=_blank {$class} sort={$page['sort']}>{$title}</a>";
                    }
                }
            }
            echo "</section>";
        }
    }
}
?>

    </aside>


    <main>

<?php
    $hello = __( "hello" );
    if ( cms_base_connect() === false ) {
        $base_ok = "<p>" . __( "hello_set_base" ) . "</p>";
    } else {
        $base_ok = "";
    }
    
    echo "
<section id=start>
    <div>
        <div>{$hello}</div>
        {$base_ok}
    </div>
</section>";

    foreach( $cms["admin_pages"] as $name => $page ) {
        echo "<section id={$name}>{$page}</section>";
    }
    
?>

    </main>

    <div class=milk></div>

    <div class=log-info-box>
        <!-- div for messages -->
    </div>

<?php else : ?>

<body class=login>
  
    <header>
        <div class=menu>
            <div class=theme-switcher>
                <?php echo __( "theme_btn" ); ?>
            </div>
        </div>
    </header>

    

    <div class=aside-main>
        <div class=center-box>
            <div class=setup-error>
                <?php
                // config.php not writeable
                if ( cms_save_config() === false ) {
                    echo __( "cant_write_config" ) . " {$cms['cms_dir']}/config.php";
                }

                // Error login and password
                if ( isset( $error_message ) ) {
                    echo __( $error_message );
                }
                ?>
            </div>
            
            <?php
                // Scan all locales
                $options = "";
                foreach( glob( "lang/*.UTF-8",  GLOB_ONLYDIR ) as $locale ) {
                    include( $locale . "/admin.mod.php" );
                    $locale = preg_replace( "/.*\//", "", $locale );

                    // translate
                    $lang = $cms["lang"]["admin.mod.php"][$locale][$locale];

                    $options .= "<div class=option value='{$locale}'>{$lang}</div>";
                }
            ?>
            <div class=lang-selector>
                <div class=lang-select-grid>
                    <div class=field-select data-lang='<?php echo $cms["config"]["locale"]; ?>'><?php echo $cms["lang"]["admin.mod.php"][$cms["config"]["locale"]][$cms["config"]["locale"]]; ?></div>
                    <div class=field-options>
                        <?php echo $options; ?>
                    </div>
                </div>
            </div>
            <div class=setup-auth>
                <?php
                if ( empty( $cms["config"]["admin.mod.php"]["admin_login"] ) && empty( $cms["config"]["admin.mod.php"]["admin_password"] ) ) {
                    echo __( "set_login_and_password" );
                }
                ?>
            </div>

            <script>
            <?php
            $form = "
            <form class=login-and-password method=post>
                <div class=login>
                    <input placeholder=\"" . __( "login_or_password" ) . "\" name=login type=text>
                </div>
                <div class=password>
                    <input placeholder=\"" . __( "password" ) . "\" name=password type=password>
                    <button title=\"" . __( "login_btn" ) . "\"></button>
                </div>
                <input type=hidden name=locale value=\"{$cms["config"]["locale"]}\">
            </form>";
            $form = base64_encode( $form );
            ?>
            let f = decodeURIComponent( escape( window.atob( "<?php echo $form; ?>" ) ) );
            document.write( f );

            document.querySelectorAll( ".login-and-password .login input" ).forEach( function( login ) {
                login.focus();
            } );

            function get_cookie( name ) {
                let cookies = document.cookie.split( ";" );
                for ( let line of cookies ) {
                    let cookie = line.split( "=" );
                    if ( name == cookie[ 0 ].trim() ) {
                        return decodeURIComponent( cookie[ 1 ] );
                    }
                }
                return "";
            }

            function set_cookie( name, value ) {
                document.cookie = encodeURIComponent( name ) + "=" + encodeURIComponent( value ) + ";SameSite=Lax";
            }

            // Initial set theme
            let n = get_cookie( "theme" );
            if ( n == undefined || isNaN( n ) || n === "" ) {
                n = 0; // dark
                set_cookie( "theme" , n );
            }
            let theme = admin_styles[n];
            document.documentElement.classList.add( theme );

            // Theme switcher
            document.querySelectorAll( ".theme-switcher" ).forEach( function( el ) {
                el.addEventListener( "click", function( event ) {
                    event.preventDefault();
                    let n = get_cookie( "theme" );
                    document.documentElement.classList.remove( admin_styles[n] );
                    n = (+n+1) % admin_styles.length;
                    document.documentElement.classList.add( admin_styles[n] );
                    set_cookie( "theme" , n );
                } );
            } );

            // Select language. Select
            document.querySelectorAll( ".login .field-select" ).forEach( function( select ) {
                select.addEventListener( "click", function( e ) {
                    e.stopPropagation();
                    select.nextElementSibling.classList.toggle( "open" );
                } );
            } );

            // Select language. Option
            document.querySelectorAll( ".login .field-options .option" ).forEach( function( select ) {
                select.addEventListener( "click", function( e ) {
                    let input = this.closest( ".lang-select-grid" ).querySelector( ".field-select" );
                    input.innerText = this.innerText;
                    input.setAttribute( "data-lang", this.getAttribute( "value" ) );
                    //e.stopPropagation(); убираем чтобы закрылось автоматически
                    let locale = this.getAttribute( "value" );
                    let search = window.location.search.replace( /&*locale=[^&]+/, "" );
                    if ( search == "" ) { 
                        search += "?locale=" + locale;
                    } else if ( search == "?" ) {
                        search += "locale=" + locale;
                    } else {
                        search += "&locale=" + locale;
                    }
                    window.location.search = search;
                } );
            } );

            // Select language
            document.body.addEventListener( "click", function( e ) {
                document.querySelectorAll( ".login .field-options" ).forEach( function( list ) {
                    list.classList.remove( "open" );
                } );
            } );
            </script>

            <div class=flatfree></div>
            <div class=support-box>
                <a target=_blank href='<?php echo __( "support_url" ); ?>'><?php echo __( "support" ); ?></a>
            </div>
        </div>
    </div>

    
<?php endif; ?>
    
</body>
</html>
