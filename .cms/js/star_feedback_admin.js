document.addEventListener( "DOMContentLoaded", function( event ) {

    function _( str ) {
        return __( str, "star_feedback.mod.php" );
    }

    api( { fn: "get_star_feedback_list" }, set_star_feedback_list );
    api( { fn: "get_star_feedback_banned_list" }, set_star_feedback_banned_list );

    function set_star_feedback_list( r ) {

        if ( r.no_database ) {
            document.querySelector( "#star_feedback .feedbacks-grid" ).innerHTML = r.no_database;
            return;
        }

        if ( r.overloaded ) {
            let m = _( "server_overloaded_xxx" );
            m = m.replace( "xxx", r.feedbacks.length );
            notify( m, "info-error", 5000 );
        }

        let grid = document.querySelector( "#star_feedback .feedbacks-grid" );
        let count = document.querySelector( "#star_feedback .main-footer .count" );
        let loaded = document.querySelector( "#star_feedback .main-footer .loaded" );
        if ( cms.clear_star_feedback_list ) {
            cms.clear_star_feedback_list = false;
            grid.innerHTML = "";
            loaded.value = "0";
        }

        count.innerText = r.count;
        loaded.setAttribute( "data-offset", r.offset );

        // insert feedbacks
        let start = Date.now();
        for ( let i = 0; i < r.feedbacks.length; i++ ) {
            grid.insertAdjacentHTML( "beforeend", r.feedbacks[i].html );
            set_controls( r.feedbacks[i].id );
            loaded.value = parseInt( loaded.value ) + 1;
            if ( Date.now() - start > 1000 ) {
                let m = _( "browser_overloaded_xxx" );
                m = m.replace( "xxx", i + 1 );
                m = m.replace( "nnn", r.feedbacks.length );
                notify( m, "info-error", 5000 );
                break;
            }
        }

        create_pager();

    }

    function set_controls( id ) {
        
        // Publish
        document.querySelectorAll( `#star_feedback .feedbacks-grid [data-id="${id}"] .feedback_public` ).forEach( function( btn ) {
            btn.addEventListener( "click", function( e ) {
                api( { fn: "star_feedback_publish", id: id }, function( r ) {
                    notify( r.info_text, r.info_class, r.info_time );
                    let feedback = document.querySelector( `#star_feedback .feedbacks-grid [data-id="${id}"]` );
                    if ( r.date != "" ) {
                        feedback.classList.remove( "unpublished" );
                        feedback.classList.add( "published" );
                    } else {
                        feedback.classList.remove( "published" );
                        feedback.classList.add( "unpublished" );
                    }
                    feedback.querySelector( `.feedback_public` ).innerText = r.button;
                } );
            } );
        } );

        // Ban
        document.querySelectorAll( `#star_feedback .feedbacks-grid [data-id="${id}"] .feedback_ban` ).forEach( function( btn ) {
            btn.addEventListener( "click", function( e ) {
                let uid  = btn.closest( "[data-id]" ).getAttribute( "data-uid" );
                let name = btn.closest( "[data-id]" ).querySelector( ".user .name" ).value;
                api( { fn: "star_feedback_ban", id: id, uid: uid, name: name }, function( r ) {
                    if ( r.info_text ) {
                        notify( r.info_text, r.info_class, r.info_time );
                    }
                    if ( r.info_class == "info-success" ) {
                        api( { fn: "get_star_feedback_banned_list" }, set_star_feedback_banned_list );
                    }
                } );
            } );
        } );

        document.querySelectorAll( `#star_feedback .rating-area .star` ).forEach( function( star ) {
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
        document.querySelectorAll( `#star_feedback .rating-area .star` ).forEach( function( star ) {
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
        document.querySelectorAll( `#star_feedback .rating-area .star` ).forEach( function( star ) {
            star.addEventListener( "click", function( e ) {
                this.closest( ".rating-area" ).querySelectorAll( ".star" ).forEach( function( star ) {
                    star.classList.remove( "active" );
                } );
                this.classList.add( "active" );
            } );
        } );

        // Save
        document.querySelectorAll( `#star_feedback .feedbacks-grid [data-id="${id}"] .save` ).forEach( function( btn ) {
            btn.addEventListener( "click", function( e ) {
                let container = btn.closest( "[data-id]" );

                let stars = 0;
                let stars_elements = container.querySelectorAll( ".star" );
                for ( i = 0; i < stars_elements.length; i++ ) {
                    if ( stars_elements[i].classList.contains( "active" ) ) {
                        stars = i + 1;
                    }
                }

                let data = {
                    fn:       "star_feedback_save",
                    stars:    stars,
                    id:       container.getAttribute( "data-id" ),
                    created:  container.querySelector( "input[name='created']" ).value,
                    user:     container.querySelector( "input[name='user']" ).value,
                    text:     container.querySelector( "textarea[name='text']" ).value,
                    answered: container.querySelector( "input[name='answered']" ).value,
                    admin:    container.querySelector( "input[name='admin']" ).value,
                    answer:   container.querySelector( "textarea[name='answer']" ).value,
                }
                api( data, function( r ) {
                    if ( r.info_text ) {
                        notify( r.info_text, r.info_class, r.info_time );
                    }
                    if ( r.answered !== undefined ) {
                        container.querySelector( "input[name='answered']" ).value = r.answered;
                    }
                } );
            } );
        } );

    }

    function create_pager() {
        let loaded = document.querySelector( "#star_feedback .main-footer .loaded" );
        let offset = parseInt( loaded.getAttribute( "data-offset" ) );
        let count  = parseInt( document.querySelector( "#star_feedback .main-footer .count" ).innerText );
        if ( count === 0 ) { count++; }
        let p = get_cookie( "star_feedback_pager" );
        let feedbacks  = Math.ceil( count / p );
        let pager  = document.querySelector( "#star_feedback .main-footer .pager" );
        pager.innerHTML = "";
        if ( feedbacks > 1 ) {
            for ( let i = 1; i <= feedbacks; i++ ) {
                let p = document.createElement( "div" );
                p.innerText = i;
                p.setAttribute( "data-offset", i - 1 );
                pager.appendChild( p );
            }
            document.querySelector( `#star_feedback .main-footer .pager [data-offset="${offset}"]` ).classList.add( "active" );
            document.querySelectorAll( "#star_feedback .main-footer .pager > div" ).forEach( function( el ) {
                el.addEventListener( "click", function( e ) {
                    let offset = this.getAttribute( "data-offset" );
                    let search = document.querySelector( "#star_feedback .feedbacks-search" ).value;
                    let data = {
                        fn: "get_star_feedback_list",
                        offset: offset,
                        search: search
                    }
                    document.querySelector( "#star_feedback .main-main" ).scrollTop = 0;
                    cms.clear_star_feedback_list = true;
                    api( data, set_star_feedback_list );
                } );
            } );
            // scroll
            pager.onmousedown = function( e ) {
                let pageX = 0;
                let pageY0 = 0;
              
                document.onmousemove = function( e ) {
                    if ( pageX !== 0 ) {
                        pager.scrollLeft = pager.scrollLeft + ( pageX - e.pageX );
                    }
                    pageX = e.pageX;
                    // fix for google chrome
                    if ( pageY0 === 0 ) {
                        pageY0 = e.pageY;
                    }
                    if ( Math.abs( pageY0 - e.pageY ) > 64 ) {
                        const event = new Event( "mouseup" );
                        pager.dispatchEvent( event );
                    }
                }
              
                // end drag
                pager.onmouseup = function() {
                    document.onmousemove = null;
                    pager.onmouseup = null;
                }
              
                // disable browser drag
                pager.ondragstart = function() {
                    return false;
                }
            }
        }

    }

    // pager counter
    document.querySelector( "#star_feedback .main-footer input" ).addEventListener( "keydown", function( e ) {
        if ( e.keyCode === 13 ) { // keyCode work on mobile
            let p = document.querySelector( "#star_feedback .main-footer input" ).value;
            set_cookie( "star_feedback_pager", p );
            cms.clear_star_feedback_list = true;
            api( { fn: "get_star_feedback_list", search: document.querySelector( "#star_feedback .feedbacks-search" ).value }, set_star_feedback_list );
        }
    } );


    // Search feedbacks
    document.querySelector( "#star_feedback .feedbacks-search" ).addEventListener( "keydown", function( e ) {
        if ( e.keyCode === 13 ) {
            search_star_feedback();
        }
    } );

    document.querySelector( "#star_feedback .feedbacks-search-button" ).addEventListener( "click", search_star_feedback );

    function search_star_feedback() {
        let search_string = document.querySelector( "#star_feedback .feedbacks-search" ).value;
        let data = {
            fn: "get_star_feedback_list",
            search: search_string
        };
        cms.clear_star_feedback_list = true;
        api( data, set_star_feedback_list );
    }

    // Reset Search
    document.querySelector( "#star_feedback .reset" ).addEventListener( "click", function() {
        document.querySelector( "#star_feedback .feedbacks-search" ).value = "";
        document.querySelector( "#star_feedback .feedbacks-search-button" ).click();
    } );

    // Delete feedbacks
    document.querySelectorAll( "#star_feedback .del-feedbacks-btn" ).forEach( function( button ) {
        button.addEventListener( "click", function( e ) {
            let ids = [];
            document.querySelectorAll( "#star_feedback .feedbacks-grid input[type=checkbox]:checked" ).forEach( function( ch ) {
                let id = ch.closest( "[data-id]" ).getAttribute( "data-id" );
                ids.push( id );
            } );
            if ( ids.length === 0 ) {
                notify( _( "no_selected_feedbacks" ), "info-error", 5000 );
                return;
            }
            if ( ! confirm( _( "confirm_delete_feedbacks" ) ) ) {
                return;
            }
            let data = {
                fn: "del_star_feedback",
                ids: ids
            };
            api( data, function( r ) {
                if ( r.info_text ) {
                    notify( r.info_text, r.info_class, r.info_time );
                    if ( r.info_class == "info-success" ) {
                        data.ids.forEach( function( id ) {
                            document.querySelector( `#star_feedback .feedbacks-grid [data-id="${id}"]` ).remove();
                        } );
                        let count = document.querySelector( "#star_feedback .main-footer .count" );
                        let loaded = document.querySelector( "#star_feedback .main-footer .loaded" );
                        loaded.value = parseInt( loaded.value ) - data.ids.length;
                        count.innerText = parseInt( count.innerText ) - data.ids.length;
                        
                        // load feedbacks
                        let limit = `LIMIT ${data.ids.length}`;
                        let last_child = document.querySelector( "#star_feedback .feedbacks-grid > div:last-child" );
                        let where;
                        if ( last_child ) {
                            let last_id = last_child.getAttribute( "data-id" );
                            where = `id < ${last_id}`;
                        } else {
                            where = "";
                        }
                        let offset = document.querySelector( "#star_feedback .main-footer .loaded" ).getAttribute( "data-offset" );
                        let search = document.querySelector( "#star_feedback .feedbacks-search" ).value;
                        let data2 = {
                            fn: "get_star_feedback_list",
                            limit: limit,
                            where: where,
                            offset: offset,
                            search: search
                        };
                        api( data2, set_star_feedback_list );
                    }
                }
            } );
        } );
    } );

    // Settings
    document.querySelector( "#star_feedback .settings_tab" ).addEventListener( "click", function( e ) {
        document.querySelector( "#star_feedback .settings" ).classList.remove( "hidden" );
    } );

    // Close Settings
    document.querySelector( "#star_feedback .close" ).addEventListener( "click", function( e ) {
        document.querySelector( "#star_feedback .settings" ).classList.add( "hidden" );
    } );

    function set_star_feedback_banned_list( r ) {

        if ( r.no_database ) {
            document.querySelector( "#star_feedback .settings .banned" ).innerHTML = r.no_database;
            return;
        }

        let grid = document.querySelector( "#star_feedback .settings .banned" );
        grid.innerHTML = "";
        for ( let i = 0; i < r.ban_list.length; i++ ) {
            grid.insertAdjacentHTML( "beforeend", r.ban_list[i].html );
            set_ban_controls( r.ban_list[i].id );
        }

    }

    function set_ban_controls( id ) {
        document.querySelectorAll( `#star_feedback .settings .banned [data-id="${id}"] .delete` ).forEach( function( btn ) {
            btn.addEventListener( "click", function( e ) {
                let id = this.closest( "[data-id]" ).getAttribute( "data-id" );
                api( { fn: "star_feedback_unban", id: id }, function( r ) {
                    notify( r.info_text, r.info_class, r.info_time );
                    document.querySelector( `#star_feedback .settings .banned [data-id="${id}"]` ).remove();
                } );
            } );
        } );
    }

    // Save settings
    document.querySelector( "#star_feedback .settings button.save" ).addEventListener( "click", function( e ) {

        let settings = document.querySelector( "#star_feedback .settings" );
        let data = {
            fn: "star_feedback_save_settings",
            moderation:         settings.querySelector( "input[name='moderation']" ).checked,
            email:              settings.querySelector( "input[name='email']" ).value,
            smtp_host:          settings.querySelector( "input[name='smtp_host']" ).value,
            smtp_port:          settings.querySelector( "input[name='smtp_port']" ).value,
            smtp_login:         settings.querySelector( "input[name='smtp_login']" ).value,
            smtp_password:      settings.querySelector( "input[name='smtp_password']" ).value,
            admin:              settings.querySelector( "input[name='admin']" ).value,
            feedbacks_per_page: settings.querySelector( "input[name='feedbacks_per_page']" ).value,
            button_text:        settings.querySelector( "input[name='button_text']" ).value,
        };
        api( data, function( r ) {
            notify( r.info_text, r.info_class, r.info_time );
            document.querySelector( "#star_feedback .feedbacks-search-button" ).click();
        } );

    } );

} );