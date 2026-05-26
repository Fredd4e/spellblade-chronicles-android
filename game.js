/* game.js - World exploration, location actions, travel and quest orchestration */

function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;

    if (newLoc === 'village') {
        state.locationName = "Eldoria Village Square";
    } else if (newLoc === 'woods') {
        state.locationName = "Whispering Woods";
        if (old !== 'woods' && window.Lore && Lore.travel) log(Lore.travel.woods, true);
    } else if (newLoc === 'ruins') {
        state.locationName = "Ruined Temple";
        if (old !== 'ruins' && window.Lore && Lore.travel) log(Lore.travel.ruins, true);
    } else if (newLoc === 'church') {
        state.locationName = "Church of the Silver Light";
        log("You step into the quiet warmth of the old church.", true);
    }

    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

function goToChurch() {
    if (state.inCombat) return;
    travel('church');
}

function exploreVillage() { if (state.inCombat) return; log('You explore the village square.'); updateAll(); save(); }

function exploreWoods() {
    if (state.inCombat) return;
    log('Venturing into the woods...');
    const roll = Math.random();
    if (roll < 0.55) {
        // Richer enemy variety in woods
        const woodsPool = ['beast', 'wolf', 'goblin', 'shadow'];
        const key = woodsPool[Math.floor(Math.random() * woodsPool.length)];
        startCombat(key);
    } else {
        searchLoot(true);
    }
}

function exploreRuins() {
    if (state.inCombat) return;
    log('Entering the ruins...');

    // Quest 2 progress for simply braving the temple
    if ((state.quest || 0) >= 2 || (state.kills || 0) >= 3) {
        state.templeProgress = (state.templeProgress || 0) + 1;
    }

    const roll = Math.random();
    if (roll < 0.45) {
        startCombat('skeleton');
    } else if (roll < 0.68) {
        startCombat('guardian');
    } else if (roll < 0.82 && (state.quest || 0) >= 1) {
        startCombat('fallen');
    } else {
        searchLoot(true);
    }
}

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
            const pool = loc === 'ruins' ? ['skeleton', 'guardian'] : ['beast', 'wolf', 'goblin'];
            startCombat(pool[Math.floor(Math.random() * pool.length)]);
        }
    }
}

function initializeGameEnhancements() { console.log('Enhancements ready'); }