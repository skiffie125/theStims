/**
 * Used to hold the html data of a particular view in the game.
 */
class GameScreen {
    /** Internal counter used to assign unique IDs to each Screen object */
    static #id_counter = 0; // '#' at the beginning of a field in js means private
    /** The html skeleton of the Screen */
    htmlContent;

    /**
     * @param {String} htmlContent The html skeleton data of the Screen
     */
    constructor(htmlContent)
    {
        this.htmlContent = htmlContent;
        this.id = GameScreen.#id_counter++;
    }
}

/**
 * Stores all the skeleton html for the different game screens. Located in a seperate module to avoid cluttering up the code
 */
let screens = {
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
    characterSelect: new GameScreen(`
    <div id="exposition">
    <p>
        Select your story:
    </p>
    <p>
        (Click a card to see more info)
    </p>
</div>
<div id="character-select">
    <div id="character-list">
        <div class="character-card">
            <img src="./assets/blank_character_icon.png" alt="blank character icon">
            <h2>
                Kevin
            </h2>
        </div>
        <div class="character-card">
            <img src="./assets/blank_character_icon.png" alt="blank character icon">
            <h2>
                Kevin
            </h2>
        </div>
        <div class="character-card">
            <img src="./assets/blank_character_icon.png" alt="blank character icon">
            <h2>
                Kevin
            </h2>
        </div>
    </div>
</div>`)
};

export default screens;