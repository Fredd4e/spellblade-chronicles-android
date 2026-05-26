/* ui.js - UI Rendering, Modals, Portraits, Inventory & Map for Spellblade Chronicles */

function $(id) { return document.getElementById(id); }

// ==================== TOAST / NOTIFICATION SYSTEM ====================
let toastContainer = null;

function showToast(message, type = 'info', duration = 2200) {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    let bg = 'bg-zinc-800 border-zinc-700 text-zinc-200';
    if (type === 'success') bg = 'bg-emerald-900/90 border-emerald-700 text-emerald-200';
    if (type === 'error') bg = 'bg-red-900/90 border-red-700 text-red-200';
    if (type === 'gold') bg = 'bg-amber-900/90 border-amber-600 text-amber-200';

    toast.className = `px-4 py-2.5 rounded-2xl shadow-xl border text-sm max-w-[92vw] ${bg} flex items-center gap-2 animate-[toastPop_0.2s_ease]`;
    toast.innerHTML = `<span>${message}</span>`;

    toastContainer.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
        toast.style.transition = 'all 0.18s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 180);
    }, duration);
}

// Keyboard friendly: allow closing toasts with Escape (light)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toastContainer) {
        const last = toastContainer.lastChild;
        if (last) last.remove();
    }
});


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
    } else if (areaKey === 'church') {
        // Church reuses village background for now (peaceful indoor feel via overlay + caption)
        bgPath = (areas.village && areas.village.bgImage) ? areas.village.bgImage : 'assets/backgrounds/village.jpg';
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

    // Small church flavor caption override
    if (loc === 'church' && $('area-portrait-caption')) {
        // We hide the box, but if someone re-enables it later it will be nice
    }
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

    if (loc === 'village') {
        actions = [
            { label: 'Talk to Elder', icon: 'fa-user-tie', fn: () => startDialogue('elder') },
            { label: 'Talk to Merchant', icon: 'fa-store', fn: () => startDialogue('merchant') },
            { label: 'Visit the Church', icon: 'fa-place-of-worship', fn: goToChurch },
            { label: 'Explore the Square', icon: 'fa-search-location', fn: exploreVillage }
            // Main travel (Woods / Ruins) now happens via the Map button for better flow
        ];
    }
    else if (loc === 'woods') {
        actions = [
            { label: 'Hunt Corrupted Beasts', icon: 'fa-dragon', fn: exploreWoods },
            { label: 'Seek the Warden', icon: 'fa-user-secret', fn: () => startDialogue('thorne') },
            { label: 'Search for Loot', icon: 'fa-search', fn: searchLoot },
            { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
        ];
    }
    else if (loc === 'ruins') {
        actions = [
            { label: 'Explore Temple Depths', icon: 'fa-dungeon', fn: exploreRuins },
            { label: 'Search Ancient Stones', icon: 'fa-search', fn: searchLoot },
            { label: 'Commune with the Bound', icon: 'fa-ghost', fn: () => startDialogue('aelric') },
            { label: 'Return to Village', icon: 'fa-home', fn: () => travel('village') }
        ];
    }
    else if (loc === 'church') {
        actions = [
            { label: 'Speak with Sister Elara', icon: 'fa-pray', fn: () => startDialogue('nun') },
            { label: 'Pray for Strength', icon: 'fa-hands-praying', fn: prayAtChurch },
            { label: 'Return to the Square', icon: 'fa-home', fn: () => travel('village') }
        ];
    }

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
    const maritalEl = $('dialogue-npc-marital');
    if (maritalEl) maritalEl.innerHTML = npc.married ? `<i class=\"fas fa-ring mr-1\"></i>${npc.married}` : '';
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
    } else if (npcKey === 'nun') {
        const nunData = (window.Lore && Lore.nun) || {};
        message = nunData.greeting || "The Light welcomes you, child.";
        log(`<b>Sister Elara:</b> ${message.replace(/<[^>]+>/g, '')}`, true);

        // Show one of her lore lines occasionally
        if (Math.random() < 0.6 && nunData.talk && nunData.talk.length) {
            const loreLine = nunData.talk[Math.floor(Math.random() * nunData.talk.length)];
            log(loreLine, true);
        }
    } else if (npcKey === 'thorne') {
        const thorneData = (window.Lore && Lore.thorne) || {};
        message = thorneData.greeting || "Another fool in the woods?";

        if (!state.quests || !state.quests.wardensWatch) {
            message = thorneData.questOffer || message;
            if (!state.quests) state.quests = {};
            state.quests.wardensWatch = 1;
            log("Quest accepted: The Warden's Watch - Slay the Corrupted Alpha.", true);
        } else if (state.quests.wardensWatch === 1 && state.alphaSlain) {
            // Complete the quest
            state.quests.wardensWatch = 2;
            state.player.gold = (state.player.gold || 0) + 60;
            state.player.xp = (state.player.xp || 0) + 45;
            log("Quest complete! +60 Gold +45 XP", true);
            if (typeof checkLevelUp === 'function') checkLevelUp();
            message = (Lore.quests.wardensWatch && Lore.quests.wardensWatch.stages.completed) || "Well done. The woods are quieter now.";
        } else if (state.quests.wardensWatch >= 2) {
            message = "The pack has scattered. For now.";
        }

        log(`<b>Thorne:</b> ${message.replace(/<[^>]+>/g, '')}`, true);
    } else if (npcKey === 'aelric') {
        const aelricData = (window.Lore && Lore.aelric) || {};
        message = aelricData.greeting || "...You can see me.";

        if (!state.quests || !state.quests.unfinishedOath) {
            message = aelricData.questOffer || message;
            if (!state.quests) state.quests = {};
            state.quests.unfinishedOath = 1;
            log("Quest accepted: The Unfinished Oath - Recover the Sunsteel Sigil.", true);
        } else if (state.quests.unfinishedOath === 1 && state.sigilRecovered) {
            state.quests.unfinishedOath = 2;
            state.player.gold = (state.player.gold || 0) + 50;
            state.player.xp = (state.player.xp || 0) + 60;
            // Grant special reward spell if not already known
            if (!state.player.spells.includes('Warden\'s Resolve')) {
                state.player.spells.push("Warden's Resolve");
                log("You learned <b>Warden's Resolve</b>!", true);
            }
            log("Quest complete! +50 Gold +60 XP", true);
            if (typeof checkLevelUp === 'function') checkLevelUp();
            message = (Lore.quests.unfinishedOath && Lore.quests.unfinishedOath.stages.completed) || "At last... I can rest.";
        } else if (state.quests.unfinishedOath >= 2) {
            message = "The seal remembers you now. Tread carefully.";
        }

        log(`<b>Aelric:</b> ${message.replace(/<[^>]+>/g, '')}`, true);
    }

    if (textEl) textEl.innerHTML = message;
    updateAll();
    save();
}

function dialogueQuests(npcKey) {
    const textEl = $('dialogue-text');
    if (!textEl) return;

    if (npcKey === 'elder') {
        const kills = state.kills || 0;
        const tProg = state.templeProgress || 0;
        let html = `Current Quest: <b>Beast Slayer</b><br>Slay at least 3 corrupted beasts.<br>Progress: ${kills}/3`;

        if ((state.quest || 0) >= 2) {
            html += `<br><br><b>Secrets of the Temple</b><br>Investigate the Ruined Temple.<br>Progress: ${tProg > 0 ? 'Complete' : 'Explore the depths'}`;
        }
        textEl.innerHTML = html;
        log("<b>Elder:</b> Bring me news once you have slain three beasts — and investigate the temple when you can.", true);

    } else if (npcKey === 'thorne') {
        const progress = (state.quests && state.quests.wardensWatch) || 0;
        let html = `<b>The Warden's Watch</b><br>Help Thorne slay the Corrupted Alpha leading the beasts.`;

        if (progress === 0) {
            html += `<br><br>Status: Not started<br>Objective: Find and defeat the Alpha in the Whispering Woods.`;
        } else if (progress === 1) {
            const done = !!state.alphaSlain;
            html += `<br><br>Status: Active<br>Objective: Slay the Corrupted Alpha.<br>Progress: ${done ? 'Complete - Return to Thorne' : 'In progress'}`;
        } else {
            html += `<br><br><b>Complete!</b><br>The pack has scattered thanks to you.`;
        }
        textEl.innerHTML = html;
        log("<b>Thorne:</b> Bring proof that the Alpha is dead.", true);

    } else if (npcKey === 'aelric') {
        const progress = (state.quests && state.quests.unfinishedOath) || 0;
        let html = `<b>The Unfinished Oath</b><br>Recover Aelric's Sunsteel Sigil from the depths of the temple.`;

        if (progress === 0) {
            html += `<br><br>Status: Not started<br>Objective: Search the inner sanctum of the Ruined Temple.`;
        } else if (progress === 1) {
            const done = !!state.sigilRecovered;
            html += `<br><br>Status: Active<br>Objective: Find the Sunsteel Sigil.<br>Progress: ${done ? 'Complete - Return to Aelric' : 'In progress'}`;
        } else {
            html += `<br><br><b>Complete!</b><br>Aelric can finally rest. You carry a piece of the old power.`;
        }
        textEl.innerHTML = html;
        log("<b>Aelric:</b> The Sigil... bring it to me.", true);
    }
}

function dialogueShop(npcKey) {
    closeDialogue();
    showShopModal(npcKey);
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

// Simple but meaningful church prayer action
function prayAtChurch() {
    if (state.inCombat || state.location !== 'church') return;

    const p = state.player;
    const beforeHp = p.hp;
    const beforeMp = p.mp;

    // Gentle restoration + small bonus for roleplay
    p.hp = Math.min(p.maxHp || 50, (p.hp || 0) + 12);
    p.mp = Math.min(p.maxMp || 20, (p.mp || 0) + 8);

    const healedHp = p.hp - beforeHp;
    const healedMp = p.mp - beforeMp;

    log("You kneel and pray. A warm light eases your wounds and refreshes your spirit.", true);
    if (healedHp > 0 || healedMp > 0) {
        showToast(`Rested: +${healedHp} HP, +${healedMp} MP`, 'success');
    }

    updateAll();
    save();
}

// ==================== PROPER SHOP MODAL (supports per-NPC shops) ====================

let currentShopNpc = null;

function showShopModal(npcKey = null) {
    currentShopNpc = npcKey;

    let shopModal = document.getElementById('shop-modal');
    if (!shopModal) {
        shopModal = document.createElement('div');
        shopModal.id = 'shop-modal';
        shopModal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[120] p-4';
        shopModal.innerHTML = `
            <div class="bg-zinc-900 rounded-3xl w-full max-w-[620px] border border-zinc-700">
                <div class="flex justify-between items-center p-5 border-b border-zinc-700">
                    <h3 id="shop-title" class="font-bold text-xl text-amber-300"><i class="fas fa-store mr-2"></i> Merchant's Wares</h3>
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

    // Set nice title based on NPC
    const titleEl = document.getElementById('shop-title');
    if (titleEl) {
        if (npcKey === 'nun') {
            titleEl.innerHTML = `<i class="fas fa-pray mr-2"></i> Sacred Relics &amp; Blessings`;
        } else {
            titleEl.innerHTML = `<i class="fas fa-store mr-2"></i> Merchant's Wares`;
        }
    }

    const container = document.getElementById('shop-items');
    const goldEl = document.getElementById('shop-gold');
    container.innerHTML = '';
    if (goldEl) goldEl.textContent = state.player.gold || 0;

    // Choose which items to sell
    let itemsToSell = [];
    if (npcKey === 'nun' && window.Lore && Lore.nunShopItems) {
        itemsToSell = Lore.nunShopItems;
    } else if (window.Lore && Lore.shopItems) {
        itemsToSell = Lore.shopItems;
    }

    if (!itemsToSell.length) return;

    itemsToSell.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 mb-2 bg-zinc-800 rounded-2xl gap-3';
        const imgSrc = item.image || 'assets/items/iron-sword.jpg';
        div.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <img src="${imgSrc}" class="w-14 h-14 object-cover rounded-xl border border-zinc-700 flex-shrink-0" alt="${item.name}" onerror="this.style.display='none'">
                <div class="min-w-0">
                    <div class="font-semibold">${item.name}</div>
                    <div class="text-xs text-zinc-400">${item.effect || ''}</div>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
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
        showToast("Not enough gold.", 'error');
        return;
    }

    state.player.gold -= item.price;

    let msg = '';
    if (item.type === 'spell') {
        // Support both Ice Shard and the new Divine Light
        const spellName = item.name.includes('Radiance') ? 'Divine Light' : 'Ice Shard';
        if (!state.player.spells.includes(spellName)) {
            state.player.spells.push(spellName);
            msg = `Learned <b>${spellName}</b>!`;
            log(`You learned <b>${spellName}</b>!`, true);
        } else {
            msg = 'You already know that spell.';
            log('You already know this spell.', true);
        }
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') {
        if (item.type === 'weapon') {
            state.player.weapon = { name: item.name, bonus: item.bonus, image: item.image };
        } else if (item.type === 'armor') {
            state.player.armor = { name: item.name, bonus: item.bonus, image: item.image };
            if (item.isSpecial) {
                state.player.maxHp = (state.player.maxHp || 50) + (item.healthBonus || 0);
                state.player.maxMp = (state.player.maxMp || 20) + (item.manaBonus || 0);
                state.player.hp = state.player.maxHp;
                state.player.mp = state.player.maxMp;
            }
        } else if (item.type === 'shield') {
            state.player.shield = { name: item.name, blockChance: item.blockChance || 15, image: item.image };
        }
        msg = `Equipped <b>${item.name}</b>`;
        log(`Equipped <b>${item.name}</b>.`, true);
    } else {
        addToInventory({ name: item.name, type: item.type, bonus: item.bonus, desc: item.effect || '', image: item.image });
        msg = `Purchased <b>${item.name}</b>`;
        log(`Purchased <b>${item.name}</b>.`, true);
    }

    updateAll();
    save();

    const goldEl = document.getElementById('shop-gold');
    if (goldEl) goldEl.textContent = state.player.gold;

    showToast(msg || 'Transaction complete.', 'success');

    button.textContent = 'Bought';
    button.disabled = true;
    button.classList.add('opacity-50');

    // Refresh shop list after short delay so player sees updated gold
    setTimeout(() => {
        const shopModal = document.getElementById('shop-modal');
        if (shopModal && shopModal.style.display !== 'none') {
            // Re-render items to update "Bought" states if needed
            if (typeof showShopModal === 'function') {
                // Close and reopen is simplest reliable refresh
                shopModal.style.display = 'none';
                setTimeout(() => showShopModal(), 60);
            }
        }
    }, 650);
}

// ==================== RENAME + CHARACTER MODAL ====================

function renameCharacter() {
    const current = (state.player && state.player.name) || 'Aether';
    const newName = prompt('Enter new name for your Spellblade:', current);
    if (!newName || !newName.trim()) return;

    const trimmed = newName.trim().slice(0, 24);
    state.player.name = trimmed || 'Aether';

    if (typeof updateStats === 'function') updateStats();
    if (typeof save === 'function') save();
    showToast(`Name changed to <b>${trimmed}</b>`, 'success');
}

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

    const blockChance = (typeof getPlayerBlockChance === 'function') ? getPlayerBlockChance() : 8;
    const critChance = (typeof getPlayerCritChance === 'function') ? getPlayerCritChance() : 7;

    const shieldText = p.shield ? `${p.shield.name} (+${p.shield.blockChance || 15}% Block)` : 'None equipped';

    content.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <!-- Left: Identity + Gear -->
            <div>
                <div class="text-2xl font-bold text-amber-300">${p.name}</div>
                <div class="text-sm text-zinc-400 mb-3">Level ${p.level || 1} Spellblade</div>

                <div class="mb-3">
                    <div class="text-xs text-zinc-400 font-semibold mb-1">EQUIPPED</div>
                    <div class="text-sm space-y-1">
                        <div class="flex items-center gap-2">
                            <img src="${p.weapon && p.weapon.image ? p.weapon.image : 'assets/items/rusty-sword.jpg'}" class="w-7 h-7 object-cover rounded border border-zinc-700" alt="Weapon" onerror="this.style.display='none'">
                            <span><b>Weapon:</b> ${p.weapon ? p.weapon.name : 'Rusty Sword'} <span class="text-emerald-400">(+${p.weapon ? p.weapon.bonus : 3})</span></span>
                        </div>
                        <div class="flex items-center gap-2">
                            <img src="${p.armor && p.armor.image ? p.armor.image : 'assets/items/cloth-tunic.jpg'}" class="w-7 h-7 object-cover rounded border border-zinc-700" alt="Armor" onerror="this.style.display='none'">
                            <span><b>Armor:</b> ${p.armor ? p.armor.name : 'Cloth Tunic'} <span class="text-emerald-400">(+${p.armor ? p.armor.bonus : 1})</span></span>
                        </div>
                        <div class="flex items-center gap-2">
                            <img src="${p.shield && p.shield.image ? p.shield.image : 'assets/items/wooden-shield.jpg'}" class="w-7 h-7 object-cover rounded border border-zinc-700" alt="Shield" onerror="this.style.display='none'">
                            <span><b>Shield:</b> ${shieldText}</span>
                        </div>
                    </div>
                </div>

                <div class="text-xs text-zinc-400 mt-3">SPELLS</div>
                <div class="text-sm">${(p.spells || []).join(', ') || 'Firebolt'}</div>
            </div>

            <!-- Right: Stats with explanations -->
            <div class="text-sm">
                <div class="flex justify-between py-0.5"><span>HP</span> <span class="font-mono">${p.hp}/${p.maxHp}</span></div>
                <div class="flex justify-between py-0.5"><span>MP</span> <span class="font-mono">${p.mp}/${p.maxMp}</span></div>
                <div class="flex justify-between py-0.5"><span>XP</span> <span class="font-mono">${p.xp || 0}/100</span></div>
                <div class="flex justify-between py-0.5"><span>Gold</span> <span class="font-mono text-yellow-400">${p.gold || 0}</span></div>

                <div class="mt-3 pt-2 border-t border-zinc-700 text-[13px]">
                    <div class="font-semibold text-xs text-zinc-400 mb-1">CORE STATS</div>

                    <div class="flex justify-between py-0.5" title="Increases melee damage and carry weight feel">
                        <span>STR <span class="text-[10px] text-zinc-500">(Strength)</span></span>
                        <span class="font-bold">${p.str || 5}</span>
                    </div>
                    <div class="text-[10px] text-zinc-500 -mt-1 mb-1">Melee damage</div>

                    <div class="flex justify-between py-0.5" title="Increases spell damage and maximum MP">
                        <span>INT <span class="text-[10px] text-zinc-500">(Intelligence)</span></span>
                        <span class="font-bold">${p.int || 5}</span>
                    </div>
                    <div class="text-[10px] text-zinc-500 -mt-1 mb-1">Spell power &amp; mana</div>

                    <div class="flex justify-between py-0.5" title="Reduces damage taken from attacks">
                        <span>DEF <span class="text-[10px] text-zinc-500">(Defense)</span></span>
                        <span class="font-bold">${p.def || 3}</span>
                    </div>
                    <div class="text-[10px] text-zinc-500 -mt-1 mb-1">Physical resistance</div>

                    <div class="flex justify-between py-0.5" title="Improves block chance, crit chance, and agility">
                        <span>DEX <span class="text-[10px] text-zinc-500">(Dexterity)</span></span>
                        <span class="font-bold">${p.dex || 5}</span>
                    </div>
                    <div class="text-[10px] text-zinc-500 -mt-1 mb-1">Block &amp; critical chance</div>
                </div>

                <div class="mt-3 pt-2 border-t border-zinc-700 text-xs">
                    <div class="font-semibold text-emerald-300 mb-1">COMBAT STATS</div>
                    <div class="flex justify-between"><span>Block Chance</span> <span class="font-bold text-emerald-400">${blockChance}%</span></div>
                    <div class="flex justify-between"><span>Crit Chance</span> <span class="font-bold text-amber-400">${critChance}%</span></div>
                </div>
            </div>
        </div>

        <div class="mt-4 pt-3 border-t border-zinc-700 text-[11px] text-zinc-500 leading-tight">
            <b>Block</b>: Chance to greatly reduce incoming damage with a shield.<br>
            <b>Crit</b>: Chance to deal 65% extra damage on attacks.
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
    // Enable dragging once visible
    setTimeout(attachMapDragHandlers, 60);
}

function hideMap() {
    const m = $('map-modal');
    if (m) {
        m.style.display = 'none';
        m.classList.add('hidden');
    }
    detachMapDragHandlers();
}

let mz = 1;

function updateMapTransform() {
    const c = $('map-content');
    if (!c) return;
    const tx = mapPanX || 0;
    const ty = mapPanY || 0;
    c.style.transform = `translate(${tx}px, ${ty}px) scale(${mz})`;
    c.style.transformOrigin = 'center center';
}

function zoomMap(d) {
    mz = Math.max(0.5, Math.min(3, mz + d));
    updateMapTransform();
    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mz * 100) + '%';
}

function resetMapZoom() {
    mz = 1;
    mapPanX = 0;
    mapPanY = 0;
    updateMapTransform();
    const zl = $('zoom-level');
    if (zl) zl.textContent = '100%';
}

// ==================== MAP DRAGGING (uses core vars) ====================
let mapDragHandlersAttached = false;

function attachMapDragHandlers() {
    const container = $('map-content');
    if (!container || mapDragHandlersAttached) return;

    const startDrag = (clientX, clientY) => {
        isDragging = true;
        dragStartX = clientX;
        dragStartY = clientY;
        container.style.cursor = 'grabbing';
    };

    const doDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        mapPanX = (mapPanX || 0) + dx;
        mapPanY = (mapPanY || 0) + dy;
        dragStartX = clientX;
        dragStartY = clientY;
        updateMapTransform();
    };

    const endDrag = () => {
        isDragging = false;
        if (container) container.style.cursor = 'grab';
    };

    // Mouse
    container.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    // Touch
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) doDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', endDrag);

    container.style.cursor = 'grab';
    mapDragHandlersAttached = true;
}

function detachMapDragHandlers() {
    // We leave listeners (cheap) but reset state
    isDragging = false;
    mapDragHandlersAttached = false;
}

// ==================== INVENTORY (rewritten - clean, supports Mana + stacking) ====================

function showInventory() {
    let m = document.getElementById('inv-m');
    if (!m) {
        m = document.createElement('div');
        m.id = 'inv-m';
        m.className = 'fixed inset-0 bg-black/80 z-[95] flex items-center justify-center p-4';
        m.innerHTML = `
            <div class="bg-zinc-900 rounded-3xl max-w-md w-full p-5 border border-zinc-700">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-lg">Inventory</h3>
                    <button onclick="hideInv()" class="text-zinc-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div id="inv-l" class="max-h-[320px] overflow-auto pr-1 space-y-1.5"></div>
                <div class="mt-4 text-xs text-zinc-500">Tap Use to consume potions. Gear is equipped via the shop.</div>
            </div>`;
        document.body.appendChild(m);
    }

    const list = document.getElementById('inv-l');
    list.innerHTML = '';

    const inv = state.inventory || [];
    if (inv.length === 0) {
        list.innerHTML = `<div class="text-center text-zinc-500 py-6">Your inventory is empty.</div>`;
    } else {
        inv.forEach((it, i) => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between bg-zinc-800 hover:bg-zinc-800/80 rounded-2xl px-3 py-2.5';

            const isConsumable = it.type === 'consumable';
            const qty = it.quantity || 1;
            const icon = it.name.toLowerCase().includes('mana') ? 'fa-bolt' :
                         it.name.toLowerCase().includes('health') ? 'fa-heart' : 'fa-flask';

            const invImg = it.image ? `<img src="${it.image}" class="w-9 h-9 object-cover rounded-lg border border-zinc-700 flex-shrink-0" alt="${it.name}" onerror="this.style.display='none'">` : `<i class="fas ${icon} text-emerald-400 w-9 text-center text-xl"></i>`;
            row.innerHTML = `
                <div class="flex items-center gap-3 min-w-0">
                    ${invImg}
                    <div class="min-w-0">
                        <div class="font-medium">${it.name} ${qty > 1 ? `<span class="text-xs text-zinc-400">×${qty}</span>` : ''}</div>
                        <div class="text-[11px] text-zinc-500 truncate">${it.desc || ''}</div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    ${isConsumable ? `<button class="px-3 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 rounded-xl active:scale-[0.985]" onclick="useInvItem(${i})">Use</button>` : ''}
                    <button class="px-3 py-1 text-sm bg-zinc-700 hover:bg-red-900/70 text-red-300 rounded-xl" onclick="dropInvItem(${i})">Drop</button>
                </div>
            `;
            list.appendChild(row);
        });
    }

    m.style.display = 'flex';
}

function hideInv() {
    const m = document.getElementById('inv-m');
    if (m) m.style.display = 'none';
}

function useInvItem(i) {
    const inv = state.inventory;
    if (!inv || !inv[i]) return;
    const it = inv[i];

    let used = false;
    const p = state.player;

    if (it.type === 'consumable') {
        const name = (it.name || '').toLowerCase();
        if (name.includes('health') || name.includes('potion')) {
            const heal = it.bonus || 30;
            p.hp = Math.min(p.maxHp || 50, (p.hp || 0) + heal);
            showToast(`+${heal} HP`, 'success', 1600);
            used = true;
        } else if (name.includes('mana')) {
            const restore = it.bonus || 15;
            p.mp = Math.min(p.maxMp || 20, (p.mp || 0) + restore);
            showToast(`+${restore} MP`, 'success', 1600);
            used = true;
        }
    }

    if (!used) {
        showToast('Nothing happens.', 'info', 1400);
    }

    // Quantity / removal
    if (it.quantity && it.quantity > 1) {
        it.quantity--;
    } else {
        inv.splice(i, 1);
    }

    hideInv();
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
    setTimeout(showInventory, 90);
}

function dropInvItem(i) {
    const inv = state.inventory;
    if (!inv || !inv[i]) return;
    inv.splice(i, 1);
    hideInv();
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
    setTimeout(showInventory, 90);
}

function addToInventory(it) {
    if (!state.inventory) state.inventory = [];

    // Try to stack consumables
    if (it.type === 'consumable') {
        const existing = state.inventory.findIndex(x =>
            x.name === it.name && x.type === 'consumable'
        );
        if (existing !== -1) {
            const ex = state.inventory[existing];
            ex.quantity = (ex.quantity || 1) + (it.quantity || 1);
            return;
        }
    }
    state.inventory.push(it);
}

// ==================== QUEST JOURNAL ====================

function showQuestJournal() {
    let journal = document.getElementById('quest-journal');
    if (!journal) {
        journal = document.createElement('div');
        journal.id = 'quest-journal';
        journal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[130] p-4';
        journal.innerHTML = `
            <div class="bg-zinc-900 rounded-3xl w-full max-w-[680px] border border-zinc-700 shadow-2xl overflow-hidden">
                <div class="flex justify-between items-center p-5 border-b border-zinc-700 bg-zinc-950/70">
                    <h3 class="font-bold text-xl text-amber-300"><i class="fas fa-scroll mr-2"></i> Quest Journal</h3>
                    <button onclick="document.getElementById('quest-journal').style.display='none'" class="text-2xl text-zinc-400 hover:text-white">&times;</button>
                </div>
                <div class="p-5 max-h-[70vh] overflow-auto" id="quest-journal-content"></div>
                <div class="p-3 border-t border-zinc-700 text-xs text-zinc-500 text-center">
                    Active quests and their current progress
                </div>
            </div>
        `;
        document.body.appendChild(journal);
    }

    const container = document.getElementById('quest-journal-content');
    container.innerHTML = '';

    const activeQuests = getActiveQuestsForJournal();

    if (activeQuests.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-zinc-400">You have no active quests.</div>`;
    } else {
        activeQuests.forEach(q => {
            const div = document.createElement('div');
            div.className = 'mb-4 bg-zinc-800 rounded-2xl p-4 border border-zinc-700';

            const progressHtml = q.objectives.map(obj => {
                const pct = obj.max ? Math.min(100, Math.floor((obj.current / obj.max) * 100)) : (obj.complete ? 100 : 0);
                return `
                    <div class="mb-2">
                        <div class="flex justify-between text-sm mb-1">
                            <span>${obj.text}</span>
                            <span class="text-emerald-400 font-mono">${obj.current || 0}${obj.max ? '/' + obj.max : ''}</span>
                        </div>
                        <div class="h-1.5 bg-zinc-700 rounded"><div class="h-1.5 bg-emerald-600 rounded" style="width:${pct}%"></div></div>
                    </div>
                `;
            }).join('');

            const loreId = 'lore-' + q.id;
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-bold text-lg text-amber-300">${q.title}</div>
                        <div class="text-xs text-zinc-400 mb-2">${q.status}</div>
                    </div>
                    <div class="text-right text-xs">
                        ${q.rewards ? q.rewards : ''}
                    </div>
                </div>

                <div class="text-sm text-zinc-300 mt-1 mb-3">${q.description}</div>

                <div class="mt-2">
                    <div class="text-xs font-semibold text-emerald-400 mb-1">OBJECTIVES</div>
                    ${progressHtml}
                </div>

                <div class="mt-3 pt-3 border-t border-zinc-700">
                    <button onclick="toggleJournalLore('${loreId}')" class="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center gap-1">
                        <i class="fas fa-book-open"></i> <span>Lore &amp; Details</span>
                    </button>
                    <div id="${loreId}" class="hidden mt-2 text-xs text-zinc-400 leading-relaxed border-l-2 border-amber-900 pl-3">
                        ${q.lore || 'No additional lore recorded.'}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    journal.style.display = 'flex';
}

function toggleJournalLore(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hidden');
}

function getActiveQuestsForJournal() {
    const quests = [];

    // Beast Slayer
    if ((state.quest || 0) >= 1) {
        const kills = state.kills || 0;
        const complete = kills >= 3;
        quests.push({
            id: 'beastSlayer',
            title: 'Beast Slayer',
            status: complete ? 'Completed' : 'Active',
            description: 'Slay at least three corrupted beasts in the Whispering Woods.',
            objectives: [{ text: 'Defeat corrupted beasts', current: kills, max: 3, complete }],
            rewards: '+40 Gold, +30 XP',
            lore: 'The Elder believes the beasts hold clues to the growing darkness. Their corrupted nature suggests something ancient is stirring.'
        });
    }

    // Secrets of the Temple
    if ((state.quest || 0) >= 2) {
        const tProg = state.templeProgress || 0;
        const complete = tProg > 0;
        quests.push({
            id: 'templeSecret',
            title: 'Secrets of the Temple',
            status: complete ? 'Completed' : 'Active',
            description: 'Investigate the Ruined Temple and uncover what ancient evil stirs within.',
            objectives: [{ text: 'Explore the depths of the Ruined Temple', current: complete ? 1 : 0, max: 1, complete }],
            rewards: '+75 Gold, Ancient Relic',
            lore: 'The temple was once a place of great power. The shadows there are older than the village itself.'
        });
    }

    // Warden's Watch (Thorne)
    if (state.quests && state.quests.wardensWatch) {
        const stage = state.quests.wardensWatch;
        const complete = stage >= 2 || !!state.alphaSlain;
        quests.push({
            id: 'wardensWatch',
            title: "The Warden's Watch",
            status: complete ? 'Completed' : 'Active',
            description: 'Help Thorne slay the Corrupted Alpha leading the beasts in the woods.',
            objectives: [{ text: 'Defeat the Corrupted Alpha', current: complete ? 1 : 0, max: 1, complete }],
            rewards: '+60 Gold, +45 XP, Warden\'s Charm',
            lore: 'Thorne, a former temple warden, believes a single powerful beast is coordinating the attacks. Killing it may buy the village precious time.'
        });
    }

    // Unfinished Oath (Aelric)
    if (state.quests && state.quests.unfinishedOath) {
        const stage = state.quests.unfinishedOath;
        const complete = stage >= 2 || !!state.sigilRecovered;
        quests.push({
            id: 'unfinishedOath',
            title: 'The Unfinished Oath',
            status: complete ? 'Completed' : 'Active',
            description: 'Recover Aelric\'s Sunsteel Sigil from the depths of the Ruined Temple.',
            objectives: [{ text: 'Find the Sunsteel Sigil', current: complete ? 1 : 0, max: 1, complete }],
            rewards: '+50 Gold, +60 XP, Warden\'s Resolve spell',
            lore: 'Aelric is the bound spirit of one of the original sealers. His sigil holds the key to understanding — and perhaps reinforcing — the ancient seal.'
        });
    }

    return quests;
}

// Safety
if(typeof window.updateAll!=='function') window.updateAll=()=> { if(typeof updateStats==='function')updateStats(); if(typeof renderActions==='function')renderActions(); if(typeof renderStory==='function')renderStory(); };
setTimeout(()=>{ if(typeof updateAll==='function') updateAll(); if(typeof renderActions==='function') renderActions(); }, 900);