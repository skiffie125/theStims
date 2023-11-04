import screens from './screens.js';
let dom_main;
let activeScreenId = screens.home.id;

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    // Populate global DOM variables
    dom_main = document.querySelector('main');

    // Set screen to home
    render_home();

    // Make the title text link to the home screen
    document.querySelector('h1').addEventListener('click',() => {render_home()});
});

/* -------------------------------------------------------------------------- */
/*                               Event handlers                               */
/* -------------------------------------------------------------------------- */

function handle_scroll_characters()
{
    if(activeScreenId != screens.home.id) throw new Error("Character screen not active");

    // TODO: implement
}

/* -------------------------------------------------------------------------- */
/*                Rendering functions (because who needs React)               */
/* -------------------------------------------------------------------------- */

/**
 * Renders the home screen
 */
function render_home() {
    // overwrite contents of main
    dom_main.innerHTML = screens.home.htmlContent;
    activeScreenId = screens.home.id;

    // Must attach all event listeners here because js modules are not accessible from the html
    dom_main.querySelector('#button-begin').addEventListener('click',() => {render_characterSelect()});
}

/**
 * Renders the character select screen
 */
function render_characterSelect() {
    // overwrite contents of main
    dom_main.innerHTML = screens.characterSelect.htmlContent;
    activeScreenId = screens.characterSelect.id;
    
    // TODO: add listeners for character list scrolling
}