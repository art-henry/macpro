document.addEventListener( "DOMContentLoaded", function( event ) {

    function _( str ) {
        return __( str, "quiz.mod.php" );
    }

    api( { fn: "get_quiz_list" }, set_quiz_list );

    function set_quiz_list( r ) {

        if ( r.no_database ) {
            document.querySelector( "#quiz .quiz-grid" ).innerHTML = r.no_database;
            return;
        }

        if ( r.result == "success" ) {

            document.querySelector( "#quiz .quiz-grid" ).innerHTML = r.list;

            // Edit Quiz
            document.querySelectorAll( ".quiz-edit" ).forEach( function( button ) {
                button.addEventListener( "click", function( e ){

                    let id = this.closest( "[data-quiz-id]" ).getAttribute( "data-quiz-id" );

                    // Get Quiz Data
                    api( { fn: "get_quiz", id: id }, function( r ) {

                        if ( r.result == "ok" ) {
                            
                            document.querySelector( ".save-quiz-button" ).setAttribute( "data-id", r.quiz.id );
                            document.querySelector( ".quiz-editor-header input[name='title']" ).value = r.quiz.title;
                            document.querySelector( ".quiz-editor textarea" ).value = r.quiz.text;
                            document.querySelector( ".quiz-editor textarea" ).setAttribute( "data-modified", r.quiz.modified );
                            document.querySelector( ".quiz-settings input[name='email']" ).value = r.quiz.email;
                            document.querySelector( ".quiz-settings input[name='host']" ).value = r.quiz.smtp_host;
                            document.querySelector( ".quiz-settings input[name='port']" ).value = r.quiz.smtp_port;
                            document.querySelector( ".quiz-settings input[name='user']" ).value = r.quiz.smtp_user;
                            document.querySelector( ".quiz-settings input[name='password']" ).value = r.quiz.smtp_password;
                            let files_as = document.querySelector( ".quiz-settings [data-files-as]" ).nextElementSibling.querySelector( `[value="${r.quiz.files_as}"]` );
                            if ( files_as ) {
                                files_as.click();
                            }

                            // Show Editor
                            document.querySelector( ".quiz-editor-bg" ).classList.remove( "hidden" );
                            document.body.classList.add( "editor" ); // for notifications

                            // Connect Editor
                            codemirror_connect( ".quiz-editor > textarea", "cmq" );

                            // track changes
                            document.querySelector( ".close-quiz-button" ).setAttribute( "data-changed", "false" );
                            document.querySelector( ".quiz-editor-grid" ).setAttribute( "data-changed", "false" );
                            cmq.on( "change", function( cmq, change ) {
                                document.querySelector( ".close-quiz-button" ).setAttribute( "data-changed", "true" );
                                document.querySelector( ".quiz-editor-grid" ).setAttribute( "data-changed", "true" );
                            } );

                            // set cursor to editor
                            cmq.focus();

                            // Save Page Ctrl+S
                            document.documentElement.addEventListener( "keydown", CtrlS );

                        }
                        
                    } );
                } );
            } );

            // Delete Quiz
            document.querySelectorAll( ".quiz-del" ).forEach( function( button ) {
                button.addEventListener( "click", function( e ) {
                    if ( ! confirm( _( "Удалить опрос?" ) ) ) return;
                    var data = {
                        fn: "del_quiz",
                        id: this.closest( "[data-quiz-id]" ).getAttribute( "data-quiz-id" )
                    };
                    api( data, function( r ) {
                        if ( r.info_text ) {
                            notify( r.info_text, r.info_class, r.info_time );
                        }
                        if ( r.result == "success" ) {
                            document.querySelector( `[data-quiz-id="${data.id}"]` ).remove();
                        }
                    } );
                } );
            } );

        }
    }

    function CtrlS( e ) {
        if ( e.code == "KeyS" && e.ctrlKey == true ) {
            e.preventDefault(); // don't save page
            if ( window.location.hash == "#quiz" ) {
                document.querySelector( ".save-quiz-button" ).click();
            }
        }
    }

    // Save Quiz
    document.querySelectorAll( ".save-quiz-button" ).forEach( function( button ) {
        button.addEventListener( "click", function( e ){
            window.cmq.save(); // drop changes to textarea
            var data = {
                fn:            "save_quiz",
                id:            this .getAttribute( "data-id" ),
                modified:      document.querySelector( ".quiz-editor textarea" ).getAttribute( "data-modified" ),
                title:         document.querySelector( ".quiz-editor-header input[name='title']" ).value,
                text:          document.querySelector( ".quiz-editor textarea" ).value,
                email:         document.querySelector( ".quiz-settings input[name='email']" ).value,
                smtp_host:     document.querySelector( ".quiz-settings input[name='host']" ).value,
                smtp_port:     document.querySelector( ".quiz-settings input[name='port']" ).value,
                smtp_user:     document.querySelector( ".quiz-settings input[name='user']" ).value,
                smtp_password: document.querySelector( ".quiz-settings input[name='password']" ).value,
                files_as:      document.querySelector( ".quiz-settings [data-files-as]" ).getAttribute( "data-files-as" )
            }
            api( data, function( r ) {
                if ( r.info_text ) {
                    notify( r.info_text, r.info_class, r.info_time );
                }
                if ( r.result = "success" ) {
                    document.querySelector( ".quiz-editor textarea" ).setAttribute( "data-modified", r.modified );
                    document.querySelector( `[data-quiz-id="${data.id}"] .quiz-title` ).innerHTML = data.title;
                    document.querySelector( ".close-quiz-button" ).setAttribute( "data-changed", "false" );
                    document.querySelector( ".quiz-editor-grid" ).setAttribute( "data-changed", "false" );
                    // edit marker
                    document.querySelectorAll( ".quiz-grid > div" ).forEach( function( item ) {
                        item.classList.remove( "last-edited" );
                    } );
                    document.querySelector( `.quiz-grid [data-quiz-id="${data.id}"]` ).classList.add( "last-edited" );
                    // close editor after save
                    if ( document.querySelector( ".save-quiz-button" ).getAttribute( "data-close" ) === "true" ) {
                        document.querySelector( ".save-quiz-button" ).setAttribute( "data-close", "false" );
                        document.querySelector( ".close-quiz-button" ).click();
                    }
                    // highlight save button
                    document.querySelector( ".save-quiz-button" ).classList.add( "saved" );
                    setTimeout( function() {
                        document.querySelector( ".save-quiz-button" ).classList.remove( "saved" );
                    }, 1000 );
                }
            } );
        } );
    } );

    // Create Quiz
    document.querySelector( ".quiz-create" ).addEventListener( "click", function( e ) {
        api( { fn: "create_quiz" }, function( r ) {
            if ( r.info_text ) {
                notify( r.info_text, r.info_class, r.info_time );
                if ( r.info_class == "info-success" ) {
                    set_quiz_list( r );
                }
            }
        } );
    } );

    // Close Editor
    document.querySelectorAll( ".close-quiz-button" ).forEach( function( button ) {
        button.onclick = function( e ) {
            document.documentElement.removeEventListener( "keydown", CtrlS );
            // detach
            if ( window.cmq !== undefined ) {
                if ( this.getAttribute( "data-changed" ) === "true" ) {
                    if ( confirm( _( "Сохранить изменения?" ) ) ) {
                        document.querySelector( ".save-quiz-button" ).setAttribute( "data-close", "true" );
                        document.querySelector( ".save-quiz-button" ).click();
                        return;
                    }
                }
                window.cmq.toTextArea();
                window.cmq = null;
            }
            // hide editor
            document.querySelector( ".quiz-editor-bg" ).classList.add( "hidden" );
            document.body.classList.remove( "editor" ); // for notifications
        };
    } );

    // Select
    document.querySelectorAll( "#quiz .field-select" ).forEach( function( select ) {
        select.addEventListener( "click", function( e ) {
            e.stopPropagation();
            select.nextElementSibling.classList.toggle( "open" );
        } );
    } );
    // Option
    document.querySelectorAll( "#quiz .field-options .option" ).forEach( function( option ) {
        option.addEventListener( "click", function( e ) {
            let input = this.closest( ".select-grid" ).querySelector( ".field-select" );
            input.innerText = this.innerText;
            input.setAttribute( "data-files-as", this.getAttribute( "value" ) );
        } );
    } );
    // Select
    // Закрытие выпадающих списков при кликах вне их, а так же по ним
    document.body.addEventListener( "click", function( e ) {
        document.querySelectorAll( "#quiz .field-options" ).forEach( function( list ) {
            list.classList.remove( "open" );
        } );
    } );

} );
