/* game.js - World exploration, location actions, travel and quest orchestration */

function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;

    if (newLoc === 'village') {
        state.locationName = "Eldoria Village Square";
        if (old === 'ruins') state.templeLevel = 1; // Reset dungeon progress
    } else if (newLoc === 'woods') {
        state.locationName = "Whispering Woods";
        if (old !== 'woods' && window.Lore && Lore.travel) log(Lore.travel.woods, true);
        if (old === 'ruins') state.templeLevel = 1;
    } else if (newLoc === 'ruins') {
        state.locationName = "Ruined Temple";
        if (old !== 'ruins' && window.Lore && Lore.travel) log(Lore.travel.ruins, true);
        if (!state.templeLevel) state.templeLevel = 1;
    } else if (newLoc === 'church') {
        state.locationName = "Church of the Silver Light";
        log("You step into the quiet warmth of the old church.", true);
        if (old === 'ruins') state.templeLevel = 1;
    } else if (newLoc === 'wildermarch') {
        state.locationName = "Wildermarch";
        if (old !== 'wildermarch' && window.Lore && Lore.travel) log(Lore.travel.wildermarch, true);
    }

    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

function goToChurch() {
    if (state.inCombat) return;
    travel('church');
}

function exploreVillage() {
    if (state.inCombat) return;

    const villagerKeys = ['garrick', 'lirael', 'mira', 'margot', 'delphine'];
    const randomKey = villagerKeys[Math.floor(Math.random() * villagerKeys.length)];

    if (typeof startDialogue === 'function') {
        startDialogue(randomKey);
    } else {
        log('You chat with some of the locals. They seem nervous about the growing darkness.');
    }
}

function exploreWoods() {
    if (state.inCombat) return;
    log('You push deeper into the Whispering Woods...');
    performExploration('woods');
}

function performExploration(area) {
    const roll = Math.random();

    if (area === 'woods') {
        if (roll < 0.62) {
            // Combat - higher chance
            const woodsPool = ['beast', 'wolf', 'goblin', 'shadow'];
            const key = woodsPool[Math.floor(Math.random() * woodsPool.length)];
            startCombat(key);
        } else if (roll < 0.82) {
            // Interesting discovery
            triggerDiscovery('woods');
        } else {
            // Modest loot
            searchLoot(true);
        }
    } 
    else if (area === 'ruins') {
        const level = state.templeLevel || 1;
        log(`Exploring the Ruined Temple (Level ${level})...`);

        // Quest progress
        if ((state.quest || 0) >= 2 || (state.kills || 0) >= 3) {
            state.templeProgress = (state.templeProgress || 0) + 1;
        }

        if (roll < 0.68) {
            // Combat - high chance in the temple
            let enemyKey;
            if (level === 1) {
                const pool = ['skeleton', 'guardian'];
                enemyKey = pool[Math.floor(Math.random() * pool.length)];
                if (Math.random() < 0.25 && (state.quest || 0) >= 1) enemyKey = 'fallen';
            } else if (level === 2) {
                const pool = ['guardian', 'succubus', 'demoness'];
                enemyKey = pool[Math.floor(Math.random() * pool.length)];
            } else {
                const pool = ['demoness', 'overlord', 'fallen'];
                enemyKey = pool[Math.floor(Math.random() * pool.length)];
            }
            startCombat(enemyKey);
        } else if (roll < 0.88) {
            triggerDiscovery('ruins');
        } else {
            searchLoot(true);
        }
    }
    else if (area === 'wildermarch') {
        log('You navigate the dense thickets of the Wildermarch...');
        if (roll < 0.58) {
            // Combat - spriggans are common here
            const wildPool = ['spriggan', 'spriggan', 'mothweaver', 'hoofmaiden', 'nightfang', 'wolf', 'beast'];
            let key = wildPool[Math.floor(Math.random() * wildPool.length)];
            // Rare chance for the Spider Queen as a dangerous encounter
            if (Math.random() < 0.12) key = 'spider_queen';
            startCombat(key);
        } else if (roll < 0.78) {
            triggerDiscovery('wildermarch');
        } else {
            searchLoot(true);
        }
    }
}

function exploreRuins() {
    if (state.inCombat) return;
    performExploration('ruins');
}

function exploreWildermarch() {
    if (state.inCombat) return;
    log('You press deeper into the wild and untamed Wildermarch...');
    performExploration('wildermarch');
}

// descendTemple is defined in ui.js (global)

function searchLoot(silent = false) {
    if (state.inCombat) return;
    if (!silent) log('Searching...');

    if (Math.random() < 0.5) {
        const g = Math.floor(Math.random() * 10) + 3;
        state.player.gold += g;
        log('Found ' + g + ' gold!');
    } else if (Math.random() < 0.32) {
        const pot = Math.random() < 0.5 ? 'Health' : 'Mana';
        addToInventory({ name: pot + ' Potion', type: 'consumable', bonus: pot === 'Health' ? 30 : 15, desc: `Restores ${pot === 'Health' ? '30 HP' : '15 MP'}`, quantity: 1 });
        log('Found a ' + pot.toLowerCase() + ' potion!');
    }

    updateAll(); save();

    if (Math.random() < 0.22 && state.location !== 'village') {
        const loc = state.location;
        if (loc === 'ruins' && Math.random() < 0.25 && (state.quest || 0) >= 1) {
            startCombat('fallen'); // rare boss from searching
        } else {
            const pool = loc === 'ruins' ? ['skeleton', 'guardian'] : (loc === 'wildermarch' ? ['spriggan', 'mothweaver', 'hoofmaiden', 'nightfang', 'wolf', 'beast'] : ['beast', 'wolf', 'goblin']);
            startCombat(pool[Math.floor(Math.random() * pool.length)]);
        }
    }
}

function triggerDiscovery(area) {
    const discoveries = {
        woods: [
            "You find a weathered locket hanging from a low branch. Inside is a faded portrait of a woman with kind eyes. You feel a strange sense of peace.",
            "Half-buried in the moss, you discover an old leather-bound journal. Most pages are ruined, but one entry speaks of 'the silver light that once held back the darkness'.",
            "A massive wolf lies dead, not by your hand. Its fur is strangely white, and clutched in its jaws is a silver pendant shaped like a crescent moon.",
            "You stumble upon the remains of an old hunter's camp. Among the ashes is a single arrow fletched with raven feathers and a note: 'Do not trust the ones who sing at night.'",
            "A strange glowing mushroom patch reveals a small cache of gold coins hidden beneath — payment left by someone long gone."
        ],
        ruins: [
            "Among the rubble, you uncover a cracked stone tablet. The inscription reads: 'Here lies the last of the Wardens. May the Light remember what we could not protect.'",
            "You find a beautiful but broken stained-glass shard depicting a knight kneeling before a winged figure. It hums faintly when held.",
            "In a collapsed side chamber, you discover an old painting of a black horse standing before a burning temple. The paint is still strangely vibrant.",
            "A skeletal hand still clutches a sealed letter addressed to 'My dearest Elara'. You choose not to open it.",
            "You pry open an ancient offering box and find several gold coins alongside a small vial of what might once have been holy water."
        ],
        wildermarch: [
            "You discover a circle of ancient standing stones half-swallowed by roots. The air hums with old, wild magic.",
            "A massive tree has grown around the skeleton of a long-dead hunter. Their bow is still clutched in bony fingers, remarkably preserved.",
            "You find a spriggan's hollow — a nest of woven branches and shining stones. Something valuable glints among the offerings.",
            "Thick spider silk stretches between trees like ghostly banners. A torn piece of red cloth is caught in the webbing.",
            "You stumble across the remains of a merchant's cart, overgrown and looted. A single silver arrowhead lies in the dirt."
        ]
    };

    const pool = discoveries[area] || discoveries.woods;
    const text = pool[Math.floor(Math.random() * pool.length)];

    log(`<i class="fas fa-scroll text-amber-400 mr-1"></i> ${text}`, true);

    // Small reward chance
    if (Math.random() < 0.55) {
        const gold = Math.floor(Math.random() * 8) + 5;
        state.player.gold += gold;
        log(`You also find <b>${gold} gold</b> among the discovery.`);
    }

    updateAll();
    save();
}

function initializeGameEnhancements() { console.log('Enhancements ready'); }