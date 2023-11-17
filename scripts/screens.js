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
        <strong>1 in every 36 children</strong> is diagnosed with <strong>Autism Spectrum Disorder</strong> (ASD) as of 2022. They strain themselves every day just to fit in to society, yet their peers typically <strong>understand very little</strong> about what life is like for them.
    </p>
    <p>
        Are <strong>you</strong> willing to take a walk in their shoes?
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
        This story you are about to play through is inspired by <strong>real stories from the ASD community</strong>.
    </p>
    <p>
        However, this is just <strong>one story of many</strong>. Everybody's experience is different, and no one story can provide a complete understanding of the Autistic experience.
    </p>
</div>
<div id="options">
    <button class="button-continue">
        I understand
    </button>
</div>`),
    scenario: new GameScreen(`<div id="exposition">
    <p>
        You are approached by your friend <strong>Joanna</strong> after school and she asks you, out of the blue, <strong>"Why are you always so awkward?"</strong>
    </p>
    <p>
        How do you respond?
    </p>
</div>
<div id="options">
    <button class="button-option">
        Witty Retort
    </button>
    <button class="button-option">
        "My family says I have Autism..."
    </button>
    <button class="button-option">
        "What are you talking about?"
    </button>
</div>`),
    scenarioResponse: new GameScreen(`<div id="exposition">
    <p>
        You tell Joanna that sometimes you behave strangely <strong>without realizing</strong> it because of your Autism.
    </p>
    <p>
        Joanna says, <strong>"Yeah, I know that, dummy. Never mind..."</strong>
    </p>
    <p>
        You must have <strong>missed something</strong>. She seems upset, maybe about something from earlier that day, but you can't be sure.
    </p>
</div>
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