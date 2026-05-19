// game.js - Full UI, Combat, Exploration, Inventory, Modals for modular Spellblade Chronicles
// Depends on core.js (state, log, save, updateAll, init) and lore.js (Lore)

function $(id) { return document.getElementById(id); }

// Re-declare or ensure render/update from core/game
// (they are defined here for completeness)

function renderStory() {
    const el = $('story');
    if (!el) return;
    el.innerHTML = '';
    state.story.slice(-9).forEach(s => {
        const p = document.createElement('p');
        p.className = `mb-1.5 text-sm ${s.important ? 'text-amber-300 font-medium' : 'text-zinc-300'}`;
        p.innerHTML = s.msg;
        el.appendChild(p);
    });
}

function updateStats() {
    const p = state.player;
    const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    const setWidth = (id, pct) => { const el = $(id); if (el) el.style.width = Math.max(0, pct) + '%'; };

    setText('player-name', p.name);
    setText('level', p.level);
    setText('hp', `${p.hp}/${p.maxHp}`);
    setText('mp', `${p.mp}/${p.maxMp}`);
    setText('xp', `${p.xp}/${p.level * 80 + 20}`);
    setText('gold', p.gold);
    setText('str', p.str);
    setText('int', p.int);
    setText('def', p.def);
    setWidth('hp-bar', (p.hp / p.maxHp) * 100);
    setWidth('mp-bar', (p.mp / p.maxMp) * 100);
    setText('location', state.locationName);
}

function updateAll() {
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderActions === 'function') renderActions();
    if (typeof renderStory === 'function') renderStory();
}

// ==================== RENDER ACTIONS & TRAVEL ====================
function renderActions() {
    const c = $('actions');
    if (!c) return;
    c.innerHTML = '';
    if (state.inCombat) {
        $('combat').classList.remove('hidden');
        renderCombatButtons();
        return;
    }
    $('combat').classList.add('hidden');
    let html = '';
    const loc = state.location;
    if (loc === 'village') {
        html += `<button onclick="openNPCDialogue('elder')" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-user-tie text-amber-400 w-5"></i><span>Talk to Elder</span></button>`;
        html += `<button onclick="openNPCDialogue('merchant')" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-store text-emerald-400 w-5"></i><span>Visit Merchant</span></button>`;
        html += `<button onclick="restInn()" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-bed text-blue-400 w-5"></i><span>Rest at Inn (10g)</span></button>`;
        html += `<button onclick="travel('woods')" class="rpg-btn bg-orange-900/70 hover:bg-orange-800 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-tree text-orange-400 w-5"></i><span>Enter Whispering Woods</span></button>`;
    } else if (loc === 'woods') {
        html += `<button onclick="startFight()" class="rpg-btn bg-red-900/70 hover:bg-red-800 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-skull text-red-400 w-5"></i><span>Look for Combat</span></button>`;
        html += `<button onclick="searchLoot()" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-search text-amber-400 w-5"></i><span>Search for Loot</span></button>`;
        html += `<button onclick="travel('village')" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-home text-emerald-400 w-5"></i><span>Return to Village</span></button>`;
        html += `<button onclick="travel('ruins')" class="rpg-btn bg-purple-900/70 hover:bg-purple-800 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-archway text-purple-400 w-5"></i><span>Go to Ruined Temple</span></button>`;
    } else if (loc === 'ruins') {
        html += `<button onclick="searchTempleHall()" class="rpg-btn bg-purple-900/70 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-search w-5"></i><span>Search the Hall</span></button>`;
        html += `<button onclick="descendDeeper()" class="rpg-btn bg-purple-900/70 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-arrow-down w-5"></i><span>Descend Deeper</span></button>`;
        html += `<button onclick="investigateAltar()" class="rpg-btn bg-purple-900/70 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-gem w-5"></i><span>Investigate Altar</span></button>`;
        html += `<button onclick="travel('woods')" class="rpg-btn bg-zinc-800 hover:bg-zinc-700 p-3 rounded-2xl flex gap-3 items-center text-left"><i class="fas fa-arrow-left text-emerald-400 w-5"></i><span>Back to Woods</span></button>`;
    }
    c.innerHTML = html;
}

function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;
    if (newLoc === 'village') state.locationName = "Eldoria Village Square";
    else if (newLoc === 'woods') {
        state.locationName = "Whispering Woods";
        if (old !== 'woods') log(Lore.travel.woods || "You enter the dark woods...", true);
    } else if (newLoc === 'ruins') {
        state.locationName = "Ruined Temple";
        if (old !== 'ruins') log(Lore.travel.ruins || "You enter the ancient temple...", true);
    }
    showAreaPortrait(newLoc);
    updateAll();
    save();
}

function showAreaPortrait(loc) {
    const p = $('area-portrait');
    const img = $('area-portrait-img');
    const cap = $('area-portrait-caption');
    if (!p || !img || !cap) return;
    p.classList.remove('hidden');
    if (loc === 'village') {
        img.style.display = 'none';
        cap.innerHTML = 'The quiet village square. The Elder awaits.';
    } else if (loc === 'woods') {
        img.style.display = 'none';
        cap.innerHTML = 'Twisted trees whisper secrets and dangers.';
    } else if (loc === 'ruins') {
        img.style.display = 'none';
        cap.innerHTML = 'Ancient stones hum with forgotten power.';
    }
}

// ==================== CREATURE IMAGES ====================
function getCreatureImagePath(name) {
    if (!name) return null;
    const n = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const mapping = {
        'goblin-scout': 'goblin-scout.jpg',
        'forest-wolf': 'forest-wolf.jpg',
        'shadow-stalker': 'shadow-stalker.jpg',
        'corrupted-wolf': 'forest-wolf.jpg',
        'skeleton-warrior': 'skeleton-warrior.jpg',
        'temple-guardian': 'temple-guardian.jpg',
        'fallen-spellblade': 'fallen-spellblade.jpg'
    };
    const file = mapping[n];
    return file ? `assets/creatures/${file}` : null;
}

function setEnemyVisual() {
    const img = $('enemy-img');
    if (!img || !state.enemy) {
        if (img) img.style.display = 'none';
        return;
    }
    const src = getCreatureImagePath(state.enemy.name);
    if (src) {
        img.src = src;
        img.style.display = 'block';
        img.onerror = () => {
            img.style.display = 'none';
            console.log('Creature image not found or failed to load:', src);
        };
    } else {
        img.style.display = 'none';
    }
}

// ==================== COMBAT ====================
function startFight() {
    let pool = [
        {name: "Goblin Scout", hp: 24, maxHp: 24, atk: 7, def: 2, xp: 18, gold: 7},
        {name: "Forest Wolf", hp: 34, maxHp: 34, atk: 9, def: 3, xp: 26, gold: 10}
    ];
    if (state.player.level >= 2) {
        pool.push({name: "Shadow Stalker", hp: 30, maxHp: 30, atk: 11, def: 3, xp: 34, gold: 13});
    }
    if (state.location === 'ruins' || state.quest >= 2) {
        pool.push({name: "Corrupted Wolf", hp: 38, maxHp: 38, atk: 10, def: 4, xp: 40, gold: 15});
    }
    state.enemy = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
    setEnemyVisual();
    state.inCombat = true;
    const logEl = $('combat-log');
    if (logEl) logEl.innerHTML = '';
    const startMsg = (state.location === 'ruins' && Lore.combatStart.ruins) ? Lore.combatStart.ruins : (Lore.combatStart.default ? Lore.combatStart.default(state.enemy.name) : `A <b>${state.enemy.name}</b> appears!`);
    addCombatLog(startMsg);
    updateCombatUI();
    renderActions();
}

function addCombatLog(msg) {
    const el = $('combat-log');
    if (!el) return;
    const d = document.createElement('div');
    d.className = 'mb-0.5';
    d.innerHTML = msg;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
}

function updateCombatUI() {
    if (!state.enemy) return;
    const e = state.enemy;
    const set = (id, v) => { const el = $(id); if (el) el.innerHTML = v; };
    set('enemy-name', e.name);
    set('enemy-hp', e.hp);
    set('enemy-max', e.maxHp);
    const bar = $('enemy-hp-bar');
    if (bar) bar.style.width = Math.max(0, (e.hp / e.maxHp) * 100) + '%';
}

function endCombatWin() {
    const e = state.enemy;
    const p = state.player;
    if (!e) return;
    p.gold += e.gold || 8;
    p.xp += e.xp || 20;
    state.kills++;

    if (state.quest === 1 && state.kills >= 3) {
        log("<b>Quest progress:</b> You have slain enough beasts for the Elder.", true);
    }

    if (p.xp >= p.level * 80 + 20) {
        p.level++;
        p.xp = 0;
        p.maxHp += 8;
        p.hp = p.maxHp;
        p.str += 1;
        p.int += 1;
        p.def += 1;
        recalculateMaxStats();
        log(Lore.levelUp ? Lore.levelUp(p.level) : `<b>LEVEL UP!</b> Now Level ${p.level}!`, true);
        if (p.level === 3 && !p.spells.includes("Ice Shard")) {
            p.spells.push("Ice Shard");
            log("<b>New Spell!</b> You learned Ice Shard!", true);
        }
        if (p.level === 5 && !p.spells.includes("Heal")) {
            p.spells.push("Heal");
            log("<b>New Spell!</b> You learned Heal!", true);
        }
    }
    endCombat();
}

function endCombat() {
    state.inCombat = false;
    state.enemy = null;
    const img = $('enemy-img');
    if (img) {
        img.style.display = 'none';
        img.src = '';
    }
    const combatEl = $('combat');
    if (combatEl) combatEl.classList.add('hidden');
    const btns = $('combat-buttons');
    if (btns) btns.innerHTML = '';
    renderActions();
    updateAll();
    save();
}

function enemyAttack() {
    if (!state.inCombat || !state.enemy) return;
    const e = state.enemy;
    const p = state.player;
    let dmg = Math.max(1, (e.atk || 7) + Math.floor(Math.random() * 4) - (p.def || 0));
    p.hp = Math.max(0, p.hp - dmg);
    addCombatLog(`<b>${e.name}</b> strikes you for <span class="text-red-400 font-bold">${dmg}</span> damage!`);
    updateStats();
    if (p.hp <= 0) {
        addCombatLog("<b style='color:#f87171'>You fall unconscious...</b>");
        setTimeout(() => {
            endCombat();
            p.hp = Math.max(5, Math.floor(p.maxHp * 0.25));
            state.location = "village";
            state.locationName = "Eldoria Village Square";
            log("You awaken in the village square, patched up by the healer.", true);
            updateAll();
            save();
        }, 1100);
    }
}

// Combat actions
function swordAttack() {
    if (!state.inCombat || !state.enemy) return;
    const e = state.enemy;
    const p = state.player;
    const wBonus = (p.weapon && p.weapon.bonus) || 0;
    const dmg = Math.max(2, p.str + wBonus - (e.def || 0) + Math.floor(Math.random() * 4));
    e.hp -= dmg;
    addCombatLog(`You strike with your <b>${p.weapon ? p.weapon.name : 'blade'}</b> for <span class="text-red-400">${dmg}</span> damage.`);
    updateCombatUI();
    if (e.hp <= 0) {
        addCombatLog(`<b>${e.name}</b> is slain!`);
        setTimeout(endCombatWin, 550);
        return;
    }
    setTimeout(enemyAttack, 650);
}

function castSpell() {
    if (!state.inCombat || !state.enemy) return;
    const p = state.player;
    const spells = p.spells || ["Firebolt"];
    if (spells.length > 1) {
        if (spells.includes("Ice Shard") && p.mp >= 8) {
            castIceShard();
        } else {
            castFirebolt();
        }
    } else {
        castFirebolt();
    }
}

function castFirebolt() {
    if (!state.inCombat || !state.enemy) return;
    const p = state.player;
    const spell = Lore.spells["Firebolt"] || {cost:5, baseDmg:8, scaling:1.5};
    if (p.mp < spell.cost) { addCombatLog("Not enough MP!"); return; }
    p.mp -= spell.cost;
    const e = state.enemy;
    const dmg = Math.max(4, Math.floor(p.int * spell.scaling) + spell.baseDmg + Math.floor(Math.random()*3));
    e.hp -= dmg;
    addCombatLog(`<b>Firebolt</b> hits <b>${e.name}</b> for <span class="text-orange-400">${dmg}</span> damage! (-${spell.cost} MP)`);
    updateStats();
    updateCombatUI();
    if (e.hp <= 0) { setTimeout(endCombatWin, 500); return; }
    setTimeout(enemyAttack, 700);
}

function castIceShard() {
    if (!state.inCombat || !state.enemy) return;
    const p = state.player;
    if (!p.spells.includes("Ice Shard")) { addCombatLog("You haven't learned Ice Shard yet."); return; }
    const spell = Lore.spells["Ice Shard"] || {cost:8, baseDmg:12, scaling:1.8};
    if (p.mp < spell.cost) { addCombatLog("Not enough MP!"); return; }
    p.mp -= spell.cost;
    const e = state.enemy;
    const dmg = Math.max(5, Math.floor(p.int * spell.scaling) + spell.baseDmg);
    e.hp -= dmg;
    addCombatLog(`<b>Ice Shard</b> pierces <b>${e.name}</b> for <span class="text-cyan-400">${dmg}</span> damage! (-${spell.cost} MP)`);
    updateStats();
    updateCombatUI();
    if (e.hp <= 0) { setTimeout(endCombatWin, 500); return; }
    setTimeout(enemyAttack, 700);
}

function castHealSpell() {
    if (!state.inCombat) return;
    const p = state.player;
    if (!p.spells.includes("Heal")) { addCombatLog("You don't know Heal yet."); return; }
    const spell = Lore.spells["Heal"] || {cost:10, baseHeal:15, scaling:2.5};
    if (p.mp < spell.cost) { addCombatLog("Not enough MP!"); return; }
    p.mp -= spell.cost;
    const heal = Math.floor(p.int * spell.scaling) + spell.baseHeal;
    p.hp = Math.min(p.maxHp, p.hp + heal);
    addCombatLog(`You cast <b>Heal</b> for <span class="text-emerald-400">${heal}</span> HP! (-${spell.cost} MP)`);
    updateStats();
    setTimeout(enemyAttack, 600);
}

function defend() {
    if (!state.inCombat || !state.enemy) return;
    addCombatLog("You raise your guard, bracing for the hit.");
    setTimeout(() => {
        if (!state.inCombat || !state.enemy) return;
        const e = state.enemy;
        const p = state.player;
        let dmg = Math.max(1, Math.floor(((e.atk || 7) * 0.55) - p.def));
        p.hp = Math.max(0, p.hp - dmg);
        addCombatLog(`Reduced hit for <span class="text-red-400">${dmg}</span> damage.`);
        updateStats();
    }, 450);
}

function flee() {
    if (!state.inCombat) return;
    if (Math.random() < 0.55) {
        addCombatLog("You escape into the shadows!");
        endCombat();
    } else {
        addCombatLog("Flee failed! The enemy attacks!");
        setTimeout(enemyAttack, 350);
    }
}

function renderCombatButtons() {
    const container = $('combat-buttons');
    if (!container) return;
    container.innerHTML = '';
    const makeBtn = (label, fn, icon, bg) => {
        const btn = document.createElement('button');
        btn.className = `${bg} text-white py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.985] transition-transform`;
        btn.innerHTML = `<i class="fas ${icon}"></i> <span>${label}</span>`;
        btn.onclick = fn;
        container.appendChild(btn);
    };
    makeBtn('Sword Attack', swordAttack, 'fa-sword', 'bg-red-600 hover:bg-red-500');
    makeBtn('Cast Spell', castSpell, 'fa-magic', 'bg-blue-600 hover:bg-blue-500');
    makeBtn('Defend', defend, 'fa-shield-alt', 'bg-zinc-700 hover:bg-zinc-600');
    makeBtn('Flee', flee, 'bg-zinc-700 hover:bg-zinc-600');
}

// ==================== WORLD & QUEST ====================
function searchLoot() {
    if (state.inCombat) return;
    const now = Date.now();
    if (now - (state.lastLootTime || 0) < 6505) {
        log("The area feels picked over. Try again later.");
        return;
    }
    state.lastLootTime = now;
    const r = Math.random();
    if (r < 0.6) {
        const g = Math.floor(Math.random() * 14) + 6;
        state.player.gold += g;
        log(Lore.loot.foundGold ? Lore.loot.foundGold(g) : `You found ${g} gold.`, true);
    } else if (r < 0.75) {
        log(Lore.loot.danger || "Something dangerous noticed you!");
        setTimeout(startFight, 300);
        return;
    } else {
        log(Lore.loot.nothing || "Your search yields nothing useful.");
    }
    updateAll();
    save();
}

function restInn() {
    if (state.player.gold < 10) {
        log("You need 10 gold to rest comfortably.");
        return;
    }
    state.player.gold -= 10;
    const heal = Math.floor(state.player.maxHp * 0.55) + 5;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    state.player.mp = Math.min(state.player.maxMp, state.player.mp + 8);
    log(`You rest soundly and recover <b>${heal}</b> HP and some MP.`, true);
    updateAll();
    save();
}

function talkElder() {
    const e = Lore.elder;
    if (state.quest === 0) {
        e.stage0.forEach(l => log(l, true));
        state.quest = 1;
    } else if (state.quest === 1 && state.kills >= 3) {
        e.stage1_complete.forEach(l => log(l, true));
        state.player.gold += 40;
        state.quest = 2;
        log("<b>Quest Updated:</b> The Elder suggests investigating the Ruined Temple.", true);
    } else if (state.quest === 2) {
        e.stage2.forEach(l => log(l, true));
    } else {
        e.default.forEach(l => log(l));
    }
    updateAll();
    save();
}

function searchTempleHall() {
    log("You cautiously search the crumbling hall...");
    if (Math.random() < 0.55) {
        setTimeout(startFight, 200);
    } else {
        const g = 12 + Math.floor(Math.random()*10);
        state.player.gold += g;
        log(`You pry ${g} gold from an old offering box.`);
        updateAll(); save();
    }
}

function descendDeeper() {
    log("The air grows colder as you descend...");
    setTimeout(startFight, 150);
}

function investigateAltar() {
    log("The altar pulses with latent magic. You feel a strange resonance.");
    if (state.player.level >= 3 && Math.random() < 0.4) {
        const bonus = 25;
        state.player.gold += bonus;
        log(`A hidden compartment yields ${bonus} gold and a surge of insight. (+XP small)`, true);
        state.player.xp += 15;
    }
    updateAll(); save();
}

// ==================== SHOP & INVENTORY ====================
function openShop() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-end justify-center z-[200]';
    modal.innerHTML = `
        <div class="bg-zinc-900 w-full max-w-md rounded-t-3xl p-5 pb-8">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-xl">Merchant's Shop</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-3xl leading-none text-zinc-400">&times;</button>
            </div>
            <div id="shop-list" class="space-y-2.5 max-h-[55vh] overflow-auto pr-1"></div>
        </div>`;
    document.body.appendChild(modal);
    const list = modal.querySelector('#shop-list');
    const items = Lore.shopItems || [];
    items.forEach(item => {
        const canAfford = state.player.gold >= item.price;
        const row = document.createElement('div');
        row.className = `p-3.5 rounded-2xl flex justify-between items-center ${canAfford ? 'bg-zinc-800 hover:bg-zinc-700 cursor-pointer' : 'bg-zinc-950 opacity-50'} ${item.isSpecial ? 'border-l-4 border-emerald-500' : ''}`;
        row.innerHTML = `<div><div class="font-semibold ${item.isSpecial ? 'text-emerald-300' : ''}">${item.name}</div><div class="text-xs text-zinc-400">${item.effect}</div></div><div class="font-bold text-emerald-400">${item.price}g</div>`;
        if (canAfford) {
            row.onclick = () => { buyFromShop(item, modal); };
        }
        list.appendChild(row);
    });
}

function buyFromShop(item, modal) {
    if (state.player.gold < item.price) return;
    state.player.gold -= item.price;
    const p = state.player;

    if (item.type === "weapon") {
        if (p.weapon && p.weapon.name !== "Rusty Sword") {
            addToInventory({name: p.weapon.name, type: "weapon", bonus: p.weapon.bonus, desc: "Previously equipped weapon"});
        }
        p.weapon = {name: item.name, bonus: item.bonus};
        log(`Equipped <b>${item.name}</b>!`, true);
    } else if (item.type === "armor") {
        if (p.armor && p.armor.name !== "Cloth Tunic") {
            addToInventory({name: p.armor.name, type:"armor", bonus: p.armor.bonus, desc:"Old armor", healthBonus: p.armor.healthBonus, manaBonus: p.armor.manaBonus});
            if (p.armor.healthBonus) { p.maxHp = Math.max(50, p.maxHp - p.armor.healthBonus); p.hp = Math.min(p.hp, p.maxHp); }
            if (p.armor.manaBonus) { p.maxMp = Math.max(20, p.maxMp - p.armor.manaBonus); p.mp = Math.min(p.mp, p.maxMp); }
            if (p.armor.bonus) p.def = Math.max(0, p.def - p.armor.bonus);
        }
        p.armor = {name: item.name, bonus: item.bonus, healthBonus: item.healthBonus || 0, manaBonus: item.manaBonus || 0};
        if (item.healthBonus) { p.maxHp += item.healthBonus; p.hp += item.healthBonus; }
        if (item.manaBonus) { p.maxMp += item.manaBonus; p.mp += item.manaBonus; }
        if (item.bonus) p.def += item.bonus;
        log(`Equipped <b>${item.name}</b>!`, true);
    } else if (item.type === "spell") {
        if (!p.spells.includes("Ice Shard")) {
            p.spells.push("Ice Shard");
            log("<b>Learned Ice Shard!</b> The tome crumbles to dust.", true);
        } else {
            log("You already know this spell.");
            state.player.gold += item.price; // refund
            return;
        }
    } else if (item.type === "consumable") {
        addToInventory({name: item.name, type: "consumable", bonus: item.bonus, desc: item.effect, quantity: 1});
        log(`Purchased <b>${item.name}</b>.`, true);
    }

    if (modal) modal.remove();
    updateAll();
    save();
}

function addToInventory(itemData) {
    const inv = state.inventory;
    const existing = inv.find(i => i.name === itemData.name && i.type === itemData.type);
    if (existing && existing.type === "consumable") {
        existing.quantity = (existing.quantity || 1) + (itemData.quantity || 1);
    } else {
        inv.push({ id: Date.now(), ...itemData, quantity: itemData.quantity || 1 });
    }
}

function showInventory() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-end justify-center z-[200]';
    let html = `<div class="bg-zinc-900 w-full max-w-md rounded-t-3xl p-5 max-h-[70vh] flex flex-col">
        <div class="flex justify-between mb-3"><h3 class="font-bold text-xl">Inventory</h3><button onclick="this.closest('.fixed').remove()" class="text-2xl">&times;</button></div>
        <div class="flex-1 overflow-auto space-y-2" id="inv-list"></div>
    </div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);
    const list = modal.querySelector('#inv-list');

    if (state.inventory.length === 0) {
        list.innerHTML = `<p class="text-zinc-400 p-4">Your inventory is empty.</p>`;
        return;
    }

    state.inventory.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'bg-zinc-800 p-3 rounded-2xl flex justify-between items-center';
        const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
        row.innerHTML = `<div><b>${item.name}</b>${qty}<div class="text-xs text-zinc-400">${item.desc || item.effect || ''}</div></div>`;

        const actions = document.createElement('div');
        actions.className = 'flex gap-2';

        if (item.type === 'consumable') {
            const useBtn = document.createElement('button');
            useBtn.className = 'px-3 py-1 bg-emerald-700 text-xs rounded-xl';
            useBtn.textContent = 'Use';
            useBtn.onclick = () => { useItem(idx, modal); };
            actions.appendChild(useBtn);
        } else if (item.type === 'weapon' || item.type === 'armor') {
            const eqBtn = document.createElement('button');
            eqBtn.className = 'px-3 py-1 bg-amber-700 text-xs rounded-xl';
            eqBtn.textContent = 'Equip';
            eqBtn.onclick = () => { equipItem(idx, modal); };
            actions.appendChild(eqBtn);
        }

        const dropBtn = document.createElement('button');
        dropBtn.className = 'px-2 py-1 bg-zinc-700 text-xs rounded-xl';
        dropBtn.textContent = 'Drop';
        dropBtn.onclick = () => { dropItem(idx, modal); };
        actions.appendChild(dropBtn);

        row.appendChild(actions);
        list.appendChild(row);
    });
}

function useItem(idx, modal) {
    const item = state.inventory[idx];
    if (!item || item.type !== 'consumable') return;
    const p = state.player;
    if (item.name.includes('Health')) {
        const h = item.bonus || 30;
        p.hp = Math.min(p.maxHp, p.hp + h);
        log(`Used ${item.name}, restored ${h} HP.`);
    } else if (item.name.includes('Mana')) {
        const m = item.bonus || 15;
        p.mp = Math.min(p.maxMp, p.mp + m);
        log(`Used ${item.name}, restored ${m} MP.`);
    }
    item.quantity = (item.quantity || 1) - 1;
    if (item.quantity <= 0) state.inventory.splice(idx, 1);
    if (modal) modal.remove();
    updateAll();
    save();
}

function equipItem(idx, modal) {
    const item = state.inventory[idx];
    if (!item) return;
    const p = state.player;
    if (item.type === 'weapon') {
        if (p.weapon) addToInventory({name: p.weapon.name, type: 'weapon', bonus: p.weapon.bonus});
        p.weapon = {name: item.name, bonus: item.bonus};
        log(`Equipped ${item.name}.`);
    } else if (item.type === 'armor') {
        if (p.armor) addToInventory({name: p.armor.name, type: 'armor', bonus: p.armor.bonus, healthBonus: p.armor.healthBonus, manaBonus: p.armor.manaBonus});
        p.armor = {name: item.name, bonus: item.bonus, healthBonus: item.healthBonus || 0, manaBonus: item.manaBonus || 0};
        if (item.healthBonus) { p.maxHp += item.healthBonus; p.hp += item.healthBonus; }
        if (item.manaBonus) { p.maxMp += item.manaBonus; p.mp += item.manaBonus; }
        if (item.bonus) p.def += item.bonus;
        log(`Equipped ${item.name}.`);
    }
    state.inventory.splice(idx, 1);
    if (modal) modal.remove();
    updateAll();
    save();
}

function dropItem(idx, modal) {
    if (confirm('Drop this item?')) {
        state.inventory.splice(idx, 1);
        if (modal) modal.remove();
        showInventory(); // refresh
    }
}

// ==================== CHARACTER & MAP ====================
function showStats() {
    const p = state.player;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4';
    modal.innerHTML = `
        <div class="bg-zinc-900 rounded-3xl p-6 w-full max-w-sm">
            <h3 class="font-bold text-2xl mb-4 text-center">${p.name} — Level ${p.level}</h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                <div>HP: <b>${p.hp}/${p.maxHp}</b></div>
                <div>MP: <b>${p.mp}/${p.maxMp}</b></div>
                <div>STR: <b>${p.str}</b></div>
                <div>INT: <b>${p.int}</b></div>
                <div>DEF: <b>${p.def}</b></div>
                <div>XP: <b>${p.xp} / ${p.level*80+20}</b></div>
                <div>Gold: <b class="text-yellow-400">${p.gold}</b></div>
                <div>Kills: <b>${state.kills}</b></div>
            </div>
            <div class="mb-3"><b>Weapon:</b> ${p.weapon ? p.weapon.name + ' (+' + p.weapon.bonus + ')' : 'None'}</div>
            <div class="mb-3"><b>Armor:</b> ${p.armor ? p.armor.name + ' (+' + p.armor.bonus + ')' : 'None'}</div>
            <div class="mb-4"><b>Spells:</b> ${(p.spells || []).join(', ') || 'Firebolt'}</div>
            <button onclick="this.closest('.fixed').remove()" class="w-full py-2.5 bg-zinc-700 rounded-2xl">Close</button>
        </div>`;
    document.body.appendChild(modal);
}

function renameCharacter() {
    const name = prompt('New name for your Spellblade:', state.player.name);
    if (name && name.trim().length > 1) {
        state.player.name = name.trim();
        updateStats();
        save();
    }
}

function showMap() {
    const m = $('map-modal');
    if (!m) {
        alert('Map modal not found in this version. Travel buttons available in actions.');
        return;
    }
    m.classList.remove('hidden');
    m.classList.add('flex');
    setupMapDragging();
}

function hideMap() {
    const m = $('map-modal');
    if (m) { m.classList.remove('flex'); m.classList.add('hidden'); }
}

function zoomMap(d) {
    mapZoom = Math.max(0.6, Math.min(2.8, mapZoom + d));
    applyMapTransform();
}

function resetMapZoom() {
    mapZoom = 1; mapPanX = 0; mapPanY = 0;
    applyMapTransform();
}

function applyMapTransform() {
    const c = $('map-content');
    if (c) c.style.transform = `scale(${mapZoom}) translate(${mapPanX}px, ${mapPanY}px)`;
    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mapZoom * 100) + '%';
}

function setupMapDragging() {
    const content = $('map-content');
    if (!content) return;
    let dragging = false, sx = 0, sy = 0;
    const onMove = (e) => {
        if (!dragging) return;
        const dx = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - sx;
        const dy = (e.clientY || (e.touches && e.touches[0].clientY) || 0) - sy;
        mapPanX += dx * 0.8;
        mapPanY += dy * 0.8;
        applyMapTransform();
        sx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        sy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };
    const onDown = (e) => {
        dragging = true;
        sx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        sy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        window.addEventListener('mousemove', onMove, {passive:true});
        window.addEventListener('mouseup', onUp, {once:true});
        if (e.touches) {
            window.addEventListener('touchmove', onMove, {passive:true});
            window.addEventListener('touchend', onUp, {once:true});
        }
    };
    const onUp = () => {
        dragging = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
    };
    content.onmousedown = onDown;
    content.ontouchstart = onDown;
    content.style.cursor = 'grab';
}

function exportLogs() {
    const text = state.story.map(s => s.msg.replace(/<[^>]*?>/g, '')).join('\n');
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spellblade-chronicles-log.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Intro (called from core init if needed)
function showIntro() {
    const modal = $('intro-modal');
    if (!modal) return;
    const titleEl = $('intro-title');
    const textEl = $('intro-text');
    if (titleEl) titleEl.innerHTML = Lore.intro.title;
    if (textEl) textEl.innerHTML = Lore.intro.paragraphs.map(p => `<p class="mb-2">${p}</p>`).join('');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function startGame(skip) {
    const modal = $('intro-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if (!skip && state.story.length === 0) {
        setTimeout(() => {
            log("The wind carries an unnatural chill through Eldoria tonight.", true);
            log("You stand before the Elder in the village square.");
        }, 250);
    }
    updateAll();
}

// ==================== IMPROVED NPC DIALOGUE SYSTEM ====================
function openNPCDialogue(npcType) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-end justify-center z-[200]';

    let npcName = 'NPC';
    let portraitSrc = null;
    let showQuestsBtn = false;
    let showStoreBtn = false;
    let initialText = 'Hello, adventurer.';
    let talkAction = () => {};

    if (npcType === 'elder') {
        npcName = 'Village Elder';
        portraitSrc = 'assets/npcs/elder.jpg';
        showQuestsBtn = true;
        initialText = 'The Elder regards you with wise, tired eyes. "There is much to discuss, young Spellblade."';
        talkAction = () => {
            const textEl = modal.querySelector('#npc-dialogue-text');
            talkElder();
            if (textEl) {
                let summary = 'The Elder listens carefully to your words.';
                if (state.quest === 1) {
                    summary = `The hunt continues. You have slain <b>${state.kills}</b> of the corrupted beasts.`;
                } else if (state.quest === 2) {
                    summary = 'The shadow in the Ruined Temple grows heavier. Be cautious.';
                }
                textEl.innerHTML = `<p class="text-amber-200">${summary}</p>`;
            }
            if (typeof renderActions === 'function') renderActions();
        };
    } else if (npcType === 'merchant') {
        npcName = 'Merchant';
        portraitSrc = 'assets/npcs/merchant.jpg';
        showStoreBtn = true;
        initialText = 'The merchant gives you a warm smile. "Greetings, traveler. What can I do for you today?"';
        talkAction = () => {
            const textEl = modal.querySelector('#npc-dialogue-text');
            if (textEl) {
                textEl.innerHTML = `<p>"The woods are no place for the unprepared. My goods may keep you alive a little longer."</p>`;
            }
        };
    }

    modal.innerHTML = `
        <div class="bg-zinc-900 w-full max-w-md rounded-t-3xl p-5 pb-8 border-t border-amber-900/50">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-700 bg-zinc-800 flex-shrink-0 shadow-inner">
                        <img id="npc-portrait-img" class="w-full h-full object-cover" style="display:none;" alt="${npcName}">
                        <div id="npc-portrait-fallback" class="w-full h-full flex items-center justify-center text-5xl text-amber-400">
                            <i class="fas fa-user-tie"></i>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-2xl text-amber-300">${npcName}</h3>
                        <div class="text-xs text-zinc-500">Eldoria Village</div>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-3xl leading-none text-zinc-400 hover:text-white">&times;</button>
            </div>

            <div id="npc-dialogue-text" 
                 class="bg-zinc-950 border border-zinc-700 rounded-2xl p-4 mb-5 text-[15px] leading-relaxed text-zinc-200 min-h-[110px] max-h-[160px] overflow-auto shadow-inner">
                ${initialText}
            </div>

            <div class="grid grid-cols-2 gap-2.5" id="dialogue-buttons">
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const portraitImg = modal.querySelector('#npc-portrait-img');
    const fallback = modal.querySelector('#npc-portrait-fallback');
    if (portraitImg && portraitSrc) {
        portraitImg.src = portraitSrc;
        portraitImg.onload = () => { if (fallback) fallback.style.display = 'none'; portraitImg.style.display = 'block'; };
        portraitImg.onerror = () => { if (fallback) fallback.style.display = 'flex'; portraitImg.style.display = 'none'; };
    } else if (fallback) {
        fallback.style.display = 'flex';
    }

    const btnContainer = modal.querySelector('#dialogue-buttons');

    function makeBtn(label, icon, handler, bgClass = 'bg-zinc-800 hover:bg-zinc-700') {
        const b = document.createElement('button');
        b.className = `rpg-btn py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.985] ${bgClass}`;
        b.innerHTML = `<i class="fas ${icon} mr-1.5"></i><span>${label}</span>`;
        b.onclick = handler;
        btnContainer.appendChild(b);
        return b;
    }

    makeBtn('Talk', 'fa-comments', talkAction);

    if (showQuestsBtn) {
        makeBtn('Quests', 'fa-scroll', () => {
            const textEl = modal.querySelector('#npc-dialogue-text');
            if (!textEl) return;

            if (state.quest === 0) {
                textEl.innerHTML = `The Elder leans forward, his voice low and serious:<br><br>"Dark creatures have begun crawling from the Whispering Woods. They were once men and beasts of these lands. I need someone brave enough to slay at least <b>three</b> of them so we can understand what is happening. Will you accept this task?"`;

                btnContainer.innerHTML = '';

                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'rpg-btn py-3 rounded-2xl text-sm flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600';
                acceptBtn.innerHTML = `<i class="fas fa-check mr-1.5"></i><span>Accept Quest</span>`;
                acceptBtn.onclick = () => {
                    state.quest = 1;
                    save();
                    if (typeof renderActions === 'function') renderActions();
                    textEl.innerHTML = `The Elder nods solemnly. "Thank you, Aether. The safety of Eldoria may depend on your courage. Return to me when the deed is done."`;
                    setTimeout(() => {
                        if (!modal.parentNode) return;
                        btnContainer.innerHTML = '';
                        makeBtn('Talk', 'fa-comments', talkAction);
                        makeBtn('Quests', 'fa-scroll', () => {});
                        makeBtn('Goodbye', 'fa-door-open', () => modal.remove(), 'bg-red-900/70');
                    }, 1100);
                };
                btnContainer.appendChild(acceptBtn);

                const declineBtn = document.createElement('button');
                declineBtn.className = 'rpg-btn py-3 rounded-2xl text-sm flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600';
                declineBtn.innerHTML = `<i class="fas fa-times mr-1.5"></i><span>Decline</span>`;
                declineBtn.onclick = () => {
                    textEl.innerHTML = `The Elder sighs softly. "I understand. The burden is heavy. Should you change your mind, I will be here."`;
                    setTimeout(() => {
                        if (!modal.parentNode) return;
                        btnContainer.innerHTML = '';
                        makeBtn('Talk', 'fa-comments', talkAction);
                        makeBtn('Quests', 'fa-scroll', () => {});
                        makeBtn('Goodbye', 'fa-door-open', () => modal.remove(), 'bg-red-900/70');
                    }, 1300);
                };
                btnContainer.appendChild(declineBtn);

            } else if (state.quest === 1) {
                textEl.innerHTML = `The Elder looks at you expectantly.<br><br><b>Beast Slayer</b><br>Slay at least 3 corrupted beasts in the Whispering Woods.<br><br>Current progress: <b class="text-emerald-400">${state.kills} / 3</b>`;
                if (state.kills >= 3) textEl.innerHTML += `<br><span class="text-emerald-400">Ready to report back!</span>`;
            } else if (state.quest === 2) {
                textEl.innerHTML = `The Elder speaks gravely:<br><br>"The Ruined Temple holds answers — and dangers. Whatever ancient evil stirs there must not be allowed to wake. Investigate it carefully."`;
            }
        });
    }

    if (showStoreBtn) {
        makeBtn('Store', 'fa-store', () => { modal.remove(); setTimeout(() => openShop(), 50); });
    }

    makeBtn('Goodbye', 'fa-door-open', () => modal.remove(), 'bg-red-900/70 hover:bg-red-800');
}

console.log("game.js fully loaded - Spellblade Chronicles (fixed)");