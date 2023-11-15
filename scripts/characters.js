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

const noraSenarioResponse4 ={
    askTeacher: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Ask the teacher anyway
    </button>
    </div>`, `<div id="exposition">
    <p>
        You raise your hand and ask the teacher despite the warning. Talking in class is stressful for you and you feel like everyone’s eyes are drilling into you. He clarifies the instructions and you can tell something is going on with either him or the class but you can’t tell what.
    </p>
    </div>`
    ), 
    askStudent: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Ask your neighbor 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You turn and whisper to your neighbor, asking them what do to. You feel self-conscious like you are the only one who doesn’t understand. You don’t know why everyone else seems to get it but you just can’t. They tell you what you need to know and then you both get to work.
    </p>
    </div>`
    ), 
    attempt: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Attempt to complete the assignment anyway   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You do your best but when you go over it at the end of the period you realize you missed a big piece of the assignment. You feel like if the teacher was just clear it would have been fine but you did your best with the information you have.
    </p>
    </div>`
    ),
    nope: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Don't do the assignment   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit and look at the assignment but you just can't do anything, the lack of clarity feels paralyzing. You end the class feeling like a failure, even though you know you aren't. 
    </p>
    </div>`
    )
}

const noraSenarioResponse5 ={
    backOfTheBus: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Join the chaos in the back
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit laughing loudly with everyone but you feel tired and drained when you get off the bus.
    </p>
    </div>`
    ), 
    friend: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Sit with one of your friends and chat
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit by one of your friends and have a fun conversation about your art.
    </p>
    </div>`
    ), 
    sketch: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Sit across from one of your friends and sketch   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit in the front where there aren't too many people, and you are able to tune out the noise in the back. Sketching always brings you joy.
    </p>
    </div>`
    ),
    alone: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Sit by yourself and cover your ears   
    </button>
    </div>`, `<div id="exposition">
    <p>
        It feels so loud. Between the bus, the conversations, and the chaos in the back, it feels far too loud. None of the other people around you are having the same reaction you are and you feel alone. 
    </p>
    </div>`
    )
}

const noraSenarioResponse6 ={
    rest: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Get a snack and take a nap
    </button>
    </div>`, `<div id="exposition">
    <p>
        It feels good to take a second and just relax, you wake up feeling a little better
    </p>
    </div>`
    ), 
    stim: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Stim and draw
    </button>
    </div>`, `<div id="exposition">
    <p>
        You are able to drop your mask and let your leg start bouncing like it wants too. You start a drawing that you have been thinking about all day. It feels good to just take a second to do something that actually interests you.
    </p>
    </div>`
    ), 
    tv: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Sit in front of the TV 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit down and stare, it feels good to turn your brain off and not need to comprehend everything around you. You can pause and take a break from the noise if you need to.
    </p>
    </div>`
    ),
    friend: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Go hang out with a friend   
    </button>
    </div>`, `<div id="exposition">
    <p>
        You get a chance to go hang out with your neighbor and you play a game together, a wonderful way to spend the afternoon.
    </p>
    </div>`
    ),
    chores: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Get started on chores immediately   
    </button>
    </div>`, `<div id="exposition">
    <p>
        Your family is happy to see that the kitchen is clean.
    </p>
    </div>`
    )
}

const noraSenarioResponse7 ={
    doIt: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Do it
    </button>
    </div>`, `<div id="exposition">
    <p>
        You complete your homework
    </p>
    </div>`
    ), 
    nope: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Don't 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You sit and stare at the backpack across the room and it just stares back at you. You try to tell yourself to do it but you can't make yourself. You want to be a good student and normally you are but you don't have it in you right now. 
    </p>
    </div>`
    )
}
const noraSenarioResponse8 ={
    eat: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Eat it
    </button>
    </div>`, `<div id="exposition">
    <p>
        You try it and like it, your dad is very happy. 
    </p>
    </div>`
    ), 
    attempt: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Attempt to eat it 
    </button>
    </div>`, `<div id="exposition">
    <p>
        You take a bite but you can't bring yourself to eat anymore. You don't want to make your dad sad but the new texture and taste were not what you were expecting.
    </p>
    </div>`
    ), 
    refuse: new ScenarioResponse(
    `<div id="options">
    <button class="button-option">
        Refuse   
    </button>
    </div>`, `<div id="exposition">
    <p>
        Your dad looks hurt but you can't bring yourself to do it. You don't want to make him sad but the idea of a new texture, taste, and change in routine is just too much right now
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
    noraSenario4: new Scenario(
    `<div id="exposition">
    <p>
        You are in science class which normally you have no problems with. However, the teacher gave you unclear directions and said that he didn't want any more questions on how to do the worksheet he just put in front of you. The rest of the class starts working on the worksheet. A few students exchange looks with each other.
    </p>
    </div>`, noraSenarioResponse4, `Placeholder`
    ),
    noraSenario5: new Scenario(
    `<div id="exposition">
    <p>
        You are riding home on the bus, it is loud and boisterous. Kids are screaming in the back, as per usual, and the bus driver greets you as you get on.
    </p>
    </div>`, noraSenarioResponse5, `Placeholder`
    ),
    noraSenario6: new Scenario(
    `<div id="exposition">
    <p>
        You get home after school, and you have a bit of time before you have to do anything.
    </p>
    </div>`, noraSenarioResponse6, `Placeholder`
    ),
    noraSenario7: new Scenario(
    `<div id="exposition">
    <p>
        You have some homework you need to do before tomorrow.
    </p>
    </div>`, noraSenarioResponse7, `Placeholder`
    ),
    noraSenario8: new Scenario(
    `<div id="exposition">
    <p>
        Your dad cooked a new thing for dinner and wants the whole family to try it.
    </p>
    </div>`, noraSenarioResponse8, `Placeholder`
    )
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