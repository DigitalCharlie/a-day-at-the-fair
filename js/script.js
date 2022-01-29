let adventurer = ""

const body = document.body

const introText = document.getElementById('intro')
const nameAdvBtn = document.getElementById('intro-button')
const nameInput = document.getElementById('adventurer-name')

const textBox = document.getElementById('text-adventure')
const currentText = document.getElementById('current-text')
const optionsBox = document.getElementById('current-options')

const historyButton = document.getElementById('history-button')
const historyModal = document.getElementById('history-modal')
const historyContents = document.getElementById('history-contents')
const closeHistoryButton = document.getElementById('close-history')

const bg = document.getElementById('bg')

// VARIABLES THAT STRUCTURE THE GAME PLAY

let dayCount = 0
let goodDeeds = 0
let badDeeds = 0
let timeOfDay = 7
let partOfTown = 'center'
let returningTo = []

// FADE IN THE SCREEN IN STAGES ... AND MAKE BUTTON COLORS RANDOM

body.classList.add('fade-in')
textBox.classList.add('fade-in')

// NAME YOURSELF AND THEN START THE GAME

const nameAdventurer = () => {
    if (nameInput.value) { // If the name input is not blank
        adventurer = nameInput.value; // name them the input value
        nameInput.blur() // blur the field so they don't hit enter a bunch and change it
    } else {
        adventurer = "Traveler" // default if it is blank — this will get used as easter egg dialogue later
    }
    console.log('Adventurer is now named ' + adventurer)
    textBox.classList.add('text-adventure-justify')
    introText.hidden = true
    currentText.hidden = false
    historyButton.style.opacity = 1
    newEvent(beginNewDay)
    introText.remove()
}

nameAdvBtn.addEventListener('click', nameAdventurer)
nameInput.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        nameAdvBtn.click();
    }
})

// HOW TO ADD TEXT TO TEXT ADVENTURE SECTION

const clearButtons = () => { // clears the buttons by emptying the innerHTML of optionsBox
    optionsBox.innerHTML = ''
}

const clearText = () => { // clears the story text by emptying the innerHTML of currentText
    currentText.innerHTML = ''
}

const removeSelectedButton = (button) => {
    button.remove()
}

const addToCurrentText = (text) => {
    let newText = document.createElement('li') // create a new list item
    newText.textContent = text // make the text of the new list item equal to whatever the input text is
    let newHistoryText = newText.cloneNode(true)
    currentText.appendChild(newText) // adds it to the UL that holds text
    historyContents.lastElementChild.appendChild(newHistoryText) // adds it to the history as well
    currentText.scrollTop = currentText.scrollHeight
}

const continueButton = (eventName) => {
    clearButtons() // gets rid of all the current buttons
    const newBtn = document.createElement('button') // creates a new button
    newBtn.textContent = "Continue" // makes it so the text of the new button is continue 
    newBtn.addEventListener('click', ()=>{newEvent(eventName)}) // give the new button an event listener to start a new event
    optionsBox.appendChild(newBtn) // add it to the optionsBox
    buttonColorIsRandom()
}

const advanceTime = (timeTaken) => {
    timeOfDay += timeTaken
}

const changeDailyConditions = (condition) => {
    for (i = 0; i < condition.length; i++) {
        dailyConditions[condition[i]] = true
    }
}

const changePermConditions = (condition) => {
    for (i = 0; i < condition.length; i++) {
        permConditions[condition[i]] = true
    }
}

const newEvent = (eventName) => {
    clearButtons() // clear all buttons
    clearText() // clear all text
    if (eventName === beginNewDay) {
        dayCount++ // advance day counter
        timeOfDay = 7 // set time to 7am
        goodDeeds = 0
        badDeeds = 0
        resetDailyConditions()
        newHistoryDay() // add a new day header in the history bar
        returningTo = []
    }
    if (returningTo.includes(eventName) && eventName.return) {
        addToCurrentText(eventName.return) // put the returning text in the box for the event
    } else {
        addToCurrentText(eventName.intro) // put the intro text in the box for the event
    }
    if (eventName.location) {
        partOfTown = eventName.location
    }
    createOptionButtons(eventName) // create the option buttons for the event
    if(eventName.eventBg) {
        newBg(eventName.eventBg)
    }
    buttonColorIsRandom()
    returningTo.push(eventName)
}

const incrementDeed = (deed) => {
    if (deed === 'good') {
        goodDeeds++
    } else {
        badDeeds++
    }
}
//damnit could this whole thing have been written so it's like... "current event" and then it does all the evaluation when the button is clicked rather than adding event listeners like this? Oof.
const createOptionButtons = (eventName) => {
    for (let i = 0; i < eventName.options.length; i++) { // for all the non-hidden options
        const newBtn = document.createElement('button') // create a button
        newBtn.textContent = eventName.options[i].button // make the name of the button
        newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.options[i].text)}) // makes it so clicking the button adds text to the li
        newBtn.addEventListener('click', ()=>{advanceTime(eventName.options[i].duration)}) // increases current time
        if (eventOptions[eventName.options[i].continue]) { // checks if there is a continue location — if yes, display it.
            newBtn.addEventListener('click', ()=>{continueButton(eventOptions[eventName.options[i].continue])})  // makes it so clicking the button adds an appropriate continue button
        } else {
            newBtn.addEventListener('click', ()=>{removeSelectedButton(newBtn)}) // if no continue condition, then just remove the selected option after adding the text.
        }
        if (eventName.options[i].deed) {
            newBtn.addEventListener('click', ()=>{incrementDeed(eventName.options[i].deed)}) 
        }
        if (eventName.options[i].bg) {
            newBtn.addEventListener('click', ()=>{newBg(eventName.options[i].bg)}) 
        }
        if (eventName.options[i].dailyConChanges) {
            newBtn.addEventListener('click', ()=>{changeDailyConditions(eventName.options[i].dailyConChanges)}) 
        }
        if (eventName.options[i].permConChanges) {
            newBtn.addEventListener('click', ()=>{changePermConditions(eventName.options[i].permConChanges)}) 
        }
        optionsBox.appendChild(newBtn) // adds a new button
    }

    resetHiddenConditions() // I hate this and don't understand why I need it, but I seem to.

    if (eventName.hiddenOptions) { // determines if there are hidden options
        for (let i = 0; i < eventName.hiddenOptions.length; i++) { // for the hidden buttons
            if (eventName.hiddenOptions[i].condition && !(eventName.hiddenOptions[i].hideAfterClicked === true && eventName.hiddenOptions[i].alreadyClicked === true)) { // if their hidden conditions are true --> do the stuff above.
                const newBtn = document.createElement('button')
                newBtn.style.opacity = 0 // don't initially show it
                newBtn.classList.add("hidden-option") // give it a class that gives it transition styles
                newBtn.textContent = eventName.hiddenOptions[i].button
                newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.hiddenOptions[i].text)})
                newBtn.addEventListener('click', ()=>{advanceTime(eventName.hiddenOptions[i].duration)}) // increases current time
                newBtn.addEventListener('click', ()=>{eventName.hiddenOptions[i].alreadyClicked = true})                
                if (eventOptions[eventName.hiddenOptions[i].continue]) {
                    newBtn.addEventListener('click', ()=>{continueButton(eventOptions[eventName.hiddenOptions[i].continue])})  // makes it so clicking the button adds an appropriate continue button
                } else {
                    newBtn.addEventListener('click', ()=>{removeSelectedButton(newBtn)})
                }
                if (eventName.hiddenOptions[i].bg) {
                    newBtn.addEventListener('click', ()=>{newBg(eventName.hiddenOptions[i].bg)}) 
                }
                if (eventName.hiddenOptions[i].dailyConChanges) {
                    newBtn.addEventListener('click', ()=>{changeDailyConditions(eventName.hiddenOptions[i].dailyConChanges)}) 
                }
                if (eventName.hiddenOptions[i].permConChanges) {
                    newBtn.addEventListener('click', ()=>{changePermConditions(eventName.hiddenOptions[i].permConChanges)}) 
                }
                if (eventName.hiddenOptions[i].deed) {
                    newBtn.addEventListener('click', ()=>{incrementDeed(eventName.hiddenOptions[i].deed)}) 
                }
                optionsBox.appendChild(newBtn)
                if (eventName.hiddenOptions[i].alreadyDisplayed === false) {
                    setTimeout(()=> {newBtn.style.opacity = 1},1000) // after 1.5s, then set the opacity of the hidden buttons to 1.
                    eventName.hiddenOptions[i].alreadyDisplayed = true
                } else {
                    newBtn.style.opacity = 1
                }
            }

        }
    }
}

// BACKGROUND TOGGLES

const newBg = (backgroundImage) => {
    const oldBg = document.querySelector("#bg div:nth-child(1)")
    const newBg = document.createElement('div')
    newBg.classList.add('bg-image')
    newBg.style.backgroundImage = 'url(' + backgroundImage + ')'
    newBg.style.opacity = 0
    bg.prepend(newBg)
    toggleBg()
  }
  
const toggleBg = () => {
    const topBg = document.querySelector("#bg div:nth-child(2)")
    const bottomBg = document.querySelector("#bg div:nth-child(1)")
    topBg.style.opacity = 0
    bottomBg.style.opacity = 1
    setTimeout(() => {topBg.remove()}, 500);
}
  

// HISTORY MODAL STUFF

const showHistory = () => {
    historyModal.classList.add('show')
}

const hideHistory = () => {
    historyModal.classList.remove('show')
}

const modalClick = (evt) => {
    if (!historyContents.contains(evt.target)) {
        hideHistory()
    }
}

const newHistoryDay = () => {
    if (dayCount === 2) {
        let historyHeadline = historyContents.querySelector('h1')
        historyHeadline.textContent = "Day 1"
    }
    if (dayCount >= 2) {
        let newHeadline = document.createElement('h1')
        let newHistoryList = document.createElement('ul')
        newHistoryList.classList.add('history-list')
        newHeadline.textContent = 'Day ' + dayCount
        historyContents.appendChild(newHeadline)
        historyContents.appendChild(document.createElement('hr'))
        historyContents.appendChild(newHistoryList)
    }
}

historyButton.addEventListener('click', showHistory)
closeHistoryButton.addEventListener('click', hideHistory)
historyModal.addEventListener('click', modalClick)

// BUTTON COLOR IS RANDOM!

const buttonColorIsRandom = () => {
    const buttons = document.querySelectorAll('button')
    const btnHoverClass = document.querySelector('.randomColor')
    
    const randomColor = () => {
      let color = Math.floor(Math.random()*16777215).toString(16);
      event.target.style.backgroundColor = '#' + color
    }
    
    const returnColor = () => {
      event.target.style.backgroundColor = 'rgb(239, 239, 239)'
    }
    
    for (btn of buttons) {
      btn.addEventListener('mouseover', randomColor)
    }
    for (btn of buttons) {
      btn.addEventListener('mouseout', returnColor)
    }
}

// EVENT DATABASE
// Each has intro text, which displays, a hidden option condition, and then a count of hidden option — which are always the last number of options.
// the continue number is associated with the eventOptions object and is used when calling new continue buttons

const beginNewDay = {
    intro: `The crow of a rooster awakens you from slumber, followed by the sound of a brass band cranking up. "Roll up! Roll up for the Pudding Faire!” cries a voice from the street below. Peering out the inn’s window, you see a crowd of happy halflings and gnomes bustling toward a fairground on the village green. It is seven o’clock in he morning on the day of the annual Honeypuddle Pudding Faire!`,
	eventBg: 'img/town-day.jpg',
    location:'center',
	options: [
		{
			button:`Go back to bed`,
			text:`Your head swirls and you decide that this is just too much right now. Perhaps later in the day, after a bit more sleep and a hearty meal from downstairs, the whole situation will feel a bit more manageable.`,
			duration:2,
		},
		{
			button:`Head off to the fair`,
			text:`You put on your boots and head out of the inn, not wanting to waste a single moment of the day.`,
			duration:0,
			continue:1,
		},
		{
			button:`Observe for a few minutes`,
			text:`You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance.`,
			duration:.5,
			bg:`img/the-faire.png`,
		},
		{
			button:`Try to remember your dreams`,
			text:`Before getting out of bed, you close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of woman turned to stone. It's a bizarre and haunting image.`,
			duration:.5,
			bg:`img/whitemole.png`,
		},
	],
	hiddenOptions: [
		{
			button:`Explore your sense of déjà vu`,
			text:`Pulling yourself into consciousness, you listen to the sounds outside your window for a moment and swear that what you're hearing is almost identical to what you heard yesterday. Was yesterday a dream? Is today?`,
			duration:0,
			condition: dayCount >= 2,
			alreadyDisplayed:false,
			hideAfterClicked:true,
		},
		{
			button:`Scream in frustration`,
			text:`Hearing the same call to "roll up for the Pudding Faire" breaks something in your mind and makes you take a deep breath in before letting out a primal shout. The noise outside pauses for a brief second before continuing.`,
			duration:0,
			condition: dayCount === 3 || dayCount > 4,
			alreadyDisplayed:false,
		},
		{
			button:`Get drunk downstairs`,
			text:`Considering your options for a moment, you decide that this whole thing is too much and opt to just go downstairs to have a morning pint or four.`,
			duration:0,
			condition: dayCount > 3,
			alreadyDisplayed:false,
		},
		{
			button:`Flee town`,
			text:`Deciding that this place is decidedly weird, you figure that making a run for it is at least worth a shot. You pack up your things and head away from the town. Fortunately, the next town isn't more than a day's journey, and you'll only need to camp one night. As you lay your head down your say a prayer that the next thing you hear won't be the sound of the fair again.`,
			duration:13,
			condition: dayCount > 3,
			alreadyDisplayed:false,
			continue: 0,
			hideAfterClicked:true,
			bg:`img/woods-camp.jpg`,
		},
	]
}

const outsideTheInn = {
	intro:`In the center of town, your senses are assaulted with the sights, sounds and delectable smells of the Pudding Faire. A large banner above "Nanny Cowslip's Chariot of Consummate Confections" offers some direction. To your left, closer to the woods are the carnival games. To the right, stalls are open for casual shopping. Straight ahead, the Pudding Faire's main tent is a flurry of activity. As you consider your decision, a cart blazes through the center of town with a gnome atop it shouting, "THERE'S NO TIME LIKE THE PRESENT!" while he tosses handfuls of candy to nearby children.`,
	return: `Back at the center of town, you consider your options. To the west, closer to the woods are the carnival games. To the east, stalls are open for casual shopping. To the north, the Pudding Faire's main tent is a flurry of activity. And, of course, there's Nanny Cowslip's chariot.`,
	location:'center',
    eventBg: 'img/the-faire.png',
	options: [
		{
			button:`Go play some games`,
			text:`As you walk towards the games you hear a heady mix of shouts from people young and old — some exulting their victories, while others bemoan their luck.`,
			duration:.5,
			continue:3,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Peruse the shops`,
			text:`You head off towards the gauntlet of sellers hawking their wares from carts, hopeful that something special will catch your eye.`,
			duration:.5,
			//continue:4,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Head to the main tent`,
			text:`The Great Pudding Tent seems particularly bustling — you head towards it to see what all the commotion is about.`,
			duration:.5,
			//continue:5,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Talk to Nanny Cowslip`,
			text:`Something about the brightly painted chariot catches your eye and you approach Nanny Cowslip's Chariot of Consummate Confections`,
			duration:0,
			continue:2,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
	],
	hiddenOptions: [
		{
			button:`Chase the cart`,
			text:`Remembering that the puppeteer Regis Blossombottom had his hand run over by a cart, you chase down the gnome throwing candy and tell him to be careful — you heard someone was hit by a speeding cart earlier and don't want it to happen again.`,
			duration:1,
			//condition: metPuppeteer === true,
			alreadyDisplayed:false,
			//continue:0,
			//bg:``,
			//dailyConChanges:[savedPuppeteer],
			//permConChanges:[],
			deed:`good`
		},
	]
}

const candyChariot = {
	intro:`Nanny Cowslip sells candy from the back of a chariot purple chariot with three enlarged kittens on her lap with collars reading Snap, Crackle, and Pop. A jar of glowing jelly beans labeled “MAGIC CANDY” sits on her counter alongside trays of sherbet lemons, honeycomb toffees, and peppermint bonbons. As you come closer, Nanny Cowslip smiles and says, "One good deed gets you one jelly bean! But of course the first one's on me because just being here is doing good for the town."`,
	return: `When you approach the stall again, Nanny smiles at you and says, "Ooh back again? Well I trust you've done something worth another candy!"`,
    eventBg: 'img/nanny-cowslip.png',
	options: [
		{
			button:`Ask what's in the candy`,
			text:`When you ask what's in the candy, she looks taken aback. After a few moments she leans in close and says, "Pure magic." You can't quite tell if she's being serious.`,
			duration:.5,
			//continue:1,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Ask for a candy`,
			text:`When you request a candy, Nanny laughs and says, "But of course!" and holds the jar out to you with a flourish. "Choose wisely! Every choice is a good one, but it still pays to be smart about it." Candy in hand, you turn back to decide where you want to go.`,
			duration:.5,
			continue:1,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Reach in and take a candy`,
			text:`As you reach in, Nanny raises an eyebrow and quips, "well, aren't you bold. But yes, enjoy — but no more until you come back with tales of good deeds." Candy in hand, you turn back to decide where you want to go.`,
			duration:.5,
			continue:1,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
	],
	hiddenOptions: [
		{
			button:`Confront her about her identity`,
			text:`As soon as you mention that you know she's really Cyrrollalee, she hushes you and tells you to get in the cart so you can talk. As soon as you step inside, it takes off — proving those wings aren't for show — and touches down on the edge of the woods outside of town.`,
			duration:0,
			//condition: knowCyrrollalee,
			alreadyDisplayed:false,
			//continue:0,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
	]
}
const carnivalArea = {
	intro:`Carnival intro`,
	eventBg: 'img/woods-fair.jpg',
	location:'carnival',
	options: [
		{
			button:`Approach the cider stand`,
			text:``,
			duration:0,
			//continue:0,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Visit the caricaturist`,
			text:``,
			duration:0,
			//continue:0,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:`Watch the puppet show`,
			text:``,
			duration:0,
			//continue:0,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
        {
            button:`Go to the center of town`,
            text:``,
            duration:.5,
            continue:1,
            //bg:``,
            //dailyConChanges:[],
            //permConChanges:[],
            //deed:``
        }
	],
	// hiddenOptions: [
	// 	{
	// 		button:``,
	// 		text:``,
	// 		duration:0,
	// 		condition: ,
	// 		alreadyDisplayed:false,
	// 		//continue:0,
	// 		//bg:``,
	// 		//dailyConChanges:[],
	// 		//permConChanges:[],
	// 		//deed:``
	// 	},
	// ]
}

// I HATE HOW BOTH OF THESE WORK AND THERE SHOULD BE SOMETHING BETTER BUT I DON'T KNOW WHAT

const eventOptions = { // I'm setting this up to be called with bracket notation because i want to be able to see the pairs more easily — giving them all names feels weird since they're placeholders to call an already named function?
    0: beginNewDay,
    1: outsideTheInn,
    2: candyChariot,
    3: carnivalArea
}

const resetHiddenConditions = () => {
    beginNewDay.hiddenOptions[0].condition = dayCount >= 2,
    beginNewDay.hiddenOptions[1].condition = dayCount === 3 || dayCount > 4,
    beginNewDay.hiddenOptions[2].condition = dayCount > 3,
    beginNewDay.hiddenOptions[3].condition = dayCount > 3,
    outsideTheInn.hiddenOptions[0].condition = dayCount >= 2
}

// HIDDEN CONDITIONS THAT ARE USED BY EVENTS TO TRIGGER RESULTS
// and the function to reset the daily ones
// all daily conditions are under 100. Permanent ones are over 100.

const dailyConditions = {
    'Avoided puddle': true, // prevented stepping in the puddle
    'Played game': true, // played a game
}

const permConditions = {

}

const resetDailyConditions = () => {
    for (condition in dailyConditions) {
        dailyConditions[condition] = false;
    }
}


// SET THE VH BASED ON WINDOW SIZE BECAUSE MOBILE VH IS ANNOYING.
// This is the method used on this page — it's grabbing the innerheight of the window rather than the whole thing, which should solve how safari on iOS counts the URL bar and such as part of the vh.
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// STUFF AT THE END

buttonColorIsRandom()



/* 
MAIN GAME
Something to add new text to the current box
Something to add new text to the history box
Something to show/hide the history box (which is.... either on the side or a pop up?)
Something to clear the current box
Something to track good deeds
Something to branch and track decisions
Classes for NPCs --> so they're random the first time, then exist.
Arrays for dialogue for non-looped NPCs


STRETCH
Settings, including toggling the opacity of the text section BG
Close up of characters --> when talking to people?

Possible pitfalls:
- will have some slightly redundant events that will serve as continuations — need to do something for after they select a few options how buttons may change.
    - ex: can they pick all the options in the room before having to continue? Or after a couple does it force forwards (if possible)?

*/