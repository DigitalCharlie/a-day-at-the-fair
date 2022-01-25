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

// VARIABLES THAT STRUCTURE THE GAME PLAY

let dayCount = 0
let goodDeeds = 0
let badDeeds = 0

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
    optionsBox.style.display = "block"
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

const addToCurrentText = (text) => {
    let newText = document.createElement('li') // create a new list item
    newText.textContent = text // make the text of the new list item equal to whatever the input text is
    let newHistoryText = document.createElement('li')
    newHistoryText.textContent = text
    currentText.appendChild(newText) // adds it to the UL that holds text
    historyContents.lastElementChild.appendChild(newHistoryText) // adds it to the history as well
}

const continueButton = (eventName) => {
    clearButtons() // gets rid of all the current buttons
    const newBtn = document.createElement('button') // creates a new button
    newBtn.textContent = "Continue" // makes it so the text of the new button is continue 
    newBtn.addEventListener('click', ()=>{newEvent(eventName)}) // give the new button an event listener to start a new event
    optionsBox.appendChild(newBtn) // add it to the optionsBox
    buttonColorIsRandom()
}

const removeSelectedButton = (button) => {
    button.remove()
}

const createOptionButtons = (eventName) => {
    for (let i = 0; i < eventName.options.length-eventName.hiddenOptionCount; i++) { // for all the non-hidden options
        const newBtn = document.createElement('button') // create a button
        newBtn.textContent = eventName.options[i].button // make the name of the button
        newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.options[i].text)}) // makes it so clicking the button adds text to the li
        if (eventOptions[eventName.options[i].continue]) { // checks if there is a continue location — if yes, display it.
            newBtn.addEventListener('click', ()=>{continueButton(eventOptions[eventName.options[i].continue])})  // makes it so clicking the button adds an appropriate continue button
        } else {
            newBtn.addEventListener('click', ()=>{removeSelectedButton(newBtn)}) // if no continue condition, then just remove the selected option after adding the text.
        }
        optionsBox.appendChild(newBtn) // adds a new button
    }
    resetHiddenConditions()
    if (eventName.hiddenCondition) { // determines if the hidden condition is true 
        for (let i = eventName.options.length-eventName.hiddenOptionCount; i < eventName.options.length; i++) { // for the hidden buttons
            const newBtn = document.createElement('button')
            newBtn.style.opacity = 0 // don't initially show it
            newBtn.classList.add("hidden-option") // give it a class that gives it transition styles
            newBtn.textContent = eventName.options[i].button
            newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.options[i].text)})
            if (eventOptions[eventName.options[i].continue]) {
                newBtn.addEventListener('click', ()=>{continueButton(eventOptions[eventName.options[i].continue])})  // makes it so clicking the button adds an appropriate continue button
            } else {
                newBtn.addEventListener('click', ()=>{removeSelectedButton(newBtn)})
            }
            optionsBox.appendChild(newBtn)
            setTimeout(()=> {newBtn.style.opacity = 1},1500) // after 1.5s, then set the opacity of the hidden buttons to 1.
        }
    }
}


const newEvent = (eventName) => {
    clearButtons() // clear all buttons
    clearText() // clear all text
    if (eventName === beginNewDay) {
        dayCount++
        newHistoryDay()
    }
    addToCurrentText(eventName.intro) // put the intro text in the box for the event
    createOptionButtons(eventName) // create the option buttons for the event
    buttonColorIsRandom()
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
    hiddenOptionCount: 1,
    hiddenCondition: dayCount === 2,
    options: [
        {button: "Go back to bed", text: "Your head swirls and you decide that this is just too much right now. Perhaps later in the day, after a bit more sleep and a hearty meal from downstairs, the whole situation will feel a bit more manageable."}, 
        {button: "Dash off to the fair", text: "You hurry to put on your boots and rush out of the inn, not wanting to waste a single moment of the day.", continue: 1},
        {button: "Observe for a few minutes", text: "You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance."},
        {button: "Try to remember your dreams", text: "Before getting out of bed, you close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of  woman turned to stone. It's a bizarre and haunting image.", continue: 1},
        {button: "Explore that sense of déjà vu ", text: "Pulling yourself into consciousness, you listen to the sounds outside your window for a moment and swear that what you're hearing is almost identical to what you heard yesterday.", continue: 1}    
    ]
}

const outsideTheInn = {
    intro: "This is a test of the event system placed inside of objects. Hopefully it is working properly",
    hiddenOptionCount: 2,
    hiddenCondition: dayCount >= 2,
    options: [
        {button: "Option 1", text: "You chose option 1", continue: 0}, 
        {button: "Option 2", text: "You chose option 2", continue: 0},
        {button: "Option 3", text: "You chose option 3 — which should only happen after day 1", continue: 0},
        {button: "Option 4", text: "You chose option 3 — which should only happen after day 1", continue: 0}
    ]
}

const eventOptions = { // I'm setting this up to be called with bracket notation because i want to be able to see the pairs more easily — giving them all names feels weird since they're placeholders to call an already named function?
    0: beginNewDay,
    1: outsideTheInn
}

const resetHiddenConditions = () => {
    beginNewDay.hiddenCondition = dayCount === 2
    outsideTheInn.hiddenCondition = dayCount >= 2
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
Randomize of the color of buttons on hover
Settings, including toggling the opacity of the text section BG
Close up of characters --> when talking to people?


Possible pitfalls:
- not currently set up to loop statements back on themselves - they always go continue then new event.
    - maybe need to add clear lines to options
    - also create a function that is "return to" or something that doesn't re-add intro text but DOES add buttons back.... without the previous option.
- might want to stage the hidden conditions and run them through a loop rather than assume they're all there.
- will have some slightly redundant events that will serve as continuations — need to do something for after they select a few options how buttons may change.
    - ex: can they pick all the options in the room before having to continue? Or after a couple does it force forwards (if possible)?
- assign time increments to buttons
*/