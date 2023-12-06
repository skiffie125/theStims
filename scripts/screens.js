/**
 * Used to hold the html data of a particular view in the game.
 */
class GameScreen {
    /** Internal counter used to assign unique IDs to each Screen object */
    static #id_counter = 0; // '#' at the beginning of a field in js means private
    /** The html skeleton of the Screen */
    htmlContent;
    id;

    /**
     * @param {String} htmlContent The html skeleton data of the Screen
     */
    constructor(htmlContent) {
        this.htmlContent = htmlContent;
        this.id = GameScreen.#id_counter++;
    }
}

/**
 * Stores all the skeleton html for the different game screens. Located in a seperate module to avoid cluttering up the code
 */
const screens = {
    home: new GameScreen(`<div id="exposition">
    <p>
        As of 2022, <strong>1 in every 36 children</strong> is diagnosed with <strong>Autism Spectrum Disorder</strong> (ASD). These individuals face daily challenges to fit into society, and yet, their peers often <strong>understand very little</strong> about what life is like for them.
    </p>
    <p>
        Are <strong>you</strong> ready to step into their shoes?
    </p>
</div>
<div id="options">
    <button id="button-begin">
        Begin
    </button>
</div>`),
    characterSelect: new GameScreen(`<div id="exposition" class="no-vertical-pad">
    <p>
        Select your story:
    </p>
    <p class="small">
        (Click a card to see more info)
    </p>
</div>
<div id="character-select">
    <div id="character-list">
        
    </div>
</div>
`),
    disclaimer: new GameScreen(`<div id="exposition">
    <p>
        The story you are about to experience draws inspiration from <strong>real stories within the ASD community</strong>.
    </p>
    <p>
        However, it's important to recognize that this is just <strong>one narrative among many</strong>. Each individual's journey is unique, and no single story can fully encapsulate the diverse experiences within the Autistic community.
    </p>
</div>
<div id="options">
    <button class="button-continue">
        I acknowledge
    </button>
</div>`),
    scenario: new GameScreen(`<div id="exposition"></div>
<div id="options">
</div>`),
    scenarioResponse: new GameScreen(`<div id="exposition"></div>
<div id="options">
    <button class="button-continue">
        Continue
    </button>
</div>`),
    end: new GameScreen(`
    <div id="end-card">
        <h2>You completed the game!</h2>
        <h3>Results:</h3>
        
        <h4>Stress Management: 3/5</h4>
        <p>
            You managed to keep your stress level relatively under control.
        </p>
    
        <h4>
            Academic Performance: 2/5
        </h4>
        <p>
            You were neglected your classwork at times, which may have saved you a bit of stress in the short term, but it's only going to make life harder in the long run. 
        </p>
    
        <h4>
            Social Standing: 4/5
        </h4>
        <p>
            You managed to fit in pretty well with your peers! Your friends describe you as quirky but charming.
        </p>
        
    
        <div id="end-buttons">
            <button id="button-share">
                Share this with your friends!
            </button>
            <button id="button-play-again">
                New Story
            </button>
            <button id="button-resources">
                Resources for individuals with Autism
            </button>
            <button id="button-survey">
                Help us improve!
            </button>
        </div>
    </div>`),
};



export default screens;
//export default noraScreens;