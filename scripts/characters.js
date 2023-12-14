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
    /** the senario that is triggered when things go to overwhelm. */
    overwhelmScenario

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
    constructor(name, age, gender, bio, icon = '../assets/blank_character_icon.png', scenarioList, overwhelmScenario,
        stress_start = 100, reputation_start = 100, performance_start = 100) {
        this.id = Character.#id_counter++;

        this.name = name;
        this.age = age;
        this.gender = gender;
        this.bio = bio;
        this.icon = icon;
        this.scenarioList = scenarioList;
        this.overwhelmScenario = overwhelmScenario

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
        const buildScenario = s => {
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
                        r.condition);
                }),
                s.theme)};
        // TODO: implement
        return new Character(
            data.name,
            data.age,
            data.gender,
            data.bio,
            data.icon,
            data.scenarioList.map(buildScenario),
            //may need a map to be the correct object here?
            data.overwhelmScenario == undefined ? undefined : buildScenario(data.overwhelmScenario));
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
        name: 'Riley',
        age: '19',
        gender: 'Nonbinary',
        icon: './assets/riley.png',
        bio: 'Riley is a 19 year old college student studying biology who was diagnosed with autism and ADHD in their senior year of highschool. They have a special interest in mollusks, which was part of why they decided to major in biology. College is harder than they anticipated, they are facing burnout and having a lot of difficulties with their roommate. They have a few friends, but they struggle with making new ones.',
        scenarioList: [
            {
                exposition: '<p>You head to the dining hall for breakfast and discover that they are out of your favorite cereal.  You go to grab a bowl of oatmeal instead and discover with horror that it\'s been sitting on the hot plate for too long and it looks very thick and dried out.  You <strong>always</strong> have cereal or oatmeal for breakfast and the thought of eating something else feels <strong>overwhelming</strong>.</p>',
                theme: 'dining hall',
                responses: [
                    {
                        buttonText: 'Eat overcooked oatmeal',
                        resultExposition: `<p>You try to get down some of the oatmeal, but <strong>the texture feels wrong in your mouth</strong> and you can’t bring yourself to eat more than a couple bites.</p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p> People with Autism may experience <strong>over-sensitivity</strong> to certain textures which can cause discomfort or even panic in extreme cases. What you\'re sensitive to, though, and how severely <strong>varies greatly depending on the person</strong>. </p>'
                    },
                    {
                        buttonText: 'Force yourself to eat something different',
                        resultExposition: '<p>You look over the options available and decide to grab some pancakes. Sometimes you can eat pancakes, but only if they are cooked right.  You take a bite and immediately can tell that they are undercooked. The middle <strong>feels pasty and wrong in your mouth</strong>.  You think about spitting it out, but you manage to choke it down. You can’t bring yourself to take another bite. You try grabbing some scrambled eggs instead, but <strong>the texture is repulsive</strong>.</p>',
                        effects: {
                            stress: -30,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p> People with Autism may experience <strong>over-sensitivity</strong> to certain textures which can cause discomfort or even panic in extreme cases. What you\'re sensitive to, though, and how severely <strong>varies greatly depending on the person</strong>. </p>'
                    },
                    {
                        buttonText: 'Skip breakfast',
                        resultExposition: '<p>You decide to skip breakfast. You know you’ll feel hungry later, but right now the thought of dealing with food with a <strong>bad texture</strong> is too much.</p>',
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p> People with Autism may experience <strong>over-sensitivity</strong> to certain textures which can cause discomfort or even panic in extreme cases. What you\'re sensitive to, though, and how severely <strong>varies greatly depending on the person</strong>. </p>',
                    },
                ]
            },
            {
                exposition: `<p>You walk into your math class and discover that the softer warm light bulbs in your classroom were replaced with harsh fluorescent brights.  <strong>The light hurts your eyes and you feel overwhelmed and on edge</strong>.  You know within the next couple of minutes you are going to start getting a headache.</p>`,
                theme: 'classroom 3',
                responses: [
                    {
                        buttonText: 'Put on the sunglasses in your backpack',
                        resultExposition: '<p>You put on the sunglasses. You feel a little <strong>self conscious</strong>, but your eyes don’t hurt anymore and you can focus on the lecture. After class the person next to you asks why you are wearing sunglasses inside.  Not expecting to have to explain yourself, you stammer through an explanation about the lights being too bright.  They give you a weird look and say <strong>“They’re just lights, I don’t get what the big deal is…”</strong> before walking away.</p>',
                        effects: {
                            stress: 0,
                            reputation: -30,
                            performance: 0
                        },
                        resultInfo: '<p>Many autistic people are <strong>hypersensitive to bright lights</strong>. Being in environments where the lighting is too bright can cause discomfort, difficulty focusing, fatigue, or emotional distress.</p>',
                    },
                    {
                        buttonText: 'Tough it out',
                        resultExposition: '<p>You try your best to focus on the lecture and take notes, but the lights are overwhelming and your head hurts.  You don’t absorb any of the material and you leave the class feeling <strong>exhausted</strong>.</p>',
                        effects: {
                            stress: -50,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Many autistic people are <strong>hypersensitive to bright lights</strong>. Being in environments where the lighting is too bright can cause discomfort, difficulty focusing, fatigue, or emotional distress.</p>',
                    },
                    {
                        buttonText: 'Skip class',
                        resultExposition: '<p>You get up and walk out of the classroom and find a quiet space to sit and read the textbook instead.  Hopefully you will be able to get notes from someone on what was covered in the lecture.</p>',
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -50
                        },
                        resultInfo: '<p>Many autistic people are <strong>hypersensitive to bright lights</strong>. Being in environments where the lighting is too bright can cause discomfort, difficulty focusing, fatigue, or emotional distress.</p>',
                    }
                ]
            },
            {
                exposition: `<p>Your next class of the day is biology.  As you are walking there you worry that they changed the lights in all of the classrooms, but when you walk in you see that the lights are still the same and you breathe a sigh of relief. </p>`,
                responses: [
                    {
                        buttonText: 'Continue',
                        resultExposition: null,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: `<p>At the end of the lecture your professor reminds you that you have an exam in 2 days and you suddenly realize that you never talked to this professor about accommodations.  Because of your autism and ADHD, you’re allowed to wear headphones during tests to help with sensory overload and you receive 50% extra time.  You would typically just send an email, but you aren’t sure that she will see it before the exam.  What do you do?</p>`,
                theme: 'classroom 4',
                responses: [
                    {
                        buttonText: `Talk to her after class`,
                        resultExposition: `<p> "You talk to your professor and she is very understanding, which is a big relief. You’ve had some experiences in the past with professors telling you that you didn’t need your accommodations or that they were unreasonable, despite the fact that they aren’t allowed to deny you access to your accommodations once you have received a note from your doctor and had it approved by the university’s disability access office.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 50)
                    },
                    {
                        buttonText: 'Send an email and hope she receives it in time',
                        resultExposition: '<p>You send her an email and hope that she receives it before the exam.</p>',
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -40
                        },
                    },
                    {
                        buttonText: 'Do nothing',
                        resultExposition: `<p>You don’t bother asking for your accommodations.  You know you will regret it once you are in the exam.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -40
                        },
                    }
                ]
            },
            {
                exposition: `<p>You check your phone and see a message from a classmate you’d like to be friends with asking if you want to come study with them until your next  class.  However, they are studying in one of the loudest and most crowded spots on campus.</p>`,
                theme: 'phone',
                responses: [
                    {
                        buttonText: `Accept the invitation`,
                        resultExposition: `<p> You know the environment will be <strong>overwhelming</strong>, but you don’t know if you’ll ever get another invitation if you decline this one so you agree to go.  There’s too much noise for you to get any work done.  You try your best to pay attention when they talk to you and respond appropriately, but it's difficult when there's so much else going on.</p>`,
                        effects: {
                            stress: -30,
                            reputation: 0,
                            performance: -20
                        },
                        condition: (Game) => (Game.stress >= 60)
                    },
                    {
                        buttonText: 'Decline the invitation',
                        resultExposition: `<p>You decline the invitation and try to explain that you just don’t have the energy.  You tack a “I’d love to some other time though!” onto the end in hopes that they don’t interpret this as a lack of interest, but <strong>you worry that there won’t be another invitation in the future</strong>.</p>`,
                        effects: {
                            stress: 0,
                            reputation: -30,
                            performance: 0
                        },
                    },
                    {
                        buttonText: 'Ask to move to a different location',
                        resultExposition: `<p>You ask if it would be possible to switch to another spot that is quieter and thankfully they agree!  You study together in your favorite corner of the library.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 30)
                    }
                ]
            },
            {
                exposition: `<p>The first meeting of the new marine biology club is today.  You are nervous because when you’ve gone to clubs in the past you’ve always just felt awkward, but your love of marine biology is enough motivation to go. You really hope that at some point there will be a meeting on mollusks since they are your <strong>special interest</strong>. You walk in a few minutes early and sit down next to a girl you’ve seen in a couple of your classes, but have never talked to.</p>`,
                theme: 'college club',
                responses: [
                    {
                        buttonText: `Ask her if she wants to hear a fun fact about cephalopods`,
                        resultExposition: `<p>You tell her about how octopi’s brains are shaped like donuts with their esophagus going through the middle, so if their food isn’t chewed well enough it can give them brain damage.  However, this isn’t usually an issue since they have a serrated radula, which is basically like mollusk’s equivalent of a tongue.  She smiles and says “Huh, that’s really neat!”</p>`,
                        effects: {
                            stress: 0,
                            reputation: 10,
                            performance: 0
                        },
                    	resultInfo: '<p>Many autistic people have <strong>special interests</strong>, which are intense or obsessive interests in specific topics. They often derive a lot of joy from learning more about, engaging in, or talking about their special interest with others. </p>',
                        condition: (Game) => (Game.stress >= 40)
                    },
                    {
                        buttonText: 'Try to make small talk',
                        resultExposition: `<p>You go through your script for small talk and ask what her major is, what classes she’s taking, and how she's liking her classes.  Once you go through those questions you don’t know what to say anymore.  You sit in awkward silence, racking your brain for another normal small talk thing to say and coming up empty.</p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Having a “script” for small talk is an example of a behavior known as <strong>masking</strong>. People with autism can learn behaviors that make them seem as if they aren’t struggling or are more “normal”. Masking is not solely found in people with Autism. </p>',
                        condition: (Game) => (Game.stress >= 60)
                    },
                    {
                        buttonText: 'Sit in silence',
                        resultExposition: `<p>You do your best to ignore the people around you and just sit in silence.  You worry about people thinking that you are weird for just sitting there so you pull out your phone and pretend to message someone to look busy.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                    }
                ]
            },
            {
                exposition: `<p>A few minutes later the meeting starts and the officers introduce themselves. The rest of the meeting is just talking about ideas for future meetings, which is a bit disappointing, but some of the future meeting topics sound cool.  You plan on going again next week.</p>`,
                theme: 'college club',
                responses: [
                    {
                        buttonText: `Head to the dining hall`,
                        resultExposition: null,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                    },
                ]
            },
            {
                exposition: `<p>You walk to the dining hall and meet up with your friends.  You go to grab food and are relieved to find that they have chicken sandwiches today. You all sit in a quiet corner and chat. One of your friends asks for the group's opinion on a situation with one of their friends who did something inconsiderate.  You know this person and you don’t like them.</p>`,
                theme: 'dining hall',
                responses: [
                    {
                        buttonText: `Speak your mind`,
                        resultExposition: `<p>You say something about how they have always been kind of selfish and that your friend shouldn’t put up with it anymore. The table goes quiet and you quickly realize <strong>you misread the tone</strong>.  Apparently your friend was joking, they weren’t actually bothered or asking for advice.  You apologize profusely and try to explain that you misunderstood, but the damage has been done.  The rest of dinner is painfully awkward.</p>`,
                        effects: {
                            stress: 0,
                            reputation: -40,
                            performance: 0
                        },
                        resultInfo: '<p>Autistic people often struggle to interpret social cues and read people’s tone, which can somtimes result in very awkward misunderstandings. </p>',
                    },
                    {
                        buttonText: 'Stay quiet',
                        resultExposition: `<p>You decide not to say anything and as the conversation continues you realize that your friend was joking and isn’t actually upset with this person or looking for advice.  You are incredibly relieved you didn’t say anything given how badly you had misread their tone.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Autistic people often struggle to interpret social cues and read people’s tone, which can sometimes result in very awkward misunderstandings. </p>',
                    },
                    {
                        buttonText: 'Change the topic',
                        resultExposition: `<p><strong>You aren’t sure how you are supposed to respond</strong> here so you quickly change the topic and start talking about how mediocre the dining hall food is.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 40)
                    }
                ]
            },
            {
                exposition: `<p>You walk back to your dorm room.  It feels good to be home. You can hear <strong>people being loud</strong> down the hall, but you try to ignore them.  You have a bit of free time, what do you do?</p>`,
                theme: 'dorm room',
                responses: [
                    {
                        buttonText: `Watch videos online about the evolutionary history of mollusks`,
                        resultExposition: `<p>You spend about an hour watching videos and you feel a bit better afterwards.</p>`,
                        effects: {
                            stress: 20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Many autistic people have <strong>special interests</strong>, which are intense or obsessive interests in specific topics. They often spend a large portion of their free time engaging in or learning more about their special interest.  </p>',
                        condition: (Game) => (Game.stress >= 30)
                    },
                    {
                        buttonText: 'Browse your favorite marine biology internet forum',
                        resultExposition: `<p>You spend about an hour looking through forums and you feel a bit better afterwards.</p>`,
                        effects: {
                            stress: 20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Many autistic people have <strong>special interests</strong>, which are intense or obsessive interests in specific topics. They often spend a large portion of their free time engaging in or learning more about their special interest.  </p>',
                        condition: (Game) => (Game.stress >= 30)
                    },
                    {
                        buttonText: 'Read a book about squids',
                        resultExposition: `<p>You spend about an hour reading and you feel a bit better afterwards.</p>`,
                        effects: {
                            stress: 20,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p>Many autistic people have <strong>special interests</strong>, which are intense or obsessive interests in specific topics. They often spend a large portion of their free time engaging in or learning more about their special interest.  </p>',
                        condition: (Game) => (Game.stress >= 50)
                    },
                    {
                        buttonText: 'Get started on homework immediately',
                        resultExposition: `<p>You start working on your homework.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 20
                        },
                        condition: (Game) => (Game.stress >= 80)
                    },
                    {
                        buttonText: 'Scroll through your social media feed',
                        resultExposition: `<p>You spend about an hour scrolling through social media and don't really feel any better afterwards.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                    }
                ]
            },
            {
                exposition: `<p>You start working on an assignment for your math class and realize you have no idea how to solve one of the problems. The tutoring center is still open for another hour, but having to <strong>interact with people</strong> sounds <strong>exhausting</strong>.  Do you go?</p>`,
                theme: 'dorm desk',
                responses: [
                    {
                        buttonText: `Go to the tutoring center`,
                        resultExposition: `<p>You pack up your stuff and head to the tutoring center.  It isn’t pleasant, but you get the help you need for your homework.</p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 50)
                    },
                    {
                        buttonText: 'Don’t go to the tutoring center',
                        resultExposition: `<p>You write down a guess and move on, you’re pretty sure it's wrong, but it's better than nothing.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        },
                    }
                ]
            },
            {
                exposition: `<p>You are trying to study, but the sound of your roommate chewing gum is driving you insane.  You go to put on your noise-canceling headphones only to discover that the battery is dead.</p>`,
                theme: 'dorm desk',
                responses: [
                    {
                        buttonText: `Ask them to stop`,
                        resultExposition: `<p>Hey, I’m really sorry but could you stop chewing the gum?  I just can’t deal with the noise right now and my headphones are dead and I really need to study.”  Jules looks over and just says “Okay” and spits it out before going back to what they were doing.  Are they annoyed?  Was that a genuine “Okay” or an passive aggressive “Okay”?  You can never tell.</p>`,
                        effects: {
                            stress: 0,
                            reputation: -20,
                            performance: 0
                        },
                        resultInfo: '<p><strong>Hypersensitivity</strong> to certain sounds is common in people with autism.  Hearing these sounds can cause intense distress, overwhelm, panic, or exhaustion if they are exposed to them for an extended period of time. Some autistic people wear noise cancelling headphones to mitigate this.</p>',
                        condition: (Game) => (Game.stress >= 30)
                    },
                    {
                        buttonText: 'Try to ignore it',
                        resultExposition: `<p>You try to just tune it out and focus on the work, but the noise is impossible to ignore.  The sound makes your skin crawl and you are starting to feel panicky.  There's no way you are getting your work done.</p>`,
                        effects: {
                            stress: -60,
                            reputation: 0,
                            performance: -20
                        },
                        resultInfo: '<p><strong>Hypersensitivity</strong> to certain sounds is common in people with autism.  Hearing these sounds can cause intense distress, overwhelm, panic, or exhaustion if they are exposed to them for an extended period of time. Some autistic people wear noise cancelling headphones to mitigate this.</p>',
                        condition: (Game) => (Game.stress >= 40)
                    },
                    {
                        buttonText: 'Go and study somewhere else',
                        resultExposition: `<p>You pack up your things and go to study somewhere else.  Unfortunately, none of the lounges in your building are empty and all of the nearby buildings on campus are closed at this hour.  You pick the lounge with the quietest people, but the background chatter is still enough that you struggle to tune it out.  You wish your headphones were charged.</p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: '<p><strong>Hypersensitivity</strong> to certain sounds is common in people with autism.  Hearing these sounds can cause intense distress, overwhelm, panic, or exhaustion if they are exposed to them for an extended period of time. Some autistic people wear noise cancelling headphones to mitigate this.</p>',
                    }
                ]
            },
        ],
        overwhelmScenario: {
            exposition: `<p> You feel like <strong>your skin is crawling</strong> and every little sound feels like its far <strong>too loud</strong>. You know you need to find a quiet place to calm down. </p>`,
            //theme: 
            responses: [
                {
                    buttonText: `Continue`,
                    resultExposition: `<p> You go hide in the bathroom as soon as you can.  You pace back and forth rapidly while flapping your hands to try and release some of the stress. After a few minutes you feel a bit calmer.</p>`,
                    effects: {
                        stress: 30,
                        reputation: -10,
                        performance: -10
                    }
                }
            ]
        }
    },
    {
        name: 'Nora',
        age: '14',
        gender: 'female',
        icon: './assets/nora.png',
        bio: 'Meet Nora, an 8th grader at her local public middle school in Vermont. Nora comes from an immigrant family, and although she used to be outgoing and sociable, she\'s facing some bullying at school. Nora\'s family is aware that she might have Autism, seeing similarities with her diagnosed Aunt. Unfortunately, Nora can\'t afford ASD testing, and she doesn\'t have a formal diagnosis yet.',
        scenarioList: [
            {
                exposition: `<p>It's the start of your day! Time to get ready. As you look through your clothes, you notice that there's nothing that <strong>feels good</strong>. You spot your favorite set of clothes in the dirty laundry hamper.</p>`,
                theme: 'bedroom',
                responses: [
                    {
                        buttonText: 'Wear comfy, but smelly clothes',
                        resultExposition: `<p>You feel comfortable in your own skin. You might get a few looks when you step onto the bus, but who cares?</p>`,
                        effects: {
                            stress: 0,
                            reputation: -20,
                            performance: 0
                        }
                    },
                    {
                        buttonText: 'Wear something you hate',
                        resultExposition: `<p>The tag on the back of your shirt scrapes the back of your neck at unpredictable intervals, and the weight of your pants feels off. The waistband of your pants pinches, and the absence of the usual comforting pressure from a sweatshirt makes everything feel ungrounded. You feel self-conscious and know that you will be constantly adjusting your clothes.</p>`,
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
                        },
                        resultInfo: `<p> Changes to routines can have a greater impact on people with Autism than on people without autism. Changes can affect them even if they are doing an activity that will help their well-being. </p>`
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
                        },
                        resultInfo: `<p> Autism can be combined with a variety of intellectual or learning disabilities, though it isn't inherently. Regardless, figuring out ways to make educational material work for students with autism can help them learn more. Not being able to process the material in a traditional classroom can be extremely frustrating, or having students push themselves to understand things can lead to negative outcomes like burnout and health issues. </p>`,
                        condition: (Game) => (Game.stress >= 90)
                    },
                    {
                        buttonText: `Doodle scenes from the book`,
                        resultExposition: `<p> You don't understand everything in the lecture, but drawing out the scenes helps you stay engaged, and may have even understood more than you would have if you sat up straight and made eye contact. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -10
                        },
                        resultInfo: `<p> Autism can be combined with a variety of intellectual or learning disabilities, though it isn't inherently. Regardless, figuring out ways to make educational material work for students with autism can help them learn more. Not being able to process the material in a traditional classroom can be extremely frustrating, or having students push themselves to understand things can lead to negative outcomes like burnout and health issues. </p>`,
                    },
                    {
                        buttonText: `Stop paying attention`,
                        resultExposition: `<p> You stare at the window engrossed in your own thoughts. When the bell rings to go to your next class, you look bleary-eyed at the board. You don't know anything that was said. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        },
                        resultInfo: `<p> Autism can be combined with a variety of intellectual or learning disabilities, though it isn't inherently. Regardless, figuring out ways to make educational material work for students with autism can help them learn more. Not being able to process the material in a traditional classroom can be extremely frustrating, or having students push themselves to understand things can lead to negative outcomes like burnout and health issues. </p>`,
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
                        },
                        condition: (Game) => (Game.stress >= 70)
                    },
                    {
                        buttonText: `Laugh and nod`,
                        resultExposition: `<p> You smile and while you don't say anything significant it was enough to get you through the interaction. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: `<p> This is a behavior known as masking. People with autism can learn behaviors that make them seem as if they aren’t struggling or are more “normal”. Masking is not solely found in people with Autism. </p>`,
                        condition: (Game) => (Game.stress >= 80)
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
                        },
                        condition: (Game) => (Game.stress >= 90)
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
                        },
                        condition: (Game) => (Game.stress >= 80)
                    },
                    {
                        buttonText: `Attempt to complete the assignment anyway`,
                        resultExposition: `<p> You do your best but when you go over it at the end of the period you realize you missed a big piece of the assignment. You feel like if the teacher was just clear it would have been fine but you did your best with the information you have. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: -10
                        },
                        condition: (Game) => (Game.stress >= 90)
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
                        },
                        condition: (Game) => (Game.stress >= 60)
                    },
                    {
                        buttonText: `Sit with one of your friends and chat`,
                        resultExposition: `<p> You sit by one of your friends and have a fun conversation about your art. </p>`,
                        effects: {
                            stress: -10,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 70)
                    },
                    {
                        buttonText: `Sit across from one of your friends and sketch`,
                        resultExposition: `<p> You sit in the front where there aren't too many people, and you are able to tune out the noise in the back. Sketching always brings you joy. </p>`,
                        effects: {
                            stress: 0,
                            reputation: -10,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 80)
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
                        },
                        condition: (Game) => (Game.stress >= 60)
                    },
                    {
                        buttonText: `Stim and draw`,
                        resultExposition: `<p> You are able to drop your mask and let your leg start bouncing like it wants too. You start a drawing that you have been thinking about all day. It feels good to just take a second to do something that actually interests you. </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 70)
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
                        },
                        condition: (Game) => (Game.stress >= 80)
                    },
                    {
                        buttonText: `Get started on chores immediately`,
                        resultExposition: `<p> Your family is happy to see that the kitchen is clean. </p>`,
                        effects: {
                            stress: 10,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 90)
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
                        },
                        condition: (Game) => (Game.stress >= 70)
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
                        },
                        condition: (Game) => (Game.stress >= 90)
                    },
                    {
                        buttonText: `Attempt to eat it`,
                        resultExposition: `<p> You take a bite but you can't bring yourself to eat anymore. You don't want to make your dad sad but the new texture and taste were not what you were expecting. </p>`,
                        effects: {
                            stress: -20,
                            reputation: 0,
                            performance: 0
                        },
                        condition: (Game) => (Game.stress >= 70)
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
        ],
        overwhelmScenario: {
            exposition: `<p> You stop. Your heart feels too big for your chest and the sounds around you blend into an overwhelming cacophony. You know you have to find a quiet space to calm down. </p>`,
            //theme: 
            responses: [
                {
                    buttonText: `Continue`,
                    resultExposition: `<p> You go get away as soon as you can. You to the bathroom and cross your arms with your hands on your shoulders. You breathe in a way your aunt showed you and it helps you calm down for the moment. You go through what just happened in your head, looking for what made you feel overwhelmed. It takes you a while to sort it all out. </p>`,
                    effects: {
                        stress: 30,
                        reputation: -10,
                        performance: -10
                    }
                }
            ]
        }
    },
    {
        name: 'Clint',
        age: '42',
        gender: 'male',
        icon: './assets/clint.png',
        bio: 'Clint is a 42-year-old park ranger working at a national park in Washington State. Previously diagnosed with what was known as Asperger’s syndrome, Clint experienced lots of bullying growing up and likes to keep his diagnosis quiet. Clint loves nature and has a special interest in native flora and fauna identification. Clint adores his job, and the isolation of his particular park allows him lots of freedom in his day. Recently, an influx of college campers has taken the park by storm, and a once quiet and calm place has become rambunctious and loud. Clint’s story is about his struggle to adapt to this sudden change.',
        scenarioList: [
            {
                exposition: `<p>You awake groggily to the sound of your alarm ringing <strong>loudly</strong> in your ear.</p>`,
                theme: 'trailer',
                responses: [
                    {
                        buttonText: `Slowly get up and brush your teeth.`,
                        resultExposition: `<p>As you brush your teeth, you reflect. Some find it strange, but you exclusively use a specific toothbrush and toothpaste, and have for your entire life. </p>`,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        },
                        resultInfo: `<p>People with Autism often experience <strong>sensory issues</strong>. These individuals often attempt to stick to routines to avoid unnecessary discomfort.</p>`
                    }
                ]
            },
            {
                exposition: 'The sounds of the birds singing and the crickets chirping are refreshing, and the breeze this morning lulls particularly lazily, catching on the trees and lightly nipping the face.',
                theme: 'outside trailer',
                responses: [
                    {
                        buttonText:'Get in the truck and do the morning drive.',
                        resultExposition: null,
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: 'Your morning drive goes as normal. The scenic route stretches ahead, twisting and turning through a picturesque, mountainous forest scene. It is early, and the few campers who frequent this park are resting quietly.',
                theme: 'morning drive',
                responses: [
                    {
                    buttonText:'Continue down the road.',
                    resultExposition: null,
                    effects: {
                        stress: 0,
                        reputation: 0,
                        performance: 0
                    }
                }
                ]
            },
            {
                exposition: 'Your attention shifts suddenly. You hear yelling and shouting, laughter, and boisterous speech. As you approach, you notice a group of young adults. They look to be from the local university. Garbage is strewn throughout their site, and empty cans litter a once scenic meadow.',
                theme: 'morning party',
                responses: [
                    {
                        buttonText:'Reprimand them about the trash',
                        resultExposition: 'They are taken aback by your sudden annoyance. Confused expressions stare back at you.',
                        effects: {
                            stress: 0,
                            reputation: -20,
                            performance: 20
                        }
                    },
                    {
                        buttonText:'Attempt to explain park rules politely.',
                        resultExposition: 'Some of them look embarrassed, while other stare at you with uncaring expressions.',
                        effects: {
                            stress: 20,
                            reputation: 20,
                            performance: 20
                        }
                    },
                    {
                        buttonText:'Say nothing.',
                        resultExposition: 'Your boss is not going to like this.',
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: -20
                        }
                    }
                ]
            },
            {
                exposition: 'You are back from your drive. After the stress this morning, you decide to take a short walk on some of the trails closest to the campsites.',
                theme: 'walking campsites',
                responses:[
                    {
                        buttonText: ' Walk the cute riverside campsite trail.',
                        effects: {
                            stress: 0,
                            reputation: 0,
                            performance: 0
                        }
                    }
                ]
            },
            {
                exposition: '<p> You are <strong>flagged</strong> down by an elderly couple. They are wondering where wood for a fire can be found </p>',
                theme: 'walking campsites',
                responses:[
                    {
                        buttonText: 'Stay silent and stare at them.',
                        resultExposition: 'They look at you with confused expressions. After some time, they continue along their path.',
                        effects: {
                            stress: -40,
                            reputation: -20,
                            performance: -20
                        }
                    },
                    {
                        buttonText: 'This is a forrest, there is wood everywhere.',
                        resultExposition: 'They chuckle and smile awkwardly, they think you are joking.',
                        effects: {
                            stress: -20,
                            reputation: -10,
                            performance: 0
                        }
                    },
                    {
                        buttonText: 'It\'s by my trailer.',
                        resultExposition: 'You dislike when people go near your things, you often find them disturbed. Either way, these people want quality firewood and you are not about to bar them from it.',
                        effects: {
                            stress: -20,
                            reputation: 10,
                            performance: 10
                        },
                        condition: (Game) => (Game.stress >= 80)
                    },
                    {
                        buttonText: 'Cut them down a tree.',
                        resultExposition: 'They look at you with confused expressions. It takes time and effort, but the small tree has fallen, and they have their firewood. They thank you with annoyed frowns.',
                        effects: {
                            stress: 0,
                            reputation: -10,
                            performance: 10
                        }
                    }
                ]
            }
        ],
        overwhelmScenario: {
            exposition: `<p> Test! </p>`,
            //theme: 
            responses: [
                {
                    buttonText: `Continue`,
                    resultExposition: `<p> You go get away as soon as you can. You to the bathroom and cross your arms with your hands on your shoulders. You breathe in a way your aunt showed you and it helps you calm down for the moment. You go through what just happened in your head, looking for what made you feel overwhelmed. It takes you a while to sort it all out. </p>`,
                    effects: {
                        stress: 30,
                        reputation: -10,
                        performance: -10
                    }
                }
            ]
        }
    }
].map(c => Character.buildCharacter(c));

export default characters;
