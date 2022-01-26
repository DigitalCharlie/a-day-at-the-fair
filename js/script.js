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
    introText.hidden = true
    currentText.hidden = false
    optionsBox.style.display = "flex"
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
    }
    addToCurrentText(eventName.intro) // put the intro text in the box for the event
    createOptionButtons(eventName) // create the option buttons for the event
    if(eventName.eventBg) {
        newBg(eventName.eventBg)
    }
    buttonColorIsRandom()
}

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
            if (eventName.hiddenOptions[i].condition) { // if their hidden conditions are true --> do the stuff above.
                const newBtn = document.createElement('button')
                newBtn.style.opacity = 0 // don't initially show it
                newBtn.classList.add("hidden-option") // give it a class that gives it transition styles
                newBtn.textContent = eventName.hiddenOptions[i].button
                newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.hiddenOptions[i].text)})
                newBtn.addEventListener('click', ()=>{advanceTime(eventName.hiddenOptions[i].duration)}) // increases current time
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
    eventBg: 'img/town-day.jpg',
    intro: `The crow of a rooster awakens you from slumber, followed by the sound of a brass band cranking up. "Roll up! Roll up for the Pudding Faire!” cries a voice from the street below. Peering out the inn’s window, you see a crowd of happy halflings and gnomes bustling toward a fairground on the village green. It is seven o’clock in he morning on the day of the annual Honeypuddle Pudding Faire!`,
    options: [
        {button: "Go back to bed", duration: 2, text: "Your head swirls and you decide that this is just too much right now. Perhaps later in the day, after a bit more sleep and a hearty meal from downstairs, the whole situation will feel a bit more manageable."}, 
        {button: "Dash off to the fair", duration: 0, continue: 1, bg: 'img/town-day.jpg', text: "You hurry to put on your boots and rush out of the inn, not wanting to waste a single moment of the day."},
        {button: "Observe for a few minutes", dailyConChanges: ['Avoided puddle','Played game'], duration: .5, bg: 'img/the-faire.png', text: "You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance."},
        {button: "Try to remember your dreams", duration: .5, continue: 1, bg: 'img/town-day.jpg', text: "Before getting out of bed, you close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of  woman turned to stone. It's a bizarre and haunting image."},
    ],
    hiddenOptions: [
        {condition: dayCount === 2, alreadyDisplayed: false, duration: .5, button: "Explore that sense of déjà vu ", continue: 1, bg: 'img/town-day.jpg', text: "Pulling yourself into consciousness, you listen to the sounds outside your window for a moment and swear that what you're hearing is almost identical to what you heard yesterday."}    
    ]
}

const outsideTheInn = {
    eventBg: 'img/the-faire.png',
    intro: "This is a test of the event system placed inside of objects. Hopefully it is working properly",
    options: [
        {button: "Option 1", duration: 1, text: "You chose option 1", continue: 0}, 
        {button: "Option 2", duration: 1, text: "You chose option 2", continue: 0},
    ],
    hiddenOptions: [
        {condition: dayCount >= 2, duration: 2, alreadyDisplayed: false, button: "Option 3", text: "You chose option 3 — which should only happen after day 1", continue: 0},
        {condition: dayCount >= 2, duration: 2, alreadyDisplayed: false, button: "Option 4", text: "You chose option 3 — which should only happen after day 1", continue: 0}
    ]
}

// I HATE HOW BOTH OF THESE WORK AND THERE SHOULD BE SOMETHING BETTER BUT I DON'T KNOW WHAT

const eventOptions = { // I'm setting this up to be called with bracket notation because i want to be able to see the pairs more easily — giving them all names feels weird since they're placeholders to call an already named function?
    0: beginNewDay,
    1: outsideTheInn
}

const resetHiddenConditions = () => {
    beginNewDay.hiddenOptions[0].condition = dayCount === 2
    outsideTheInn.hiddenOptions[0].condition = dayCount >= 2
    outsideTheInn.hiddenOptions[1].condition = dayCount >= 2
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