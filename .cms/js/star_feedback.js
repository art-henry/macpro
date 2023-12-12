document.addEventListener( "DOMContentLoaded", function( event ) {

/*translate-placeholder*/

    function __( str ) {
        if ( ! translate ) return str;
        if ( ! translate[str] ) return str;
        return translate[str];
    }

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
    
    function set_cookie_expires( name, value ) {
        let expires = ( new Date( Date.now() + 365 * 86400 * 1000 ) ).toUTCString();
        document.cookie = encodeURIComponent( name ) + "=" + encodeURIComponent( value ) + ";SameSite=Lax;Path=/;expires=" + expires;
    }

    function api( data, rfn ) {
        const formData = new FormData();
        for ( let key in data ) {
            if ( ! data.hasOwnProperty( key ) ) continue;
            if ( Array.isArray( data[key] ) ) {
                for ( let key2 in data[key] ) {
                    formData.append( key + "[]", data[key][key2] );
                }
            } else {
                formData.append( key, data[key] );
            }
        }
        let ajax = new XMLHttpRequest();
        ajax.addEventListener( "load", function( event ) {
            let data = JSON.parse( event.target.responseText );
            if ( rfn ) {
                rfn( data );
            }
        } );
        ajax.open( "POST", base_path + "star_feedback_api" );
        ajax.send( formData );
    }


    // Reply Buttons
    document.querySelectorAll( ".star-feedback-btn" ).forEach( function( button ) {

        if ( typeof limit_exceeded !== "undefined" ) {

            button.remove();

        } else {

            button.addEventListener( "click", reply );

        }

    } );

    function reply( e ) {

        this.classList.add( "btn-hide" );

        let exists = document.querySelector( ".star-feedback" );
        if ( exists ) {
            return;
        }

        let help = "";
        if ( moderation ) {
            help = __( "moderated" );
        }
        
        let form = `
        <div class=star-feedback>
            <div class=header>
                <div class=answer>${help}</div>
                <div class=close><div class=x1></div><div class=x2></div></div>
            </div>
            <div class=input-group>
                <label>` + __( "name" ) + `</label>
                <input aria-label="Name" name=name>
            </div>
            <div class=input-group>
                <label>` + __( "email_for_reply" ) + `</label>
                <input aria-label="Email" name=email>
            </div>
            <div class=input-group>
                <label>` + __( "message" ) + `</label>
                <textarea aria-label="Message" name=text maxlength=10000></textarea>
            </div>
            <div class=stars-panel>
                <div class="rating-area">
                    <div class="star" title="` + __( "star_1" ) + `"></div>
                    <div class="star" title="` + __( "star_2" ) + `"></div>
                    <div class="star" title="` + __( "star_3" ) + `"></div>
                    <div class="star" title="` + __( "star_4" ) + `"></div> 
                    <div class="star" title="` + __( "star_5" ) + `"></div>
                </div>
                <div class=send>` + __( "send" ) + `</div>
            </div>
        </div>`;

        this.insertAdjacentHTML( "beforebegin", form );
        let container = this.closest( ".star_feedback" );
        container.scrollTo( 0, container.scrollHeight );

        document.querySelector( `.star-feedback textarea` ).addEventListener( "keyup", function( e ) {
            this.style.height = "";
            if ( this.offsetHeight < this.scrollHeight ) {
                this.style.height = ( this.scrollHeight + 2 ) + "px";
            }
        } );

        document.querySelector( `.star-feedback .close` ).addEventListener( "click", function( e ) {
            this.closest( ".star_feedback" ).querySelector( ".star-feedback-btn" ).classList.remove( "btn-hide" );
            this.closest( ".star-feedback" ).remove();
        } );

        
        document.querySelectorAll( `.star-feedback .star` ).forEach( function( star ) {
            star.addEventListener( "mouseover", function( e ) {
                let status = "add";
                let current_star = this;
                this.closest( ".rating-area" ).querySelectorAll( ".star" ).forEach( function( star ) {
                    if ( status == "add" ) {
                        star.classList.add( "gold" );
                    } else {
                        star.classList.remove( "gold" );
                    }
                    if ( star === current_star ) {
                        status = "remove";
                    }
                } );
            } );
        } );
        document.querySelectorAll( `.star-feedback .star` ).forEach( function( star ) {
            star.addEventListener( "mouseout", function( e ) {
                let stars = this.closest( ".rating-area" ).querySelectorAll( ".star" );
                let status = "remove";
                for ( i = stars.length - 1; i >= 0; i-- ) {
                    if ( stars[i].classList.contains( "active" ) ) {
                        status = "add";
                    }
                    if ( status == "add" ) {
                        stars[i].classList.add( "gold" );
                    } else {
                        stars[i].classList.remove( "gold" );
                    }
                }
            } );
        } );
        document.querySelectorAll( `.star-feedback .star` ).forEach( function( star ) {
            star.addEventListener( "click", function( e ) {
                this.closest( ".rating-area" ).querySelectorAll( ".star" ).forEach( function( star ) {
                    star.classList.remove( "active" );
                } );
                this.classList.add( "active" );
            } );
        } );

        document.querySelector( `.star-feedback .send` ).addEventListener( "click", function( e ) {
            
            let uid = get_cookie( "cms_star_feedback_uid" );
            if ( uid == "" ) {
                for ( $i = 0; $i < 36; $i++ ) {
                    uid += ( Math.floor( Math.random() * 16 ) ).toString( 16 );
                }
                set_cookie_expires( "cms_star_feedback_uid", uid );
                uid = get_cookie( "cms_star_feedback_uid" );
            }

            let stars = 0;
            let stars_elements = document.querySelectorAll( ".star-feedback .star" );
            for ( i = 0; i < stars_elements.length; i++ ) {
                if ( stars_elements[i].classList.contains( "active" ) ) {
                    stars = i + 1;
                }
            }

            let data = {
                fn:    "post_star_feedback_feedback",
                pid:   pid,
                stars: stars,
                name:  document.querySelector( `.star-feedback input[name='name']` ).value,
                email: document.querySelector( `.star-feedback input[name='email']` ).value,
                text:  document.querySelector( `.star-feedback textarea[name='text']` ).value,
            }

            if ( data.name == "" ) {
                alert( __( "empty_name" ) );
                return;
            }
    
            if ( data.text == "" ) {
                alert( __( "empty_message" ) );
                return;
            }

            api( data, function( r ) {

                if ( r.answer ) {
                    document.querySelector( `.star-feedback .answer` ).innerHTML = r.answer;
                }

                if ( r.collapse ) {
                    document.querySelectorAll(  `.star-feedback .input-group` ).forEach( function( el ) {
                        el.remove();
                    } );
                    document.querySelector(  `.star-feedback .send` ).remove();
                    document.querySelector(  `.star-feedback .stars-panel` ).remove();
                }

                if ( r.feedback ) {
                    document.querySelector(  `.star-feedback` ).remove();
                    document.querySelector( `.star-feedback-btn` ).insertAdjacentHTML( "beforebegin", r.feedback );
                }

            } );

        } );

        document.querySelector(  `.star-feedback input[name="name"]` ).focus();

    }

    // Autoscroll
    document.querySelectorAll( ".star_feedback" ).forEach( function( star_feedback ) {

        star_feedback.scrollTo( 0, star_feedback.scrollHeight );

    } );

} );