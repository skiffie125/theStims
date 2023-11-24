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
    /** @type {String} URL string for the image to display on the character card & HUD */
    icon;
    /** Array of Scenarios in order of how they will appear in game. */
    scenarioList;
    /** @type {int} Integer stress level of character (0 - 100) */
    // stress_level;
    /** @type {int} Integer reputation level of character (0 - 100) */
    // reputation_level;

    stress_start;
    reputation_start;
    performance_start;

    /**
     * 
     * @param {String} name Displayed on the character card as well as the HUD when the character is selected to play
     * @param {number} age Displayed on the character card
     * @param {String} gender Displayed on the character card
     * @param {String} bio Displayed on the character card
     * @param {String} icon URL string for the image to display on the character card & HUD
     * @param {Scenario[]} scenarioList Array of Scenarios in order of how they will appear in game
     */
    constructor(name, age, gender, bio, icon = '../assets/blank_character_icon.png', scenarioList,
        stress_start = 100, reputation_start = 100, performance_start = 100) {
        this.id = Character.#id_counter++;

        this.name = name;
        this.age = age;
        this.gender = gender;
        this.bio = bio;
        this.icon = icon;
        this.scenarioList = scenarioList;

        this.stress_start = stress_start;
        this.reputation_start = reputation_start;
        this.performance_start = performance_start;
        
        // this.stress_level = 0;
        // this.reputation_level = 65; // Default to a D reputation socre, to be changed
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
    static buildCharacter(data) {
        // TODO: implement
        return new Character(
            data.name,
            data.age,
            data.gender,
            data.bio,
            data.icon,
            data.scenarioList.map(s => {
                return new Scenario(
                    s.exposition,
                    s.responses.map(r => {
                        return new ScenarioResponse(
                            r.buttonText,
                            r.resultExposition,
                            r.resultInfo,
                            (r.effects == undefined) ? new ResponseEffects() : new ResponseEffects(
                                r.effects.stress,
                                r.effects.reputation,
                                r.effects.performance,
                                r.effects.extra),
                            r.isEnabled);
                    }),
                    s.theme);
            }))
    }

    /* adjustStress(stress) {
        this.stress_level += stress;
        this.stress_level = Math.max(this.stress_level, 0);
        this.stress_level = Math.min(this.stress_level, 100);
        // Trigger effects if stress reaches a certian 
    }

    adjustReputation(reputation) {
        this.reputation_level += reputation;
        this.reputation_level = Math.max(this.reputation_level, 0);
        this.reputation_level = Math.min(this.reputation_level, 100);
    }

    getLetterReputation() {
        if (this.reputation_level == 100)
        {
            return 'A+';
        } else if (reputation_level >= 90)
        {
            return 'A';
        } else if (reputation_level >= 88)
        {
            return 'B+';
        } else if (reputation_level >= 80)
        {
            return 'B';
        } else if (reputation_level >= 78)
        {
            return 'C+';
        } else if (reputation_level >= 70)
        {
            return 'C';
        } else if (reputation_level >= 68)
        {
            return 'D+';
        } else
        {
            return 'D';
        }
    } */
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
    /**
     * @type {String} html to display in a pop-up box after continue is clicked on the response screen
     */
    resultInfo;

    /**
     * @type {ResponseEffects} used to determine what should happen when the response is chosen
     */
    effects;

    /**
     * @type {(Game) => Boolean} used to determine if the response should be available to the player or disabled
     */
    condition;


    // TODO:
    // figure out how we want to represent other metrics 
    // social and school in nora's case 


    /**
     * @param {String} buttonText Text to display on the button to choose this response
     * @param {String} resultExposition html to display in the top section of the screen when the response is chosen
     * (each top-level element will appear with a short delay after the last)
     */
    constructor(buttonText, resultExposition, resultInfo, effects, condition) {
        this.id = ScenarioResponse.#id_counter++;

        this.buttonText = buttonText;
        this.resultExposition = resultExposition;
        this.resultInfo = resultInfo;
        this.effects = effects;
        this.condition = (condition == undefined) ? () => true : condition;
    }

    /**
     * applies modifications to game state when response button is clicked.
     * @param {Object} Game the game object
     */
    applyEffects(Game) {
        Game.stress += this.effects.stress;
        Game.reputation += this.effects.reputation;
        Game.performance += this.effects.performance;
        this.effects.extra(Game);
    }
}

class ResponseEffects {
    /**@type {number} added to stress level when response is chosen */
    stress;
    /**@type {number} added to reputation level when response is chosen */
    reputation;
    /**@type {number} added to performance level when response is chosen */
    performance;
    /**@type {(Game) => any} function to perform any additional logic when response is chosen */
    extra;

    /**
     * 
     * @param {number} stress added to stress level when response is chosen
     * @param {number} reputation added to reputation level when response is chosen
     * @param {number} performance added to performance level when response is chosen
     * @param {(Game) => any} extra function to perform any additional logic when response is chosen
     */
    constructor(stress = 0, reputation = 0, performance = 0, extra = () => { }) {
        this.stress = stress;
        this.reputation = reputation;
        this.performance = performance;
        this.extra = extra;
    }
}

/* -------------------------------------------------------------------------- */
/*                               Character Data                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Guidelines ------------------------------- */
// Exposition can be as long as needed but try to limit the size of each <p> tag
// Make sure all apostrophes are the same if pasting from word processor
// <strong></strong> tags can be used to emphasize vocab words / important phrases / dialogue

// Not every response needs an info box, can be added later during research
// Start each story with a couple low-stakes scenarios to act as a sort of tutorial
// Decisions generally ramp up in stakes throughout story
// Each scenario should be crafted to emphasize a unique challenge/aspect of ASD, no need to repeat the same concept

/**
 * @type {Character[]}
 */
const characters = [
    {
        name: 'August',
        age: '20',
        gender: 'female',
        icon: '../assets/augest.png',
        bio: 'August is in her second year of her associates degree at a local community college in Arizona. She comes from a suburban middle-class family, and has a mother, father, and 2 younger sisters who love her very much but put heavy pressure on her to succeed in school. She has diagnosed ADHD and an anxiety disorder, but nobody suspects that she may also have Autism.',
        scenarioList: [

        ]
    },
    {
        name: 'Nora',
        age: '14',
        gender: 'female',
        icon: '../assets/nora.png',
        bio: 'Nora is in the 8th grade at her local public middle school in Vermont. She comes from an immigrant family and has had trouble with bullies at school, despite being quite friendly and sociable and a talented artist. Her family knows she has Autism because her Aunt has it as well and displays similar traits, but they are unable to afford testing and thus she has no formal diagnosis.',
        scenarioList: [
            {
                exposition: `<p> You start your day, getting ready. You are picking out what to wear but nothing that  <strong>feels good</strong> to wear is clean at the moment. What do you do? </p>`,
                theme: 'bedroom',
                responses: [
                    {
                        buttonText: 'Wear dirty clothes',
                        resultExposition: `<p> You feel comfortable in your own skin. You get a few looks when you step on the bus but who cares? </p>`,
                        effects: {
                            stress: 0,
                            reputation: -20,
                            performance: 0
                        }
                    },
                    {
                        buttonText: 'Wear something you hate',
                        resultExposition: `<p> The tag on the back of your shirt scrapes the back of your neck at unpredictable intervals and the weight of your pants feels wrong. The waistband of your pants pinches and the lack of the usual helpful pressure of a sweatshirt makes it feel ungrounded. Furthermore, you feel self-conscious and start adjusting your clothes constantly. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: `<p> People with Autism may experience <strong>over-sensitivity</strong> to certain textures which can cause discomfort or even panic in extreme cases. What you're sensitive to, though, and how severely <strong>varies greatly depending on the person</strong>. </p>`
                    },
                    {
                        buttonText: 'Try to clean your clothes before school',
                        resultExposition: `<p> It's not perfect, the oil stain on your shirt still shows a little bit, but it's <strong>better</strong> than it would otherwise be. It messed up your usual morning routine which makes you feel even more tired but at least when you get on the bus to go to school you don't feel like crawling out of your own skin. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: `<p> You are in English class, your first class of the day. You are trying to pay attention in class but your mind keeps wandering. The book you are discussing couldn't be more boring, and it feels painful to try and keep your focus. What do you do? </p>`,
                theme: 'classroom 1',
                responses: [
                    {
                        buttonText: `Do everything you can to pay attention`,
                        resultExposition: `<p> You take intense notes and by the time class is over the words you wrote and the words the teacher is saying are blurring together. You definitely understood a lot, but that didn't stop your mind from blanking occasionally. You leave for the next class tired. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Doodle scenes from the book`,
                        resultExposition: `<p> You don't understand everything in the lecture, but drawing out the scenes helps you stay engaged, and may have even understood more than you would have if you sat up straight and made eye contact. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -10
                        }
                    },
                    {
                        buttonText: `Stop paying attention`,
                        resultExposition: `<p> You stare at the window engrossed in your own thoughts. When the bell rings to go to your next class, you look bleary-eyed at the board. You don't know anything that was said. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        }
                    }
                ]
            },
            {
                exposition: `<p> You are at lunch with a group of friends when one of them says something. How do you respond? </p>`,
                theme: 'cafeteria',
                responses: [
                    {
                        buttonText: `"What?"`,
                        resultExposition: `<p> "It was a joke, Nora." Your friend responds, and the rest laugh. You didn't fully catch what was said. This happens a lot when you are with larger groups of people, you are noticing. </p>`,
                        effects: {
                            stress: 0,
                            reputation: -10,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Laugh and nod`,
                        resultExposition: `<p> You smile and while you don't say anything significant it was enough to get you through the interaction. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Don't respond at all`,
                        resultExposition: `<p> You don't make eye contact and just stare down at the lunch table, you don't have a good response so you don't say anything. You get some looks from the people around you but the conversation shifts away from you and you can finish eating. </p>`,
                        effects: {
                            stress: 0,
                            reputation: -20,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Take a second to process what was said`,
                        resultExposition: `<p> You take a second and realize what she is actually saying. You are then able to respond in kind, and get smiles from your friends. It makes you feel good that you were able to communicate but it feels like it took more work for you than everyone else. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: `<p> You are in science class which normally you have no problems with. However, the teacher gave you unclear directions and said that he didn't want any more questions on how to do the worksheet he just put in front of you. The rest of the class starts working on the worksheet. A few students exchange looks with each other. </p>`,
                theme: 'classroom 2',
                responses: [
                    {
                        buttonText: `Ask the teacher anyway`,
                        resultExposition: `<p>  You raise your hand and ask the teacher despite the warning. Your teacher turns and starts yelling at you and the class. You shrink back in your seat. Talking in class is already stressful for you and you feel like everyone's eyes are drilling into you. He gives you a detention slip. All you wanted to do was understand the assignment like you are supposed to. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: -10
                        }
                    },
                    {
                        buttonText: `Ask your neighbor`,
                        resultExposition: `<p> You turn and whisper to your neighbor, asking them what do to. You feel self-conscious like you are the only one who doesn't understand. You don't know why everyone else seems to get it but you just can't. They tell you what you need to know and then you both get to work. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Attempt to complete the assignment anyway`,
                        resultExposition: `<p> You do your best but when you go over it at the end of the period you realize you missed a big piece of the assignment. You feel like if the teacher was just clear it would have been fine but you did your best with the information you have. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: -10
                        }
                    },
                    {
                        buttonText: `Don't do the assignment `,
                        resultExposition: `<p> You sit and look at the assignment but you just can't do anything, the lack of clarity feels paralyzing. You end the class feeling like a failure, even though you know you aren't. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        }
                    }
                ]
            },
            {
                exposition: `<p> You are riding home on the bus, it is loud and boisterous. Kids are screaming in the back, as per usual, and the bus driver greets you as you get on. </p>`,
                theme: 'school bus',
                responses: [
                    {
                        buttonText: `Join the chaos in the back`,
                        resultExposition: `<p> You sit laughing loudly with everyone but you feel tired and drained when you get off the bus. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Sit with one of your friends and chat`,
                        resultExposition: `<p> You sit by one of your friends and have a fun conversation about your art. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Sit across from one of your friends and sketch`,
                        resultExposition: `<p> You sit in the front where there aren't too many people, and you are able to tune out the noise in the back. Sketching always brings you joy. </p>`,
                        effects: {
                            stress: 0,
                            reputation: -10,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Sit by yourself and cover your ears`,
                        resultExposition: `<p> It feels so loud. Between the bus, the conversations, and the chaos in the back, it feels far too loud. None of the other people around you are having the same reaction you are and you feel alone. </p>`,
                        effects: {
                            stress: -10,
                            reputation: -10,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: `<p> You get home after school, and you have a bit of time before you have to do anything. </p>`,
                theme: 'living room',
                responses: [
                    {
                        buttonText: `Get a snack and take a nap`,
                        resultExposition: `<p> It feels good to take a second and just relax, you wake up feeling a little better </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Stim and draw`,
                        resultExposition: `<p> You are able to drop your mask and let your leg start bouncing like it wants too. You start a drawing that you have been thinking about all day. It feels good to just take a second to do something that actually interests you. </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Sit in front of the TV `,
                        resultExposition: `<p> You sit down and stare, it feels good to turn your brain off and not need to comprehend everything around you. You can pause and take a break from the noise if you need to. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Go hang out with a friend`,
                        resultExposition: `<p> You get a chance to go hang out with your neighbor and you play a game together, a wonderful way to spend the afternoon. </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Get started on chores immediately`,
                        resultExposition: `<p> Your family is happy to see that the kitchen is clean. </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: `<p> You have some homework you need to do before tomorrow. </p>`,
                theme: 'bedroom',
                responses: [
                    {
                        buttonText: `Do it`,
                        resultExposition: `<p> You complete your homework </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Don't`,
                        resultExposition: `<p> You sit and stare at the backpack across the room and it just stares back at you. You try to tell yourself to do it but you can't make yourself. You want to be a good student and normally you are but you don't have it in you right now. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        }
                    }
                ]
            },
            {
                exposition: `<p> Your dad cooked a new thing for dinner and wants the whole family to try it. </p>`,
                theme: 'dinner table',
                responses: [
                    {
                        buttonText: `Eat it`,
                        resultExposition: `<p> You try it and like it, your dad is very happy. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Attempt to eat it`,
                        resultExposition: `<p> You take a bite but you can't bring yourself to eat anymore. You don't want to make your dad sad but the new texture and taste were not what you were expecting. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        }
                    },
                    {
                        buttonText: `Refuse`,
                        resultExposition: `<p> Your dad looks hurt but you can't bring yourself to do it. You don't want to make him sad but the idea of a new texture, taste, and change in routine is just too much right now </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            }
        ]
    },
    {
        name: 'Roman',
        age: '31',
        gender: 'male',
        icon: '../assets/roman.png',
        bio: 'Roman is a retail worker at a home improvement shop in Portland, Oregon, and lives in a nearby apartment with his mother. He was diagnosed with Autism at age 5 and received therapies throughout his adolescence to help develop his social skills. He speaks very politely and tries his best to be approachable, but for some reason, people often seem intimidated by him and he has never held a job for longer than 6 months.',
        scenarioList: [

        ]
    }
].map(c => Character.buildCharacter(c));

export default characters;