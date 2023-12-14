import screens from './screens.js';
import characters from './characters.js';

/** @type {HTMLElement} reference to 'main' element */
let dom_main;
/** @type {HTMLElement} reference to HUD element */
let dom_hud;
/** @type {HTMLElement} reference to background img element */
let dom_bg;
/** @type {HTMLElement} reference to the floaty text element*/
let dom_ftext;


/**
 * Singleton object responsible for holding game state and observers
*/
let Game = (function () {
    // treat these like private members for Game
    // ik this syntax is confusing af but that's javascript for you
    let chosenCharacterPrivate;
    let storyProgressPrivate = 0;
    let themePrivate = 'none';
    let doStressEffects = false;
    let doFloatingText = false;
    let textSpawner;
    let ft_emphasis_chance = 0.2;
    let audioEnabledPrivate = undefined;
    
    /** @type {Pizzicato.Sound[]} Keeps track of sound objects currently playing/loaded */
    const sounds = [];
    /** @type {Pizzicato.Group} group for all ambient sounds so they can have effects applied collectively */
    const sound_group = new Pz.Group();
    /** @type {Object} map of all effects attached to sound_group */
    const global_sfx = {
        distortion: new Pz.Effects.Distortion({
            gain: 0
        }),
    }
    // apply all the global sound effects to *sound_group*
    Object.values(global_sfx).forEach(effect => { sound_group.addEffect(effect); });
    
    const STAT_MAX = 100;
    const STRESS_LOW = 70;
    const STRESS_HIGH = 50;

    const floating_text_pool = [
        `The world is too loud.`,
        `There is a loose hair in your collar.`,
        `Your watch is slightly too tight.`,
        `Your shoes are pinching.`,
        `Your shirt tag is scratchy.`,
        `Your hair is touching your neck.`,
        `It's too bright here.`,
        `Your face itches.`,
        `It hurts to sit still.`,
        `You can hear your heart beating.`,
        `Your clothes feel prickly on your skin.`,
        `Reality is moving too fast.`,
        `People can see you.`,
        `Don't make a scene.`,
        `Why do you feel so irritable?`,
        `Just ignore it.`,
    ]

    let stressPrivate = STAT_MAX;
    let reputationPrivate = STAT_MAX;
    let performancePrivate = STAT_MAX;

    const themes = {
        "school hallway": {
            audio: 'loud_school.mp3',
            backdrop: './assets/bg_school.png',
        },
        "bedroom": {
            audio: 'room_traffic_clock.mp3',
            backdrop: './assets/bedroom.jpg',
        },
        "living room": {
            audio: 'room_traffic_clock.mp3',
            backdrop: './assets/living_room.jpg',
        },
        "classroom 1": {
            audio: 'classrom_ambient.mp3',
            backdrop: './assets/classroom_1.jpg',
        },
        "classroom 2": {
            audio: 'classrom_ambient.mp3',
            backdrop: './assets/classroom_2.jpg',
        },
        "cafeteria": {
            audio: 'cafeteria.mp3',
            backdrop: './assets/cafeteria.jpg',
        },
        "dinner table": {
            audio: 'dinner_table.mp3',
            backdrop: './assets/family_dinner.jpg',
        },
        "school bus": {
            audio: 'school_bus_ride.mp3',
            backdrop: './assets/school_bus.jpg',
        },
        "dining hall": {
            audio: 'dining_hall.wav',
            backdrop: './assets/dining_hall.jpg',
        },
        "classroom 3": {
            audio: 'keyboard.m4a',
            backdrop: './assets/classroom_3.jpg',
        },
        "classroom 4": {
            audio: 'quiet_classroom.wav',
            backdrop: './assets/classroom_4.jpg',
        },
        "phone": {
            audio: 'background_chatter.mp3',
            backdrop: './assets/phone.jpg',
        },
        "college club": {
            audio: 'background_chatter.mp3',
            backdrop: './assets/club_room.jpg',
        },
        "dorm room": {
            audio: 'dorm_ambient.wav',
            backdrop: './assets/dorm_room.jpg',
        },
        "dorm desk": {
            audio: 'gum.wav',
            backdrop: './assets/dorm_desk.jpg',
        },
        "trailer": {
            audio: 'trailer.mp3',
            backdrop: './assets/trailer.jpg',
        },
        "outside trailer":{
            audio: 'trailer.mp3',
            backdrop: './assets/outside_trailer.png',
        },
        "morning drive": {
            audio: 'morning_drive.mp3',
            backdrop: './assets/morning_drive.png',
        },
        "morning party": {
            audio: 'morning_drive2.mp3',
            backdrop: './assets/morning_drive2.png',
        },
        "walking campsites": {
            audio: 'walking_campsites.mp3',
            backdrop: './assets/walking_campsites.png',
        },
        "phone call": {
            audio: 'phone_call.mp3',
            backdrop: './assets/phone_call.png',
        },
        "after call": {
            audio: 'walking_campsites.mp3',
            backdrop: './assets/after_call.png',
        },
        "nature hike 1": {
            audio: 'nature_hike_1.mp3',
            backdrop: './assets/nature_hike_1.png',
        },
        
    }

    /**
     * This function is responsible for all the auditory and visual effects which are triggered by stress
     */
    const updateStressEffects = () => {
        if (doStressEffects)
        {
            const low = Game.stress <= STRESS_LOW;
            const high = Game.stress <= STRESS_HIGH;

            document.body.dataset.stressEffects = low ? high ? 'high' : 'low' : 'none';
            global_sfx.distortion.gain = 1 - (Game.stress/STAT_MAX);
            Game.floatingText(low);
            ft_emphasis_chance = high ? 0.1 : 0.05;

        }
        else
        {
            document.body.dataset.stressEffects = 'none';
            global_sfx.distortion.gain = 0;
            Game.floatingText(false);
        }
    }

    // this is where the object with its public members are defined
    return {
        /** ID of the current screen being displayed */
        activeScreenId: screens.home.id,
        /** Whether audio should be enabled or not for the game. *undefined* until user is first prompted to enable audio */
        get audioEnabled() { return audioEnabledPrivate },
        set audioEnabled(b) {
            audioEnabledPrivate = b;
            if(b == true)
            {
                sound_group.play();
                document.querySelector('#button-toggle-sound img').src = './assets/ui_icons/volume-on.svg';
            }
            else
            {
                sound_group.pause();
                document.querySelector('#button-toggle-sound img').src = './assets/ui_icons/volume-mute.svg';
            }
        },


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
        get theme() { return themePrivate; },
        set theme(t) {

            if (t in themes)
            {
                if(themePrivate != t)
                {
                    this.clearSounds();
                    this.playSound(`./assets/${themes[t].audio}`);
                }
                themePrivate = t;
                // dom_bg.hidden = false;
                dom_main.classList.add('theme-active');
                dom_bg.dataset.bg = t;
            }
            else
            {
                if(themePrivate != t)
                {
                    this.clearSounds();
                }
                themePrivate = 'none';
                // dom_bg.hidden = true;
                dom_main.classList.remove('theme-active');
                dom_bg.dataset.bg = 'none';
            }
        },
        get stress() { return stressPrivate; },
        set stress(num) {
            stressPrivate = clamp(num, 0, STAT_MAX);
            updateStressEffects();
        },
        get reputation() { return reputationPrivate; },
        set reputation(num) {
            reputationPrivate = clamp(num, 0, STAT_MAX);
        },
        get performance() { return performancePrivate; },
        set performance(num) {
            performancePrivate = clamp(num, 0, STAT_MAX);
        },
        reset() {
            this.stress = STAT_MAX;
            this.reputation = STAT_MAX;
            this.performance = STAT_MAX;
            this.chosenCharacter = undefined;
            this.storyProgress = 0;
        },
        /**
         * Turns on and off the stress effects
         * @param {Boolean} enable 
         */
        stressEffects(enable) {
            doStressEffects = enable;
            updateStressEffects();
        },
        /**
         * Turns on and off the floating text effect
         * @param {Boolean} enable 
         */
        floatingText(enable) {
            if(enable && !doFloatingText)
            {
                textSpawner = setInterval(() => {
                    this.spawnText();
                }, 500);
            }
            if(!enable && doFloatingText)
            {
                clearInterval(textSpawner);
            }
            doFloatingText = enable;
        },
        spawnText() {
            const el = document.createElement('p');
            el.innerText = floating_text_pool[Math.floor(Math.random()*floating_text_pool.length)];
            dom_ftext.appendChild(el);
            
            const x = Math.random()*70+15;
            const y = Math.random()*70+15;
            const theta = Math.random()*Math.PI*2;
            const mu = Math.random()*50+50;

            el.style.left = `${x}%`;
            el.style.top = `${y}%`;
            if(Math.random() < ft_emphasis_chance)
            {
                el.classList.add('emphasized');
            }

            el.animate(
                [
                    {
                        opacity: 0,
                        filter: `blur(3px)`,
                    },
                    {
                        opacity: 1,
                        filter: `blur(0)`,
                        offset: 0.5
                    },
                    {
                        opacity: 0,
                        filter: `blur(3px)`,
                        left: `calc(${x}% + ${Math.cos(theta)*mu}px)`,
                        top: `calc(${y}% + ${Math.sin(theta)*mu}px)`,
                    }
                ],
                {
                    duration: 10000
                }
            ).onfinish = () => {
                el.remove();
            }
        },
        /**
         * Creates a *Sound* object and attaches it to the global sound_group
         * @param {String} url URL of the sound file to play
         * @returns {Pizzicato.Sound} the created *Sound* object
         */
        playSound(url) {
            const s = new Pz.Sound({
                source: 'file',
                options: {
                    path: url,
                    loop: true,
                    attack: 0.9,
                    release: 0.9,
                    detatched: true,
                }
            }, (error) => {
                if(error) return;
                
                // register in sounds and sound_group
                sounds.push(s);
                sound_group.addSound(s);

                //play the sound if enabled
                if (Game.audioEnabled) { s.play(); }
            });
            return s;
        },
        /**
         * Stops and unloads all currently loaded sounds
         */
        clearSounds() {
            sounds.forEach(s => {
                sound_group.removeSound(s);
                s.stop();
            })
            while(sounds.length) sounds.pop();
        }
    }
})();

// This event fires once the page is fully loaded, any code which reads/modifies the page data must be called after the page is loaded.
window.addEventListener('load', event => {
    // Populate global DOM variables
    dom_main = document.querySelector('main');
    dom_hud = document.querySelector('#HUD');
    dom_bg = document.querySelector('#backdrop');
    dom_ftext = document.querySelector('#floaty-text');



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

    document.querySelector('#button-toggle-sound').addEventListener('click',() => {
        Game.audioEnabled = !Game.audioEnabled;
    })

    // console.log(characters);

    // Make the title text link to the home screen
    document.querySelector('h1').addEventListener('click', () => render_home());
});

/* -------------------------------------------------------------------------- */
/*                               Event handlers                               */
/* -------------------------------------------------------------------------- */

function handle_home_continue() {
    // If user hasn't been prompted about audio yet
    if (Game.audioEnabled == undefined)
        // Ask them to enable audio
        show_question("<p>This game uses audio to create a more immersive experience. Would you like to enable audio?</p>", [
            {
                buttonText: "Enable Audio",
                callback: () => {
                    Game.audioEnabled = true;
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

    console.log('Starting Game as ', Game.chosenCharacter.name);
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
 * Executes any effects of the response, then goes to the response screen. Given a story slide, it skips any responses and loads the next scenario
 * @param {ScenarioResponse} r 
 */
function handle_select_response(r) {
    // Game.chosenCharacter.adjustStress(r.stressEffect);
    if(r.resultExposition != null){
        r.applyEffects(Game);
        console.log(r.buttonText);
        logDebug();
        render_scenarioResponse(r);
    }else{
        handle_next_scenario();
    }
}

/**
 * Shows an info box if this particular response has a **resultInfo** field. Otherwise, advances the story.
 * @param {ScenarioResponse} r
 */
function handle_response_continue(r) {
    if (r.resultInfo == undefined) 
    {
        handle_next_scenario();

    } else
    {
        show_message(r.resultInfo, handle_next_scenario);
    }
}

/**
 * Advances to the next scenario in the storyline or the end screen if this was the last scenario
 */
function handle_next_scenario() {
    if (Game.storyProgress + 1 < Game.chosenCharacter.scenarioList.length)
    {
        // not sure if this is the correct place to put this or not
        if (Game.stress <= 40)
        {
            render_scenario(Game.chosenCharacter.overwhelmScenario);
        } else
        {
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
    // Game.floatingText(true);

    // overwrite contents of main
    dom_main.innerHTML = screens.home.htmlContent;
    Game.activeScreenId = screens.home.id;
    dom_hud.classList.add('hide');


    // set the background
    // document.body.dataset.bg = 'none';
    Game.theme = 'none';
    Game.reset();
    Game.playSound('./assets/sample_menu.mp3');

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
    // document.body.dataset.bg = 'none';
    Game.theme = 'none';

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
    // document.body.dataset.bg = 'none';
    Game.theme = 'none';

    // set up initial animations
    let delay = reveal_children_consecutively(dom_main.querySelector('#exposition'), 1000, 1000);
    reveal_children_consecutively(dom_main.querySelector('#options'), 500, 250, delay, false, false);

    // dom_main.querySelector('.button-continue').addEventListener('click', handle_start_game);
    dom_main.querySelector('.button-continue').addEventListener('click', () => {
        show_message(`
        <h3>
            How to Play:
        </h3>
        <p>
            Throughout this story, you will be presented with various choices.
        </p>
        <p>
            The choices you make will affect your character's emotional state, relationships and performance at their job/school. One common trait of Autism is <strong>alexithymia</strong>, which means a difficulty with identifying one's own emotions, so likewise, you will not be able to see the exact impacts of your choices until the end of the story.
        </p>
        <p>
            Some future choices may be disabled based on the consequences of your <strong>previous decisions</strong>. 
        </p>
        <p>
            If your character gets too overwhelmed, they will have a <strong>meltdown</strong>. Try to avoid this if possible! <strong>Visual & audio effects</strong> will warn you when you are getting close to a meltdown. 
        </p>
        `, handle_start_game);
    });
}

/**
 * Renders the scenario screen with a given scenario
 * @param {Scenario} s The {@link Scenario} object to render data from
 */
function render_scenario(s) {
    // overwrite contents of main
    /* pauseAudio();

    // Pause audio from the previous scene
    if (sound != null)
    {
        sound.pause();
    }
    // Play audio for the new scene based on the audio file defined in theme
    sound = new Pz.Sound({
        source: 'file',
        options: {
            path: './assets/' + getAudioFile(s.theme),
            loop: true,
            attack: 0.9,
            release: 0.9,
            detatched: true,
        }
    }, () => {
        var distortion = new Pizzicato.Effects.Distortion({
            gain: (1 - Game.stress * 0.01)  // calculate gain based on stress level
        });
        sound.addEffect(distortion);
        if (Game.audioEnabled) { sound.play(); }
    }); */

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
        const [enabled, msg] = response.condition(Game);
        newButton.disabled = !enabled;
        if(!enabled) newButton.prepend(htmlToElement(`<img src="./assets/ui_icons/forbidden.svg" alt="disabled">`));
        newButton.title = enabled ? "Choose this option" : msg ? msg : 'Something is preventing you from choosing this option...';
        options.appendChild(newButton);

        newButton.addEventListener('click', () => { handle_select_response(response) });
    })

    // document.body.dataset.bg = s.theme;
    Game.theme = s.theme;
    Game.stressEffects(true);

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
    // document.body.dataset.bg = 'none';
    Game.theme = 'none';
    Game.stressEffects(false);

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
    if (Game.chosenCharacter == undefined) return;
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
function clamp(x, lower, upper) {
    return x > lower ? x < upper ? x : upper : lower;
}

/**
 * Log various game info for debugging purposes
 */
function logDebug() {
    console.log('Stress: ', Game.stress);
    console.log('Reputation: ', Game.reputation);
    console.log('Performance: ', Game.performance);
}