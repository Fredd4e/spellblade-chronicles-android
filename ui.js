/* ui.js - UI Rendering, Modals, Portraits, Inventory & Map for Spellblade Chronicles */

function $(id) { return document.getElementById(id); }

// Show intro modal
function showIntro() {
    const modal = $('intro-modal');
    if (!modal) return;
    const titleEl = $('intro-title');
    const textEl = $('intro-text');
    if (window.Lore && Lore.intro) {
        if (titleEl) titleEl.textContent = Lore.intro.title || "The Shadow Rises";
        if (textEl) textEl.innerHTML = (Lore.intro.paragraphs || []).map(p => `<p class=\"mb-2\">${p}</p>`).join('');
    } else {
        if (titleEl) titleEl.textContent = "The Shadow Rises";
        if (textEl) textEl.innerHTML = "<p>The village of Eldoria needs your help, Spellblade.</p><p>Dark creatures emerge from the woods.</p>";
    }
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function startGame(skipIntro = false) {
    const modal = $('intro-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    if (!skipIntro && (!state.story || state.story.length === 0)) {
        if (window.Lore && Lore.intro && Lore.intro.paragraphs) {
            Lore.intro.paragraphs.forEach(p => log(p, true));
        } else {
            log("Your journey as the Spellblade begins in Eldoria.", true);
        }
    }
    log("You stand ready in the village square. The Elder awaits.", true);
    if (typeof updateAll === 'function') updateAll();
    if (typeof showAreaPortrait === 'function') showAreaPortrait(state.location);
    if (typeof save === 'function') save();
}

// Background only - no extra portrait box
function showAreaPortrait(loc) {
    const p = $('area-portrait');
    const container = document.querySelector('.game-container');

    let bgPath = '';

    const areas = (window.Lore && Lore.areas) ? Lore.areas : {};
    const areaKey = (!loc || loc === 'village') ? 'village' : loc;

    if (areaKey === 'village') {
        bgPath = (areas.village && areas.village.bgImage) ? areas.village.bgImage : 'assets/backgrounds/village.jpg';
    } else if (areaKey === 'woods') {
        bgPath = (areas.woods && areas.woods.bgImage) ? areas.woods.bgImage : 'assets/backgrounds/woods.jpg';
    } else if (areaKey === 'ruins') {
        bgPath = (areas.ruins && areas.ruins.bgImage) ? areas.ruins.bgImage : 'assets/backgrounds/ruins.jpg';
    }

    // Only set full background on the game container
    if (container && bgPath) {
        container.style.backgroundImage = `linear-gradient(rgba(15, 15, 15, 0.72), rgba(9, 9, 9, 0.82)), url('${bgPath}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.transition = 'background-image 0.6s ease';
    }

    // Hide the extra portrait box completely
    if (p) p.classList.add('hidden');
}

function updateStats() {
    const p = state.player;
    if ($('player-name')) $('player-name').textContent = p.name || 'Aether';
    if ($('level')) $('level').textContent = p.level || 1;
    if ($('hp')) $('hp').textContent = `${p.hp}/${p.maxHp}`;
    if ($('mp')) $('mp').textContent = `${p.mp}/${p.maxMp}`;
    if ($('xp')) $('xp').textContent = `${p.xp || 0}/100`;
    if ($('gold')) $('gold').textContent = p.gold || 0;
    if ($('str')) $('str').textContent = p.str || 5;
    if ($('int')) $('int').textContent = p.int || 5;
    if ($('def')) $('def').textContent = p.def || 3;

    if ($('hp-bar')) $('hp-bar').style.width = Math.max(5, Math.min(100, ((p.hp || 0) / (p.maxHp || 50)) * 100)) + '%';
    if ($('mp-bar')) $('mp-bar').style.width = Math.max(5, Math.min(100, ((p.mp || 0) / (p.maxMp || 20)) * 100)) + '%';
    if ($('location')) $('location').textContent = state.locationName || state.location || 'Eldoria Village Square';
}

function renderStory() {
    const storyEl = $('story');
    if (!storyEl) return;
    storyEl.innerHTML = (state.story || []).map(e => `<div class=\"${e.important ? 'text-amber-300 font-semibold' : ''} mb-0.5\">${e.msg}</div>`).join('');
    const box = $('story-box'); if (box) box.scrollTop = box.scrollHeight;
}

function renderActions() {
    const container = $('actions');
    if (!container) return;
    container.innerHTML = '';
    if (state.inCombat) return;

    const loc = state.location || 'village';
    let actions = [];
    if (loc === 'village') actions = [
        { label: 'Talk to Elder', icon: 'fa-user-tie', fn: () => startDialogue('elder') },
        { label: 'Talk to Merchant', icon: 'fa-store', fn: () => startDialogue('merchant') },
        { label: 'Explore the Square', icon: 'fa-search-location', fn: exploreVillage },
        { label: 'Travel to Woods', icon: 'fa-tree', fn: () => travel('woods') }
    ];
    else if (loc === 'woods') actions = [
        { label: 'Hunt Corrupted Beasts', icon: 'fa-dragon', fn: exploreWoods },
        { label: 'Search for Loot', icon: 'fa-search', fn: searchLoot },
        { label: 'Go to Ruins', icon: 'fa-archway', fn: () => travel('ruins') },
        { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
    ];
    else if (loc === 'ruins') actions = [
        { label: 'Explore Temple Depths', icon: 'fa-dungeon', fn: exploreRuins },
        { label: 'Search Ancient Stones', icon: 'fa-search', fn: searchLoot },
        { label: 'Return to Woods', icon: 'fa-tree', fn: () => travel('woods') },
        { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
    ];

    actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'rpg-btn flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-800 hover:bg-emerald-700/80 active:bg-emerald-600 rounded-2xl text-sm font-semibold';
        btn.innerHTML = `<i class=\"fas ${a.icon} mr-1.5\"></i> <span>${a.label}</span>`;
        btn.onclick = () => a.fn();
        container.appendChild(btn);
    });
}

// ==================== ENHANCED DIALOGUE SYSTEM ====================

let currentNpcKey = null;

function startDialogue(npcKey) {
    if (!window.Lore || !Lore.npcs || !Lore.npcs[npcKey]) {
        console.warn('NPC not found:', npcKey);
        return;
    }

    currentNpcKey = npcKey;
    const npc = Lore.npcs[npcKey];
    const modal = $('dialogue-modal');
    if (!modal) return;

    const portrait = $('dialogue-npc-portrait');
    const nameEl = $('dialogue-npc-name');
    const ageEl = $('dialogue-npc-age');
    const titleEl = $('dialogue-npc-title');
    const textEl = $('dialogue-text');

    if (portrait) {
        portrait.src = npc.portrait || 'assets/npcs/elder.jpg';
        portrait.onerror = () => { portrait.style.display = 'none'; };
    }
    if (nameEl) nameEl.textContent = npc.name || 'Unknown';
    if (ageEl) ageEl.innerHTML = npc.age ? `<i class=\"fas fa-user-clock mr-1\"></i>Age ${npc.age}` : '';
    if (titleEl) titleEl.textContent = npc.title || '';

    if (textEl) {
        textEl.innerHTML = `Hello, traveler. What brings you to speak with me today?`;
        if (npcKey === 'elder') textEl.innerHTML = `The wards grow weaker by the day, Aether. We must act.`;
        if (npcKey === 'merchant') textEl.innerHTML = `Ah, a fellow adventurer! Care to browse my wares?`;
    }

    renderDialogueOptions(npcKey, npc);
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function renderDialogueOptions(npcKey, npc) {
    const container = $('dialogue-options');
    if (!container) return;
    container.innerHTML = '';

    const addBtn = (label, icon, fn, enabled = true) => {
        const btn = document.createElement('button');
        btn.className = `rpg-btn flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold ${enabled ? 'bg-zinc-800 hover:bg-emerald-700/80 active:bg-emerald-600' : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'}`;
        btn.innerHTML = `<i class=\"fas ${icon} mr-1.5\"></i> <span>${label}</span>`;
        if (enabled) btn.onclick = fn;
        container.appendChild(btn);
    };

    addBtn('Talk', 'fa-comments', () => dialogueTalk(npcKey));
    addBtn('Goodbye', 'fa-door-open', closeDialogue);

    if (npc.hasQuests) addBtn('Quests', 'fa-scroll', () => dialogueQuests(npcKey));
    if (npc.hasShop)   addBtn('Shop', 'fa-store', () => dialogueShop(npcKey));
}

function dialogueTalk(npcKey) {
    const textEl = $('dialogue-text');
    const npc = Lore.npcs[npcKey];
    let message = "It is good to speak with you.";

    if (npcKey === 'elder') {
        const elder = Lore.elder || {};
        let dialogueLines = elder.default || [];

        if (state.quest === 0) {
            dialogueLines = elder.stage0 || dialogueLines;
            state.quest = 1;
            log("Quest accepted: Beast Slayer - Slay 3 corrupted beasts.", true);
        } else if (state.kills >= 3 && state.quest < 2) {
            dialogueLines = elder.stage1_complete || dialogueLines;
            state.quest = 2;
            state.player.gold = (state.player.gold || 0) + 40;
            state.player.xp = (state.player.xp || 0) + 30;
            log('Quest complete! +40 Gold +30 XP', true);
            if (typeof checkLevelUp === 'function') checkLevelUp();
        } else if (state.quest >= 2) {
            dialogueLines = elder.stage2 || dialogueLines;
        }

        if (dialogueLines.length > 0) {
            message = dialogueLines[0];
            dialogueLines.forEach(line => log(line, true));
        }
    } else if (npcKey === 'merchant') {
        message = `Welcome to my shop, ${state.player.name || 'traveler'}! I have fine goods from across the lands.`;
        log(`<b>Merchant:</b> Welcome! Take a look at my wares.`, true);
    }

    if (textEl) textEl.innerHTML = message;
    updateAll();
    save();
}

function dialogueQuests(npcKey) {
    const textEl = $('dialogue-text');
    if (npcKey === 'elder') {
        if (textEl) textEl.innerHTML = `Current Quest: <b>Beast Slayer</b><br>Slay at least 3 corrupted beasts.<br>Progress: ${state.kills || 0}/3`;
        log("<b>Elder:</b> Bring me news once you have slain three beasts.", true);
    }
}

function dialogueShop(npcKey) {
    closeDialogue();
    showShopModal();
}

function closeDialogue() {
    const modal = $('dialogue-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    currentNpcKey = null;
    if (typeof renderActions === 'function') renderActions();
}

// ==================== PROPER SHOP MODAL ====================

function showShopModal() {
    let shopModal = document.getElementById('shop-modal');
    if (!shopModal) {
        shopModal = document.createElement('div');
        shopModal.id = 'shop-modal';
        shopModal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[120] p-4';
        shopModal.innerHTML = `
            <div class="bg-zinc-900 rounded-3xl w-full max-w-[620px] border border-zinc-700">
                <div class="flex justify-between items-center p-5 border-b border-zinc-700">
                    <h3 class="font-bold text-xl text-amber-300"><i class="fas fa-store mr-2"></i> Merchant's Wares</h3>
                    <button onclick="document.getElementById('shop-modal').style.display='none'" class="text-2xl leading-none text-zinc-400 hover:text-white">&times;</button>
                </div>
                <div class="p-5 max-h-[420px] overflow-auto" id="shop-items"></div>
                <div class="p-4 border-t border-zinc-700 text-right text-sm">
                    Your Gold: <span id="shop-gold" class="font-bold text-yellow-400"></span>
                </div>
            </div>
        `;
        document.body.appendChild(shopModal);
    }

    const container = document.getElementById('shop-items');
    const goldEl = document.getElementById('shop-gold');
    container.innerHTML = '';
    if (goldEl) goldEl.textContent = state.player.gold || 0;

    if (!window.Lore || !Lore.shopItems) return;

    Lore.shopItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 mb-2 bg-zinc-800 rounded-2xl';
        div.innerHTML = `
            <div>
                <div class="font-semibold">${item.name}</div>
                <div class="text-xs text-zinc-400">${item.effect || ''}</div>
            </div>
            <div class="text-right">
                <div class="text-yellow-400 font-bold">${item.price}g</div>
                <button class="mt-1 px-4 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 rounded-xl" data-index="${index}">Buy</button>
            </div>
        `;

        const buyBtn = div.querySelector('button');
        buyBtn.onclick = () => buyItem(item, buyBtn);

        container.appendChild(div);
    });

    shopModal.style.display = 'flex';
}

function buyItem(item, button) {
    const gold = state.player.gold || 0;
    if (gold < item.price) {
        alert("You don't have enough gold.");
        return;
    }

    state.player.gold -= item.price;

    if (item.type === 'spell') {
        if (!state.player.spells.includes('Ice Shard')) {
            state.player.spells.push('Ice Shard');
            log(`You learned <b>${item.name}</b>!`, true);
        } else {
            log('You already know this spell.', true);
        }
    } else if (item.type === 'weapon' || item.type === 'armor') {
        if (item.type === 'weapon') state.player.weapon = { name: item.name, bonus: item.bonus };
        if (item.type === 'armor') {
            state.player.armor = { name: item.name, bonus: item.bonus };
            if (item.isSpecial) {
                state.player.maxHp = (state.player.maxHp || 50) + (item.healthBonus || 0);
                state.player.maxMp = (state.player.maxMp || 20) + (item.manaBonus || 0);
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
            }
        }
        log(`Equipped <b>${item.name}</b>.`, true);
    } else {
        addToInventory({ name: item.name, type: item.type, bonus: item.bonus, desc: item.effect || '' });
        log(`Purchased <b>${item.name}</b>.`, true);
    }

    updateAll();
    save();

    const goldEl = document.getElementById('shop-gold');
    if (goldEl) goldEl.textContent = state.player.gold;

    button.textContent = 'Bought';
    button.disabled = true;
    button.classList.add('opacity-50');
}

// ==================== CHARACTER MODAL ====================

function showStats() {
    showCharacterModal();
}

function showCharacterModal() {
    let charModal = document.getElementById('character-modal');
    if (!charModal) {
        charModal = document.createElement('div');
        charModal.id = 'character-modal';
        charModal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[120] p-4';
        charModal.innerHTML = `
            <div class="bg-zinc-900 rounded-3xl w-full max-w-[580px] border border-zinc-700">
                <div class="flex justify-between items-center p-5 border-b border-zinc-700">
                    <h3 class="font-bold text-xl text-amber-300"><i class="fas fa-user mr-2"></i> Character Sheet</h3>
                    <button onclick="document.getElementById('character-modal').style.display='none'" class="text-2xl text-zinc-400 hover:text-white">&times;</button>
                </div>
                <div class="p-5" id="character-content"></div>
            </div>
        `;
        document.body.appendChild(charModal);
    }

    const content = document.getElementById('character-content');
    const p = state.player;

    content.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <div class="text-2xl font-bold text-amber-300">${p.name}</div>
                <div class="text-sm text-zinc-400 mb-3">Level ${p.level || 1} Spellblade</div>

                <div class="mb-3">
                    <div class="text-xs text-zinc-400">EQUIPPED</div>
                    <div class="mt-1"><b>Weapon:</b> ${p.weapon ? p.weapon.name : 'Rusty Sword'} (+${p.weapon ? p.weapon.bonus : 3})</div>
                    <div><b>Armor:</b> ${p.armor ? p.armor.name : 'Cloth Tunic'} (+${p.armor ? p.armor.bonus : 1})</div>
                </div>

                <div class="text-xs text-zinc-400 mt-4">SPELLS</div>
                <div class="text-sm">${(p.spells || []).join(', ') || 'Firebolt'}</div>
            </div>

            <div class="text-sm">
                <div class="flex justify-between py-1"><span>HP</span> <span class="font-mono">${p.hp}/${p.maxHp}</span></div>
                <div class="flex justify-between py-1"><span>MP</span> <span class="font-mono">${p.mp}/${p.maxMp}</span></div>
                <div class="flex justify-between py-1"><span>XP</span> <span class="font-mono">${p.xp || 0}/100</span></div>
                <div class="flex justify-between py-1"><span>Gold</span> <span class="font-mono text-yellow-400">${p.gold || 0}</span></div>

                <div class="mt-4 pt-3 border-t border-zinc-700">
                    <div class="flex justify-between"><span>STR</span> <span class="font-bold">${p.str || 5}</span></div>
                    <div class="flex justify-between"><span>INT</span> <span class="font-bold">${p.int || 5}</span></div>
                    <div class="flex justify-between"><span>DEF</span> <span class="font-bold">${p.def || 3}</span></div>
                </div>
            </div>
        </div>
    `;

    charModal.style.display = 'flex';
}

// ==================== MAP FUNCTIONS (FIXED) ====================

function showMap() {
    const m = $('map-modal');
    if (m) {
        m.style.display = 'flex';
        m.classList.remove('hidden');
    }
}

function hideMap() {
    const m = $('map-modal');
    if (m) {
        m.style.display = 'none';
        m.classList.add('hidden');
    }
}

let mz = 1;

function zoomMap(d) {
    mz = Math.max(0.5, Math.min(3, mz + d));
    const c = $('map-content');
    if (c) c.style.transform = `scale(${mz})`;
    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mz * 100) + '%';
}

function resetMapZoom() {
    mz = 1;
    const c = $('map-content');
    if (c) c.style.transform = 'scale(1)';
    const zl = $('zoom-level');
    if (zl) zl.textContent = '100%';
}

// ==================== INVENTORY ====================

function showInventory(){ 
    let m=document.getElementById('inv-m'); 
    if(!m){m=document.createElement('div');m.id='inv-m';m.className='fixed inset-0 bg-black/80 z-[95] flex items-center justify-center p-4'; m.innerHTML=`<div class=\"bg-zinc-900 rounded-3xl max-w-md w-full p-5\"><h3 class=\"font-bold mb-3\">Inventory</h3><div id=\"inv-l\" class=\"max-h-64 overflow-auto\"></div><button onclick=\"document.getElementById('inv-m').style.display='none'\" class=\"mt-3 w-full py-2 bg-zinc-700 rounded-2xl\">Close</button></div>`; document.body.appendChild(m);} 
    const l=document.getElementById('inv-l'); l.innerHTML=''; 
    (state.inventory||[]).forEach((it,i)=>{ 
        const d=document.createElement('div'); 
        d.className='p-2 bg-zinc-800 mb-1 rounded flex justify-between'; 
        d.innerHTML=`<span>${it.name}</span><span><button class=\"text-emerald-400\" onclick=\"useInvItem(${i})\">Use</button> <button class=\"text-red-400\" onclick=\"dropInvItem(${i})\">Drop</button></span>`; 
        l.appendChild(d); 
    }); 
    m.style.display='flex'; 
}

function hideInv(){ const m=document.getElementById('inv-m'); if(m) m.style.display='none'; }

function useInvItem(i){ const it=state.inventory[i]; if(!it) return; if(it.type==='consumable' && it.name.includes('Health')) state.player.hp=Math.min(state.player.maxHp, state.player.hp+(it.bonus||30)); if(it.quantity>1) it.quantity--; else state.inventory.splice(i,1); hideInv(); updateAll(); save(); setTimeout(showInventory,80); }

function dropInvItem(i){ state.inventory.splice(i,1); hideInv(); updateAll(); save(); setTimeout(showInventory,80); }

function addToInventory(it){ if(!state.inventory) state.inventory=[]; state.inventory.push(it); }

// Safety
if(typeof window.updateAll!=='function') window.updateAll=()=> { if(typeof updateStats==='function')updateStats(); if(typeof renderActions==='function')renderActions(); if(typeof renderStory==='function')renderStory(); };
setTimeout(()=>{ if(typeof updateAll==='function') updateAll(); if(typeof renderActions==='function') renderActions(); }, 900);