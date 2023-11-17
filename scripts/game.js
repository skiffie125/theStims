import screens from './screens.js';
import characters from './characters.js';

/** @type {HTMLElement} reference to 'main' element */
let dom_main;
/** @type {HTMLElement} reference to HUD element */
let dom_hud;

/**
 * Singleton object responsible for holding game state and observers
 */
let Game = (function () {
    // treat these like private members for Game
    // ik this syntax is confusing af but that's javascript for you
    let chosenCharacterPrivate;
    let storyProgressPrivate = 0;

    // this is where the object with its public members are defined
    return {
        /** ID of the current screen being displayed */
        activeScreenId: screens.home.id,
        /** @type {Character} the {@link Character} the player is currently playing as */
        get chosenCharacter() { return chosenCharacterPrivate; },
        set chosenCharacter(c) {
            chosenCharacterPrivate = c;
            update_HUD();
        },
        /** @type {number} index of the currently active {@link Scenario} in the {@link Character}'s scenarioList */
        get storyProgress() { return storyProgressPrivate; },
        set storyProgress(num) {
            storyProgressPrivate = num;
            update_HUD();
        }
    }
})();

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    // Populate global DOM variables
    dom_main = document.querySelector('main');
    dom_hud = document.querySelector('#HUD');

    // Set screen to home
    render_home();

    // add event listener to scroll main element with wheel
    dom_main.addEventListener('wheel', (ev) => handle_scroll_main(ev.deltaY));

    document.addEventListener('keydown', (ev) => {
        switch (ev.key)
        {
            case 'ArrowDown':
                handle_scroll_main(1);
                break;
            case 'ArrowUp':
                handle_scroll_main(-1);
                break;
        }
    });

    // console.log(characters);

    // Make the title text link to the home screen
    document.querySelector('h1').addEventListener('click', () => render_home());
});

/* -------------------------------------------------------------------------- */
/*                               Event handlers                               */
/* -------------------------------------------------------------------------- */

function handle_scroll_characters() {
    if (Game.activeScreenId != screens.home.id) throw new Error("Character screen not active");

    // TODO: implement
}

/**
 * Sets the chosen character, performs any additional setup, then goes to the next screen
 * @param {Character} c 
 */
function handle_select_character(c) {
    Game.chosenCharacter = c;
    Game.storyProgress = 0;
    render_disclaimer();
}

/**
 * Executes any effects of the senario, reworking of the render senario method below, didn't want to mess up what worked 
 */
function render_story_scenario() {

    char = Game.chosenCharacter();
    if(storyProgress() >= char.scenarioList.length){ // stopping if you've reached the end
        render_end();
    }
    cur_senario = char.scenarioList[Game.storyProgress()];
    // overwrite contents of main
    dom_main.innerHTML = cur_senario.exposition;
    Game.activeScreenId = cur_senario.id;
    dom_hud.classList.remove('hide');
    // still need assets/ visuals
    // add scenario choice buttons
    cur_senario.responses.forEach(reponse => {
        // Don't know if this is right? need feedback
        //also should be checking for threshold, again though in milestone 3
        const newButton = document.createElement('button');
        newButton.textContent = reponse.buttonText; 
        document.body.appendChild(newButton);
        newButton.addEventListener('click', () => { handle_select_response(reponse) });
    });
}

/**
 * Executes any effects of the response, then goes to the response screen
 * @param {ScenarioResponse} r 
 */
function handle_select_response(r) {
    // TODO: implement
    //rendering the response
    dom_main.innerHTML = r.resultExposition;
    dom_hud.classList.remove('hide');
     // Don't know if this is right? need feedback
    const newButton = document.createElement('button');
    newButton.textContent = "Continue"; 
    document.body.appendChild(newButton);
    Game.chosenCharacter().adjustStress(r.stressEffect);
    //if there was a greater stress than you could go to overwhelm, for milestone 3

    Game.storyProgress(Game.storyProgress() + 1); // updating game
    newButton.addEventListener('click', () => { render_story_scenario() }); //going to next scene
    
}

/**
 * Advances to the next scenario in the storyline or the end screen if this was the last scenario
 * Kinda already does this in handle select response 
 */
function handle_response_continue() {
    // TODO: implement
}

/**
 * Handles scrolling up and down in the main element since we don't like the ugly default scroll bar
 * @param {number} direction a positive number (or 0) indicates scrolling down; a negative number indicates scrolling up.
 */
function handle_scroll_main(direction) {
    let exposition = dom_main.querySelector('#exposition');
    if (exposition == null) return;

    // generate a list of all the scroll positions of the child elements
    const snap_heights = [...exposition.children].map(child => child.offsetTop);
    // Must round current scroll height to avoid bugs
    const current_height = Math.round(dom_main.scrollTop);
    let target_height;

    // Choose nearest snap height in respective direction
    if (direction <= 0)
    {
        target_height = Math.max(...snap_heights.filter(x => x < current_height));
    }
    else
    {
        target_height = Math.min(...snap_heights.filter(x => x > current_height));
    }

    dom_main.scrollTo({ top: target_height });
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
    Game.activeScreenId = screens.home.id;
    dom_hud.classList.add('hide');


    // set the background
    document.body.dataset.bg = 'none';

    // this is just to test scroll behavior, remove later
    // dom_main.querySelector('#exposition').innerHTML += "<p>blah blah blah</p>".repeat(7);

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
    Game.activeScreenId = screens.characterSelect.id;
    dom_hud.classList.add('hide');
    const charSelect = dom_main.querySelector('#character-select');
    const characterList = dom_main.querySelector('#character-list');

    // set the background
    document.body.dataset.bg = 'none';

    // generate character cards from data
    characters.forEach(c => {
        // create card from html and insert data
        let el = htmlToElement(`<div class="character-card">
            <img class="character-card-icon" src="${c.icon}" alt="${c.name} icon">
            <h2> ${c.name} </h2>
            <div class="character-stats hidden-until-selected">
                <p> <strong>Age:</strong> ${c.age} </p>
                <p> <strong>Gender:</strong> ${c.gender} </p>
            </div>
            <p class="character-desc hidden-until-selected"> <strong>Bio:</strong> ${c.bio} </p>
            <button class="character-back-button hidden-until-selected"> Back </button>
            <button class="character-confirm-button hidden-until-selected"> Choose ${c.name} </button>
        </div>`);

        // click behavior for card
        el.addEventListener('click', () => {
            // cancels the event if the card is already selected
            if (el.classList.contains('selected')) return;

            // Remove selection from any other character card
            characterList.querySelectorAll('.character-card.selected').forEach(el2 => {
                el2.classList.remove('selected');
            })
            // Apply css classes to select the character card
            charSelect.classList.add('selection-on');
            el.classList.add('selected');

            // Animate stuff appearing after a short delay
            window.setTimeout(() => {
                el.querySelectorAll('.hidden-until-selected').forEach(el2 => el2.classList.add('selected'));
            }, 200);
        }, true);

        // click behavior for confirm button
        el.querySelector('.character-confirm-button').addEventListener('click', () => { handle_select_character(c) });

        // click behavior for back button
        el.querySelector('.character-back-button').addEventListener('click', () => {
            charSelect.classList.remove('selection-on');
            el.classList.remove('selected');
            console.log('going back');
            console.log(el);

            // Animate stuff disappearing
            el.querySelectorAll('.hidden-until-selected').forEach(el2 => el2.classList.remove('selected'));
        })

        // add card to the document
        characterList.appendChild(el);
    })

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 500, 500);
    reveal_children_consecutively(dom_main.querySelector('#character-list'), 500, 250, delay, false);

    // TODO: add listeners for scrolling between selected characters
}

/**
 * Renders the disclaimer screen
 */
function render_disclaimer() {
    // overwrite contents of main
    dom_main.innerHTML = screens.disclaimer.htmlContent;
    Game.activeScreenId = screens.disclaimer.id;
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
    Game.activeScreenId = screens.scenario.id;
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
    Game.activeScreenId = screens.scenarioResponse.id;
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
    Game.activeScreenId = screens.end.id;
    dom_hud.classList.remove('hide');

    // set the background
    document.body.dataset.bg = 'none';

    dom_main.querySelector('#button-play-again').addEventListener('click', () => { render_home() });
}

/* -------------------------------------------------------------------------- */
/*                               Other Functions                              */
/* -------------------------------------------------------------------------- */

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

/**
 * Updates the HUD with data from Game. Triggered any time relevant data is changed
 */
function update_HUD() {
    dom_hud.querySelector('#character-icon').src = Game.chosenCharacter.icon;
    dom_hud.querySelector('#character-name').innerText = `Story: ${Game.chosenCharacter.name}`;
    dom_hud.querySelector('#scenario-num').innerText = `Scenario ${Game.storyProgress}`;
}

/**
 * Simple utility function to transform html data into an {@link Element}
 * @param {String} str html string to convert
 * @returns {Element}
 */
function htmlToElement(str) {
    let t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstChild;
}