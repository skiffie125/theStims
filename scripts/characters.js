/**
 * Represents a playable character, their info, their gameplay stats, and their storyline.
 */
class Character {
    static #id_counter = 0;

    /** @readonly unique identifier for this Character instance */
    id;
    /** @type {String} Displayed on the character card as well as the HUD when the character is selected to play */
    name;
    /** @type {number} Displayed on the character card */
    age;
    /** @type {String} Displayed on the character card */
    gender;
    /** @type {String} Displayed on the character card */
    bio;
    /** Array of Scenarios in order of how they will appear in game. */
    scenarioList;

    /**
     * 
     * @param {String} name Displayed on the character card as well as the HUD when the character is selected to play
     * @param {number} age Displayed on the character card
     * @param {String} gender Displayed on the character card
     * @param {String} bio Displayed on the character card
     * @param {Scenario[]} scenarioList Array of Scenarios in order of how they will appear in game.
     */
    constructor(name, age, gender, bio, scenarioList) {
        this.id = Character.#id_counter++;

        this.name = name;
        this.age = age;
        this.gender = gender;
        this.bio = bio;
        this.scenarioList = scenarioList;
    }

    /**
     * Constructs and returns a new instance of {@link Character} from raw object data.
     * @param {Object} data a plain object holding all character data in the form of:
     *  {
     *      character params,
     *      scenarioList: [
     *      {
     *          scenario params,
     *          responses: [
     *          {
     *              response params
     *          },
     *          ...
     *          ]
     *      },
     *      ...
     *      ]
     *  }
     * @returns {Character}
     */
    static buildCharacter(data)
    {
        // TODO: implement
    }
}

/**
 * Represents a discrete section of a character's story with exposition and a list of responses that the player can choose.
 */
class Scenario {
    static #id_counter = 0;

    /** @readonly unique identifier for this Scenario instance*/
    id;
    /**
     * @type {String} html to display in the top section of the screen when scenario is entered
     * (each top-level element will appear with a short delay after the last)
     * */
    exposition;
    /** @type {ScenarioResponse[]} list of responses in the order they will display from left to right */
    responses;
    /** @type {String} used to determine the background image and ambient sound during the scenario */
    theme;

    /**
     * 
     * @param {String} exposition html to display in the top section of the screen when scenario is entered
     * (each top-level element will appear with a short delay after the last)
     * @param {ScenarioResponse[]} responses list of responses in the order they will display from left to right
     * @param {String} [theme] used to determine the background image and ambient sound during the scenario. valid themes are:
     * **none** (default), **school**
     */
    constructor(exposition, responses, theme = 'none') {
        this.id = Scenario.#id_counter++;

        this.exposition = exposition;
        this.responses = responses;
        this.theme = theme;
    }
}

/**
 * Represents a particular choice that the player can make during a scenario, as well as the text which is
 * displayed afterwards and any internal effects on gameplay.
 */
class ScenarioResponse {
    static #id_counter = 0;

    /** @readonly unique identifier for this ScenarioResponse instance*/
    id;
    /** @type {String} Text to display on the button to choose this response */
    buttonText;
    /**
     * @type {String} html to display in the top section of the screen when the response is chosen
     * (each top-level element will appear with a short delay after the last)
     */
    resultExposition;
    
    
    // Added the following
    // TODO: Add to constructor
    
    /**
     * @type {int} effect response has on stress if chosen
     */
    stressEffect;
    /**
     * @type {int} threshold of stress needed to take this action
     */
    threshold;

    // TODO:
    // figure out how we want to represent other metrics 
    // social and school in nora's case 


    /**
     * @param {String} buttonText Text to display on the button to choose this response
     * @param {String} resultExposition html to display in the top section of the screen when the response is chosen
     * (each top-level element will appear with a short delay after the last)
     */
    constructor(buttonText, resultExposition) {
        this.id = ScenarioResponse.#id_counter++;

        this.buttonText = buttonText;
        this.resultExposition = resultExposition;
    }
}

// TODO: Add character data

/*
DEMO STORY
*/

//Responses Arrays

const noraSenarioResponse1 ={
    dirtyClothes: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Wear dirty clothes
    </button>
    </div>`, `<div id="exposition">
    <p>
        You feel comfortable in your own skin. You get a few looks when you step on the bus but who cares?
    </p>
    </div>`
    ), 
    hated: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Wear something you hate
    </button>
    </div>`, `<div id="exposition">
    <p>
        The tag on the back of your shirt scrapes the back of your neck at unpredictable intervals and the weight of your pants feels wrong. The waistband of your pants pinches and the lack of the usual helpful pressure of a sweatshirt makes it feel ungrounded. Furthermore, you feel self-conscious and start adjusting your clothes constantly.
    </p>
    </div>`
    ), 
    clean: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Try to clean your clothes before school 
    </button>
    </div>`, `<div id="exposition">
    <p>
        It's not perfect, the oil stain on your shirt still shows a little bit, but it's better than it would otherwise be. It messed up your usual morning routine which makes you feel even more tired but at least when you get on the bus to go to school you don’t feel like crawling out of your own skin.
    </p>
    </div>`
    )
}

const noraSenarioResponse2 ={
    doIt: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Do everything you can to pay attention
    </button>
    </div>`, `<div id="exposition">
    <p>
        You take intense notes and by the time class is over the words you wrote and the words the teacher is saying are blurring together. You definitely understood a lot, but that didn't stop your mind from blanking occasionally. You leave for the next class tired.
    </p>
    </div>`
    ), 
    doodle: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Doodle scenes from the book 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You don't understand everything in the lecture, but drawing out the scenes helps you stay engaged, and may have even understood more than you would have if you sat up straight and made eye contact.
    </p>
    </div>`
    ), 
    stop: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Stop paying attention   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You stare at the window engrossed in your own thoughts. When the bell rings to go to your next class, you look bleary-eyed at the board. You don't know anything that was said.
    </p>
    </div>`
    )
}

const noraSenarioResponse3 ={
    literally: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Respond literally
    </button>
    </div>`, `<div id="exposition">
    <p>
        "It was a joke, Nora." You feel like that was the right response, but clearly it wasn't
    </p>
    </div>`
    ), 
    mask: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Laugh and nod 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You smile and while you don't say anything significant it was enough to get you through the interaction.
    </p>
    </div>`
    ), 
    stop: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Don't respond at all   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You don't make eye contact and just stare down at the lunch table, you don't have a good response so you don't say anything. You get some looks from the people around you but the conversation shifts away from you and you can finish eating.
    </p>
    </div>`
    ),
    try: new ScenarioResponse(
        `<div id="options">
        <button class="button-option">
            Take time to consider and respond   
        </button>
        </div>`, `<div id="exposition">
        <p>
            You take a second and realize what she is actually saying. You are then able to respond in kind, and get smiles from your friends. It makes you feel good that you were able to communicate but it feels like it took more work for you than everyone else.
        </p>
        </div>`
        )
}


//List of senarios

const noraSenarios = {
    noraSenario1: new Scenario(
    `<div id="exposition">
    <p>
        You start your day, getting ready. You are picking out what to wear but nothing that feels good to wear is clean at the moment. What do you do?
    </p>
    </div>`, noraSenarioResponse1, `Placeholder`
    ),
    noraSenario2: new Scenario(
    `<div id="exposition">
    <p>
    You are in English class, your first class of the day. You are trying to pay attention in class but your mind keeps wandering. The book you are discussing couldn’t be more boring, and it feels painful to try and keep your focus. What do you do?
    </p>
    </div>`, noraSenarioResponse2, `Placeholder`
    ), 
    noraSenario3: new Scenario(
    `<div id="exposition">
    <p>
    You are at lunch with a group of friends when one of them says something. How do you respond?
    </p>
    </div>`, noraSenarioResponse3, `Placeholder`
    ), 
}


//Character 



/**
 * @type {Character[]}
 */
const characters = [
{
    name: 'August',
    age: '20',
    gender: 'female',
    bio: 'August is in her second year of her associates degree at a local community college in Arizona. She comes from a suburban middle-class family, and has a mother, father, and 2 younger sisters who love her very much but put heavy pressure on her to succeed in school. She has diagnosed ADHD and an anxiety disorder, but nobody suspects that she may also have Autism.',
    scenarioList: [

    ]
},
{
    name: 'Nora',
    age: '14',
    gender: 'female',
    bio: 'Nora is in the 8th grade at her local public middle school in Vermont. She comes from an immigrant family and has had trouble with bullies at school, despite being quite friendly and sociable and a talented artist. Her family knows she has Autism because her Aunt has it as well and displays similar traits, but they are unable to afford testing and thus she has no formal diagnosis.',
    scenarioList: [
        {
            exposition: '<p> You are approached by your friend <strong>Joanna</strong> after school and she asks you, out of the blue, <strong>"Why are you always so awkward?"</strong> </p> <p> How do you respond? </p>',
            theme: 'school',
            responses: [
                {
                    buttonText: 'Witty Retort',
                    resultExposition: 'not written yet'
                },
                {
                    buttonText: '"My family says I have Autism"',
                    resultExposition: `<p> You tell Joanna that sometimes you behave strangely <strong>without realizing</strong> it because of your Autism. </p> <p> Joanna says, <strong>"Yeah, I know that, dummy. Never mind..."</strong> </p> <p> You must have <strong>missed something</strong>. She seems upset, maybe about something from earlier that day, but you can't be sure. </p>`
                },
                {
                    buttonText: '"What are you talking about?"',
                    resultExposition: 'not written yet'
                }
            ]
        }
    ]
},
{
    name: 'Roman',
    age: '31',
    gender: 'male',
    bio: 'Roman is a retail worker at a home improvement shop in Portland, Oregon, and lives in a nearby apartment with his mother. He was diagnosed with Autism at age 5 and received therapies throughout his adolescence to help develop his social skills. He speaks very politely and tries his best to be approachable, but for some reason, people often seem intimidated by him and he has never held a job for longer than 6 months.',
    scenarioList: [

    ]
}
].map(c => Character.buildCharacter(c));

export default characters;