import screens from './screens.js';
/** @type {HTMLElement} reference to 'main' element */
let dom_main;
/** @type {HTMLElement} reference to HUD element */
let dom_hud;

/** ID of the current screen being displayed */
let activeScreenId = screens.home.id;

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    // Populate global DOM variables
    dom_main = document.querySelector('main');
    dom_hud = document.querySelector('#HUD');

    // Set screen to home
    render_home();

    // Make the title text link to the home screen
    document.querySelector('h1').addEventListener('click', () => { render_home() });
});

/* -------------------------------------------------------------------------- */
/*                               Event handlers                               */
/* -------------------------------------------------------------------------- */

function handle_scroll_characters() {
    if (activeScreenId != screens.home.id) throw new Error("Character screen not active");

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
    dom_hud.classList.add('hide');

    // set the background
    dom_main.dataset.bg = 'none';

    // Must attach all event listeners here because js modules are not accessible from the html
    dom_main.querySelector('#button-begin').addEventListener('click', () => { render_characterSelect() });
}

/**
 * Renders the character select screen
 */
function render_characterSelect() {
    // overwrite contents of main
    dom_main.innerHTML = screens.characterSelect.htmlContent;
    activeScreenId = screens.characterSelect.id;
    dom_hud.classList.add('hide');

    // set the background
    dom_main.dataset.bg = 'none';

    // Getting character cards from the html for now, eventually these will be generated
    let charCards = dom_main.querySelectorAll('.character-card');
    let charSelect = dom_main.querySelector('#character-select');

    // add listeners for character cards
    charCards.forEach((el, i) => {
        // add click behavior for card
        el.addEventListener('click', () => {
            // cancels the event if the card is already selected
            if (el.classList.contains('selected')) return;

            // Apply css classes to select the character card
            charSelect.classList.add('selection-on');
            el.classList.add('selected');
            // Remove selection from any other character card
            charCards.forEach(el2 => {
                if (el2 != el)
                {
                    el2.classList.remove('selected');
                }
            })

            // Animate stuff appearing after a short delay
            window.setTimeout(() => {
                el.querySelectorAll('.hidden-until-selected').forEach(el2 => el2.classList.add('selected'));
            }, 200);
        }, true);
        // This 'true' makes the event occur in the capturing phase of event handling so that we can cancel it before the back button event occurs

        // add click behavior for character confirm buttons
        el.querySelector('.character-confirm-button').addEventListener('click', () => {
            // TODO: make confirm button actually select a character
            console.log(`Chose character #${i}`);

            // go to next screen
            render_disclaimer();
        });

        // add click behavior for back button
        el.querySelector('.character-back-button').addEventListener('click', function () {
            charSelect.classList.remove('selection-on');
            el.classList.remove('selected');
            console.log('going back');
            console.log(el);

            // Animate stuff disappearing
            el.querySelectorAll('.hidden-until-selected').forEach(el2 => el2.classList.remove('selected'));
        });
    });

    // TODO: add listeners for scrolling between selected characters
}

/**
 * Renders the disclaimer screen
 */
function render_disclaimer() {
    // overwrite contents of main
    dom_main.innerHTML = screens.disclaimer.htmlContent;
    activeScreenId = screens.disclaimer.id;
    dom_hud.classList.add('hide');

    // set the background
    dom_main.dataset.bg = 'none';

    dom_main.querySelector('.button-continue').addEventListener('click', () => { render_scenario() });
}

/**
 * Renders the scenario screen
 */
function render_scenario() {
    // overwrite contents of main
    dom_main.innerHTML = screens.scenario.htmlContent;
    activeScreenId = screens.scenario.id;
    dom_hud.classList.remove('hide');

    dom_main.dataset.bg = 'school';

    // add listeners to scenario choice buttons
    dom_main.querySelectorAll('.button-option').forEach(el => {
        // TODO: add logic to scenario choices
        el.addEventListener('click', () => { render_scenarioResponse() });
    });
}

/**
 * Renders the scenario response screen
 */
function render_scenarioResponse() {
    // overwrite contents of main
    dom_main.innerHTML = screens.scenarioResponse.htmlContent;
    activeScreenId = screens.scenarioResponse.id;
    dom_hud.classList.remove('hide');

    // set the background
    dom_main.dataset.bg = 'school';

    dom_main.querySelector('.button-continue').addEventListener('click', () => { render_end() });
}

function render_end() {
    // overwrite contents of main
    dom_main.innerHTML = screens.end.htmlContent;
    activeScreenId = screens.end.id;
    dom_hud.classList.remove('hide');

    // set the background
    dom_main.dataset.bg = 'none';

    dom_main.querySelector('#button-play-again').addEventListener('click', () => { render_home() });
}