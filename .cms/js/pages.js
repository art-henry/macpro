document.addEventListener( "DOMContentLoaded", function( event ) {

    function _( str ) {
        return __( str, "pages.mod.php" );
    }

    // Полностью этот скрипт отключить нельзя если включены Инструменты,
    // поэтому нужна проверка
    if ( document.querySelector( "#pages" ) ) {
        api( { fn: "get_pages_list" }, set_pages_list );
    }

    function set_pages_list( r ) {

        if ( ! document.querySelector( "#pages" ) ) return;

        if ( r.no_database ) {
            document.querySelector( "#pages .pages-grid" ).innerHTML = r.no_database;
            return;
        }

        if ( r.overloaded ) {
            let m = _( "server_overloaded_xxx" );
            m = m.replace( "xxx", r.pages.length );
            notify( m, "info-error", 5000 );
        }

        // Запоминаем результаты какого поиска мы получили
        // Это нужно чтобы не загружать снова все страницы при создании новой
        // не производить сброс поиска.
        let pages_search = document.querySelector( "#pages .page-search" );
        pages_search.setAttribute( "data-result-of", r.search );

        let grid = document.querySelector( "#pages .pages-grid" );
        let count = document.querySelector( "#pages .main-footer .count" );
        let loaded = document.querySelector( "#pages .main-footer .loaded" );
        if ( cms.clear_pages_list ) {
            cms.clear_pages_list = false;
            grid.innerHTML = "";
            loaded.value = "0";
        }

        // Всего страниц в БД
        count.innerText = r.count;

        // При удалении страниц подгружаются последние и не нужно менять смещение у пейджера
        if ( cms.dont_change_offset ) {
            cms.dont_change_offset = false;
        } else {
            loaded.setAttribute( "data-offset", r.offset );
        }

        // insert pages
        let start = Date.now();
        for ( let i = 0; i < r.pages.length; i++ ) {
            grid.insertAdjacentHTML( "beforeend", r.pages[i].html );
            loaded.value = +loaded.value + 1;
            let page = grid.querySelector( `[data-id="${r.pages[i].id}"]` );
            set_controls( page );
            if ( Date.now() - start > 1000 ) {
                let m = _( "browser_overloaded_xxx" );
                m = m.replace( "xxx", i + 1 );
                m = m.replace( "nnn", r.pages.length );
                notify( m, "info-error", 5000 );
                break;
            }
        }

        create_pager();

        // При создании страницы было обнаружено что поиск не сброшен,
        // поэтому была вызвана функция загрузки страниц с пустым поиском
        // и пришло время создать новую страницу
        if ( cms.create_page_fn ) {
            cms.create_page_fn();
            cms.create_page_fn = null;
        }

    }

    function create_pager() {
        let loaded = document.querySelector( "#pages .main-footer .loaded" );
        let offset = parseInt( loaded.getAttribute( "data-offset" ) );
        let count  = parseInt( document.querySelector( "#pages .main-footer .count" ).innerText );
        if ( count === 0 ) { count++; }
        let cookie_pp = get_cookie( "pages_pager" );
        let pages  = Math.ceil( count / cookie_pp );
        let pager  = document.querySelector( "#pages .main-footer .pager" );
        pager.innerHTML = "";
        if ( pages > 1 ) {
            for ( let i = 1; i <= pages; i++ ) {
                let p = document.createElement( "div" );
                p.innerText = i;
                p.setAttribute( "data-offset", ( i - 1 ) * cookie_pp );
                pager.appendChild( p );
            }
            pager.querySelector( `[data-offset="${offset}"]` ).classList.add( "active" );
            pager.childNodes.forEach( function( el ) {
                el.addEventListener( "click", function( e ) {
                    let offset = this.getAttribute( "data-offset" );
                    let search = document.querySelector( "#pages .page-search" ).value;
                    let data = {
                        fn: "get_pages_list",
                        offset: offset,
                        search: search
                    }
                    document.querySelector( "#pages .main-main" ).scrollTop = 0;
                    cms.clear_pages_list = true;
                    api( data, set_pages_list );
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
    let pager_counter = document.querySelector( "#pages .main-footer input" );
    if ( pager_counter ) pager_counter.addEventListener( "keydown", function( e ) {
        if ( e.keyCode === 13 ) { // keyCode work on mobile
            let p = document.querySelector( "#pages .main-footer input" ).value;
            set_cookie_expires( "pages_pager", p );
            cms.clear_pages_list = true;
            api( { fn: "get_pages_list", search: document.querySelector( "#pages .page-search" ).value }, set_pages_list );
        }
    } );

    function set_controls( selector ) {

        // Open properties
        selector.querySelectorAll( ".page-prop-btn" ).forEach( function( button ) {
            button.addEventListener( "click", function( e ) {
                let id = this.closest( "[data-id]" ).getAttribute( "data-id" );
                document.querySelector( `#pages .pages-grid [data-id="${id}"]` ).classList.toggle( "open" );
            } );
        } );

        // Save properties
        selector.querySelectorAll( ".page-prop-save-btn" ).forEach( function( button ) {
            button.addEventListener( "click", function( e ) {
                let id       = this.closest( "[data-id]" ).getAttribute( "data-id" );
                let item = document.querySelector( `#pages .pages-grid [data-id="${id}"] ` );
                let data = {
                    fn:           "save_prop",
                    id:           id,
                    title:        item.querySelector( '[name="title"]' ).value,
                    seo_title:    item.querySelector( '[name="seo_title"]' ).value,
                    url:          item.querySelector( '[name="url"]' ).value,
                    date:         item.querySelector( '[name="date"]' ).value,
                    time:         item.querySelector( '[name="time"]' ).value,
                    template:     item.querySelector( '.template-select-grid .field-select' ).getAttribute( "data-template" ),
                    old_template: item.querySelector( '.template-select-grid .field-select' ).getAttribute( "data-old-template" ),
                    description:  item.querySelector( '[name="description"]' ).value,
                    tags:         item.querySelector( '[name="tags"]' ).value,
                }
                api( data, function( r ) {
                    if ( r.ok == "false" ) { // FIXME: never fire
                        notify( r.info_text, r.info_class, 5000 );
                    }
                    if ( r.ok == "true" ) {

                        // Update Title, URL and Date
                        item.querySelector( ".page-name" ).innerHTML = r.title;
                        item.querySelector( ".page-name" ).setAttribute( "href", r.base_path + r.url );
                        update_home();
                        item.querySelector( "[name=url]" ).value = r.url;
                        let date = item.querySelector( ".page-date" );
                        date.innerHTML = r.created;
                        if ( r.planned ) {
                            date.classList.add( "future" );
                        } else {
                            date.classList.remove( "future" );
                        }

                        // update old template
                        item.querySelector( '.template-select-grid .field-select' ).setAttribute( "data-old-template", data.template );

                        // edit marker
                        document.querySelectorAll( "#pages .pages-grid > div" ).forEach( function( el ) {
                            el.classList.remove( "last-edited" );
                        } );
                        setTimeout( function() {
                            item.classList.add( "last-edited" );
                        }, 200 );

                        // highlight save button
                        button.classList.add( "saved" );
                        setTimeout( function() {
                            button.classList.remove( "saved" );
                        }, 200 );

                        notify( r.info_text, r.info_class, 5000 );

                        // update event for menu
                        if ( r.update_menu == "true" ) {
                            let event = new Event( "update_menu" );
                            document.body.dispatchEvent( event );
                        }
                    }
                    
                } );
            } );
        } );

        // Pin Page
        selector.querySelectorAll( ".pin" ).forEach( function( pin ) {
            pin.addEventListener( "click", function( e ) {
                let box  = this.closest( "[data-id]" );
                let id   = box.getAttribute( "data-id" );
                let pin  = box.getAttribute( "data-pin" );
                if ( pin === "1" ) {
                    pin = "0";
                } else {
                    pin = "1";
                }
                let data = {
                    fn:  "page_pin",
                    id:  id,
                    pin: pin
                }
                api( data, function( r ) {
                    if ( r.ok == "true" ) {
                        box.setAttribute( "data-pin", pin );
                    }
                } );
            } );
        } );
        
        // Publish Page
        selector.querySelectorAll( ".published" ).forEach( function( pub ) {
            pub.addEventListener( "click", function( e ) {
                let box  = this.closest( "[data-id]" );
                let id   = box.getAttribute( "data-id" );
                let published  = box.getAttribute( "data-published" );
                if ( published === "1" ) {
                    published = "0";
                } else {
                    published = "1";
                }
                let data = {
                    fn:  "page_publish",
                    id:  id,
                    published: published
                }
                api( data, function( r ) {
                    if ( r.ok == "true" ) {
                        box.setAttribute( "data-published", published );
                        if ( published == "1" ) {
                            pub.setAttribute( "title", _( "published" ) );
                        } else {
                            pub.setAttribute( "title", _( "unpublished" ) );
                        }
                    }
                } );
            } );
        } );

        // Edit page
        selector.querySelectorAll( ".page-edit-btn" ).forEach( function( button ) {
            button.addEventListener( "click", function( e ) {
                button.classList.add( "loading" );
                let id = this.closest( "[data-id]" ).getAttribute( "data-id" );
                // get page from server
                api( { fn: "get_page", id: id }, function( r ) {
                    button.classList.remove( "loading" );
                    if ( r.result == "ok" ) {
                        let title = document.querySelector( "#pages .page-editor-title" );
                        title.innerHTML = r.page.title;
                        title.setAttribute( "href", r.base_path + r.page.url );
                        let props = document.querySelector( "#pages .page-properties" );
                        props.querySelector( "input[name='title']" ).value = r.page.title;
                        props.querySelector( "input[name='url']" ).value = r.page.url;
                        props.querySelector( "input[name='seo_title']" ).value = r.page.seo_title;
                        props.querySelector( "textarea[name='description']" ).value = r.page.description;
                        props.querySelector( "textarea[name='tags']" ).value = r.page.tags;
                        props.querySelector( "input[name='date']" ).value = r.date;
                        props.querySelector( "input[name='time']" ).value = r.time;
                        let select = props.querySelector( ".template-select-grid" );
                        let options = select.querySelector( ".field-options" );
                        options.innerHTML = r.options;
                        let tpl = select.querySelector( ".field-select" );
                        tpl.setAttribute( "data-template", r.option );
                        tpl.setAttribute( "data-old-template", r.option );
                        tpl.innerText = r.option_tr;
                        document.querySelector( "#pages .page-editor > textarea" ).value = r.page.text;
                        if ( r.page.modified != null ) { // prevent delete attribute
                            document.querySelector( "#pages .page-editor > textarea" ).setAttribute( "data-modified", r.page.modified );
                        }
                        document.querySelector( "#pages .save-page-button" ).setAttribute( "data-id", r.page.id );

                        options.querySelectorAll( ".option" ).forEach( function( option ) {
                            option.addEventListener( "click", click_select_option );
                        } );
                        
                        
                        // Images
                        document.querySelector( "#pages .link-file-tag" ).innerHTML = "";
                        document.querySelector( "#pages .del-uploaded-files" ).classList.add( "disabled" );
                        document.querySelector( "#pages .mediateka-files-grid" ).innerHTML = r.flist;
                        document.querySelectorAll( "#pages .mediateka-files-grid input[type=checkbox]" ).forEach( function( checkbox ) {
                            checkbox.addEventListener( "change", img_rechecked );
                        } );
                        document.querySelectorAll( "#pages .file-block" ).forEach( function( block ) {
                            block.addEventListener( "click", img_click );
                        } );
                        document.querySelectorAll( "#pages .mediateka-files-grid img" ).forEach( function( img ) {
                            img.addEventListener( "dblclick", img_lbox );
                        } );

                        // Show Editor
                        document.querySelector( "#pages .page-editor-bg" ).classList.remove( "hidden" );
                        document.body.classList.add( "editor" ); // for notifications

                        // Connect Editor
                        codemirror_connect( "#pages .page-editor > textarea", "cm" );

                        // restore scroll and cursor position
                        let cursor = localStorage.getItem( "cursor_page_" + id );
                        if ( cursor ) {
                            cursor = JSON.parse( cursor );
                            window.cm.scrollTo( cursor.left, cursor.top );
                            window.cm.setCursor( { line:cursor.line, ch:cursor.ch } );
                            window.cm.refresh();
                            //window.cm.scrollIntoView( { line:cursor.line, ch:cursor.ch } ); // fix glitch
                        }

                        // track changes
                        document.querySelector( "#pages .close-page-button" ).setAttribute( "data-changed", "false" );
                        document.querySelector( "#pages .page-editor-grid" ).setAttribute( "data-changed", "false" );
                        cm.on( "change", function( cm, change ) {
                            document.querySelector( "#pages .close-page-button" ).setAttribute( "data-changed", "true" );
                            document.querySelector( "#pages .page-editor-grid" ).setAttribute( "data-changed", "true" );
                        } );
                        // save scroll and cursor position
                        [ "cursorActivity", "scroll" ].forEach( function( event ) {
                            cm.on( event, function() {
                                let cursor = window.cm.getCursor();
                                let scroll = window.cm.getScrollInfo();
                                localStorage.setItem( "cursor_page_" + id, JSON.stringify( { line:cursor.line, ch:cursor.ch, left: scroll.left, top: scroll.top } ) );
                            } );
                        } );

                        // set focus to editor
                        cm.focus();

                        // Save Page Ctrl+S
                        document.documentElement.addEventListener( "keydown", CtrlS );

                        // open tags panel
                        if ( document.documentElement.offsetWidth >= 1024 ) {
                            document.querySelector( "#pages .page-editor-grid" ).classList.add( "tags-opened" );
                        }
                    }
                } );
            } );
        } );

        // Select
        selector.querySelectorAll( ".field-select" ).forEach( function( select ) {
            select.addEventListener( "click", function( e ) {
                e.stopPropagation();
                select.nextElementSibling.classList.toggle( "open" );
            } );
        } );
        // Option шаблона
        // вынесено в функцию потому что динамическое изменение
        selector.querySelectorAll( ".field-options .option" ).forEach( function( option ) {
            option.addEventListener( "click", click_select_option );
        } );

        // Транслитерация URL
        selector.querySelectorAll( ".url-translit" ).forEach( function( btn ) {
            btn.addEventListener( "click", function( e ) {
                let url = selector.querySelector( "input[name='title']" ).value;
                let tr_url = url_translit( url );
                this.previousElementSibling.value = tr_url;
            } );
        } );

    }

    // Клик по опции выбора шаблона
    function click_select_option( e ) {
        let select = this.closest( ".template-select-grid" );
        let value  = this.getAttribute( "value" );
        select_switch_to( select, value );
    }

    //todo: докрутить data-template и data-old-template
    function select_switch_to( select, value ) {
        let field_select = select.querySelector( ".field-select" );
        let old_value = field_select.getAttribute( "data-template" );
        if ( old_value != value ) {
            let old_name = field_select.innerText;
            let field_options = select.querySelector( ".field-options" );
            let option = field_options.querySelector( `[value="${value}"]` );
            field_select.innerText = option.innerText;
            field_select.setAttribute( "data-template", value );
            option.remove();
            let option_html = `<div class=option value="${old_value}">${old_name}</div>`;
            field_options.insertAdjacentHTML( "afterbegin", option_html );
            field_options.firstChild.addEventListener( "click", click_select_option );
        }
    }

    // Select for editor
    document.querySelectorAll( ".page-properties .field-select" ).forEach( function( select ) {
        select.addEventListener( "click", function( e ) {
            e.stopPropagation();
            select.nextElementSibling.classList.toggle( "open" );
        } );
    } );

    // Select
    // Закрытие выпадающих списков при кликах вне их, а так же по ним
    document.body.addEventListener( "click", function( e ) {
        document.querySelectorAll( "#pages .field-options" ).forEach( function( list ) {
            list.classList.remove( "open" );
        } );
    } );

    // Search page
    let pages_search = document.querySelector( "#pages .page-search" );
    if ( pages_search ) pages_search.addEventListener( "keydown", function( e ) {
        if ( e.keyCode === 13 ) {
            search_pages();
        }
    } );

    let search_btn = document.querySelector( "#pages .page-search-button" );
    if ( search_btn ) search_btn.addEventListener( "click", function( e ) {
        search_pages();
        document.querySelector( "#pages .page-search" ).focus();
    } );

    function search_pages() {
        let search_string = document.querySelector( "#pages .page-search" ).value;
        let data = {
            fn: "get_pages_list",
            search: search_string
        };
        cms.clear_pages_list = true;
        api( data, set_pages_list );
    }

    // Reset Search
    let reset_btn = document.querySelector( "#pages .reset" );
    if ( reset_btn ) reset_btn.addEventListener( "click", function() {
        document.querySelector( "#pages .page-search" ).value = "";
        document.querySelector( "#pages .page-search-button" ).click();
        document.querySelector( "#pages .page-search" ).focus();
    } );

    // Delete pages
    document.querySelectorAll( "#pages .del-pages-btn" ).forEach( function( button ) {
        button.addEventListener( "click", function( e ) {
            let ids = [];
            document.querySelectorAll( "#pages .pages-grid input[type=checkbox]:checked" ).forEach( function( ch ) {
                let id = ch.closest( "[data-id]" ).getAttribute( "data-id" );
                ids.push( id );
            } );
            if ( ids.length === 0 ) {
                notify( _( "no_selected_pages" ), "info-error", 5000 );
                return;
            }
            if ( ! confirm( _( "confirm_delete_pages" ) ) ) {
                return;
            }
            let data = {
                fn: "del_pages",
                ids: ids
            };
            api( data, function( r ) {
                if ( r.info_text ) {
                    notify( r.info_text, r.info_class, 5000 );
                    if ( r.info_class == "info-success" ) {
                        data.ids.forEach( function( id ) {
                            document.querySelector( `#pages .pages-grid [data-id="${id}"]` ).remove();
                            localStorage.removeItem( "cursor_page_" + id );
                        } );
                        let count = document.querySelector( "#pages .main-footer .count" );
                        let loaded = document.querySelector( "#pages .main-footer .loaded" );
                        loaded.value = parseInt( loaded.value ) - data.ids.length;
                        count.innerText = parseInt( count.innerText ) - data.ids.length;
                        // load pages
                        
                        let offset = +loaded.getAttribute( "data-offset" ) + document.querySelectorAll( "#pages .pages-grid > *" ).length;
                        let search = document.querySelector( "#pages .page-search" ).value;
                        let data2 = {
                            fn: "get_pages_list",
                            count: data.ids.length,
                            offset: offset,
                            search: search
                        };
                        // Не менять атрибут смещения у пейджера
                        cms.dont_change_offset = true;
                        api( data2, set_pages_list );
                    }
                }
            } );
        } );
    } );

    // copy file link button
    let copy_btn = document.querySelector( "#pages .link-file-copy-btn" );
    if ( copy_btn ) copy_btn.onclick = function( e ) {
        let img = this.previousElementSibling.innerText;
        let tmp = document.createElement( "textarea" );
        document.body.appendChild( tmp );
        tmp.value = img;
        tmp.select();
        let r = document.execCommand( "copy" );
        tmp.remove();
        if ( r ) {
            if ( img ) {
                notify( _( "copyed" ), "info-success", 5000 );
            } else {
                notify( _( "select_file" ), "info-error", 5000 );
            }
        } else {
            notify( _( "copy_error" ), "info-error", 5000 );
        }
    };

    function CtrlS( e ) {
        // ы and і - fix for librewolf
        if ( ( e.code == "KeyS" || e.key == "ы" || e.key == "і" ) && e.ctrlKey == true ) {
            e.preventDefault(); // don't save page
            if ( window.location.hash == "#pages" ) {
                document.querySelector( "#pages .save-page-button" ).click();
            }
        }
    }

    // Save Page
    document.querySelectorAll( "#pages .save-page-button" ).forEach( function( button ) {
        button.onclick = function( e ) {
            window.cm.save(); // drop changes to textarea
            let data = {
                fn: "save_page",
                id: document.querySelector( "#pages .save-page-button" ).getAttribute( "data-id" ),
                modified: document.querySelector( "#pages .page-editor > textarea" ).getAttribute( "data-modified" ),
                text: document.querySelector( "#pages .page-editor > textarea" ).value,
                title: document.querySelector( "#pages .page-properties input[name='title']" ).value,
                url: document.querySelector( "#pages .page-properties input[name='url']" ).value,
                seo_title: document.querySelector( "#pages .page-properties input[name='seo_title']" ).value,
                description: document.querySelector( "#pages .page-properties textarea[name='description']" ).value,
                tags: document.querySelector( "#pages .page-properties textarea[name='tags']" ).value,
                date: document.querySelector( "#pages .page-properties input[name='date']" ).value,
                time: document.querySelector( "#pages .page-properties input[name='time']" ).value,
                template: document.querySelector( "#pages .page-properties .template-select-grid .field-select" ).getAttribute( "data-template" ),
                old_template: document.querySelector( "#pages .page-properties .template-select-grid .field-select" ).getAttribute( "data-old-template" ),
            }
            api( data, function( r ) {
                if ( r.ok == "true" ) {
                    // set text
                    if ( r.new_text ) {
                        window.cm.setValue( r.new_text );
                    }

                    // Update Title and URL
                    document.querySelector( "#pages .page-editor-title" ).innerHTML = r.title;
                    document.querySelector( "#pages .page-editor-title" ).setAttribute( "href", r.base_path + r.url );
                    document.querySelector( "#pages .page-properties input[name='url']" ).value = r.url;

                    // update old template
                    document.querySelector( "#pages .page-properties .template-select-grid .field-select" ).setAttribute( "data-old-template", data.template );

                    // Update item in page list
                    let item = document.querySelector( `#pages .pages-grid [data-id='${data.id}']` );
                    item.querySelector( `.page-name` ).innerHTML = r.title;
                    item.querySelector( `.page-name` ).setAttribute( "href", r.base_path + r.url );
                    update_home();
                    item.querySelector( `input[name='title']` ).value = r.title;
                    item.querySelector( `input[name='url']` ).value = r.url;
                    item.querySelector( `input[name='seo_title']` ).value = data.seo_title;
                    item.querySelector( `textarea[name='description']` ).value = data.description;
                    item.querySelector( `textarea[name='tags']` ).value = data.tags;

                    // Выставить шаблон в плашке в списке страниц
                    let select = item.querySelector( `.template-select-grid` );
                    select_switch_to( select, data.template );
                    item.querySelector( `.template-select-grid .field-select` ).setAttribute( "data-old-template", data.template );

                    item.querySelector( `input[name='date']` ).value = data.date;
                    item.querySelector( `input[name='time']` ).value = data.time;
                    if ( r.planned ) {
                        item.querySelector( `.page-date` ).classList.add( "future" );
                    } else {
                        item.querySelector( `.page-date` ).classList.remove( "future" );
                    }

                    document.querySelector( "#pages .page-editor > textarea" ).setAttribute( "data-modified", r.modified );
                    document.querySelector( "#pages .close-page-button" ).setAttribute( "data-changed", "false" );
                    document.querySelector( "#pages .page-editor-grid" ).setAttribute( "data-changed", "false" );
                    // edit marker
                    document.querySelectorAll( "#pages .pages-grid > div" ).forEach( function( item ) {
                        item.classList.remove( "last-edited" );
                    } );
                    item.classList.add( "last-edited" );
                    // close editor after save
                    if ( document.querySelector( "#pages .save-page-button" ).getAttribute( "data-close" ) === "true" ) {
                        document.querySelector( "#pages .save-page-button" ).setAttribute( "data-close", "false" );
                        document.querySelector( "#pages .close-page-button" ).click();
                    }
                    // highlight save button
                    document.querySelector( "#pages .save-page-button" ).classList.add( "saved" );
                    setTimeout( function() {
                        document.querySelector( "#pages .save-page-button" ).classList.remove( "saved" );
                    }, 1000 );

                    notify( r.info_text, r.info_class, r.info_time );
                }
                if ( r.ok == "false" ) {
                    // highlight save button
                    document.querySelector( "#pages .save-page-button" ).classList.add( "error" );
                    setTimeout( function() {
                        document.querySelector( "#pages .save-page-button" ).classList.remove( "error" );
                    }, 1000 );

                    notify( r.info_text, r.info_class, r.info_time );
                }
            } );
        };
    } );

    // transliterate file name
    function __tr_file( str ) {
        let ext = str.match( /\.[^\.]+$/, "" );
        str = str.replace( /\.[^\.]+$/, "" );
        let sp = cms.tr[" "];
        cms.tr[" "] = "_";
        for ( let i in cms.tr ) {
            let re = new RegExp( i, "g" );
            str = str.replace( re, cms.tr[i] );
        }
        if ( sp === undefined ) {
            delete cms.tr[" "];
        } else {
            cms.tr[" "] = sp;
        }
        str = str.replace( /[^-A-Za-z0-9_]+/g, "" );
        if ( ext[0] ) {
            str = str + ext[0];
        }
        str = str.toLowerCase();
        return str;
    }

    // Upload files
    let upload_btn = document.querySelector( "#pages .upload-files input[type=file]" );
    if ( upload_btn ) upload_btn.addEventListener( "change", async function( event ) {
        const formData = new FormData();
        let id = document.querySelector( "#pages .save-page-button" ).getAttribute( "data-id" );
        formData.append( "id", id );
        formData.append( "fn", "upload_files" );
        let n = 0;
        for ( let i = 0; i < this.files.length; i++ ) {
            formData.append( "myfile[]", this.files[i] );
            let f = `${cms.base_path}uploads/${id}/` + __tr_file( this.files[i].name );
            let f_exists = document.querySelector( `#pages .file-block [data-src="${f}"]` );
            if ( f_exists ) { n++; }
        }
        let google_chrome_fix = this;
        if ( n )  {
            let c = confirm( _( "same_files" ) + ` - ${n} ` + _( "pc" ) + "\n" + _( "confirm_replace" ) );
            if ( ! c ) {
                google_chrome_fix.value = "";
                return c;
            }
        }
        let bar = document.querySelector( "#pages .upload-progress" );

        
        let ajax = new XMLHttpRequest();
        
        ajax.upload.addEventListener( "progress", function( event ) {
            let percent = Math.round( (event.loaded / event.total) * 100 );
            bar.style.width = percent + "%";
        }, false );

        ajax.addEventListener( "error", function( event ) {
            notify( _( "error_upload_file" ), "info-error", 3600000 );
            bar.style = "";
        }, false );
        
        ajax.addEventListener( "abort", function( event ) {
            notify( _( "error_upload_file" ), "info-error", 3600000 );
            bar.style = "";
        }, false );

        ajax.addEventListener( "load", function( event ) {
            bar.style = "";
            google_chrome_fix.value = "";
            let r = JSON.parse( event.target.responseText );
            if ( r.info_text ) {
                notify( r.info_text, r.info_class, r.info_time );
                if ( r.info_class == "info-success" ) {

                    // удалить файлы которые были обновлены
                    let tmp = document.createElement( "div" );
                    tmp.innerHTML = r.flist;
                    let imgs = tmp.querySelectorAll( "img" );
                    imgs.forEach( function( img ) {
                        let file = img.getAttribute( "data-src" );
                        let exists_file = document.querySelector( `#pages .file-block [data-src="${file}"]` );
                        if ( exists_file ) {
                            exists_file.parentElement.remove();
                        }
                    } );

                    let container = document.querySelector( "#pages .mediateka-files-grid" );
                    container.innerHTML = r.flist + container.innerHTML;
                    
                    // images checkboxes
                    container.querySelectorAll( "input[type=checkbox]" ).forEach( function( checkbox ) {
                        checkbox.addEventListener( "change", img_rechecked );
                    } );
                    
                    // open lightbox
                    container.querySelectorAll( "img" ).forEach( function( img ) {
                        img.addEventListener( "dblclick", img_lbox );
                    } );
                    
                    // generate link
                    container.querySelectorAll( ".file-block" ).forEach( function( file_block ) {
                        file_block.addEventListener( "click", img_click );
                    } );
                    
                    // select last uploaded
                    container.querySelector( ".file-block" ).click();
                }
            }
        }, false );

        ajax.open( "POST", cms.api );
	    ajax.send( formData );
        
    } );

    // Close Editor
    document.querySelectorAll( "#pages .close-page-button" ).forEach( function( button ) {
        button.addEventListener( "click", function( e ) {

            document.documentElement.removeEventListener( "keydown", CtrlS );
            // detach
            if ( window.cm !== undefined ) {
                if ( this.getAttribute( "data-changed" ) === "true" ) {
                    if ( confirm( _( "confirm_save" ) ) ) {
                        document.querySelector( "#pages .save-page-button" ).setAttribute( "data-close", "true" );
                        document.querySelector( "#pages .save-page-button" ).click();
                        return;
                    }
                }
                window.cm.toTextArea();
                window.cm = null;
            }

            // hide editor
            document.querySelector( "#pages .page-editor-bg" ).classList.add( "hidden" );
            document.body.classList.remove( "editor" );

            // hide mediateka
            if ( ! document.querySelector( "#pages .page-editor-panel" ).classList.contains( "hidden" ) ) {
                document.querySelector( "#pages .open-mediateka" ).click();
            }
            
        } );
    } );

    // Create Page
    document.querySelectorAll( "#pages .add-page-btn" ).forEach( function( btn ) {
        btn.addEventListener( "click", function ( e ) {
            // Отложенный вызов на случай если нужно очистить поиск
            cms.create_page_fn = function() {
                api( { fn: "create_page" }, function( r ) {
                    if ( r.info_text ) {
                        notify( r.info_text, r.info_class, r.info_time );
                    }
                    if ( r.pages ) {
                        let grid = document.querySelector( "#pages .pages-grid" );
                        grid.insertAdjacentHTML( "afterbegin", r.pages[0].html );
                        // Подкрутить список страниц в начало
                        document.querySelector( "#pages .main-main" ).scrollTop = 0;

                        let page_box = grid.querySelector( `[data-id="${r.pages[0].id}"]` );

                        set_controls( page_box );

                        let counter = document.querySelector( "#pages .main-footer .count" );
                        counter.innerText = +counter.innerText + 1;

                        let showed_pages_el = document.querySelector( "#pages .main-footer .counters input" );
                        if ( showed_pages_el.value === get_cookie( "pages_pager" ) ) {
                            document.querySelector( "#pages .pages-grid > div:last-child" ).remove();
                        } else {
                            showed_pages_el.value = +showed_pages_el.value + 1;
                        }
                    }
                } );
            }
            // Если сейчас не результаты поиска отображены,
            // и если мы видим первый пейджер
            // то сразу выполнить создание страницы
            let empty_search = document.querySelector( "#pages .page-search" ).getAttribute( "data-result-of" ) === "";
            let offset_zero = +document.querySelector( "#pages .main-footer .counters input" ).getAttribute( "data-offset" ) === 0;
            if ( empty_search && offset_zero ) {
                cms.create_page_fn();
                cms.create_page_fn = null;
            } else {
                document.querySelector( "#pages .reset" ).click();
                // Создание страницы произведет функция set_pages_list()
            }
        } );
    } );

    // Open Properties
    let prop_btn = document.querySelector( "#pages .open-properties" );
    if ( prop_btn ) prop_btn.onclick = function( e ) {
        document.querySelector( "#pages .page-editor-grid" ).classList.toggle( "properties" );
        document.querySelector( "#pages .page-properties" ).classList.toggle( "hidden" );
        if ( window.cm ) {
            let cursor = window.cm.getCursor();
            window.cm.scrollIntoView( { line:cursor.line, ch:cursor.ch } );
        }
        if ( document.querySelector( "#pages .page-editor-grid" ).classList.contains( "properties" ) ) {
            document.querySelector( "#pages .page-editor-grid" ).classList.remove( "mediateka" );
            document.querySelector( "#pages .page-editor-panel" ).classList.add( "hidden" );
        }
    };
    
    // Open Mediateka
    let media_btn = document.querySelector( "#pages .open-mediateka" );
    if ( media_btn ) media_btn.onclick = function( e ) {
        document.querySelector( "#pages .page-editor-grid" ).classList.toggle( "mediateka" );
        document.querySelector( "#pages .page-editor-panel" ).classList.toggle( "hidden" );
        if ( window.cm ) {
            let cursor = window.cm.getCursor();
            window.cm.scrollIntoView( { line:cursor.line, ch:cursor.ch } );
        }
        if ( document.querySelector( "#pages .page-editor-grid" ).classList.contains( "mediateka" ) ) {
            document.querySelector( "#pages .page-editor-grid" ).classList.remove( "properties" );
            document.querySelector( "#pages .page-properties" ).classList.add( "hidden" );
        }
    };

    // Replace Dialog Toggle
    let replace_btn = document.querySelector( "#pages .codemirror-replace" );
    if ( replace_btn ) replace_btn.onclick = function( e ) {
        let dialog = document.querySelector( "#pages .CodeMirror-dialog" );
        if ( dialog ) {
            dialog.remove();
        } else {
            let mediateka = ! document.querySelector( "#pages .page-editor-panel" ).classList.contains( "hidden" );
            if ( mediateka && window.innerWidth < 1024 ) {
                document.querySelector( "#pages .open-mediateka" ).click();
            }
            window.cm.execCommand( "replace" );
        }
    };

    // generate link to clicked file
    function img_click() {
        this.parentElement.querySelectorAll( ".file-block" ).forEach( function( block ) {
            block.classList.remove( "active-file" );
        } );
        this.classList.add( "active-file" );
        let i = this.querySelector( "img" );
        let t = i.getAttribute( "data-type" );
        let link = i.getAttribute( "data-src" );
        let w = i.getAttribute( "width" );
        let h = i.getAttribute( "height" );
        let e = link.replace( /.*\./, "" );
        let img = [ "webp", "tiff", "jpeg", "jpg", "png", "svg", "gif", "bmp", "ico" ];
        let mus = [ "mp3", "ogg", "m4a", "flac" ];
        let vid = [ "mp4", "mkv", "webm" ];
        let a = `<a href="${link}" target=_blank>${link}</a>`;
        let tag = this.closest( ".mediateka-grid" ).querySelector( ".link-file-tag" );
        if ( img.indexOf( e ) >= 0 ) {
            link = `&lt;img alt="" src="${a}"`;
            if ( w ) {
                link += ` width="${w}"`;
            }
            if ( h ) {
                link += ` height="${h}"`;
            }
            link += "&gt;";
            tag.innerHTML = link;
        } else if ( mus.indexOf( e ) >= 0 ) {
            link = `&lt;audio src="${a}" controls>&lt;/audio>`;
            tag.innerHTML = link;
        } else if ( vid.indexOf( e ) >= 0 ) {
            link = `&lt;video src="${a}" controls>&lt;/video>`;
            tag.innerHTML = link;
        } else {
            link = `&lt;a href="${a}"&gt;TEXT&lt;/a&gt;`;
            tag.innerHTML = link;
        }
        let inner_link = tag.querySelector( "a" );
        inner_link.addEventListener( "click", file_link_click );
        // с двойным кликом нужно мудрить чтобы открывать в новой вкладке
        // можно правой и открыть в новой вкладке
    }

    function file_link_click( e ) {
        e.preventDefault();
        let tmp = document.createElement( "textarea" );
        document.body.appendChild( tmp );
        tmp.value = e.target.getAttribute( "href" );
        tmp.select();
        let r = document.execCommand( "copy" );
        tmp.remove();
        if ( r ) {
            notify( _( "copyed" ), "info-success", 5000 );
        } else {
            notify( _( "copy_error" ), "info-error", 5000 );
        }
    }

    // enable or disable delete files button
    function img_rechecked() {
        let checked = document.querySelectorAll( "#pages .mediateka-files-grid input[type=checkbox]:checked" );
        if ( checked.length ) {
            document.querySelector( "#pages .del-uploaded-files" ).classList.remove( "disabled" );
        } else {
            document.querySelector( "#pages .del-uploaded-files" ).classList.add( "disabled" );
        }
    }
    
    // view in lightbox
    function img_lbox() {
        let src = this.getAttribute( "data-src" );
        let e = src.replace( /.*\./, "" );
        let img = [ "webp", "tiff", "jpeg", "jpg", "png", "svg", "gif", "bmp", "ico" ];
        let mus = [ "mp3", "ogg", "m4a", "flac" ];
        let vid = [ "mp4", "mkv", "webm" ];
        let t;
        if ( document.querySelector( "#lbox-window" ) == null ) {
            if ( img.indexOf( e ) >= 0 ) {
                t = document.createElement( "img" );
            } else if ( mus.indexOf( e ) >= 0 ) {
                t = document.createElement( "audio" );
                t.setAttribute( "controls", true );
            } else if ( vid.indexOf( e ) >= 0 ) {
                t = document.createElement( "video" );
                t.setAttribute( "controls", true );
            }
            if ( t !== undefined ) {
                t.src = src;
                let d = document.createElement( "div" );
                d.id = "lbox-window";
                d.appendChild( t );
                document.body.appendChild( d );
                d.addEventListener( "click", function( e ) {
                    this.remove();
                } );
            }
        }
    }


    // Delete files
    let del_files_btn = document.querySelector( "#pages .del-uploaded-files" );
    if ( del_files_btn ) del_files_btn.onclick = function( e ) {
        if ( ! this.classList.contains( "disabled" ) ) {
            let flist = [];
            document.querySelectorAll( "#pages .mediateka-files-grid input[type=checkbox]:checked" ).forEach( function( e ) {
                let f = e.closest( ".file-block" ).querySelector( "img" ).getAttribute( "data-src" );
                flist.push( f );
            } );
            let data = {
                fn: "del_files",
                flist: flist
            };
            api( data, function( r ) {
                if ( r.info_text ) {
                    document.querySelector( "#pages .link-file-tag" ).innerHTML = "";
                    notify( r.info_text, r.info_class, r.info_time );
                    if ( r.info_class == "info-success" ) {
                        for ( let f in flist ) {
                            document.querySelector( `#pages .mediateka-files-grid img[data-src="${flist[f]}"]` ).parentElement.remove();
                        }
                        document.querySelector( "#pages .del-uploaded-files" ).classList.add( "disabled" );
                    }
                }
            } );
        }
    };

    // prevent hide cursor when window resize
    window.addEventListener( "resize", function() {
        if ( window.cm ) {
            let cursor = window.cm.getCursor();
            window.cm.scrollIntoView( { line:cursor.line, ch:cursor.ch } );
        }
    } );

    // show/hide tags
    let tags_btn = document.querySelector( "#pages .tags-helper" );
    if ( tags_btn ) tags_btn.addEventListener( "click", function( e ) {
        document.querySelector( "#pages .page-editor-grid" ).classList.toggle( "tags-opened" );
        cm.focus();
        cm.refresh();
    } );

    // for tags
    document.querySelectorAll( "#pages .tags-grid [data-type='wrap']" ) .forEach( function( btn ) {
        btn.addEventListener( "click", function( e ) {
            let otag = this.getAttribute( "data-otag" );
            let ctag = this.getAttribute( "data-ctag" );
            let len  = this.getAttribute( "data-len" );
            let ch   = this.getAttribute( "data-ch" );
            let line = this.getAttribute( "data-line" );
            
            //wrap_selections( otag, ctag, len, line, ch );
            let cursor = cm.getCursor();
            let selections = cm.getSelections();
            let replacements = [];
            for ( let i = 0; i < selections.length; i++ ) {
                replacements[i] = otag + selections[i] + ctag;
            }
            cm.replaceSelections( replacements );
            //tag_panel_collapse();
            if ( window.innerWidth < 1024 ) {
                document.querySelector( "#pages .tags-helper" ).click();
            }
            if ( selections.length < 2 ) {
                if ( line ) {
                    cursor.line += +line;
                    cursor.ch = +ch;
                } else if ( len ) {
                    cursor.ch += +len;
                }
                cm.setCursor( cursor );
            }
            cm.focus();
            cm.refresh();
        } );
    } );

    // fix glitches codemirror
    let fix = document.querySelector( "aside a[href='#pages']" );
    if ( fix ) fix.addEventListener( "click", function( e ) {
        setTimeout( function( e ) {
            if ( window.cm ) {
                cm.refresh();
                cm.focus();
            }
        }, 50 );
    } );

    // Транслитерация URL
    let tr_url = document.querySelector( "#pages .page-editor-grid .url-translit" );
    if ( tr_url ) tr_url.addEventListener( "click", function( e ) {
        let url = document.querySelector( "#pages .page-editor-grid .page-properties input[name='title']" ).value;
        let tr_url = url_translit( url );
        this.previousElementSibling.value = tr_url;
    } );
    function url_translit( url ) {
        url = url.toLowerCase();
        for ( let i in cms.tr ) {
            let re = new RegExp( i, "g" );
            url = url.replace( re, cms.tr[i] );
        }
        url = url.replace( / +/g, "-" );
        url = url.replace( /[^-a-z0-9_]+/g, "" );
        url = url.replace( /^[-_]+|[-_]+$/g, "" );
        return url;
    }

    function update_home() {
        document.querySelectorAll( `#pages .pages-grid [data-id]` ).forEach( function( page ) {
            if ( page.querySelector( `.page-name[href="${cms.base_path}"]` ) ) {
                page.classList.add( "home" );
            } else {
                page.classList.remove( "home" );
            }
        } );
    }


    // Замена текста на всех страницах
    document.querySelectorAll( "#pages-utils .replace-btn" ).forEach( function( button ) {
        button.addEventListener( "click", function( e ) {
            let data = {
                fn: "replace_in_pages",
                table: document.querySelector( "#pages-utils input[name='table']" ).value,
                id_col: document.querySelector( "#pages-utils input[name='id_col']" ).value,
                column: document.querySelector( "#pages-utils input[name='column']" ).value,
                search_regex: document.querySelector( "#pages-utils input[name='search_regex']" ).value,
                replace: document.querySelector( "#pages-utils input[name='replace']" ).value,
            };
            if ( data.search_regex && confirm( _( "replace_in_pages_confirm" ) ) ) {
                api( data, function( r ) {
                    if ( r.info_text ) {
                        notify( r.info_text, r.info_class, r.info_time );
                    }
                } );
            }
        } );
    } );

} );
