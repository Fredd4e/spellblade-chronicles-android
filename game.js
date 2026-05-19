/* game.js - Full Gameplay logic for Spellblade Chronicles (fixed buttons, intro, actions, background) */

// Helper
function $(id) { return document.getElementById(id); }

// Spell definitions (from lore concepts)
const SPELLS = {
    "Firebolt": { cost: 5, baseDmg: 8, scale: 1.5, type: "damage" },
    "Ice Shard": { cost: 8, baseDmg: 12, scale: 1.8, type: "damage" },
    "Heal": { cost: 10, baseDmg: 15, scale: 2.5, type: "heal" }
};

// === Background as full game area background + portrait box fix ===
function showAreaPortrait(loc) {
    const p = $('area-portrait');
    const img = $('area-portrait-img');
    const cap = $('area-portrait-caption');
    if (!p || !img || !cap) return;

    p.classList.remove('hidden');

    let bgPath = '';
    let caption = '';

    const areas = (window.Lore && Lore.areas) ? Lore.areas : {};
    const areaKey = (!loc || loc === 'village') ? 'village' : loc;

    if (areaKey === 'village') {
        bgPath = (areas.village && areas.village.bgImage) ? areas.village.bgImage : 'assets/backgrounds/village.jpg';
        caption = areas.village ? areas.village.caption : 'The quiet village square. The Elder awaits.';
    } else if (areaKey === 'woods') {
        bgPath = (areas.woods && areas.woods.bgImage) ? areas.woods.bgImage : 'assets/backgrounds/woods.jpg';
        caption = areas.woods ? areas.woods.caption : 'Twisted trees whisper secrets and dangers.';
    } else if (areaKey === 'ruins') {
        bgPath = (areas.ruins && areas.ruins.bgImage) ? areas.ruins.bgImage : 'assets/backgrounds/ruins.jpg';
        caption = areas.ruins ? areas.ruins.caption : 'Ancient stones hum with forgotten power.';
    }

    // Set as FULL BACKGROUND on the game container (fixes "image box" issue)
    const container = document.querySelector('.game-container');
    if (container && bgPath) {
        container.style.backgroundImage = `linear-gradient(rgba(15, 15, 15, 0.72), rgba(9, 9, 9, 0.82)), url('${bgPath}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.transition = 'background-image 0.6s ease';
    }

    if (bgPath) {
        img.src = bgPath;
        img.style.display = 'block';
        img.onerror = () => { img.style.display = 'none'; };
    } else {
        img.style.display = 'none';
    }

    cap.innerHTML = caption;
}

// Travel with portrait + save
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
    }

    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

// Update UI stats from state
function updateStats() {
    const p = state.player;
    const nameEl = $('player-name');
    if (nameEl) nameEl.textContent = p.name || 'Aether';
    const lvlEl = $('level');
    if (lvlEl) lvlEl.textContent = p.level || 1;

    const hpEl = $('hp');
    if (hpEl) hpEl.textContent = `${p.hp}/${p.maxHp}`;
    const mpEl = $('mp');
    if (mpEl) mpEl.textContent = `${p.mp}/${p.maxMp}`;
    const xpEl = $('xp');
    if (xpEl) xpEl.textContent = `${p.xp || 0}/100`;
    const goldEl = $('gold');
    if (goldEl) goldEl.textContent = p.gold || 0;

    const strEl = $('str'); if (strEl) strEl.textContent = p.str || 5;
    const intEl = $('int'); if (intEl) intEl.textContent = p.int || 5;
    const defEl = $('def'); if (defEl) defEl.textContent = p.def || 3;

    // Progress bars
    const hpBar = $('hp-bar');
    if (hpBar) hpBar.style.width = Math.max(5, Math.min(100, ((p.hp || 0) / (p.maxHp || 50)) * 100)) + '%';
    const mpBar = $('mp-bar');
    if (mpBar) mpBar.style.width = Math.max(5, Math.min(100, ((p.mp || 0) / (p.maxMp || 20)) * 100)) + '%';

    // Location
    const locEl = $('location');
    if (locEl) locEl.textContent = state.locationName || state.location || 'Eldoria Village Square';
}

// Render story log
function renderStory() {
    const storyEl = $('story');
    if (!storyEl) return;
    storyEl.innerHTML = (state.story || []).map(entry => {
        return `<div class="${entry.important ? 'text-amber-300 font-semibold' : 'text-zinc-300'} mb-0.5">${entry.msg}</div>`;
    }).join('');
    // Keep scrolled to bottom
    const box = $('story-box');
    if (box) box.scrollTop = box.scrollHeight;
}

// Render dynamic action buttons (fixes buttons/options not showing)
function renderActions() {
    const container = $('actions');
    if (!container) return;
    container.innerHTML = '';

    if (state.inCombat) return;

    const loc = state.location || 'village';
    let actions = [];

    if (loc === 'village') {
        actions = [
            { label: 'Talk to Elder', icon: 'fa-user-tie', fn: talkToElder },
            { label: 'Explore the Square', icon: 'fa-search-location', fn: exploreVillage },
            { label: 'Visit Shop', icon: 'fa-store', fn: showShop },
            { label: 'Travel to Woods', icon: 'fa-tree', fn: () => travel('woods') }
        ];
    } else if (loc === 'woods') {
        actions = [
            { label: 'Hunt Corrupted Beasts', icon: 'fa-dragon', fn: exploreWoods },
            { label: 'Search for Loot', icon: 'fa-search', fn: searchLoot },
            { label: 'Go to Ruins', icon: 'fa-archway', fn: () => travel('ruins') },
            { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
        ];
    } else if (loc === 'ruins') {
        actions = [
            { label: 'Explore Temple Depths', icon: 'fa-dungeon', fn: exploreRuins },
            { label: 'Search Ancient Stones', icon: 'fa-search', fn: searchLoot },
            { label: 'Return to Woods', icon: 'fa-tree', fn: () => travel('woods') },
            { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
        ];
    }

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'rpg-btn flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-800 hover:bg-emerald-700/80 active:bg-emerald-600 rounded-2xl text-sm font-semibold shadow-sm transition-all';
        btn.innerHTML = `<i class="fas ${action.icon} mr-1.5"></i><span>${action.label}</span>`;
        btn.onclick = (e) => { e.preventDefault(); action.fn(); };
        container.appendChild(btn);
    });

    // If no actions, show hint
    if (actions.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center text-xs text-zinc-400 py-2">No actions available here.</div>';
    }
}

// === Core gameplay actions ===
function talkToElder() {
    if (state.inCombat) return;
    const elderDialogues = (window.Lore && Lore.elder) ? Lore.elder : {};
    let msgs = elderDialogues.default || ["The Elder nods silently."];

    if (state.kills >= 3 && state.quest < 2) {
        msgs = elderDialogues.stage1_complete || msgs;
        if (state.quest === 1) {
            state.quest = 2;
            state.player.gold = (state.player.gold || 0) + 40;
            state.player.xp = (state.player.xp || 0) + 30;
            log("<b>Quest Complete:</b> Beast Slayer — received 40 gold and 30 XP!", true);
            checkLevelUp();
        }
    } else if (state.quest === 0) {
        msgs = elderDialogues.stage0 || msgs;
        state.quest = 1;
        log("Quest accepted: Slay 3 corrupted beasts in the woods.", true);
    }

    msgs.forEach(m => log(m, true));
    updateAll();
    save();
}

function exploreVillage() {
    if (state.inCombat) return;
    log("You wander the quiet square. A few villagers nod respectfully.");
    if (Math.random() < 0.3) {
        const gold = 2;
        state.player.gold = (state.player.gold || 0) + gold;
        log(`You found a small pouch with ${gold} gold.`);
    }
    updateAll();
    save();
}

function exploreWoods() {
    if (state.inCombat) return;
    log("You push into the dark Whispering Woods, senses alert...");
    // High chance of encounter
    if (Math.random() < 0.75) {
        startCombat('beast');
    } else {
        searchLoot(true);
    }
}

function exploreRuins() {
    if (state.inCombat) return;
    log("You descend into the eerie Ruined Temple...");
    if (Math.random() < 0.8) {
        startCombat('skeleton');
    } else {
        searchLoot(true);
    }
}

function searchLoot(silent = false) {
    if (state.inCombat) return;
    if (!silent) log("You search the area carefully...");

    if (Math.random() < 0.55) {
        const goldFound = Math.floor(Math.random() * 12) + 4;
        state.player.gold = (state.player.gold || 0) + goldFound;
        log(window.Lore && Lore.loot ? Lore.loot.foundGold(goldFound) : `You found ${goldFound} gold!`, true);
    } else if (Math.random() < 0.35) {
        // small potion find
        addToInventory({ id: Date.now(), name: "Health Potion", type: "consumable", bonus: 30, desc: "Restores 30 HP", quantity: 1 });
        log("You found a Health Potion!", true);
    } else {
        log(window.Lore && Lore.loot ? Lore.loot.nothing : "Nothing of value here.");
        if (Math.random() < 0.4 && (state.location === 'woods' || state.location === 'ruins')) {
            log(window.Lore && Lore.loot ? Lore.loot.danger : "Something stirs...");
            setTimeout(() => startCombat(state.location === 'ruins' ? 'skeleton' : 'beast'), 600);
            return;
        }
    }
    updateAll();
    save();
}

// === Combat System (fixes combat buttons) ===
function startCombat(enemyKey = 'beast') {
    state.inCombat = true;
    const combatEl = $('combat');
    if (combatEl) combatEl.classList.remove('hidden');

    const enemyTemplates = {
        beast: { name: "Corrupted Beast", hp: 38, maxHp: 38, dmg: 7, img: "assets/creatures/beast.jpg" },
        skeleton: { name: "Skeletal Warrior", hp: 52, maxHp: 52, dmg: 9, img: "assets/creatures/skeleton.jpg" }
    };

    state.enemy = JSON.parse(JSON.stringify(enemyTemplates[enemyKey] || enemyTemplates.beast));

    // UI
    const enName = $('enemy-name'); if (enName) enName.textContent = state.enemy.name;
    const enHp = $('enemy-hp'); if (enHp) enHp.textContent = state.enemy.hp;
    const enMax = $('enemy-max'); if (enMax) enMax.textContent = state.enemy.maxHp;
    const enBar = $('enemy-hp-bar'); if (enBar) enBar.style.width = '100%';

    const enImg = $('enemy-img');
    if (enImg) {
        enImg.src = state.enemy.img || '';
        enImg.style.display = state.enemy.img ? 'block' : 'none';
        enImg.onerror = () => { enImg.style.display = 'none'; };
    }

    const clog = $('combat-log');
    if (clog) {
        const startMsg = (window.Lore && Lore.combatStart && Lore.combatStart[ state.location === 'ruins' ? 'ruins' : 'default' ]) 
            ? (typeof Lore.combatStart[ state.location === 'ruins' ? 'ruins' : 'default' ] === 'function' 
                ? Lore.combatStart[ state.location === 'ruins' ? 'ruins' : 'default' ](state.enemy.name) 
                : Lore.combatStart[ state.location === 'ruins' ? 'ruins' : 'default' ]) 
            : `A <b>${state.enemy.name}</b> lunges at you!`;
        clog.innerHTML = `<div>${startMsg}</div>`;
    }

    renderCombatButtons();
    $('actions').innerHTML = ''; // clear exploration buttons
}

function renderCombatButtons() {
    const cont = $('combat-buttons');
    if (!cont) return;
    cont.innerHTML = '';

    const makeBtn = (label, fn, extraClass = '') => {
        const b = document.createElement('button');
        b.className = `py-2.5 px-3 text-xs font-semibold rounded-xl transition ${extraClass || 'bg-zinc-700 hover:bg-zinc-600'}`;
        b.textContent = label;
        b.onclick = fn;
        return b;
    };

    cont.appendChild(makeBtn('⚔️ Sword Attack', () => playerAttack('sword')));
    cont.appendChild(makeBtn('🔥 Firebolt', () => castSpell('Firebolt')));
    if (state.player.spells && state.player.spells.includes('Ice Shard')) {
        cont.appendChild(makeBtn('❄️ Ice Shard', () => castSpell('Ice Shard')));
    }
    if (state.player.spells && state.player.spells.includes('Heal')) {
        cont.appendChild(makeBtn('💚 Heal', () => castSpell('Heal')));
    }
    cont.appendChild(makeBtn('🛡️ Defend', defend));
    cont.appendChild(makeBtn('🏃 Flee', fleeCombat, 'bg-red-900/70 hover:bg-red-800'));
}

function playerAttack(type = 'sword') {
    if (!state.inCombat || !state.enemy) return;
    const clog = $('combat-log');
    let dmg = 4 + (state.player.str || 5) + (state.player.weapon && state.player.weapon.bonus ? state.player.weapon.bonus : 0);
    if (type === 'sword') dmg = Math.floor(dmg * (0.9 + Math.random() * 0.3));

    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    if (clog) clog.innerHTML += `<div class="text-emerald-400">You strike for <b>${dmg}</b> damage.</div>`;

    updateEnemyUI();
    if (state.enemy.hp <= 0) { endCombat(true); return; }

    setTimeout(enemyAttack, 650);
}

function castSpell(spellName) {
    if (!state.inCombat || !state.enemy) return;
    const spell = SPELLS[spellName];
    if (!spell) return;
    if ((state.player.mp || 0) < spell.cost) {
        const clog = $('combat-log'); if (clog) clog.innerHTML += `<div class="text-red-400">Not enough MP!</div>`;
        return;
    }
    state.player.mp -= spell.cost;

    const clog = $('combat-log');
    let dmgOrHeal = Math.floor(spell.baseDmg + (state.player.int || 5) * spell.scale * (0.85 + Math.random()*0.3));

    if (spell.type === 'heal') {
        const heal = Math.min(dmgOrHeal, (state.player.maxHp || 50) - (state.player.hp || 0));
        state.player.hp = (state.player.hp || 0) + heal;
        if (clog) clog.innerHTML += `<div class="text-emerald-400">You cast ${spellName} and heal <b>${heal}</b> HP.</div>`;
        updateStats();
    } else {
        state.enemy.hp = Math.max(0, state.enemy.hp - dmgOrHeal);
        if (clog) clog.innerHTML += `<div class="text-sky-400">${spellName} hits for <b>${dmgOrHeal}</b> damage!</div>`;
        updateEnemyUI();
        if (state.enemy.hp <= 0) { endCombat(true); return; }
    }

    updateStats();
    setTimeout(enemyAttack, 700);
}

function defend() {
    if (!state.inCombat) return;
    const clog = $('combat-log');
    if (clog) clog.innerHTML += `<div class="text-zinc-400">You brace for impact...</div>`;
    // Reduced enemy damage next
    state._defending = true;
    setTimeout(enemyAttack, 500);
}

function enemyAttack() {
    if (!state.inCombat || !state.enemy) return;
    const clog = $('combat-log');
    let edmg = state.enemy.dmg || 6;
    if (state._defending) { edmg = Math.floor(edmg * 0.5); state._defending = false; }
    const actual = Math.max(1, edmg - Math.floor((state.player.def || 3) * 0.6));
    state.player.hp = Math.max(0, (state.player.hp || 0) - actual);

    if (clog) clog.innerHTML += `<div class="text-red-400">${state.enemy.name} hits you for <b>${actual}</b> damage.</div>`;
    updateStats();
    updateEnemyUI();

    if ((state.player.hp || 0) <= 0) {
        endCombat(false);
    }
}

function updateEnemyUI() {
    if (!state.enemy) return;
    const eh = $('enemy-hp'); if (eh) eh.textContent = Math.max(0, state.enemy.hp);
    const bar = $('enemy-hp-bar');
    if (bar && state.enemy.maxHp) bar.style.width = Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100) + '%';
}

function fleeCombat() {
    if (!state.inCombat) return;
    const success = Math.random() < 0.6;
    const clog = $('combat-log');
    if (success) {
        if (clog) clog.innerHTML += `<div>You successfully fled!</div>`;
        setTimeout(() => endCombat(false), 400); // treat as no victory loot
    } else {
        if (clog) clog.innerHTML += `<div class="text-red-400">Flee failed!</div>`;
        setTimeout(enemyAttack, 400);
    }
}

function endCombat(victory) {
    state.inCombat = false;
    const combatEl = $('combat');
    if (combatEl) combatEl.classList.add('hidden');
    const cbtns = $('combat-buttons'); if (cbtns) cbtns.innerHTML = '';

    if (victory && state.enemy) {
        const xpG = Math.floor((state.enemy.maxHp || 30) / 2) + 8;
        const gG = Math.floor(Math.random() * 9) + 6;
        state.player.xp = (state.player.xp || 0) + xpG;
        state.player.gold = (state.player.gold || 0) + gG;
        state.kills = (state.kills || 0) + 1;

        log(`<b>Victory!</b> +${xpG} XP, +${gG} gold. Kills: ${state.kills}`, true);

        if (state.kills >= 3 && state.quest === 1) {
            log("You feel ready to report back to the Elder.", true);
        }
        checkLevelUp();
    } else if (!victory && (state.player.hp || 0) <= 0) {
        log("You collapse... The village wards protect you as you recover.", true);
        state.player.hp = Math.max(8, Math.floor((state.player.maxHp || 50) * 0.35));
    }

    state.enemy = null;
    state._defending = false;

    updateAll();
    renderActions();
    save();
}

// Level up
function checkLevelUp() {
    const p = state.player;
    while ((p.xp || 0) >= 100) {
        p.xp -= 100;
        p.level = (p.level || 1) + 1;
        p.str = (p.str || 5) + 1;
        p.int = (p.int || 5) + 1;
        p.def = (p.def || 3) + 1;
        p.maxHp = (p.maxHp || 50) + 8;
        p.hp = p.maxHp;
        p.maxMp = 20 + Math.floor(p.int * 2.2);
        p.mp = p.maxMp;

        log(window.Lore && Lore.levelUp ? Lore.levelUp(p.level) : `<b>LEVEL UP!</b> You are now Level ${p.level}!`, true);
        // Unlock new spell at certain levels
        if (p.level === 3 && !p.spells.includes('Ice Shard')) {
            p.spells.push('Ice Shard');
            log("<b>New Spell:</b> Ice Shard unlocked!", true);
        }
        if (p.level === 5 && !p.spells.includes('Heal')) {
            p.spells.push('Heal');
            log("<b>New Spell:</b> Heal unlocked!", true);
        }
    }
    recalculateMaxStats(); // from core
}

// === Inventory (dynamic modal) ===
function showInventory() {
    let modal = document.getElementById('inventory-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inventory-modal';
        modal.className = 'fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4';
        modal.innerHTML = `
            <div onclick="event.target.id==='inventory-modal' && hideInventory()" class="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-5">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-xl flex items-center gap-2"><i class="fas fa-box"></i> Inventory</h3>
                    <button onclick="hideInventory()" class="text-2xl leading-none text-zinc-400 hover:text-white">&times;</button>
                </div>
                <div id="inv-content" class="max-h-[55vh] overflow-auto pr-1 space-y-2"></div>
                <div class="mt-4 text-xs flex justify-between text-zinc-400">
                    <span>Gold: <span id="inv-gold" class="font-bold text-yellow-400"></span></span>
                    <span class="cursor-pointer underline" onclick="hideInventory(); showShop()">Open Shop</span>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    renderInventoryList(modal);
    modal.style.display = 'flex';
}

function hideInventory() {
    const m = document.getElementById('inventory-modal');
    if (m) m.style.display = 'none';
}

function renderInventoryList(modal) {
    const content = modal.querySelector('#inv-content');
    const goldSpan = modal.querySelector('#inv-gold');
    if (goldSpan) goldSpan.textContent = state.player.gold || 0;
    content.innerHTML = '';

    const inv = state.inventory || [];
    if (inv.length === 0) {
        content.innerHTML = '<p class="text-sm text-zinc-400 p-3">Your inventory is empty.</p>';
        return;
    }

    inv.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'item-row flex justify-between items-center bg-zinc-800 hover:bg-zinc-700/80 p-3 rounded-2xl cursor-pointer';
        el.innerHTML = `
            <div class="min-w-0">
                <div class="font-medium">${item.name} ${item.quantity > 1 ? '×' + item.quantity : ''}</div>
                <div class="text-[10px] text-zinc-400">${item.desc || item.type || ''}</div>
            </div>
            <div class="flex gap-1.5">
                <button class="use-btn text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium">${item.type === 'consumable' ? 'Use' : 'Equip'}</button>
                <button class="drop-btn text-xs px-3 py-1 bg-red-700 hover:bg-red-600 rounded-xl">Drop</button>
            </div>`;

        el.querySelector('.use-btn').onclick = (e) => { e.stopImmediatePropagation(); useOrEquipItem(index); };
        el.querySelector('.drop-btn').onclick = (e) => { e.stopImmediatePropagation(); dropItem(index); };
        content.appendChild(el);
    });
}

function useOrEquipItem(index) {
    const item = state.inventory[index];
    if (!item) return;

    if (item.type === 'consumable') {
        if (item.name.includes('Health')) {
            state.player.hp = Math.min(state.player.maxHp, (state.player.hp || 0) + (item.bonus || 30));
            log(`Used ${item.name}. +${item.bonus || 30} HP`, true);
        } else if (item.name.includes('Mana')) {
            state.player.mp = Math.min(state.player.maxMp, (state.player.mp || 0) + (item.bonus || 20));
            log(`Used ${item.name}. +${item.bonus || 20} MP`, true);
        }
        // reduce qty
        if (item.quantity > 1) item.quantity--; else state.inventory.splice(index, 1);
    } else if (item.type === 'weapon') {
        // swap
        const old = state.player.weapon;
        state.player.weapon = { name: item.name, bonus: item.bonus || 3 };
        if (old && old.name !== 'Rusty Sword') {
            addToInventory(old); // return old
        }
        state.inventory.splice(index, 1);
        log(`Equipped ${item.name}.`, true);
    } else if (item.type === 'armor') {
        const old = state.player.armor;
        state.player.armor = { name: item.name, bonus: item.bonus || 2 };
        if (old && old.name !== 'Cloth Tunic') addToInventory(old);
        state.inventory.splice(index, 1);
        log(`Equipped ${item.name}.`, true);
    }

    hideInventory();
    updateAll();
    save();
    // re-open to refresh
    setTimeout(showInventory, 120);
}

function dropItem(index) {
    if (confirm('Drop this item?')) {
        state.inventory.splice(index, 1);
        hideInventory();
        updateAll();
        save();
        setTimeout(showInventory, 100);
    }
}

function addToInventory(item) {
    if (!state.inventory) state.inventory = [];
    // stack consumables
    const existing = state.inventory.findIndex(i => i.name === item.name && i.type === 'consumable');
    if (existing >= 0 && item.type === 'consumable') {
        state.inventory[existing].quantity = (state.inventory[existing].quantity || 1) + (item.quantity || 1);
    } else {
        state.inventory.push(item);
    }
}

// === Shop (simple dynamic modal) ===
function showShop() {
    let modal = document.getElementById('shop-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'shop-modal';
        modal.className = 'fixed inset-0 z-[96] flex items-center justify-center bg-black/80 p-4';
        modal.innerHTML = `
            <div onclick="event.target.id==='shop-modal' && hideShop()" class="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-5">
                <div class="flex justify-between mb-4">
                    <h3 class="font-bold text-xl"><i class="fas fa-store mr-2"></i> Village Shop</h3>
                    <button onclick="hideShop()" class="text-xl">&times;</button>
                </div>
                <div id="shop-list" class="space-y-2 max-h-[50vh] overflow-auto"></div>
                <div class="text-xs text-zinc-400 mt-3">Your gold: <span id="shop-gold"></span></div>
            </div>`;
        document.body.appendChild(modal);
    }
    const list = modal.querySelector('#shop-list');
    const goldEl = modal.querySelector('#shop-gold');
    goldEl.textContent = state.player.gold || 0;
    list.innerHTML = '';

    const shopItems = [
        { name: "Iron Sword", type: "weapon", bonus: 5, price: 45, desc: "+5 attack" },
        { name: "Leather Armor", type: "armor", bonus: 4, price: 35, desc: "+4 defense" },
        { name: "Health Potion", type: "consumable", bonus: 30, price: 12, desc: "Restores 30 HP", quantity: 1 },
        { name: "Mana Potion", type: "consumable", bonus: 20, price: 15, desc: "Restores 20 MP", quantity: 1 },
        { name: "Spell Tome: Ice Shard", type: "spell", price: 60, desc: "Learn Ice Shard" }
    ];

    shopItems.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'flex justify-between items-center p-3 bg-zinc-800 rounded-2xl';
        row.innerHTML = `
            <div>
                <div class="font-medium">${item.name}</div>
                <div class="text-xs text-zinc-400">${item.desc} • ${item.price}g</div>
            </div>
            <button class="buy-btn text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-2xl font-semibold">Buy</button>`;
        row.querySelector('.buy-btn').onclick = () => buyItem(item, modal);
        list.appendChild(row);
    });

    modal.style.display = 'flex';
}

function hideShop() {
    const m = document.getElementById('shop-modal');
    if (m) m.style.display = 'none';
}

function buyItem(item, modal) {
    if ((state.player.gold || 0) < item.price) {
        alert('Not enough gold!');
        return;
    }
    state.player.gold -= item.price;

    if (item.type === 'spell') {
        if (!state.player.spells.includes('Ice Shard')) {
            state.player.spells.push('Ice Shard');
            log(`Learned ${item.name}!`, true);
        } else {
            state.player.gold += item.price; // refund
            alert('You already know that spell.');
            return;
        }
    } else {
        addToInventory({ ...item, id: Date.now() });
        log(`Purchased ${item.name}.`, true);
    }

    // refresh shop gold
    const goldEl = modal.querySelector('#shop-gold');
    if (goldEl) goldEl.textContent = state.player.gold;
    updateAll();
    save();
}

// === Other UI functions ===
function showStats() {
    let modal = document.getElementById('stats-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'stats-modal';
        modal.className = 'fixed inset-0 z-[94] flex items-center justify-center bg-black/80 p-4';
        modal.innerHTML = `
            <div class="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-sm w-full p-6">
                <h3 class="font-bold text-xl mb-4 flex items-center gap-2"><i class="fas fa-user"></i> Character Sheet</h3>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4" id="stats-content"></div>
                <button onclick="hideStats()" class="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">Close</button>
            </div>`;
        document.body.appendChild(modal);
    }
    const content = modal.querySelector('#stats-content');
    const p = state.player;
    content.innerHTML = `
        <div>Name</div><div class="font-semibold">${p.name}</div>
        <div>Level</div><div class="font-semibold">${p.level}</div>
        <div>HP / Max</div><div>${p.hp} / ${p.maxHp}</div>
        <div>MP / Max</div><div>${p.mp} / ${p.maxMp}</div>
        <div>XP</div><div>${p.xp || 0} / 100</div>
        <div>Gold</div><div class="text-yellow-400">${p.gold}</div>
        <div>STR</div><div>${p.str} (+${p.weapon ? p.weapon.bonus : 0})</div>
        <div>INT</div><div>${p.int}</div>
        <div>DEF</div><div>${p.def} (+${p.armor ? p.armor.bonus : 0})</div>
        <div>Weapon</div><div class="text-emerald-300">${p.weapon ? p.weapon.name : 'None'}</div>
        <div>Armor</div><div class="text-emerald-300">${p.armor ? p.armor.name : 'None'}</div>
        <div>Spells</div><div class="col-span-1 text-xs">${(p.spells || []).join(', ')}</div>
    `;
    modal.style.display = 'flex';
}

function hideStats() {
    const m = document.getElementById('stats-modal');
    if (m) m.style.display = 'none';
}

function renameCharacter() {
    const newName = prompt('Enter new name for your Spellblade:', state.player.name || 'Aether');
    if (newName && newName.trim()) {
        state.player.name = newName.trim();
        updateStats();
        save();
        log(`You are now known as ${state.player.name}.`, true);
    }
}

function exportLogs() {
    const text = (state.story || []).map(s => s.msg.replace(/<[^>]*>/g, '')).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spellblade-logs.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Map functions (for modal buttons)
let mapZoomLevel = 1;
function showMap() {
    const modal = $('map-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function hideMap() {
    const modal = $('map-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.add('hidden');
}

function zoomMap(delta) {
    mapZoomLevel = Math.max(0.6, Math.min(2.8, mapZoomLevel + delta));
    const content = $('map-content');
    if (content) content.style.transform = `scale(${mapZoomLevel})`;
    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mapZoomLevel * 100) + '%';
}

function resetMapZoom() {
    mapZoomLevel = 1;
    const content = $('map-content');
    if (content) content.style.transform = 'scale(1)';
    const zl = $('zoom-level');
    if (zl) zl.textContent = '100%';
}

// Initialize enhancements (called from index.html onload)
function initializeGameEnhancements() {
    // Future: map drag, keyboard shortcuts, PWA install prompt, etc.
    // For now ensures actions render correctly after load
    if (typeof renderActions === 'function' && !state.inCombat) {
        // already called via updateAll in init
    }
    console.log('%c[Spellblade] Game enhancements ready.', 'color:#555');
}

// Make sure updateAll and init work even if core partially loaded
if (typeof window.updateAll !== 'function') {
    window.updateAll = function() {
        if (typeof updateStats === 'function') updateStats();
        if (typeof renderActions === 'function') renderActions();
        if (typeof renderStory === 'function') renderStory();
    };
}

// Initial safety render after scripts load
setTimeout(() => {
    if (typeof updateAll === 'function') updateAll();
}, 1200);
