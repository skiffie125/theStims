let dom_main;
import screens from './screens.js';

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    dom_main = document.querySelector('main');
    goto_home();

    document.querySelector('h1').addEventListener('click',() => {goto_home()});
});

function goto_home() {
    dom_main.innerHTML = screens.home;
    document.getElementById('button-begin').addEventListener('click',() => {goto_characterSelect()});
}

function goto_characterSelect() {
    dom_main.innerHTML = screens.characterSelect;
}