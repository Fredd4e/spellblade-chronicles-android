/* game.js - World exploration, location actions, travel and quest orchestration */

function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;
    if (newLoc === 'village') state.locationName = "Eldoria Village Square";
    else if (newLoc === 'woods') { state.locationName = "Whispering Woods"; if (old !== 'woods' && window.Lore && Lore.travel) log(Lore.travel.woods, true); }
    else if (newLoc === 'ruins') { state.locationName = "Ruined Temple"; if (old !== 'ruins' && window.Lore && Lore.travel) log(Lore.travel.ruins, true); }
    else if (newLoc === 'church') { 
        state.locationName = "Eldoria Church"; 
        if (old !== 'church' && window.Lore && Lore.travel) log(Lore.travel.church, true); 
    }
    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

function talkToElder() { 
    if (state.inCombat) return; 
    const elder = (window.Lore && Lore.elder) ? Lore.elder : {};
    let dialogue = elder.default || ["<b>Elder:</b> 'Return when you have slain more of the foul creatures in the woods.'"];
    if (state.quest === 0) {
        dialogue = elder.stage0 || dialogue;
        state.quest = 1;
        log("Quest accepted: Beast Slayer - Slay 3 corrupted beasts.", true);
    } else if (state.kills >= 3 && state.quest < 2) {
        dialogue = elder.stage1_complete || dialogue;
        state.quest = 2;
        state.player.gold = (state.player.gold || 0) + 40;
        state.player.xp = (state.player.xp || 0) + 30;
        log('Quest complete! +40 Gold +30 XP', true);
        if (typeof checkLevelUp === 'function') checkLevelUp();
    } else if (state.quest >= 2) {
        dialogue = elder.stage2 || dialogue;
    }
    dialogue.forEach(msg => log(msg, true));
    updateAll(); 
    save(); 
}

function exploreVillage() { if (state.inCombat) return; log('You explore the village square.'); updateAll(); save(); }

function exploreWoods() { if (state.inCombat) return; log('Venturing into the woods...'); if (Math.random() < 0.7) startCombat('beast'); else searchLoot(true); }

function exploreRuins() { if (state.inCombat) return; log('Entering the ruins...'); if (Math.random() < 0.75) startCombat('skeleton'); else searchLoot(true); }

function exploreChurch() { 
    if (state.inCombat) return; 
    log('You walk the quiet aisles, admiring the craftsmanship of the stained glass and the gentle glow of candles. A profound sense of peace settles in your heart.'); 
    updateAll(); 
    save(); 
}

function restoreMana() {
    if (state.inCombat) return;
    const cost = 10;
    const currentGold = state.player.gold || 0;
    if (currentGold < cost) {
        log("<b>Sarah:</b> 'I am sorry, but the church requires a small tithe of 10 gold for the blessing.'", true);
        return;
    }
    state.player.gold -= cost;
    const maxMp = state.player.maxMp || 20;
    state.player.mp = maxMp;
    log("<b>Sarah:</b> 'May the eternal Light renew your inner flame. Go forth with clarity and strength.'", true);
    log(`You paid <b>10 Gold</b> and your mana has been fully restored! (MP: ${maxMp})`, true);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

function searchLoot(silent=false) { 
    if (state.inCombat) return; 
    if(!silent) log('Searching...'); 
    if (Math.random()<0.5) { const g = Math.floor(Math.random()*10)+3; state.player.gold += g; log('Found '+g+' gold!'); }
    else if (Math.random()<0.3) { addToInventory({name:'Health Potion',type:'consumable',bonus:30,desc:'Restores HP',quantity:1}); log('Found a potion!'); }
    updateAll(); save();
    if (Math.random()<0.25 && state.location!=='village') startCombat(state.location==='ruins'?'skeleton':'beast');
}

function initializeGameEnhancements(){ console.log('Enhancements ready'); }