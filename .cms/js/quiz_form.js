/*vars-placeholder*/

function quiz_api( data, rfn ) {
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
    ajax.open( "POST", quiz_api_url );
    ajax.send( formData );
}

// Open Forms
document.querySelectorAll( "[data-quiz]" ).forEach( function( button ) {
    let n = button.getAttribute( "data-quiz" );
    button.setAttribute( "onclick", `show_quiz( event, "${n}" )` );
} );

function show_quiz( e, n ) {
    e.preventDefault(); // <a>link</a>
    document.querySelector( `[data-quiz-form="${n}"]` ).classList.remove( "quiz-hidden" );
}

document.querySelectorAll( "[data-quiz-form]" ).forEach( function( form ) {
    let f = form.getAttribute( "data-quiz-form" );

    // Close
    document.querySelectorAll( `[data-quiz-form="${f}"] [data-quiz-form-close]` ).forEach( function( button ) {
        button.setAttribute( "onclick", `hide_quiz( event, "${f}" )` );
    } );

    // Steps Loop
    let steps = document.querySelectorAll( `[data-quiz-form="${f}"] [data-quiz-step]` );
    for( let s = 0; s < steps.length; s++ ) {
        
        // Prev
        let prev = steps[s].querySelector( "[data-quiz-prev]" );
        if ( prev ) {
            prev.setAttribute( "onclick", `quiz_step( event, "${f}", "${s}", "${s-1}" )` );
        }
        
        // Next
        let next = steps[s].querySelector( "[data-quiz-next]" );
        if ( next ) {
            next.setAttribute( "onclick", `next_step_quiz( event, "${f}", "${s}" )` );
        }

        // Send
        let send = steps[s].querySelector( "[data-quiz-send]" );
        if ( send ) {
            send.setAttribute( "onclick", `send_quiz( event, "${f}", "${s+1}" )` );
        }

        // Hide pages except first
        steps[s].setAttribute( "data-quiz-step", s );
        if ( s == 0 ) {
            steps[s].classList.remove( "quiz-page-hidden" );
        } else {
            steps[s].classList.add( "quiz-page-hidden" );
        }

    }

} );

function next_step_quiz( event, form, step ) {
    event.preventDefault();
    let result = get_step_quiz( form, step );
    if ( result ) {
        quiz_step( event, form, step, +step+1 );
    }
}

function get_step_quiz( n, s ) {
    let data = {};
    let req  = {};
    document.querySelectorAll( `[data-quiz-form="${n}"] [data-quiz-step="${s}"] input[name], [data-quiz-form="${n}"] [data-quiz-step="${s}"] textarea[name]` ).forEach( function( input ) {
        let type           = input.type;
        let required       = input.getAttribute( "data-quiz-required" );
        let required_radio = input.getAttribute( "data-quiz-required-radio" );
        let name;
        let value;
        switch ( type ) {
            case "radio":
                name  = input.name;
                if ( input.checked == true) {
                    value = input.value;
                } else if ( data[name] && data[name]["value"] ) {
                    value = data[name]["value"];
                } else {
                    value = "";
                }
            break;
            case "checkbox":
                name  = input.name;
                value = input.checked;
            break;
            default:
                name  = input.name;
                value = input.value;
            break;
        }
        if ( name == "quiz_file[]" ) {
            if ( ! data["quiz_file[]"] ) {
                data["quiz_file[]"] = [];
            }
            data["quiz_file[]"].push( value );
        } else {
            let r = required != null || required_radio;
            data[name] = { type: type, value: value, required: r };
        }
        // for radio inputs
        if ( required_radio != null ) {
            if ( ! req[required_radio] ) { req[required_radio] = {}; }
            if ( ! req[required_radio]["names"] ) { req[required_radio]["names"] = []; }
            req[required_radio]["names"].push( name );
            if ( value ) {
                req[required_radio]["value"] = value;
            }
        }
    } );
    for ( let i in data ) {
        if ( data[i]["type"] == "radio" && data[i]["value"] == "" ) {
            alert( `'Не выбрана опция "${i}"` );
            return false;
        } else if ( data[i]["required"] && data[i]["value"] == "" ) {
            alert( `Обязательное поле "${i}"` );
            return false;
        } else if ( data[i]["required"] && data[i]["type"] == "checkbox" && data[i]["value"] == false ) {
            alert( `Не выбрана опция "${i}"` );
            return false;
        }
    }
    for ( let i in req ) {
        if ( ! req[i]["value"] ) {
            alert( `Заполните одно из полей: "${req[i]["names"]}"` );
            return false;
        }
    }
    return data;
}

function hide_quiz( e, n ) {
    document.querySelector( `[data-quiz-form="${n}"]` ).classList.add( "quiz-hidden" );
}

function show_step_quiz( e, n, s ) {
    let pages = document.querySelectorAll( `[data-quiz-form="${n}"] [data-quiz-step]` );
    for( let j = 0; j < pages.length; j++ ) {
        if ( j == s ) {
            pages[j].classList.remove( "quiz-page-hidden" );
        } else {
            pages[j].classList.add( "quiz-page-hidden" );
        }
    }
}

function quiz_step( event, form, n_hide, n_show ) {
    event.preventDefault();
    document.querySelector( `[data-quiz-form="${form}"] [data-quiz-step="${n_hide}"]` ).classList.add( "quiz-page-hidden" );
    document.querySelector( `[data-quiz-form="${form}"] [data-quiz-step="${n_show}"]` ).classList.remove( "quiz-page-hidden" );
}

function send_quiz( e, n, s ) {
    e.preventDefault();
    if ( document.querySelector( `[data-quiz-form="${n}"] [data-quiz-send]` ).getAttribute( "disabled" ) == "true" ) {
        return;
    }
    document.querySelector( `[data-quiz-form="${n}"] [data-quiz-send]` ).setAttribute( "disabled", "true" );
    
    let data = {};
    // Steps Loop
    let steps = document.querySelectorAll( `[data-quiz-form="${n}"] [data-quiz-step]` );
    for( let i = 0; i < steps.length; i++ ) {
        let step = get_step_quiz( n, i );
        if ( step ) {
            data = Object.assign( data, step );
        } else {
            document.querySelector( `[data-quiz-form="${n}"] [data-quiz-send]` ).setAttribute( "disabled", "false" );
            return;
        }
    }
    let title = document.querySelector( "head title" );
    title = title.innerText;
    let page = window.location.href;
    data["Страница"]  = { value: title };
    data["Ссылка"]  = { value: page };
    
    quiz_api( { fn: "quiz_form", quiz: n, form: JSON.stringify( data ) }, function( r ) {
        document.querySelector( `[data-quiz-form="${n}"] [data-quiz-send]` ).setAttribute( "disabled", "false" );
        if ( r.result == "ok" ) {
            let event = new Event( "click" );
            quiz_step( event, n, s-1, s );
        } else if ( r.result == "error" ) {
            alert( r.msg );
        }
    } );

}

function get_cookie_quiz( name ) {
    let cookie_lines = decodeURIComponent( document.cookie ).split( ";" );
    for ( let line in cookie_lines ) {
        let cookie = cookie_lines[line].split( "=" );
        if ( name == cookie[0].trim() ) {
            return cookie[1];
        }
    }
    return "";
}

function del_file() {
    let parent = this.parentElement;
    let name = this.getAttribute( "data-quiz-del-file" );
    let id = this.getAttribute( "data-id" );
    quiz_api( { fn: "del_file", name: name, id: id }, function( r ) {
        if ( r.result == "ok" ) {
            parent.remove();
        }
    } );
}

let cook = get_cookie_quiz( "quiz_files" );

document.querySelectorAll( "[data-quiz-form] input[type=file]" ).forEach( function( input ) {

    let id = input.getAttribute( "data-id" );
    if ( cook ) {
        quiz_api( { fn: "get_files", id: id }, function( r ) {
            if ( r.result == "error" ) {
                document.querySelector( `[data-quiz-ferror="${id}"]` ).innerHTML = r.info_text;
            }
            if ( r.flist ) {
                let list = document.querySelector( `[data-quiz-flist="${id}"]` );
                list.innerHTML = r.flist;
                let delBtns = document.querySelectorAll( `[data-quiz-flist="${id}"] [data-quiz-del-file]` );
                delBtns.forEach( function( button ) {
                    button.addEventListener( "click", del_file );
                } );
            }
        } );
    }

    input.value = ""; // fix after reload page
    input.addEventListener( "change", async function( event ) {
        const formData = new FormData();
        formData.append( "id", id );
        formData.append( "fn", "upload_files" );
        for ( let i = 0; i < input.files.length; i++ ) {
            formData.append( "myfile[]", input.files[i] );
        }

        let bar = document.querySelector( `[data-quiz-form="${id}"] .load-progress` );
        let err = document.querySelector( `[data-quiz-form="${id}"] [data-quiz-ferror]` );
        err.innerHTML = "";

        let ajax = new XMLHttpRequest();

        ajax.upload.addEventListener( "progress", function( event ) {
            let percent = Math.round( (event.loaded / event.total) * 100 );
            bar.style.height = percent + "%";
        }, false );

        ajax.addEventListener( "error", function( event ) {
            err.innerHTML = "Ошибка загрузки файлов";
            bar.style = "";
        }, false );
        
        ajax.addEventListener( "abort", function( event ) {
            err.innerHTML = "Ошибка загрузки файлов";
            bar.style = "";
        }, false );

        ajax.addEventListener( "load", function( event ) {
            bar.style = "";
            input.value = "";
            let r = JSON.parse( event.target.responseText );
            if ( r.result == "error" ) {
                err.innerHTML = r.info_text;
            }
            if ( r.flist ) {
                let flist = document.querySelector( `[data-quiz-flist="${id}"]` );
                flist.innerHTML = r.flist;
                let delBtns = flist.querySelectorAll( `[data-quiz-del-file]` );
                delBtns.forEach( function( button ) {
                    button.addEventListener( "click", del_file );
                } );
            }
        }, false );

        ajax.open( "POST", quiz_api_url );
        ajax.send( formData );

    } );

} );

// drag&drop hover
document.querySelectorAll( ".quiz-loader .load-field" ).forEach( function( drag_zone ) {
    drag_zone.addEventListener( "dragover", function() {
        drag_zone.classList.add( "hover-drop" );
    } );
    drag_zone.addEventListener( "dragleave", function() {
        drag_zone.classList.remove( "hover-drop" );
    } );
    drag_zone.addEventListener( "drop", function() {
        drag_zone.classList.remove( "hover-drop" );
    } );
} );