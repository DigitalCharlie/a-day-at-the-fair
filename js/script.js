let adventurer = ""

const body = document.body

const introText = document.getElementById('intro')
const nameAdvBtn = document.getElementById('intro-button')
const nameInput = document.getElementById('adventurer-name')

const textBox = document.getElementById('text-adventure')
const currentText = document.getElementById('current-text')
const optionsBox = document.getElementById('current-options')
const history = document.getElementById('history')

// VARIABLES THAT STRUCTURE THE GAME PLAY

let dayCount = 2
let goodDeeds = 0
let badDeeds = 0

// FADE IN THE SCREEN IN STAGES

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
    history.style.opacity = 1
    dayCount++
    introText.remove()
}

// HOW TO ADD TEXT TO TEXT ADVENTURE SECTION

const addToCurrentText = (text) => {
    let newText = document.createElement('li')
    newText.textContent = text
    currentText.appendChild(newText)
}

const continueButton = (eventName) => {
    clearButtons()
    const newBtn = document.createElement('button')
    newBtn.textContent = "Continue"
    newBtn.addEventListener('click', ()=>{newEvent(eventName)})
    console.log(eventName)
    optionsBox.appendChild(newBtn)
}

const createOptionButtons = (eventName) => {
    for (let i = 0; i < eventName.options.length-eventName.hiddenOptionCount; i++) {
        const newBtn = document.createElement('button')
        newBtn.textContent = eventName.options[i].button
        newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.options[i].text)})
        newBtn.addEventListener('click', ()=>{continueButton(eventName.options[i].continue)})
        optionsBox.appendChild(newBtn)
    }
    if (eventName.hiddenCondition) {
        for (let i = eventName.options.length-eventName.hiddenOptionCount; i < eventName.options.length; i++) {
            const newBtn = document.createElement('button')
            newBtn.style.opacity = 0
            newBtn.classList.add("hidden-option")
            newBtn.textContent = eventName.options[i].button
            newBtn.addEventListener('click', ()=>{addToCurrentText(eventName.options[i].text)})
            optionsBox.appendChild(newBtn)
            setTimeout(()=> {newBtn.style.opacity = 1},1500)
        }
    }
}

const clearButtons = () => {
    optionsBox.innerHTML = ''
}

const clearText = () => {
    currentText.innerHTML = ''
}

const newEvent = (eventName) => {
    clearButtons()
    clearText()
    addToCurrentText(eventName.intro)
    createOptionButtons(eventName)
}

// INITIAL STRUCTURE FOR ROUND ONE

const toBedBtn = document.getElementById("back-to-bed")
const toFairBtn = document.getElementById("dash-to-fair")
const observeFromWindowBtn = document.getElementById("observe-from-window")
const rememberDreamsBtn = document.getElementById("remember-dreams")

const toBed = () => {
    addToCurrentText("Your head swirls and you decide that this is just too much right now. Perhaps later in the day, after a bit more sleep and a hearty meal from downstairs, the whole situation will feel a bit more manageable.")
    clearButtons()
    continueButton(clearText)
}

const toFair = () => {
    addToCurrentText("You hurry to put on your boots and rush out of the inn, not wanting to waste a single moment of the day.")
    continueButton(outsideTheInn)
}

const observeFromWindow = () => {
    addToCurrentText("You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance.")
    clearButtons()
}

const rememberDreams = () => {
    addToCurrentText("Before getting out of bed, you close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of  woman turned to stone. It's a bizarre and haunting image.")
    clearButtons()
}

toBedBtn.addEventListener('click', toBed)
toFairBtn.addEventListener('click', toFair)
observeFromWindowBtn.addEventListener('click', observeFromWindow)
rememberDreamsBtn.addEventListener('click', rememberDreams)


// EVENT STRUCTURE

const beginNewDay = {
    intro: `The crow of a rooster awakens you from slumber, followed by the sound of a brass band cranking up. "Roll up! Roll up for the Pudding Faire!” cries a voice from the street below. Peering out the inn’s window, you see a crowd of happy halflings and gnomes bustling toward a fairground on the village green. It is seven o’clock in he morning on the day of the annual Honeypuddle Pudding Faire!`,
    hiddenOptionCount: 1,
    hiddenCondition: dayCount === 2,
    options: [
        {button: "Go back to bed", text: "Your head swirls and you decide that this is just too much right now. Perhaps later in the day, after a bit more sleep and a hearty meal from downstairs, the whole situation will feel a bit more manageable."}, 
        {button: "Dash off to the fair", text: "You hurry to put on your boots and rush out of the inn, not wanting to waste a single moment of the day."},
        {button: "Observe for a few minutes", text: "You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance."},
        {button: "Try to remember your dreams", text: "Before getting out of bed, you close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of  woman turned to stone. It's a bizarre and haunting image."},
        {button: "Feel a sense of déjà vu ", text: "Pulling yourself into consciousness, you listen to the sounds outside your window for a moment and swear that what you're hearing is almost identical to what you heard yesterday."}    
    ]
}

const outsideTheInn = {
    intro: "This is a test of the event system placed inside of objects. Hopefully it is working properly",
    hiddenOptionCount: 2,
    hiddenCondition: dayCount >= 2,
    options: [
        {button: "Option 1", text: "You chose option 1", continue: beginNewDay}, 
        {button: "Option 2", text: "You chose option 2", continue: beginNewDay},
        {button: "Option 3", text: "You chose option 3 — which should only happen after day 1", continue: beginNewDay},
        {button: "Option 4", text: "You chose option 3 — which should only happen after day 1", continue: beginNewDay}
    ]
}


// EVENT LISTENERS

nameAdvBtn.addEventListener('click', nameAdventurer)
nameInput.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        nameAdvBtn.click();
    }
})

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
*/