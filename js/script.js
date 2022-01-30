const adventurers = []

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
// should have wrapped it inside of game objects, but I did not.

let dayCount = 0
let goodDeeds = 0
let badDeeds = 0
let timeOfDay = 7
let partOfTown = 'center'
const returningTo = []

// FADE IN THE SCREEN IN STAGES ... AND MAKE BUTTON COLORS RANDOM

body.classList.add('fade-in')
textBox.classList.add('fade-in')

// NAME YOURSELF AND THEN START THE GAME

class Adventurer {
    constructor (name) {
        this.name = name
        this.trinkets = []
        this.finalDaysTally = ''
        this.currentTrinket = ''
    }
    finalDaysTally () {
        this.finalDaysTally = dayCount
    }
    newTrinket (item) {
        if(this.trinkets.indexOf(item) === -1) {
            this.trinkets.push(item);
        }
        this.currentTrinket = item;
    }
}

const nameAdventurer = () => {
    if (nameInput.value) { // If the name input is not blank
        adventurers.push(new Adventurer(nameInput.value)) // name them the input value
        nameInput.blur() // blur the field so they don't hit enter a bunch and change it
    } else {
        adventurers.push(new Adventurer("Traveler")) // default if it is blank — this will get used as easter egg dialogue later
    }
    console.log('Adventurer is now named ' + adventurers[0].name)
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
    if (eventName != (beginNewDay || returnToInnAtNight) && timeOfDay >= 16) {
        returnToInnBg()
        newBtn.addEventListener('click', ()=>{newEvent(returnToInnAtNight)})
    } else {
        newBtn.addEventListener('click', ()=>{newEvent(eventName)}) // give the new button an event listener to start a new event
    }
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
        refreshTrinkets()
        returningTo.length = 0
    }
    if (returningTo.includes(eventName) && eventName.returningIntro) {
        addToCurrentText(eventName.returningIntro) // put the returning text in the box for the event
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
    if (eventName.initialize) {
        eventName.initialize()
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

const createOptionButtons = (eventName) => {
    for (let i = 0; i < eventName.options.length; i++) { // for all the non-hidden options
        const option = eventName.options[i] // making this easier to read easier to read
        const hiddenMet = (typeof option.condition === 'function' && option.condition()) // if there's a hidden condition and it's met
        const notDoneForever = !(option.hideAfterClicked === true && option.alreadyClicked === true) // if it should only happen once and it already hasn't happened
        if (notDoneForever && (hiddenMet || !option.condition)) {
            const newBtn = document.createElement('button') // create a button
            newBtn.textContent = option.button // make the name of the button
            newBtn.addEventListener('click', ()=>{
                addToCurrentText(option.text)
                advanceTime(option.duration)
                const continueTo = typeof option.continue === 'function' ? option.continue() : option.continue // Thank you to my friend Max for explaining how ternaries work
                if (continueTo) { // checks if there is a continue location — if yes, display it.
                   continueButton(continueTo)  // makes it so clicking the button adds an appropriate continue button
                } else {
                   removeSelectedButton(newBtn) // if no continue condition, then just remove the selected option after adding the text.
                }
                if (option.deed) {
                    incrementDeed(option.deed)
                }
                if (option.bg) {
                    newBg(option.bg)
                }
                if (option.buttonFunction) {
                    option.buttonFunction()
                }
                if (option.dailyConChanges) {
                    changeDailyConditions(option.dailyConChanges)
                }
                if (option.permConChanges) {
                    changePermConditions(option.permConChanges)
                }
            }) // makes it so clicking the button adds text to the li
            
            if (hiddenMet) { // if there is a hidden condition and it's met
                newBtn.style.opacity = 0 // don't initially show it
                newBtn.classList.add("hidden-option") // give it a class that gives it transition styles
            } 

            optionsBox.appendChild(newBtn) // adds a new button

            if (option.alreadyDisplayed === false) { // if it hasn't already been displayed, wait and then change opacity
                setTimeout(()=> {newBtn.style.opacity = 1},1000) // after 1s, then set the opacity of the hidden buttons to 1.
                option.alreadyDisplayed = true
            } else { // if it's already been displayed, just show it!
                newBtn.style.opacity = 1
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

// BACKGROUND FOR RETURN TO INN BASED ON LOCATION

const returnToInnBg = () => {
    if (partOfTown === 'carnival') {
        returnToInnAtNight.eventBg = 'img/woods-fair-night.jpg'
    } else if (partOfTown === 'main tent') {
        returnToInnAtNight.eventBg = 'img/main-tent-night.jpg'
    } else if (partOfTown === 'shops') {
        returnToInnAtNight.eventBg = 'img/market-night.png'
    } else {
        returnToInnAtNight.eventBg = 'img/town-night.jpg'
    }
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

// RANDOM TRINKETS!!!

const allTrinkets = [`a mummified goblin hand`, `a piece of crystal that faintly glows in the moonlight`, `a gold coin minted in an unknown land`, `a diary written in a language you don’t know`, `a brass ring that never tarnishes`, `an old chess piece made from glass`, `a pair of knucklebone dice, each with a skull symbol on the side that would normally show six pips`, `a small idol depicting a nightmarish creature that gives you unsettling dreams when you sleep near it`, `a rope necklace from which dangles four mummified elf fingers`, `The deed for a parcel of land in a realm unknown to you`, `a 1-ounce block made from an unknown material`, `a small cloth doll skewered with needles`, `a tooth from an unknown beast`, `an enormous scale, perhaps from a dragon`, `a bright green feather`, `an old divination card bearing your likeness`, `a glass orb filled with moving smoke`, `a 1-pound egg with a bright red shell`, `a pipe that blows bubbles`, `a glass jar containing a weird bit of flesh floating in pickling fluid`, `a tiny gnome-crafted music box that plays a song you dimly remember from your childhood`, `a small wooden statuette of a smug halfling`, `a brass orb etched with strange runes`, `a multicolored stone disk`, `a tiny silver icon of a raven`, `a bag containing forty-seven humanoid teeth, one of which is rotten`, `a shard of obsidian that always feels warm to the touch`, `a dragon's bony talon hanging from a plain leather necklace`, `a pair of old socks`, `a blank book whose pages refuse to hold ink, chalk, graphite, or any other substance or marking`, `a silver badge in the shape of a five-pointed star`, `a knife that belonged to a relative`, `a glass vial filled with nail clippings`, `a rectangular metal device with two tiny metal cups on one end that throws sparks when wet`, `a white, sequined glove sized for a human`, `a vest with one hundred tiny pockets`, `a small, weightless stone block`, `a tiny sketch portrait of a goblin`, `an empty glass vial that smells of perfume when opened`, `a gemstone that looks like a lump of coal when examined by anyone but you`, `a scrap of cloth from an old banner`, `a rank insignia from a lost legionnaire`, `a tiny silver bell without a clapper`, `a mechanical canary inside a gnome-crafted lamp`, `a tiny chest carved to look like it has numerous feet on the bottom`, `a dead sprite inside a clear glass bottle`, `a metal can that has no opening but sounds as if it is filled with liquid, sand, spiders, or broken glass (your choice)`, `a glass orb filled with water, in which swims a clockwork goldfish`, `a silver spoon with an M engraved on the handle`, `a whistle made from gold-colored wood`, `a dead scarab beetle the size of your hand`, `Two toy soldiers, one with a missing head`, `a small box filled with different-sized buttons`, `a candle that can’t be lit`, `a tiny cage with no door`, `an old key`, `an indecipherable treasure map`, `a hilt from a broken sword`, `a rabbit’s foot`, `a glass eye`, `a cameo carved in the likeness of a hideous person`, `a silver skull the size of a coin`, `an alabaster mask`, `a pyramid of sticky black incense that smells very bad`, `a nightcap that, when worn, gives you pleasant dreams`, `a single caltrop made from bone`, `a gold monocle frame without the lens`, `a 1-inch cube, each side painted a different color`, `a crystal knob from a door`, `a small packet filled with pink dust`, `a fragment of a beautiful song, written as musical notes on two pieces of parchment`, `a silver teardrop earring made from a real teardrop`, `The shell of an egg painted with scenes of human misery in disturbing detail`, `a fan that, when unfolded, shows a sleeping cat`, `a set of bone pipes`, `a four-leaf clover pressed inside a book discussing manners and etiquette`, `a sheet of parchment upon which is drawn a complex mechanical contraption`, `an ornate scabbard that fits no blade you have found so far`, `an invitation to a party where a murder happened`, `a bronze pentacle with an etching of a rat's head in its center`, `a purple handkerchief embroidered with the name of a powerful archmage`, `Half of a floorplan for a temple, castle, or some other structure`, `a bit of folded cloth that, when unfolded, turns into a stylish cap`, `a receipt of deposit at a bank in a far-flung city`, `a diary with seven missing pages`, `an empty silver snuffbox bearing an inscription on the surface that says "dreams"`, `an iron holy symbol devoted to an unknown god`, `a book that tells the story of a legendary hero's rise and fall, with the last chapter missing`, `a vial of dragon blood`, `an ancient arrow of elven design`, `a needle that never bends`, `an ornate brooch of dwarven design`, `an empty wine bottle bearing a pretty label that says, "The Wizard of Wines Winery, Red Dragon Crush, 331422-W"`, `a mosaic tile with a multicolored, glazed surface`, `a petrified mouse`, `a black pirate flag adorned with a dragon's skull and crossbones`, `a tiny mechanical crab or spider that moves about when it’s not being observed`, `a glass jar containing lard with a label that reads, "Griffon Grease"`, `a wooden box with a ceramic bottom that holds a living worm with a head on each end of its body`, `a metal urn containing the ashes of a hero`];

let todaysTrinkets = []

const refreshTrinkets = () => {
  todaysTrinkets.length = 0
  for (let i = 0; i < 4; i++) {
      let num = Math.floor(Math.random() * 100);
      if(todaysTrinkets.indexOf(allTrinkets[num]) === -1) todaysTrinkets.push(allTrinkets[num]);
  }
  for (i = 0; i < todaysTrinkets.length; i++) {
    yardSale.options[i+1].button = todaysTrinkets[i]
    yardSale.options[i+1].text = `You decide to purchase `+ todaysTrinkets[i] + ` and put it away in your bag before heading back towards the other shops.` 
}
}

// EVENT DATABASE
// Each has intro text, which displays, a hidden option condition, and then a count of hidden option — which are always the last number of options.
// the continue number is associated with the eventOptions object and is used when calling new continue buttons
// This would have been better to do through a class — but it's way too late for me to figure out on this timeline.

class FairEvent {
    constructor ({intro, eventBg, location, options, hiddenOptions, returningIntro, initialize}) {
        this.intro = intro
        this.eventBg = eventBg
        this.location = location
        this.options = options
        this.hiddenOptions = hiddenOptions
        this.returningIntro = returningIntro
        this.initialize = initialize
    }
}

const beginNewDay = new FairEvent ({
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
			continue: () => outsideTheInn,
		},
		{
			button:`Observe for a few minutes`,
			text:`You gaze out the window and take in the sight of the fair. You see gnomes performing a maypole dance, a halfling tightrope walking above a crowd of spectators, a few dancers juggling knives, and a dozen games of skill and chance.`,
			duration:.5,
			bg:`img/the-faire.png`,
		},
		{
			button:`Try to remember your dreams`,
			text:`You close your eyes and try to focus on your dreams from the night before — in your mind's eye, you see a white mole with claws of steel laughing in front of woman turned to stone. It's a bizarre and haunting image.`,
			duration:.5,
			bg:`img/whitemole.png`,
		},
        {
			button:`Explore your sense of déjà vu`,
			text:`Pulling yourself into consciousness, you listen to the sounds outside your window for a moment and swear that what you're hearing is almost identical to what you heard yesterday. Was yesterday a dream? Is today?`,
			duration:0,
			condition: () => dayCount >= 2,
			alreadyDisplayed:false,
			hideAfterClicked:true,
		},
		{
			button:`Scream in frustration`,
			text:`Hearing the same call to "roll up for the Pudding Faire" breaks something in your mind and makes you take a deep breath in before letting out a primal shout. The noise outside pauses for a brief second before continuing.`,
			duration:0,
			condition: () => dayCount === 3 || dayCount > 4,
			alreadyDisplayed:false,
		},
		{
			button:`Get drunk downstairs`,
			text:`Considering your options for a moment, you decide that this whole thing is too much and opt to just go downstairs to have a morning pint or four.`,
			duration:0,
			condition: () => dayCount > 3,
			alreadyDisplayed: false,
		},
		{
			button:`Flee town`,
			text:`Deciding that this place is decidedly weird, you figure that making a run for it is at least worth a shot. You pack up your things and head away from the town. Fortunately, the next town isn't more than a day's journey, and you'll only need to camp one night. As you lay your head down your say a prayer that the next thing you hear won't be the sound of the fair again.`,
			duration:13,
			condition: () => dayCount > 3,
			alreadyDisplayed: false,
			continue: () => beginNewDay,
			hideAfterClicked: true,
			bg:`img/woods-camp.jpg`,
		},
	]
})

const outsideTheInn = new FairEvent ({
	intro:`In the center of town, your senses are assaulted with the sights, sounds and delectable smells of the Pudding Faire. A large banner above "Nanny Cowslip's Chariot of Consummate Confections" offers some direction. To your left, closer to the woods are the carnival games. To the right, stalls are open for casual shopping. Straight ahead, the Pudding Faire's main tent is a flurry of activity. As you consider your decision, a cart blazes through the center of town with a gnome atop it shouting, "THERE'S NO TIME LIKE THE PRESENT!" while he tosses handfuls of candy to nearby children.`,
	returningIntro: `Back at the center of town, you consider your options. To the west, closer to the woods are the carnival games. To the east, stalls are open for casual shopping. To the north, the Pudding Faire's main tent is a flurry of activity. And, of course, there's Nanny Cowslip's chariot.`,
	location:'center',
    eventBg: 'img/the-faire.png',
	options: [
		{
			button:`Go play some games`,
			text:`As you walk towards the games you hear a heady mix of shouts from people young and old — some exulting their victories, while others bemoan their luck.`,
			duration:.5,
			continue: () => carnivalArea,
			//bg:``,
		},
		{
			button:`Peruse the shops`,
			text:`You head off towards the gauntlet of sellers hawking their wares from carts, hopeful that something special will catch your eye.`,
			duration:.5,
			continue: () => shopsArea,
			//bg:``,
		},
		{
			button:`Head to the main tent`,
			text:`The Great Pudding Tent seems particularly bustling — you head towards it to see what all the commotion is about.`,
			duration:.5,
			continue: () => {
                if (timeOfDay < 12.5) {
                    return mainTentMorning
                } else {return mainTentAfternoon}
            }
		},
		{
			button:`Talk to Nanny Cowslip`,
			text:`Something about the brightly painted chariot catches your eye and you approach Nanny Cowslip's Chariot of Consummate Confections`,
			duration:0,
			continue: () => candyChariot,
		},
		// {
		// 	button:`Chase the cart`,
		// 	text:`Remembering that the puppeteer Regis Blossombottom had his hand run over by a cart, you chase down the gnome throwing candy and tell him to be careful — you heard someone was hit by a speeding cart earlier and don't want it to happen again.`,
		// 	duration:1,
		// 	condition: () => metPuppeteer === true && timeOfDay < 8,
		// 	alreadyDisplayed:false,
		// 	dailyConChanges:[savedPuppeteer],
		// 	deed:`good`
		// },
        {
			button:`Follow the deep footprints`,
			text:`As you head out of town it gets easier and easier to follow the deep, gnome-sized footprints heading out to the woods. There isn't much traffic this way, and the other footprints you see clearly belong to tall folk.`,
			duration:1,
			alreadyDisplayed:false,
			deed:`good`,
            condition: () => dailyConditions.footprintsToWoods === true
		},
	]
})

const candyChariot = new FairEvent ({
	intro:`Nanny Cowslip sells candy from the back of a chariot purple chariot with three enlarged kittens on her lap with collars reading Snap, Crackle, and Pop. A jar of glowing jelly beans labeled “MAGIC CANDY” sits on her counter alongside trays of sherbet lemons, honeycomb toffees, and peppermint bonbons. As you come closer, Nanny Cowslip smiles and says, "One good deed gets you one jelly bean! But of course the first one's on me because just being here is doing good for the town."`,
	returningIntro: `When you approach the stall again, Nanny smiles at you and says, "Ooh back again? Well I trust you've done something worth another candy!"`,
    eventBg: 'img/nanny-2.png',
	options: [
		{
			button:`Ask what's in the candy`,
			text:`When you ask what's in the candy, she looks taken aback. After a few moments she leans in close and says, "Pure magic." You can't quite tell if she's being serious.`,
			duration:.5,
		},
        {
			button:`Head away from the cart`,
			text:`You turn away from the cart, pondering where you'd like to go next.`,
			duration:.5,
			continue:() => outsideTheInn,
		},
        {
			button:`Ask for a candy`,
			text:`When you request a candy, Nanny laughs and says, "But of course!" and holds the jar out to you with a flourish. "Choose wisely! Every choice is a good one, but it still pays to be smart about it."`,
			duration:.5,
			continue:() => outsideTheInn,
            condition: () => takenCandy === false,
			alreadyDisplayed:true,
			dailyConChanges:[`takenCandy`],
		},
		{
			button:`Reach in and take a candy`,
			text:`As you reach in, Nanny raises an eyebrow and quips, "well, aren't you bold. But yes, enjoy — but no more until you come back with tales of good deeds."`,
			duration:.5,
			continue:() => outsideTheInn,
            condition: () => takenCandy === false,
			alreadyDisplayed:true,
			dailyConChanges:[`takenCandy`],
		},
        // {
		// 	button:`Confront her about her identity`,
		// 	text:`As soon as you mention that you know she's really Cyrrollalee, she hushes you and tells you to get in the cart so you can talk. As soon as you step inside, it takes off — proving those wings aren't for show — and touches down on the edge of the woods outside of town.`,
		// 	duration:0,
		// 	condition: knowCyrrollalee,
		// 	alreadyDisplayed:false,
		// },
	]
})

const carnivalArea = new FairEvent ({
	intro:`Gnomes and halfings young and old are raucously shouting all throughout the wooded games area. While the most puppet show happening just ahead of you is clearly the most popular attraction with a couple dozen children watching raptly, you quickly notice that most of the attending adults have flagons from the cider stand to your left. To your right you see a caricaturist drawing sketches for a few silver pieces each.`,
	returningIntro: `You consider your options again — the puppet fair happening in the large tent, a quick visit to the cider stand, a sketch at the caricaturist, or heading back to the center of town.`,
	eventBg: 'img/woods-fair.jpg',
	location:'carnival',
    initialize: () => {
        if (timeOfDay >= 12 && timeOfDay <= 14 && dailyConditions.piedToday === false) {
            let lastText = document.getElementById('current-text').lastElementChild
            let firstInitText = " As you consider your options, a custard tart comes flying at you and catches you on the side of the face."
            let laterInitText = " As you consider your options, a familiar custard tart comes flying at you."
            if (permConditions.piedInFace === true) {
                lastText.textContent += laterInitText
            } else {
                lastText.textContent += firstInitText
            }
            dailyConditions.piedToday = true
        }
    },
	options: [
		{
			button:`Return to the center of town`,
			text:`Deciding you'd rather go to a different part of the fair, you head back to the center of town.`,
			duration:.5,
			continue: () => outsideTheInn
		},
		{
			button:`Approach the cider stand`,
			text:`There's something alluring about the cider stand's colorful awnings that draws you in — besides, it's hot, and a cool cider sounds nice.`,
			duration:0,
            continue: () => ciderStall,
		},
		{
			button:`Visit the caricaturist`,
			text:`Looking over at the caricaturist, you can't help but notice that while the halfling is drawing caricatures of fairgoers, hung up around the stall are landscape paintings of local scenery.`,
			duration:0,
			continue: () => caricatureStall,
		},
		{
			button:`Watch the puppet show`,
			text:`Looking towards the painted puppet stage, you can't help but be impressed with how attentive the young audience is. Walking over, you notice a sign: "The Legend of Mystery Hollow — told every hour on the hour."`,
			duration:0
			//continue:1,
		},
		{
			button:`Look for the culprit`,
			text:`After looking around for a moment, you see the culprit: a giggling gnome child who darts away as soon as you make eye contact. Your emotions calm after a minute and you're just thankful it's not a mimic this time. Gods, last week was rough.`,
			duration:.5,
			condition: () => timeOfDay >= 12 && timeOfDay <= 14 && dailyConditions.piedToday === false,
			alreadyDisplayed:false,
			permConChanges:["piedInFace"]
		},
		{
			button:`Duck the incoming custard`,
			text:`As you stand considering your options, you deftly move a foot to the left as a custard tart comes flying at you. You hear a angry shout from behind you and turn to see the custard hit a very large human who charges after the gnome child.`,
			duration:.5,
			condition: () => permConditions.piedInFace === true && timeOfDay >= 12 && timeOfDay <= 14 && dailyConditions.piedToday === false,
			alreadyDisplayed:false,
			permConChanges:["dodgedPie"],
		},
		{
			button:`Catch the incoming custard`,
			text:`As you stand considering your options, you reflexively put up your hand and catch the flying custard with a cradling motion and redirect it towards your mouth. As you take a bite, you wink at the gnome child who stares in awe. The custard's flight hasn't made it any less delicious.`,
			duration:.5,
			condition: () => permConditions.piedInFace === true && timeOfDay >= 12 && timeOfDay <= 14 && permConditions.dodgedPie === true && dailyConditions.piedToday === false,
			alreadyDisplayed:false,
			deed:`good`
		}
	]
})

const shopsArea = new FairEvent ({
	intro:`Despite being less crowded than some of the other parts of the faire, the shops set up on the south side of the lake prove to be the loudest. Dozens of vendors are shouting about their wares and prices, but three in particular catch your eye. A tabaxi herbalist offering potions, a gnome's yard sale happening on a particularly large green area and a halfling potter whose kiln is set up right next to his stall.`,
	returningIntro: `You look around the shops area, deciding if there are any other stalls you want to visit. There's a tabaxi herbalist offering potions, a gnome's yard sale happening on a particularly large green area and a halfling potter whose kiln is set up right next to his stall.`,
	eventBg: 'img/market-day.jpeg',
	location: 'shops',
	options: [
		{
			button:`Return to the center of town`,
			text:`Deciding you'd rather go to a different part of the fair, you head back to the center of town.`,
			duration:.5,
			continue: () => outsideTheInn
		},
		{
			button:`Visit the herbalist`,
			text:`The herbalist's stall isn't terribly busy as you approach — which gives you a clear view of the woodland animals carved into the wood of the stall.`,
			duration:1.5,
			//continue:0,
			bg:`img/herbalist.jpeg`,
		},
		{
			button:`Check out the yard sale`,
			text:`As you head towards the yard sale, it's clear why this takes up so much space: every item is laid out on blankets, with dozens of trinkets priced to move.`,
			duration:1.5,
			continue: () => yardSale,
			bg:`img/trinkets.jpeg`,
            condition: () => dailyConditions.purchasedTrinket === false
		},
		{
			button:`Browse the pottery`,
			text:`The small stall next to the kiln is clearly the busiest stall in the area — as you approach, you see a dozen or so families all holding similar commemorative plates.`,
			duration:1.5,
			alreadyDisplayed:true,
            condition: () => dayCount != 3,
			bg:`img/potter.jpeg`,
		},
		{
			button:`Approach the distressed potter`,
			text:`While on other days Janphar's stall has been one of the busiest, today he sits sobbing with his head in his hands. No one is in line to buy his plates today.`,
			duration:1.5,
			alreadyDisplayed:false,
            condition: () => dayCount === 3,
			bg:`img/potter.jpeg`,
		}
	]
})

const returnToInnAtNight = new FairEvent ({
	intro:`It's starting to get late, and you decide that you've had enough of the fair for one day. Your feet are sore from being out all day and you head is just a bit fuzzy from so much time in the sun.`,
	secretText: `It's starting to get late, and you decide that you've had enough of the fair for one day. Your feet are sore from being out all day and you head is just a bit fuzzy from so much time in the sun.`,
	eventBg: '',
	options: [],
	hiddenOptions: [
		{
			button:`Continue`,
			text:`In the twilight of the day you make your way back to the inn, ready to put your head down for the night.`,
			duration:0,
			alreadyDisplayed:true,
			continue: () => beginNewDay,
            bg:`img/town-night.jpg`,
            condition: () => goodDeeds < 4
		},
		{
			button:`Greet Nanny Cowslip`,
			text:`In the twilight of the day you make your way back to the inn, ready to put your head down for the night. Standing outside the inn, however, is Nanny Cowslip. As soon as she sees you she starts walking directly towards you.`,
			duration:0,
			alreadyDisplayed:true,
            bg:`img/town-night.jpg`,
            condition: () => goodDeeds >= 4
			//continue:0,
		}
	]
})

const mainTentMorning = new FairEvent ({
	intro:`As you approach the Great Pudding Tent you are surrounded by a flurry of activity. Gnomes and halflings are running across tables, racing towards the center tables. Onlookers are hurling food at them — mostly soft, squishy vegetables, like past-ripe tomatoes — and after you see a gnome reach the center table, his time is recorded on a nearby chalkboard. As you get closer, stout tables and benches radiate around the Great Pudding: a fruitcake almost ten feet in diameter. People all around are talking about the feast in excited tones.`,
	eventBg: 'img/main-tent.jpg',
	options: [
		{
			button:`Return to the center of town`,
			text:`Deciding you'be seen enough of the Great Pudding Tent, you head back to the center of town.`,
			duration:.5,
			continue: () => outsideTheInn
		},
		{
			button:`Ask what the big deal is`,
			text:`A halfling next to you scoffs. "What's the big deal? This is the most exciting festival of the year for all of us in Honeypuddle! It brings old friends and new, delicious food, and so much more. If you don't appreciate it, you should probably just go." With a hrumph he walks around the fruitcake to the otherside so he can gaze at the fruitcake without having to look at you.`,
			duration:.5,
		},
		{
			button:`Ask what will happen at the feast`,
			text:`Turning to your side, you ask a nearby gnome what will happen tonight. She responds, "Well, feasts are held here throughout the day, with guests coming and going as they please. The Great Pudding remains untouched until sundown, when the villagers bless it with song and slice it up using a two-man saw wielded by a gnome and a halfling. After the feast, the patrons have a grand storytelling session and then pull the tables aside to dance until midnight." She lets out a sigh. "It's truly beautiful."`,
			duration:.5,
		},
		{
			button:`Gaze longingly at the fruitcake`,
			text:`As you examine the fruitcake, you keep noticing finer and finer details — little flourishes in the icing, the perfect distribution of fruit across the surface, how even the bake it. It's truly a baking marvel — clear even from the outside that it is baked all the way through without even a hint of a soggy bottom.`,
			duration:1,
		},
	],
	hiddenOptions: []
})

const mainTentAfternoon = new FairEvent ({
	intro:`As you approach the Great Pudding Tent you are surrounded by a flurry of activity. Gnomes and halflings are running across tables, racing towards the center tables. Onlookers are hurling food at them — mostly soft, squishy vegetables, like past-ripe tomatoes — and after you see a gnome reach the center table, his time is recorded on a nearby chalkboard. As you get closer to the center, however, you notice the gnomes and halflings closest to the Great Pudding are in worried knots, talking rapidly.`,
	eventBg: 'img/main-tent.jpg',
	options: [
		{
			button:`Return to the center of town`,
			text:`Deciding don't want anything to do with what has happened here, you head back to the center of town.`,
			duration:.5,
			continue: () => outsideTheInn,
        },
		{
			button:`Ask what happened`,
			text:`You ask a few people what happened, but the clearest explanation comes from a child who spits out the tale rapidly. "The mayor told this guy who talked bad that he needed to go and then the guy said NO and then there was this big sound and now LOOK the mayor's wife is holding on to that toad BUT THE TOAD IS THE MAYOR hehehehehe our mayor croaked but he's still alive hahahaha.`,
			duration:0,
		},
		{
			button:`Try to eavesdrop`,
			text:`You move around the crowd, trying to hear what's happened. "Can you believe the mayor got turned into a FROG?! It's just awful!" says one gnome. "That drunk dude blew some green powder in his face, then poof! Frog. See, I told you no good comes from folks who prefer to sleep in Threepenny Wood." replies another. Moving around, you gather that Mayor Barleydew asked the gnome to leave because he was disturbing the locals with his creepy talk and bad attitude.`,
			duration:0,
			dailyConChanges:['footprintsToWoods'],
		},
		{
			button:`Do a little investigating`,
			text:`Deciding to poke around a bit, you're having trouble telling footprints apart — there are a lot of people milling around — but as you head back towards the center of town, you notice some deeper footprints leading to Threepenny Wood. Looks like someone put a lot of force into their step.`,
			duration:0,
			continue: () => outsideTheInn,
			dailyConChanges:['footprintsToWoods'],
		},
	],
	hiddenOptions: []
})

const ciderStall = new FairEvent ({
	intro:`The cider stand does a roaring trade in apple cider and berries from local presses. Patrons sit on wooden tables sheltered by wide, colorful awnings embroidered with smiling faces.`,
	eventBg: 'img/cider-stall.jpeg',
	options: [
		{
			button:`Look at what else there is to do`,
			text:`You turn back to the games, and think about where to next.`,
			duration:.5,
			continue: () => carnivalArea
		},
		{
			button:`Chat up the bartender`,
			text:`You try to chat with Maisie Plumtucker, but she's far too busy. She's serving cool cider on a hot day — idle chatter is for fairgoers, not busy workers.`,
			duration:1,
		},
		{
			button:`Ask for a wee dram`,
			text:`You put your fingers close together and ask if you can have just a wee dram. You get the tiniest thimble of cider — just enough to let you get a sense of the flavor. Even with just a drop you can taste the freshness of the berries.`,
			duration:.5,
		},
		{
			button:`Buy a flagon`,
			text:`You ask for a flagon and hand over two copper pieces. It's served quickly, and it's about the tastiest thing you can imagine.`,
			duration:1,
		},
		{
			button:`Buy a flagon... and chug it.`,
			text:`You put down two copper pieces and ask for a flagon — the moment Maisie Plumtucker puts it down in front of you, you knock it back in one swallow. Everyone stares at you — half the crowd impressed, the other half appalled.`,
			duration:1.5,
			condition: () => dayCount > 2,
			alreadyDisplayed:false,
		},
	]
})

const caricatureStall = new FairEvent ({
	intro:`As you get approach the caricature booth, it's obvious to you that the artist only dabbles in portraits — the real masterpieces are the landscape paintings that are displayed around the stall. `,
	eventBg: 'img/caricature.jpeg',
	options: [
		{
			button:`Wander away`,
			text:`You decide you've spent enough time here for today and turn back to the rest of the carnival area.`,
			duration:0,
			continue: () => carnivalArea,
		},
		{
			button:`Examine the paintings`,
			text:`Looking closer, the paintings are all of the surrounding area. You see bucolic pastorals of the fields and the majestic landscapes of Threepenny Wood. There's a mastery in the strokes — you feel like these paintings are at least on par with those you've seen on display in Waterdeep, Neverwinter and other major cities.`,
			duration:1,
		},
		{
			button:`Ask about purchasing a painting`,
			text:`Feeling like these paintings are a real find, you ask Kohla Reedwright how much for a painting. When she says a gold piece, you consider buying them all — confident that you could sell them at a handsome profit in a larger city. Instead, you decide to purchase just one — a painting of the nearby lake.`,
			duration:1,
			condition: () => timeOfDay < 14,
			alreadyDisplayed:true,
		},
		{
			button:`Listen to the current subject`,
			text:`"WHY WOULD YOU DRAW ME LIKE THAT?" an older gnome shouts at the caricature artist Kohla Reedwright. "DO YOU KNOW WHO I AM!? I'M BERTUS FLOPHOLLOW AND I WILL NOT STAND FOR THIS!" You look at the painting and see that Bertus' already small nose was drawn tiny, alongside exaggerating his chin. For a caricature, it's rather mild.`,
			bg:"img/gnome-caricature.jpeg",
            duration:1,
			alreadyDisplayed:false,
            condition: () => timeOfDay >= 14 && dailyConditions.calmedBertus === false,
		},
		{
			button:`Try to calm to the current subject`,
			text:`After a few minutes of trying to get a word in, you successfully divert the gnome's attention from the caricature towards other parts of the fair. When you look back at Kohla, she looks relieved.`,
			duration:1,
			alreadyDisplayed:false,
			continue: () => carnivalArea,
            condition: () => timeOfDay >= 14 && dailyConditions.calmedBertus === false,
			permConChanges:['knowHowToCalmCaric'],
			deed:`good`
		},
		{
			button:`Tell Kohla about Bertus`,
			text:`Not wanting Kohla to be verbally assaulted by Bertus, you let her know that if he comes by he's likely to be angry — so it might be best to avoid exaggerating his nose and chin. She looks skeptical, but thanks you.`,
			duration:1,
			alreadyDisplayed:false,
			continue: () => carnivalArea,
			dailyConChanges:['calmedBertus'],
			deed:`good`,
            condition: () => timeOfDay < 13 && permConditions.knowHowToCalmCaric === true,
		},
	]
})

const yardSale = new FairEvent ({
	intro:`Gaffer Hogwaddle’s orchard backs onto the village green, so every year he holds a yard sale at the Pudding Faire to clear out any bric-a-brac he’s accumulated. There are hundreds of items laid out, but a few catch your eye today. Which one do you want to purchase?`,
	eventBg: '',
	options: [
		{
			button:`None of them`,
			text:`After thinking about it, you decide that none of the options really excite you and you head back to the other shops.`,
			duration:1,
			continue: () => shopsArea
			//continue:0,
			//bg:``,
			//dailyConChanges:[],
			//permConChanges:[],
			//deed:``
		},
		{
			button:``,
			buttonFunction: () => adventurers[0].newTrinket(yardSale.options[1].button),
			duration:.5,
			continue: () => shopsArea,
			dailyConChanges:['purchasedTrinket'],
		},
		{
			button:``,
			buttonFunction: () => adventurers[0].newTrinket(yardSale.options[2].button),
			duration:.5,
			continue: () => shopsArea,
			dailyConChanges:['purchasedTrinket'],
		},
		{
			button:``,
			buttonFunction: () => adventurers[0].newTrinket(yardSale.options[3].button),
			duration:.5,
			continue: () => shopsArea,
			dailyConChanges:['purchasedTrinket'],
		},
		{
			button:``,
			buttonFunction: () => adventurers[0].newTrinket(yardSale.options[4].button),
			duration:.5,
			continue: () => shopsArea,
			dailyConChanges:['purchasedTrinket'],
		},
	]
})

// LIST OF CONDITIONS, MOSTLY FOR REFERENCE SINCE THEY DON'T NEE TO EXIST UNTIL I CREATE THEM.

const dailyConditions = {
    "takenCandy": false,
    "footprintsToWoods": false,
    "calmedBertus":false,
    "piedToday": false,
    "purchasedTrinket": false
}

const permConditions = {
    "piedInFace":false,
    "dodgedPie": false,
    "knowHowToCalmCaric": false
}

const resetDailyConditions = () => { // for all the daily conditions, set them to false
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

FUTURE
- move the whole thing to humblewood, which could give it consistent art? or be fine with the varying styles or something.
- whole thing top down maps? Something to create consistency of style. maybe faces and such are all official artwork?
- make time of day visible or something.
*/