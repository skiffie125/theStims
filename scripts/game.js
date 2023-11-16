import screens from './screens.js';
import characters from './characters.js';

/** @type {HTMLElement} reference to 'main' element */
let dom_main;
/** @type {HTMLElement} reference to HUD element */
let dom_hud;

/** ID of the current screen being displayed */
let activeScreenId = screens.home.id;
/** @type {Character} the {@link Character} the player is currently playing as */
let chosenCharacter;
/** @type {number} index of the currently active {@link Scenario} in the {@link Character}'s scenarioList */
let storyProgress = 0;

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    // Populate global DOM variables
    dom_main = document.querySelector('main');
    dom_hud = document.querySelector('#HUD');

    // Set screen to home
    render_home();

    // add event listener to scroll main element with wheel
    dom_main.addEventListener('wheel', (ev) => handle_scroll_main(ev.deltaY));

    // Make the title text link to the home screen
    document.querySelector('h1').addEventListener('click', () => render_home());
});

/* -------------------------------------------------------------------------- */
/*                               Event handlers                               */
/* -------------------------------------------------------------------------- */

function handle_scroll_characters() {
    if (activeScreenId != screens.home.id) throw new Error("Character screen not active");

    // TODO: implement
}

/**
 * Sets the chosen character, performs any additional setup, then goes to the next screen
 * @param {Character} c 
 */
function handle_select_character(c) {
    // TODO: implement
}

/**
 * Executes any effects of the response, then goes to the response screen
 * @param {ScenarioResponse} r 
 */
function handle_select_response(r) {
    // TODO: implement
}

/**
 * Advances to the next scenario in the storyline or the end screen if this was the last scenario
 */
function handle_response_continue() {
    // TODO: implement
}

/**
 * Handles scrolling up and down in the main element since we don't like the ugly default scroll bar
 * @param {number} amount distance to scroll vertically, negative indicates scrolling up
 */
function handle_scroll_main(amount) {
    dom_main.scrollBy({ top: amount });
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
    document.body.dataset.bg = 'none';

    // this is just to test scroll behavior, remove later
    // dom_main.querySelector('#exposition').innerHTML += "<p>blah blah blah</p>".repeat(12);

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

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
    document.body.dataset.bg = 'none';

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 500, 500);
    reveal_children_consecutively(dom_main.querySelector('#character-list'), 500, 250, delay, false);

    // TODO: Generate character cards from character data

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
    document.body.dataset.bg = 'none';

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

    dom_main.querySelector('.button-continue').addEventListener('click', () => { render_scenario() });
}

/**
 * Renders the scenario screen with a given scenario
 * @param {Scenario} s The {@link Scenario} object to render data from
 */
function render_scenario(s) {
    // overwrite contents of main
    dom_main.innerHTML = screens.scenario.htmlContent;
    activeScreenId = screens.scenario.id;
    dom_hud.classList.remove('hide');


    // TODO: Generate screen content from scenario data

    document.body.dataset.bg = 'school'; // replace this

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

    // add listeners to scenario choice buttons
    dom_main.querySelectorAll('.button-option').forEach(el => {
        // TODO: add logic to scenario choices
        el.addEventListener('click', () => { render_scenarioResponse() });
    });
}

/**
 * Renders the scenario response screen
 * @param {ScenarioResponse} r The {@link ScenarioResponse} object to render data from
 */
function render_scenarioResponse(r) {
    // overwrite contents of main
    dom_main.innerHTML = screens.scenarioResponse.htmlContent;
    activeScreenId = screens.scenarioResponse.id;
    dom_hud.classList.remove('hide');

    // TODO: Generate screen content from response data

    document.body.dataset.bg = 'school'; // replace this

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

    dom_main.querySelector('.button-continue').addEventListener('click', () => { render_end() });
}

function render_end() {
    // overwrite contents of main
    dom_main.innerHTML = screens.end.htmlContent;
    activeScreenId = screens.end.id;
    dom_hud.classList.remove('hide');

    // set the background
    document.body.dataset.bg = 'none';

    dom_main.querySelector('#button-play-again').addEventListener('click', () => { render_home() });
}

/**
 * Applies fade/slide-in animation to each child of an element at increasing delays for each subsequent child.
 * @param {HTMLElement} el parent element
 * @param {number} [duration] duration of each animation in milliseconds
 * @param {number} [interdelay] delay between the start of each animation in milliseconds
 * @param {number} [startdelay] delay before start of the first animation in milliseconds
 * @param {Boolean} [slide] set to false to disable vertical movement in the animation
 * @param {Boolean} [hide] whether the elements should have the *hidden* attribute set before animating
 * @returns {number} delay to use for further animations
 */
function reveal_children_consecutively(el, duration = 1000, interdelay = 1000, startdelay = 0, slide = true, hide = true) {
    // construct keyframe object
    let kf = {
        opacity: [0, 1],
        pointerEvents: ['none', 'initial']
    }
    if (slide) kf.top = ['-0.5rem', 0];

    let i = 0;
    for (const child of el.children)
    {
        // set the child initially to 'hidden' so it doesn't affect the scroll height of main
        if (hide) child.setAttribute('hidden', '');

        // apply the animation with delay
        child.animate(
            kf,
            {
                id: 'reveal',
                duration: duration,
                delay: i * interdelay + startdelay,
                fill: 'backwards',
                easing: 'ease-out'
            }
        )

        // un-hide the element and scroll it into view when it starts animating
        window.setTimeout(() => {
            if (hide) child.removeAttribute('hidden');
            dom_main.scrollTo({ top: dom_main.scrollHeight });
        }, i * interdelay + startdelay);

        i++;
    }
    return i * interdelay + startdelay;
}