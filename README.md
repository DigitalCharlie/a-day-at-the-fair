# A Day at the Fair

A text adventure set in the Forgotten Realms.

Story adapted from ["The Pudding Faire,"](https://www.dmsguild.com/product/249757/Pudding-Faire) a D&D 5e module by Will Doyle. If you find a part particularly well written, such as the introduction to each day, it's likely pulled directly from the mod.

Images are pulled from a lot of sources, but the bulk are either from the Pudding Faire module itself or from Ross McConnell at [2 Minute Tabletop](https://2minutetabletop.com/). The maps you see for the major locations, for example, are all from Ross.

## Directions

Gameplay for A Day at the Fair is simple — players are presented with an situation and a couple of options to choose from. They are able to move to various locations throughout the fair, and depending on what time they arrive there may be different special events that occur. At the end of the day, players return to the inn and wake up to repeat the same day with all the knowledge they gained from the day before. If this opens up new options, those buttons are faded in after the other buttons load to call attention to them.

The goal of the game is to escape the time loop, though the method for doing so is left vague on purpose — though there are a number of hints throughout the fair that help point players in the right direction. It's not necessary to play to escape the loop, however, as just repeating the fair day can be fun on its own.

## Screenshots

Players choose one of the options on the screen
![](img/intro-screenshot.png)

And are taken to the corresponding location

![](img/continue-screenshot.png)

If the want to review what they have done (for that day or previous ones) they can click the full history button in the upper corner to get this modal.
![](img/history-screenshot.png)

## Motivation

This project was created for three reasons:
1. As something to turn in for project 1 for my General Assembly course
2. As a learning tool for JavaScript that references itself in relatively complex ways
3. As a way to really get my mind around the module because I'm planning to run it for some friends

## Languages used

A Day at the Fair is written in HTML, CSS and JavaScript. It's kept in 3 files, but long term should be split into more — particularly the JS.

## Challenges

Because A Day at the Fair is the most ambitious project I've tried to build myself, there were a lot of times where code decisions I made earlier in the project wound up being a hinderance as I moved forward. I did not do a sufficiently good job understanding how events would relate to each other. I improved the code significantly throughout the process, refactoring it a number of times, but there's still a lot room to improve and simplify the code.

I found that while I understand creating simple functions that can be run as parts of bigger processes, I sometimes still make those bigger processes too complex to be able to account for future uses in my code.

## Future improvements

Along with the goal of simplifying the code, there are a number of places where I cobbled together functionality to add new buttons to ongoing conversations. Because I made the create buttons function so complex, I didn't set myself up to be able to use it to add a single button to an event that was already in place.

Of course, because this was done for an assignment, there are also a few places where I rushed to finish the code and get it functional that I didn't have time to revisit, particularly the victory condition sections. That part as a whole is a mess that needs revision.

Additionally, I don't fully understand what scope I should give variables, what should wrapped inside of other objects (I've been told I should have a game object, for example), and I think understanding some of that better would help me write cleaner code.

The continue system feels awkward — I found that I needed to either have a database of all the events and then call them from that object with a key value pair, or run a simple function each time to just return the event that should be continued to. I think there's a better solution out there, but I'm not clear what it is yet.

In terms of gameplay, there are a few features I'd add — the top of the list are some kind of inventory and clock systems that let players see when events transpired each day, as well as what they have on them. That might also make their money a bit more meaningful, and introduce opportunities to gain money as well. 