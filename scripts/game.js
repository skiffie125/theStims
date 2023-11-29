import screens from './screens.js';
import characters from './characters.js';

/** @type {HTMLElement} reference to 'main' element */
let dom_main;
/** @type {HTMLElement} reference to HUD element */
let dom_hud;
let sound;

/**
 * Singleton object responsible for holding game state and observers
 */
let Game = (function () {
    // treat these like private members for Game
    // ik this syntax is confusing af but that's javascript for you
    let chosenCharacterPrivate;
    let storyProgressPrivate = 0;
    
    const STAT_MAX = 100;

    let stressPrivate = STAT_MAX;
    let reputationPrivate = STAT_MAX;
    let performancePrivate = STAT_MAX;

    // this is where the object with its public members are defined
    return {
        /** ID of the current screen being displayed */
        activeScreenId: screens.home.id,
        /** Whether audio should be enabled or not for the game. *undefined* until user is first prompted to enable audio */
        audioEnabled: undefined,


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
        },
        get stress() { return stressPrivate; },
        set stress(num) {
            stressPrivate = clamp(num,0,STAT_MAX);

            // Update stress visual/audio effects here
        },
        get reputation() { return reputationPrivate; },
        set reputation(num) {
            reputationPrivate = clamp(num,0,STAT_MAX);
        },
        get performance() { return performancePrivate; },
        set performance(num) {
            performancePrivate = clamp(num,0,STAT_MAX);
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
            case 'm': // TODO: Remove this
                show_message(`<p>testing testing!</p>
                <p>testing testing!</p>
                <p>testing testing!</p>
                <p>testing testing!</p>`, () => { console.log('clicked continue') });
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

function handle_home_continue() {
    // If user hasn't been prompted about audio yet
    if(Game.audioEnabled == undefined)
    // Ask them to enable audio
    show_question("<p>This game uses audio to create a more immersive experience. Would you like to enable audio?</p>",[
        {
            buttonText: "Enable Audio",
            callback: () => {
                Game.audioEnabled = true;
                playAudio(); // Plays inital audio contained in html
                render_characterSelect();
            }
        },
        {
            buttonText: "No Audio",
            callback: () => {
                Game.audioEnabled = false;
                render_characterSelect();
            }
        }
    ]);
    // otherwise go directly to character select
    else render_characterSelect();
}

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
    render_disclaimer();
}

/**
 * Resets game state and starts the first scenario
 */
function handle_start_game() {
    Game.storyProgress = 0;
    Game.stress = Game.chosenCharacter.stress_start;
    Game.reputation = Game.chosenCharacter.reputation_start;
    Game.performance = Game.chosenCharacter.performance_start;

    console.log('Starting Game as ',Game.chosenCharacter.name);
    logDebug();

    if (Game.chosenCharacter.scenarioList.length > 0)
    {
        render_scenario(Game.chosenCharacter.scenarioList[0]);
    }
    else
    {
        render_end();
    }
}

/**
 * Executes any effects of the response, then goes to the response screen
 * @param {ScenarioResponse} r 
 */
function handle_select_response(r) {
    // Game.chosenCharacter.adjustStress(r.stressEffect);
    r.applyEffects(Game);
    console.log(r.buttonText);
    logDebug();
    render_scenarioResponse(r);
}

/**
 * Shows an info box if this particular response has a **resultInfo** field. Otherwise, advances the story.
 * @param {ScenarioResponse} r
 */
function handle_response_continue(r) {
    if (r.resultInfo == undefined) handle_next_scenario();
    else show_message(r.resultInfo, handle_next_scenario);
}

/**
 * Advances to the next scenario in the storyline or the end screen if this was the last scenario
 */
function handle_next_scenario() {
    if (Game.storyProgress + 1 < Game.chosenCharacter.scenarioList.length)
    {
        // not sure if this is the correct place to put this or not
        if(Game.stress <= 50){
            render_scenario(Game.chosenCharacter.overwhelmScenario);
        } else {
            Game.storyProgress++;
            render_scenario(Game.chosenCharacter.scenarioList[Game.storyProgress]);
        }

        
    }
    else
    {
        render_end();
    }
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
    dom_main.querySelector('#button-begin').addEventListener('click', handle_home_continue);
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

    dom_main.querySelector('.button-continue').addEventListener('click', handle_start_game);
}

/**
 * Renders the scenario screen with a given scenario
 * @param {Scenario} s The {@link Scenario} object to render data from
 */
function render_scenario(s) {
    // overwrite contents of main
    pauseAudio();

    // Pause audio from the previous scene
    if (sound != null)
    {
        sound.pause();
    }
    // Play audio for the new scene based on the audio file defined in theme
    sound = new Pz.Sound('../assets/' + getAudioFile(s.theme), () => {
        var distortion = new Pizzicato.Effects.Distortion({
            gain: 0.1
        });
        sound.addEffect(distortion);
        sound.attack = 0.9;
        sound.release = 0.9;
        sound.play();
    });

    dom_main.innerHTML = screens.scenario.htmlContent;
    Game.activeScreenId = screens.scenario.id;
    dom_hud.classList.remove('hide');
    const options = dom_main.querySelector('#options');

    dom_main.querySelector('#exposition').innerHTML = s.exposition;

    s.responses.forEach(response => {
        const newButton = document.createElement('button');
        newButton.textContent = response.buttonText;
        newButton.classList.add('button-option');
        // console.log(response.condition,response.condition(Game));
        const enabled = response.condition(Game);
        newButton.disabled = !enabled;
        newButton.title = enabled ? "Choose this option" : 'Something is preventing you from choosing this option...';
        options.appendChild(newButton);

        newButton.addEventListener('click', () => { handle_select_response(response) });
    })

    document.body.dataset.bg = s.theme;

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);
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

    // Generate screen content from response data
    dom_main.querySelector('#exposition').innerHTML = r.resultExposition;

    // Don't set the theme since we just want the previous theme to carry over
    // document.body.dataset.bg = 'school';

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

    dom_main.querySelector('.button-continue').addEventListener('click', () => handle_response_continue(r));
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
    dom_hud.querySelector('#scenario-num').innerText = `Scenario ${Game.storyProgress + 1}`;
}

/**
 * Displays a modal box (dialog box) on top of the rest of the page, darkening the page and blocking interaction
 * with anything besides the box.
 * @param {String} htmlContent An html string to render inside the modal box content area
 * @param {Boolean} [dissmissable] Whether the modal can be closed by clicking the background (default **true**)
 * @returns {Element} The generated modal element
 */
function show_modal(htmlContent, dissmissable = true) {
    // generating html
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `<div class="modal-box">
        <div class="modal-header"></div>
        <div class="modal-content">${htmlContent}</div>
    </div>`;

    // initial animations
    modal.animate({ opacity: [0, 1] },
        {
            id: 'reveal',
            duration: 500,
            fill: 'backwards',
            easing: 'ease-out'
        });
    reveal_children_consecutively(modal.querySelector('.modal-content'), 500, 250, 0, false, false);

    // event listeners
    if (dissmissable) modal.addEventListener('click', (ev) => {
        if (ev.target == modal) close_modal(modal);
    });
    document.querySelector('#modals').appendChild(modal);
    return modal;
}

/**
 * Displays a modal box (dialog box) on top of the rest of the page, darkening the page and blocking interaction
 * with anything besides the box. This method adds a **continue** button at the bottom of the box content which
 * closes the box and triggers an optional callback function.
 * @param {String} htmlContent An html string to render inside the modal box content area
 * @param {EventListenerOrEventListenerObject} [callback] Function to execute when continue button is clicked
 * @param {Boolean} [dissmissable] Whether the modal can be closed by clicking the background (default **false**)
 * @returns 
 */
function show_message(htmlContent, callback, dissmissable = false) {
    const modal = show_modal(htmlContent + `<button class="button-modal-continue">Okay</button>`, dissmissable);
    modal.querySelector('.button-modal-continue').addEventListener('click', (event) => {
        close_modal(modal);
        return callback(event);
    });
    return modal;
}

/**
 * Displays a modal box (dialog box) on top of the rest of the page, darkening the page and blocking interaction
 * with anything besides the box. This method adds a **continue** button at the bottom of the box content which
 * closes the box and triggers an optional callback function.
 * @param {String} htmlContent An html string to render inside the modal box content area
 * @param {Object[]} choices
 * @param {EventListenerOrEventListenerObject} [callback] Function to execute when continue button is clicked
 * @param {Boolean} [dissmissable] Whether the modal can be closed by clicking the background (default **false**)
 * @returns 
 */
function show_question(htmlContent, choices, dissmissable = false) {
    // choices.forEach(choice => {
    //     htmlContent += `<button class="button-modal-choice">${choice.buttonText}</button>`;
    // })
    const modal = show_modal(htmlContent, dissmissable);
    // modal.querySelectorAll('.button-modal-choice').forEach(button => {
    //     addEventListener('click', (event) => {
    //         close_modal(modal);
    //         return callback(event);
    //     });
    // })
    const choicelist = modal.querySelector('.modal-content').appendChild(htmlToElement(`<div class="modal-choice-list"></div>`));
    choices.forEach(choice => {
        const button = htmlToElement(`<button class="button-modal-choice">${choice.buttonText}</button>`);
        button.addEventListener('click', (ev) => {
            choice.callback(ev);
            close_modal(modal);
        });
        choicelist.appendChild(button);
    })
    return modal;
}

/**
 * Closes a modal box, (dialog box) hiding it and restoring interactability with other elements on the page.
 * @param {Element} modal An element with class *modal*
 */
function close_modal(modal) {
    modal.remove();
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

/**
 * Simple helper function to clamp a value *x* between a lower and upper bound
 * @param {number} x 
 * @param {number} lower 
 * @param {number} upper 
 * @returns {number}
 */
function clamp(x,lower,upper)
{
    return x > lower ? x < upper ? x : upper : lower;
}

/**
 * Log various game info for debugging purposes
 */
function logDebug()
{
    console.log('Stress: ', Game.stress);
    console.log('Reputation: ', Game.reputation);
    console.log('Performance: ', Game.performance);
}

/** 
 * Returns the name of the audio file corresponding to the given theme
 */
function getAudioFile(theme){
    switch (theme) {
        case "school hallway":
            return 'loud_school.mp3';
        case "bedroom":
            return 'room_traffic_clock.mp3';
        case "living room":
            return 'room_traffic_clock.mp3';
        case "classroom 1":
            return 'classrom_ambient.mp3';
        case "classroom 2":
            return 'classrom_ambient.mp3';
        case "cafeteria":
            return 'cafeteria.mp3';
        case "dinner table":
            return 'dinner_table.mp3';
        case "school bus":
            return 'school_bus_ride.mp3';
        default:
            break;
    }
}   

/**
 * Plays background audio contained in html
 */
function playAudio(){
    if(Game.audioEnabled) document.getElementById("GameAudio").play();
}

/**
 * Pauses background site audio
 */
function pauseAudio(){
    document.getElementById("GameAudio").pause();
}

/** 
 * Loads new audio for background. This should change with scenario. 
 */
function loadAudio(src){
    var audio = document.getElementById("GameAudio");
    audio.src = src;
    audio.load();
}   