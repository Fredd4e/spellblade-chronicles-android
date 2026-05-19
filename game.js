// game.js - Full UI, Combat, Exploration, Inventory, Modals for modular Spellblade Chronicles
// Enhanced v2: Intuitive immersive quest accept/decline in dialogue, robust area background image support (graceful fallback if missing),
// optimized structure, comments for scalability with more quests/areas/NPCs/dungeons.
// Depends on core.js and lore.js

function $(id) { return document.getElementById(id); }

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

// ==================== AREA BACKGROUNDS (NEW - Immersive & Resilient) ====================
// Supports dynamic backgrounds per area. Does NOT break if images missing.
// Falls back to caption-only or subtle gradient. Easy to extend with more areas.
function setAreaBackground(loc) {
    const portrait = $('area-portrait');
    const img = $('area-portrait-img');
    const cap = $('area-portrait-caption');
    if (!portrait || !img || !cap) return;

    portrait.classList.remove('hidden');
    portrait.style.display = 'block';

    const areaData = (window.Lore && Lore.areas && Lore.areas[loc]) ? Lore.areas[loc] : null;
    const bgPath = areaData ? areaData.bgImage : null;
    const captionText = areaData ? areaData.caption : 
        (loc === 'village' ? 'The quiet village square. The Elder awaits.' :
         loc === 'woods' ? 'Twisted trees whisper secrets and dangers.' :
         loc === 'ruins' ? 'Ancient stones hum with forgotten power.' : 'Unknown lands...');

    cap.innerHTML = captionText;

    if (bgPath) {
        img.src = bgPath;
        img.style.display = 'block';
        img.style.objectFit = 'cover';
        img.style.width = '100%';
        img.style.maxHeight = '220px';
        img.style.borderRadius = '16px';
        img.style.border = '1px solid rgba(245, 158, 11, 0.2)';
        img.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.3)';

        img.onerror = () => {
            console.log(`[Spellblade] Background image missing or failed to load: ${bgPath}. Using graceful fallback.`);
            img.style.display = 'none';
            // Fallback: subtle themed gradient or keep clean
            portrait.style.background = loc === 'woods' ? 'linear-gradient(180deg, #1a2a1a 0%, #111827 100%)' :
                                        loc === 'ruins' ? 'linear-gradient(180deg, #2a1f3d 0%, #111827 100%)' :
                                        'linear-gradient(180deg, #1f2937 0%, #111827 100%)';
            portrait.style.borderRadius = '16px';
            portrait.style.padding = '12px';
        };

        img.onload = () => {
            img.onerror = null; // clear previous
            // Optional: dim slightly for text readability if overlay caption
        };
    } else {
        img.style.display = 'none';
        portrait.style.background = 'linear-gradient(180deg, #1f2937 0%, #111827 100%)';
    }
}

// Call this on travel and init for persistent area feel
function showAreaPortrait(loc) {
    setAreaBackground(loc || state.location);
}

// ==================== RENDER ACTIONS & TRAVEL (Optimized - data driven comments for scale) ====================
function renderActions() {
    const c = $('actions');
    if (!c) return;
    c.innerHTML = '';
    if (state.inCombat) {
        $('combat').classList.remove('hidden');
        renderCombatButtons(); // Assumed defined elsewhere or in full file
        return;
    }
    $('combat').classList.add('hidden');
    let html = '';
    const loc = state.location;

    // NOTE for scalability: In future, load actions from Lore.areas[loc].actions or generate dynamically
    // This keeps it simple now while allowing easy extension for new dungeons/areas/NPCs
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
    showAreaBackground(newLoc); // Use new resilient bg function
    updateAll();
    save();
}

// Alias for compatibility
function showAreaBackground(loc) {
    setAreaBackground(loc);
}

// ==================== CREATURE IMAGES (existing, resilient) ====================
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

// ==================== COMBAT (kept from original, with minor quest progress hook) ====================
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

    // Quest progress hook (scalable: check active quests)
    if (state.quest === 1 && state.kills >= 3) {
        log("<b>Quest progress:</b> You have slain enough beasts for the Elder.", true);
    }
    // Future: if (state.quests?.beastSlayer?.status === 'active') { update progress }

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
    addCombatLog(`The <b>${e.name}</b> hits you for <span class="text-red-400">${dmg}</span> damage.`);
    updateCombatUI();
    if (p.hp <= 0) {
        addCombatLog(`<span class="text-red-500 font-bold">You have fallen...</span>`);
        setTimeout(() => {
            alert("You have been defeated. The shadows claim another...");
            location.reload(); // simple restart or implement proper death/respawn
        }, 1200);
    }
}

// Placeholder stubs for other functions referenced (full implementations in original or extend here)
function renderCombatButtons() {
    const container = $('combat-buttons');
    if (!container) return;
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            <button onclick="playerAttack()" class="rpg-btn bg-red-800 hover:bg-red-700">Attack</button>
            <button onclick="castSpell()" class="rpg-btn bg-indigo-800 hover:bg-indigo-700">Cast Spell</button>
            <button onclick="defendAction()" class="rpg-btn bg-zinc-700 hover:bg-zinc-600">Defend</button>
            <button onclick="fleeCombat()" class="rpg-btn bg-amber-800 hover:bg-amber-700">Flee</button>
        </div>
    `;
}

// Add simple combat action stubs if not present elsewhere
function playerAttack() {
    if (!state.inCombat || !state.enemy) return;
    const e = state.enemy;
    const p = state.player;
    let dmg = Math.max(1, (p.str || 5) + (p.equippedWeaponBonus || 0) - (e.def || 0) + Math.floor(Math.random()*3));
    e.hp -= dmg;
    addCombatLog(`You strike the <b>${e.name}</b> for <span class="text-emerald-400">${dmg}</span> damage.`);
    updateCombatUI();
    if (e.hp <= 0) {
        addCombatLog(`<b>You defeated the ${e.name}!</b>`);
        setTimeout(endCombatWin, 600);
    } else {
        setTimeout(enemyAttack, 650);
    }
}

function castSpell() {
    // Simplified - expand with spell selection modal in full version
    if (!state.inCombat || !state.enemy) return;
    const p = state.player;
    if (!p.spells || p.spells.length === 0 || p.mp < 5) {
        addCombatLog("Not enough MP or no spells.");
        return;
    }
    const spell = p.spells[0]; // Use first for demo
    const spellData = Lore.spells[spell];
    if (!spellData) return;
    p.mp = Math.max(0, p.mp - spellData.cost);
    let dmg = Math.floor(spellData.baseDmg + (p.int * spellData.scaling * 0.6));
    state.enemy.hp -= dmg;
    addCombatLog(`You cast <b>${spell}</b> for <span class="text-sky-400">${dmg}</span> damage!`);
    updateCombatUI();
    updateAll();
    if (state.enemy.hp <= 0) {
        setTimeout(endCombatWin, 500);
    } else {
        setTimeout(enemyAttack, 700);
    }
}

function defendAction() {
    if (!state.inCombat) return;
    addCombatLog("You brace for the next attack...");
    updateAll();
    setTimeout(() => {
        if (state.inCombat && state.enemy) {
            const e = state.enemy;
            const p = state.player;
            let dmg = Math.max(1, Math.floor(((e.atk||7) * 0.6) - (p.def||0)));
            p.hp = Math.max(0, p.hp - dmg);
            addCombatLog(`You block most of it but still take <span class="text-red-400">${dmg}</span> damage.`);
            updateCombatUI();
            if (p.hp <= 0) { /* death handled in enemyAttack */ }
        }
    }, 800);
}

function fleeCombat() {
    if (!state.inCombat) return;
    if (Math.random() < 0.6) {
        addCombatLog("You successfully flee!");
        endCombat();
    } else {
        addCombatLog("Couldn't escape!");
        setTimeout(enemyAttack, 400);
    }
}

function searchLoot() { /* original logic or stub */ 
    const r = Math.random();
    if (r < 0.4) {
        const g = 8 + Math.floor(Math.random()*12);
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

function talkElder(modalTextEl = null) {
    const e = Lore.elder;
    let messages = [];

    if (state.quest === 0) {
        messages = e.stage0;
        // Do NOT auto-set quest here anymore for better control via explicit accept
        // state.quest = 1; 
    } else if (state.quest === 1 && state.kills >= 3) {
        messages = e.stage1_complete;
        state.player.gold += 40;
        state.quest = 2;
        messages.push("<b>Quest Updated:</b> The Elder suggests investigating the Ruined Temple.");
    } else if (state.quest === 2) {
        messages = e.stage2;
    } else {
        messages = e.default;
    }

    if (modalTextEl) {
        modalTextEl.innerHTML = messages.map(m => `<p class="mb-1.5">${m}</p>`).join('');
    } else {
        messages.forEach(l => log(l, true));
    }
}

// ==================== IMPROVED IMMERSIVE QUEST DIALOGUE (Main Request) ====================
// Now more intuitive: Quest offers feel like natural conversation choices.
// Prominent, themed Accept/Decline buttons. Scalable for more quests.
function openNPCDialogue(npcType) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-end justify-center z-[200]';

    let npcName = 'NPC';
    let portraitSrc = null;
    let showQuestsBtn = false;
    let showStoreBtn = false;
    let initialText = 'Hello, adventurer.';
    let talkAction = () => {};

    const npcData = (Lore.npcs && Lore.npcs[npcType]) ? Lore.npcs[npcType] : null;
    if (npcData) {
        npcName = npcData.name;
        portraitSrc = npcData.portrait;
    }

    if (npcType === 'elder') {
        showQuestsBtn = true;
        initialText = 'The Elder regards you with wise, tired eyes. "There is much to discuss, young Spellblade."';

        talkAction = () => {
            const textEl = modal.querySelector('#npc-dialogue-text');
            if (!textEl) return;

            // Enhanced immersive talk - context aware quest offer
            if (state.quest === 0) {
                // Immersive quest offer directly in Talk flow
                textEl.innerHTML = `
                    <p class="mb-3">The Elder leans forward, voice low and serious:</p>
                    <p class="mb-3">"Dark creatures have begun crawling from the Whispering Woods. They were once men and beasts of these lands. I need someone brave enough to slay at least <b>three</b> of them so we can understand what is happening."</p>
                    <p class="text-amber-300 text-sm">"Will you accept this task, Aether?"</p>
                `;
                // Replace buttons with immersive Accept / Decline
                const btnContainer = modal.querySelector('#dialogue-buttons');
                btnContainer.innerHTML = '';

                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'rpg-btn py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.985] transition-all';
                acceptBtn.innerHTML = `<i class="fas fa-check-double mr-2"></i><span>I will slay the beasts</span>`;
                acceptBtn.onclick = () => {
                    state.quest = 1;
                    save();
                    if (typeof renderActions === 'function') renderActions();
                    textEl.innerHTML = `<p class="text-emerald-300">The Elder nods solemnly. "Thank you, Aether. The safety of Eldoria may depend on your courage. Return to me when the deed is done."</p>`;
                    setTimeout(() => {
                        if (!modal.parentNode) return;
                        btnContainer.innerHTML = '';
                        makeBtn('Continue', 'fa-comments', () => { modal.remove(); }, 'bg-emerald-800');
                    }, 1400);
                };
                btnContainer.appendChild(acceptBtn);

                const declineBtn = document.createElement('button');
                declineBtn.className = 'rpg-btn py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 active:scale-[0.985] transition-all';
                declineBtn.innerHTML = `<i class="fas fa-times mr-2"></i><span>I need more time...</span>`;
                declineBtn.onclick = () => {
                    textEl.innerHTML = `<p>The Elder sighs softly, but his eyes remain kind. "I understand. The burden is heavy. Should you change your mind, I will be here. The shadows, however, will not wait forever."</p>`;
                    setTimeout(() => {
                        if (!modal.parentNode) return;
                        btnContainer.innerHTML = '';
                        makeBtn('Understood', 'fa-door-open', () => modal.remove(), 'bg-red-900/70');
                    }, 1600);
                };
                btnContainer.appendChild(declineBtn);
            } else {
                talkElder(textEl);
            }
            if (typeof renderStory === 'function') renderStory();
        };
    } else if (npcType === 'merchant') {
        npcName = 'Merchant';
        showStoreBtn = true;
        initialText = 'The merchant gives you a warm smile. "Greetings, traveler. What can I do for you today?"';
        talkAction = () => {
            const textEl = modal.querySelector('#npc-dialogue-text');
            if (textEl) {
                textEl.innerHTML = `<p>"The woods are no place for the unprepared. My goods may keep you alive a little longer. Come browse my wares anytime."</p>`;
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
                 class="bg-zinc-950 border border-zinc-700 rounded-2xl p-4 mb-5 text-[15px] leading-relaxed text-zinc-200 min-h-[110px] max-h-[180px] overflow-auto shadow-inner">
                ${initialText}
            </div>

            <div class="grid grid-cols-2 gap-2.5" id="dialogue-buttons">
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Portrait handling (resilient)
    const portraitImg = modal.querySelector('#npc-portrait-img');
    const fallback = modal.querySelector('#npc-portrait-fallback');
    if (portraitImg && portraitSrc) {
        portraitImg.src = portraitSrc;
        portraitImg.onload = () => { if (fallback) fallback.style.display = 'none'; portraitImg.style.display = 'block'; };
        portraitImg.onerror = () => { 
            if (fallback) fallback.style.display = 'flex'; 
            portraitImg.style.display = 'none';
            console.log(`[Spellblade] NPC portrait missing: ${portraitSrc}`);
        };
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

            // Legacy/Alternative quest view - still useful for checking progress
            if (state.quest === 0) {
                textEl.innerHTML = `The Elder leans forward...<br><br>"Will you accept the <b>Beast Slayer</b> task?"`;
                btnContainer.innerHTML = '';

                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'rpg-btn py-3 rounded-2xl text-sm flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600';
                acceptBtn.innerHTML = `<i class="fas fa-check mr-1.5"></i><span>Accept Quest</span>`;
                acceptBtn.onclick = () => {
                    state.quest = 1;
                    save();
                    renderActions();
                    textEl.innerHTML = `The Elder nods. "Thank you. Return when done."`;
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
                    textEl.innerHTML = `The Elder sighs. "I understand. Should you change your mind..."`;
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
                textEl.innerHTML = `The Elder looks at you expectantly.<br><br><b>Beast Slayer</b><br>Slay at least 3 corrupted beasts.<br><br>Progress: <b class="text-emerald-400">${state.kills} / 3</b>`;
                if (state.kills >= 3) textEl.innerHTML += `<br><span class="text-emerald-400">Ready to report!</span>`;
            } else if (state.quest === 2) {
                textEl.innerHTML = `The Elder speaks gravely about the Ruined Temple...`;
            }
        });
    }

    if (showStoreBtn) {
        makeBtn('Store', 'fa-store', () => { modal.remove(); setTimeout(() => { if (typeof openShop === 'function') openShop(); }, 50); });
    }

    makeBtn('Goodbye', 'fa-door-open', () => modal.remove(), 'bg-red-900/70 hover:bg-red-800');
}

// ==================== INIT & MISC (ensure bg on load) ====================
function initializeGameEnhancements() {
    // Ensure area bg shows on start
    setTimeout(() => {
        if (state && state.location) {
            setAreaBackground(state.location);
        }
    }, 300);
}

// Hook into existing init if possible (call this in addition to core init)
console.log("game.js fully loaded - Spellblade Chronicles v2 (immersive quests + resilient backgrounds)");