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
    } else if (areaKey === 'wildermarch') {
        bgPath = (areas.wildermarch && areas.wildermarch.bgImage) ? areas.wildermarch.bgImage : 'assets/backgrounds/wildermarch.jpg';
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

    // Combat player HUD bars (if combat is active)
    const chp = p.hp || 0, chpmax = p.maxHp || 50;
    const cmp = p.mp || 0, cmpmax = p.maxMp || 20;
    const chpPct = Math.max(5, Math.min(100, (chp / chpmax) * 100));
    const cmpPct = Math.max(5, Math.min(100, (cmp / cmpmax) * 100));
    if ($('combat-player-hp-bar')) $('combat-player-hp-bar').style.width = chpPct + '%';
    if ($('combat-player-mp-bar')) $('combat-player-mp-bar').style.width = cmpPct + '%';
    if ($('combat-player-hp')) $('combat-player-hp').textContent = `${chp}/${chpmax}`;
    if ($('combat-player-mp')) $('combat-player-mp').textContent = `${cmp}/${cmpmax}`;

    if ($('location')) {
        let locText = state.locationName || state.location || 'Eldoria Village Square';

        // Minimalistic Ruins dungeon level tracker
        if (state.location === 'ruins') {
            const lvl = state.templeLevel || 1;
            const tracker = [1,2,3].map(n => n === lvl ? `<b>${n}</b>` : n).join(' - ');
            locText = `Ruined Temple <span class="text-amber-400">[${tracker}]</span>`;
        }

        $('location').innerHTML = locText;
    }
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
            { label: 'Explore', icon: 'fa-dragon', fn: exploreWoods },
            { label: 'Seek the Warden', icon: 'fa-user-secret', fn: () => startDialogue('thorne') }
        ];
    }
    else if (loc === 'ruins') {
        actions = [
            { label: 'Explore', icon: 'fa-dungeon', fn: exploreRuins },
            { label: 'Commune with the Bound', icon: 'fa-ghost', fn: () => startDialogue('aelric') }
        ];

        const lvl = state.templeLevel || 1;
        if (lvl < 3) {
            actions.push({ label: `Descend to Level ${lvl + 1}`, icon: 'fa-arrow-down', fn: descendTemple });
        }
    }
    else if (loc === 'church') {
        actions = [
            { label: 'Speak with Sister Elara', icon: 'fa-pray', fn: () => startDialogue('nun') },
            { label: 'Speak with Mother Seraphine', icon: 'fa-pray', fn: () => startDialogue('mother') },
            { label: 'Pray for Strength', icon: 'fa-hands-praying', fn: prayAtChurch }
        ];
    }
    else if (loc === 'wildermarch') {
        actions = [
            { label: 'Explore the Wilds', icon: 'fa-tree', fn: exploreWildermarch },
            { label: 'Find Amina', icon: 'fa-user-ninja', fn: () => startDialogue('amina') }
        ];
    }

    actions.forEach(a => {
        const btn = document.createElement('button');
        
        // Context-aware fantasy button styling
        let btnClass = 'fantasy-btn rpg-btn flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm';
        
        const loc = state.location || '';
        const label = (a.label || '').toLowerCase();
        
        if (loc === 'church' || label.includes('pray') || label.includes('seraphine') || label.includes('elara')) {
            btnClass += ' btn-holy';
        } else if (loc === 'ruins' || label.includes('temple') || label.includes('descend') || label.includes('explore')) {
            btnClass += ' btn-combat';
        } else if (loc === 'woods' || label.includes('hunt') || label.includes('woods') || loc === 'wildermarch') {
            btnClass += ' btn-action';
        } else {
            btnClass += ' btn-action';
        }
        
        btn.className = btnClass;
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
        if (npcKey === 'amina') textEl.innerHTML = `Watch your step out here. These woods bite back.`;
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
        let btnClass = `fantasy-btn rpg-btn flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm ${enabled ? 'btn-dialogue' : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700'}`;
        
        // Special holy treatment for shop in church dialogue
        if (label === 'Shop' && (npcKey === 'nun' || npcKey === 'mother')) {
            btnClass = btnClass.replace('btn-dialogue', 'btn-holy');
        }
        
        btn.className = btnClass;
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
    } else if (npcKey === 'mother') {
        const motherData = (window.Lore && Lore.mother) || {};
        message = motherData.greeting || "The Light welcomes you, child.";
        log(`<b>Mother Seraphine:</b> ${message.replace(/<[^>]+>/g, '')}`, true);

        if (Math.random() < 0.55 && motherData.talk && motherData.talk.length) {
            const loreLine = motherData.talk[Math.floor(Math.random() * motherData.talk.length)];
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
    } else if (npcKey === 'amina') {
        const aminaData = (window.Lore && Lore.amina) || {};
        message = aminaData.greeting || "Careful where you step, stranger.";

        if (!state.quests || !state.quests.webOfTheWild) {
            message = aminaData.questOffer || message;
            if (!state.quests) state.quests = {};
            state.quests.webOfTheWild = 1;
            log("Quest accepted: Web of the Wildermarch - Defeat the Spider Queen.", true);
        } else if (state.quests.webOfTheWild === 1 && state.spiderQueenSlain) {
            state.quests.webOfTheWild = 2;
            state.player.gold = (state.player.gold || 0) + 85;
            state.player.xp = (state.player.xp || 0) + 70;
            log("Quest complete! +85 Gold +70 XP", true);
            if (typeof checkLevelUp === 'function') checkLevelUp();
            message = (Lore.quests.webOfTheWild && Lore.quests.webOfTheWild.stages.completed) || "The Wildermarch is safer thanks to you.";
        } else if (state.quests.webOfTheWild >= 2) {
            message = "The queen is dead. The woods feel lighter.";
        }

        log(`<b>Amina:</b> ${message.replace(/<[^>]+>/g, '')}`, true);
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

    } else if (npcKey === 'amina') {
        const progress = (state.quests && state.quests.webOfTheWild) || 0;
        let html = `<b>Web of the Wildermarch</b><br>Help Amina slay the Spider Queen haunting the wilds.`;

        if (progress === 0) {
            html += `<br><br>Status: Not started<br>Objective: Find and defeat the Spider Queen in the Wildermarch.`;
        } else if (progress === 1) {
            const done = !!state.spiderQueenSlain;
            html += `<br><br>Status: Active<br>Objective: Slay the Spider Queen.<br>Progress: ${done ? 'Complete - Return to Amina' : 'In progress'}`;
        } else {
            html += `<br><br><b>Complete!</b><br>The Wildermarch is safer thanks to you.`;
        }
        textEl.innerHTML = html;
        log("<b>Amina:</b> Bring me proof the Spider Queen is dead.", true);
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
            <div class="fantasy-modal rounded-3xl w-full max-w-[620px] overflow-hidden">
                <div class="flex justify-between items-center p-5 fantasy-modal-header border-b border-amber-900/30">
                    <h3 id="shop-title" class="font-bold text-xl text-amber-300"><i class="fas fa-store mr-2"></i> Merchant's Wares</h3>
                    <button onclick="document.getElementById('shop-modal').style.display='none'" class="fantasy-btn btn-action text-xl leading-none px-2 py-0 rounded">&times;</button>
                </div>
                <div class="p-5 max-h-[420px] overflow-auto bg-[#161410]" id="shop-items"></div>
                <div class="p-4 fantasy-modal-header border-t border-amber-900/20 text-right text-sm">
                    Your Gold: <span id="shop-gold" class="font-bold text-yellow-400"></span>
                </div>
            </div>
        `;
        document.body.appendChild(shopModal);
    }

    // Set nice title based on NPC
    const titleEl = document.getElementById('shop-title');
    if (titleEl) {
        if (npcKey === 'nun' || npcKey === 'mother') {
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
        const isHoly = item.isHoly || (npcKey === 'nun' || npcKey === 'mother');
        div.className = `flex items-center justify-between p-3 mb-2 rounded-2xl gap-3 ${isHoly ? 'bg-[#25221e] border border-amber-900/40' : 'bg-zinc-800'}`;
        
        const imgSrc = item.image || 'assets/items/iron-sword.jpg';
        div.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <img src="${imgSrc}" class="w-14 h-14 object-cover rounded-xl border border-zinc-700 flex-shrink-0" alt="${item.name}" onerror="this.style.display='none'">
                <div class="min-w-0">
                    <div class="font-semibold text-sm">${item.name}</div>
                    <div class="text-xs text-zinc-400">${item.effect || ''}</div>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <div class="text-yellow-400 font-bold text-sm">${item.price}g</div>
                <button class="mt-1.5 px-4 py-1 text-xs fantasy-btn ${isHoly ? 'btn-holy' : 'btn-shop'} rounded-lg" data-index="${index}">Buy</button>
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
        // Put currently equipped item back into inventory (if any)
        if (item.type === 'weapon' && state.player.weapon) {
            addToInventory({ 
                name: state.player.weapon.name, 
                type: 'weapon', 
                bonus: state.player.weapon.bonus, 
                desc: `+${state.player.weapon.bonus} Damage`, 
                image: state.player.weapon.image 
            });
        } else if (item.type === 'armor' && state.player.armor) {
            addToInventory({ 
                name: state.player.armor.name, 
                type: 'armor', 
                bonus: state.player.armor.bonus, 
                desc: `+${state.player.armor.bonus} DEF`, 
                image: state.player.armor.image 
            });
        } else if (item.type === 'shield' && state.player.shield) {
            addToInventory({ 
                name: state.player.shield.name, 
                type: 'shield', 
                blockChance: state.player.shield.blockChance, 
                desc: `+${state.player.shield.blockChance || 15}% Block Chance`, 
                image: state.player.shield.image 
            });
        }

        // Equip the new item
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

    button.textContent = '✓ Bought';
    button.disabled = true;
    button.classList.add('opacity-60', 'btn-dialogue');
    button.classList.remove('btn-holy', 'btn-shop');

    // Refresh shop list after short delay so player sees updated gold
    setTimeout(() => {
        const shopModal = document.getElementById('shop-modal');
        if (shopModal && shopModal.style.display !== 'none') {
            // Re-render items to update "Bought" states if needed
            if (typeof showShopModal === 'function') {
                // Close and reopen is simplest reliable refresh
                shopModal.style.display = 'none';
                setTimeout(() => showShopModal(currentShopNpc), 60);
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
            <div class="fantasy-modal rounded-3xl w-full max-w-[620px] overflow-hidden">
                <!-- Header with Tabs -->
                <div class="flex justify-between items-center p-5 fantasy-modal-header border-b border-amber-900/30">
                    <div class="flex gap-1">
                        <div onclick="switchCharacterTab('character')" id="tab-character"
                             class="tab-button active px-5 py-1.5 text-sm font-semibold rounded-t cursor-pointer border-b-2 border-amber-400 text-amber-300">
                            Character
                        </div>
                        <div onclick="switchCharacterTab('spellbook')" id="tab-spellbook"
                             class="tab-button px-5 py-1.5 text-sm font-semibold rounded-t cursor-pointer text-zinc-400 hover:text-amber-200">
                            Spellbook
                        </div>
                    </div>
                    <button onclick="document.getElementById('character-modal').style.display='none'" 
                            class="fantasy-btn btn-action text-xl leading-none px-2 py-0 rounded">&times;</button>
                </div>
                
                <div class="p-5 bg-[#161410] rounded-b-3xl" id="character-content"></div>
            </div>
        `;
        document.body.appendChild(charModal);
    }

    // Store current tab on the modal element
    if (!charModal.dataset.currentTab) {
        charModal.dataset.currentTab = 'character';
    }

    renderCharacterContent(charModal.dataset.currentTab);
    charModal.style.display = 'flex';
}

function switchCharacterTab(tab) {
    const modal = document.getElementById('character-modal');
    if (!modal) return;

    modal.dataset.currentTab = tab;
    renderCharacterContent(tab);

    // Update tab styles
    const charTab = document.getElementById('tab-character');
    const spellTab = document.getElementById('tab-spellbook');

    if (tab === 'character') {
        charTab.classList.add('active', 'border-b-2', 'border-amber-400', 'text-amber-300');
        charTab.classList.remove('text-zinc-400');
        spellTab.classList.remove('active', 'border-b-2', 'border-amber-400', 'text-amber-300');
        spellTab.classList.add('text-zinc-400');
    } else {
        spellTab.classList.add('active', 'border-b-2', 'border-amber-400', 'text-amber-300');
        spellTab.classList.remove('text-zinc-400');
        charTab.classList.remove('active', 'border-b-2', 'border-amber-400', 'text-amber-300');
        charTab.classList.add('text-zinc-400');
    }
}

function renderCharacterContent(tab) {
    const content = document.getElementById('character-content');
    if (!content) return;

    const p = state.player;
    const blockChance = (typeof getPlayerBlockChance === 'function') ? getPlayerBlockChance() : 8;
    const critChance = (typeof getPlayerCritChance === 'function') ? getPlayerCritChance() : 7;
    const shieldText = p.shield ? `${p.shield.name} (+${p.shield.blockChance || 15}% Block)` : 'None equipped';

    if (tab === 'character') {
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-5">
                <!-- Left Column -->
                <div>
                    <div class="text-2xl font-bold text-amber-300">${p.name}</div>
                    <div class="text-sm text-zinc-400 mb-4">Level ${p.level || 1} Spellblade</div>

                    <div class="mb-4">
                        <div class="text-xs text-zinc-400 font-semibold mb-1.5">EQUIPPED</div>
                        <div class="text-sm space-y-1.5">
                            <div class="flex items-center gap-2">
                                <img src="${p.weapon?.image || 'assets/items/rusty-sword.jpg'}" class="w-8 h-8 object-cover rounded border border-zinc-700" alt="">
                                <span><b>Weapon:</b> ${p.weapon?.name || 'Rusty Sword'} <span class="text-emerald-400">(+${p.weapon?.bonus || 3})</span></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <img src="${p.armor?.image || 'assets/items/cloth-tunic.jpg'}" class="w-8 h-8 object-cover rounded border border-zinc-700" alt="">
                                <span><b>Armor:</b> ${p.armor?.name || 'Cloth Tunic'} <span class="text-emerald-400">(+${p.armor?.bonus || 1})</span></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <img src="${p.shield?.image || 'assets/items/wooden-shield.jpg'}" class="w-8 h-8 object-cover rounded border border-zinc-700" alt="">
                                <span><b>Shield:</b> ${shieldText}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Stats -->
                <div class="text-sm">
                    <div class="flex justify-between py-0.5"><span>HP</span> <span class="font-mono">${p.hp}/${p.maxHp}</span></div>
                    <div class="flex justify-between py-0.5"><span>MP</span> <span class="font-mono">${p.mp}/${p.maxMp}</span></div>
                    <div class="flex justify-between py-0.5"><span>XP</span> <span class="font-mono">${p.xp || 0}/100</span></div>
                    <div class="flex justify-between py-0.5"><span>Gold</span> <span class="font-mono text-yellow-400">${p.gold || 0}</span></div>

                    <div class="mt-3 pt-2 border-t border-amber-900/30 text-[13px]">
                        <div class="font-semibold text-xs text-zinc-400 mb-1">CORE STATS</div>
                        <div class="flex justify-between py-0.5"><span>STR</span> <span class="font-bold">${p.str || 5}</span></div>
                        <div class="flex justify-between py-0.5"><span>INT</span> <span class="font-bold">${p.int || 5}</span></div>
                        <div class="flex justify-between py-0.5"><span>DEF</span> <span class="font-bold">${p.def || 3}</span></div>
                        <div class="flex justify-between py-0.5"><span>DEX</span> <span class="font-bold">${p.dex || 5}</span></div>
                    </div>

                    <div class="mt-3 pt-2 border-t border-zinc-700 text-xs">
                        <div class="font-semibold text-emerald-300 mb-1">COMBAT STATS</div>
                        <div class="flex justify-between"><span>Block Chance</span> <span class="font-bold text-emerald-400">${blockChance}%</span></div>
                        <div class="flex justify-between"><span>Crit Chance</span> <span class="font-bold text-amber-400">${critChance}%</span></div>
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-zinc-700 text-[11px] text-zinc-500">
                <b>Block</b>: Greatly reduces damage with a shield. &nbsp;&nbsp; <b>Crit</b>: 65% extra damage on attacks.
            </div>
        `;
    } 
    else if (tab === 'spellbook') {
        // Spellbook Tab
        const slots = p.spellSlots || [null, null];
        const knownSpells = p.spells || [];

        content.innerHTML = `
            <div class="mb-4">
                <div class="text-amber-400 text-sm font-semibold mb-2">ACTIVE SPELL SLOTS</div>
                <div class="flex gap-3">
                    ${[0,1].map(i => {
                        const spell = slots[i];
                        const iconPath = spell ? `assets/spells/${spell.toLowerCase().replace(' ', '_')}.jpg` : null;
                        return `
                            <div onclick="assignSpellToSlot(${i})" 
                                 class="flex-1 h-[78px] flex flex-col items-center justify-center rounded-xl border cursor-pointer transition-all
                                 ${spell ? 'border-amber-600 bg-[#1f1a16]' : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'}">
                                ${spell 
                                    ? `<img src="${iconPath}" class="w-11 h-11 object-contain" onerror="this.style.display='none'">
                                       <div class="text-[10px] text-amber-200 leading-none mt-0.5">${spell}</div>` 
                                    : `<div class="text-zinc-400 text-xs">Empty Slot</div>`}
                            </div>`;
                    }).join('')}
                </div>
            </div>

            <div class="rounded-2xl" style="background-image: url('assets/spells/spellbook_bg.jpg'); background-size: cover; background-position: center; padding: 8px; background-color: rgba(20,17,14,0.85); background-blend-mode: multiply;">
                <div class="text-amber-400 text-sm font-semibold mb-2 px-1">SPELLBOOK</div>
                <div class="grid grid-cols-2 gap-2">
                    ${knownSpells.map(spell => {
                        const iconPath = `assets/spells/${spell.toLowerCase().replace(' ', '_')}.jpg`;
                        const isEquipped = slots.includes(spell);
                        return `
                            <div onclick="quickAssignSpell('${spell}')" 
                                 class="flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all hover:bg-[#25221e]
                                 ${isEquipped ? 'border-amber-600 bg-[#1f1a16]' : 'border-zinc-700 bg-zinc-800'}">
                                <img src="${iconPath}" class="w-10 h-10 object-contain" onerror="this.style.display='none'">
                                <div>
                                    <div class="text-sm text-amber-100">${spell}</div>
                                    <div class="text-[10px] text-zinc-500">${isEquipped ? 'Equipped' : 'Click to equip'}</div>
                                </div>
                            </div>`;
                    }).join('')}
                </div>
                ${knownSpells.length === 0 ? '<div class="text-zinc-500 text-xs mt-2 px-1">You don\'t know any spells yet. Buy tomes from shops.</div>' : ''}
            </div>
        `;
    }
}

// ==================== SPELL SLOT HELPERS ====================
window.assignSpellToSlot = function(slotIndex) {
    const p = state.player;
    if (!p.spellSlots) p.spellSlots = [null, null];

    // Toggle off if already equipped in this slot
    if (p.spellSlots[slotIndex]) {
        p.spellSlots[slotIndex] = null;
        showCharacterModal();
        save();
        return;
    }

    const known = p.spells || [];
    if (known.length === 0) {
        showToast("You don't know any spells yet.");
        return;
    }

    const choice = prompt("Type spell name for slot " + (slotIndex + 1) + ":\nAvailable: " + known.join(", "));
    if (!choice) return;

    const spell = known.find(s => s.toLowerCase() === choice.toLowerCase());
    if (!spell) {
        showToast("Spell not found.");
        return;
    }

    p.spellSlots = p.spellSlots.map(s => s === spell ? null : s);
    p.spellSlots[slotIndex] = spell;

    showCharacterModal();
    save();
    showToast(`Assigned <b>${spell}</b> to slot ${slotIndex + 1}`);
};

window.quickAssignSpell = function(spellName) {
    const p = state.player;
    if (!p.spellSlots) p.spellSlots = [null, null];

    let target = p.spellSlots.findIndex(s => !s);
    if (target === -1) target = 0;

    p.spellSlots = p.spellSlots.map(s => s === spellName ? null : s);
    p.spellSlots[target] = spellName;

    showCharacterModal();
    save();
    showToast(`Assigned <b>${spellName}</b> to slot ${target + 1}`);
};

// ==================== MAP FUNCTIONS (FIXED) ====================

// Map zoom / pan configuration
const DEFAULT_MAP_ZOOM = 1.3;   // Default when opening the map (30% zoomed in)
const MIN_MAP_ZOOM = 1.0;       // Maximum zoom out = 100% (cannot zoom out further)
const MAX_MAP_ZOOM = 6.0;       // High zoom in limit

function showMap() {
    const m = $('map-modal');
    if (m) {
        m.style.display = 'flex';
        m.classList.remove('hidden');
    }

    // Initialize with better defaults: 30% zoomed in
    if (typeof mapZoom === 'undefined' || mapZoom === null || mapZoom < 0.1) {
        mapZoom = DEFAULT_MAP_ZOOM;
    }
    if (typeof mapPanX === 'undefined') mapPanX = 0;
    if (typeof mapPanY === 'undefined') mapPanY = 0;

    clampMapPan();

    // Enable improved interactions + show current location
    setTimeout(() => {
        initMapInteractions();
        updateMapCurrentLocation();

        // Center view on current location when first opening (nice at 1.3x default)
        centerMapOnCurrentLocation();

        clampMapPan();
        updateMapTransform();
    }, 70);
}

function hideMap() {
    const m = $('map-modal');
    if (m) {
        m.style.display = 'none';
        m.classList.add('hidden');
    }
    detachMapDragHandlers();
}

function updateMapTransform() {
    const viewport = $('map-content');
    const inner = $('map-inner');
    if (!viewport || !inner) return;

    const zoom = mapZoom || 1;
    const tx = mapPanX || 0;
    const ty = mapPanY || 0;

    // Apply transform ONLY to the inner layer. The outer #map-content stays as a clean viewport
    // with overflow-hidden + rounded corners. This guarantees the map never visually escapes the box.
    inner.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    inner.style.transformOrigin = '0 0';

    // Counter-scale the markers so they stay a constant readable size while their position follows the map.
    // Markers now live inside #map-inner, so they naturally move with pan/zoom.
    const markers = inner.querySelectorAll('.map-marker');
    markers.forEach(m => {
        m.style.transform = `scale(${1 / zoom})`;
        m.style.transformOrigin = 'center bottom';
    });
}

function zoomMap(delta) {
    const oldZoom = mapZoom || 1;
    const newZoom = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, oldZoom + delta));
    setMapZoom(newZoom);
}

function setMapZoom(newZoom, focalX = null, focalY = null) {
    const viewport = $('map-content');
    if (!viewport) return;

    const oldZoom = mapZoom || 1;
    const zoom = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, newZoom));

    if (focalX !== null && focalY !== null) {
        // Zoom toward a specific point (used by wheel + pinch)
        const rect = viewport.getBoundingClientRect();
        const px = focalX - rect.left;
        const py = focalY - rect.top;

        // Convert point to world space before zoom change
        const worldX = (px - (mapPanX || 0)) / oldZoom;
        const worldY = (py - (mapPanY || 0)) / oldZoom;

        // Apply new zoom
        mapZoom = zoom;

        // Recalculate pan so the focal point stays under the cursor/finger
        mapPanX = px - worldX * mapZoom;
        mapPanY = py - worldY * mapZoom;
    } else {
        mapZoom = zoom;
    }

    clampMapPan();
    updateMapTransform();

    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mapZoom * 100) + '%';
}

function resetMapZoom() {
    mapZoom = DEFAULT_MAP_ZOOM;
    mapPanX = 0;
    mapPanY = 0;
    centerMapOnCurrentLocation();
    clampMapPan();
    updateMapTransform();
    const zl = $('zoom-level');
    if (zl) zl.textContent = Math.round(mapZoom * 100) + '%';
}

function clampMapPan() {
    const viewport = $('map-content');
    if (!viewport) return;

    const W = viewport.clientWidth;
    const H = viewport.clientHeight;
    const z = mapZoom || 1;

    const scaledW = W * z;
    const scaledH = H * z;

    // Bounded panning: the map image must always stay fully inside the visible map box.
    // The outer #map-content acts as the viewport (with overflow-hidden + rounded corners).
    // The inner #map-inner receives the transform. This guarantees no visual escape from the box.
    if (scaledW > W) {
        const minX = W - scaledW;
        const maxX = 0;
        mapPanX = Math.max(minX, Math.min(maxX, mapPanX || 0));
    } else {
        mapPanX = (W - scaledW) / 2;
    }

    if (scaledH > H) {
        const minY = H - scaledH;
        const maxY = 0;
        mapPanY = Math.max(minY, Math.min(maxY, mapPanY || 0));
    } else {
        mapPanY = (H - scaledH) / 2;
    }
}

function centerMapOnCurrentLocation() {
    const viewport = $('map-content');
    if (!viewport || !state.location) return;

    const W = viewport.clientWidth;
    const H = viewport.clientHeight;
    const z = mapZoom || DEFAULT_MAP_ZOOM;

    // Approximate marker positions as percentages (same data as the pins)
    const locationPositions = {
        village: { x: 0.28, y: 0.62 },   // left:28%, bottom:38% → y from top ≈ 62%
        woods:   { x: 0.48, y: 0.45 },
        ruins:   { x: 0.78, y: 0.32 },
        church:  { x: 0.28, y: 0.62 },
        wildermarch: { x: 0.22, y: 0.28 }  // wild area northwest of the village/woods
    };

    const pos = locationPositions[state.location] || locationPositions.village;

    // Convert percentage to "world" pixel coordinates (relative to unscaled map)
    const worldX = W * pos.x;
    const worldY = H * pos.y;

    // We want this world point to appear in the center of the container
    const desiredScreenX = W / 2;
    const desiredScreenY = H / 2;

    mapPanX = desiredScreenX - worldX * z;
    mapPanY = desiredScreenY - worldY * z;
}

function updateMapCurrentLocation() {
    const marker = $('map-current-marker');
    const content = $('map-content');
    if (!marker || !content || !state.location) return;

    // Approximate positions matching the static pins (in %)
    const positions = {
        village: { bottom: '38%', left: '28%' },
        woods:   { bottom: '55%', left: '48%' },
        ruins:   { top: '32%', right: '22%' },
        church:  { bottom: '38%', left: '28%' }, // church is inside village
        wildermarch: { top: '28%', left: '22%' }
    };

    const pos = positions[state.location] || positions.village;

    // Reset all positioning
    marker.style.top = '';
    marker.style.bottom = '';
    marker.style.left = '';
    marker.style.right = '';

    Object.assign(marker.style, pos);
    marker.classList.remove('hidden');
    marker.style.display = 'block';
}

// ==================== IMPROVED MAP INTERACTIONS ====================
let mapInteractionsInitialized = false;
let mapPointerId = null;
let lastTouchDist = 0;

function initMapInteractions() {
    const viewport = $('map-content');
    if (!viewport) return;

    // Prevent the old attach function from doing anything
    if (mapInteractionsInitialized) return;

    // Critical for mobile: disable browser touch behaviors (scroll, zoom, etc.)
    viewport.style.touchAction = 'none';
    viewport.style.cursor = 'grab';

    // --- POINTER EVENTS (best unified mouse + touch + pen support) ---
    viewport.addEventListener('pointerdown', (e) => {
        // Only primary pointer for dragging
        if (mapPointerId !== null) return;

        mapPointerId = e.pointerId;
        viewport.setPointerCapture(e.pointerId);

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        viewport.style.cursor = 'grabbing';
    });

    viewport.addEventListener('pointermove', (e) => {
        if (!isDragging || e.pointerId !== mapPointerId) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        mapPanX = (mapPanX || 0) + dx;
        mapPanY = (mapPanY || 0) + dy;

        dragStartX = e.clientX;
        dragStartY = e.clientY;

        clampMapPan();
        updateMapTransform();
    });

    const endPointer = (e) => {
        if (e.pointerId !== mapPointerId) return;

        isDragging = false;
        mapPointerId = null;
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
        viewport.style.cursor = 'grab';

        // Final safety clamp
        clampMapPan();
        updateMapTransform();
    };

    viewport.addEventListener('pointerup', endPointer);
    viewport.addEventListener('pointercancel', endPointer);

    // --- MOUSE WHEEL ZOOM (excellent desktop experience) ---
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY < 0 ? 0.18 : -0.18;   // smooth step
        const newZoom = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, (mapZoom || 1) + delta));

        // Zoom toward mouse cursor position
        setMapZoom(newZoom, e.clientX, e.clientY);
    }, { passive: false });

    // --- BASIC PINCH-TO-ZOOM (touch) ---
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isDragging = false; // cancel single-finger drag
            lastTouchDist = getTouchDistance(e.touches);
        }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault(); // stop page from scrolling/zooming

            const currentDist = getTouchDistance(e.touches);
            if (lastTouchDist > 0) {
                const zoomFactor = currentDist / lastTouchDist;
                const newZoom = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, (mapZoom || 1) * zoomFactor));

                // Use midpoint of the two fingers as focal point
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                setMapZoom(newZoom, midX, midY);
            }
            lastTouchDist = currentDist;
        }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            lastTouchDist = 0;
        }
    });

    mapInteractionsInitialized = true;

    // Initial transform + markers
    clampMapPan();
    updateMapTransform();
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

function detachMapDragHandlers() {
    // For backward compatibility with hideMap()
    isDragging = false;
    mapPointerId = null;
    lastTouchDist = 0;
}

// ==================== INVENTORY (rewritten - clean, supports Mana + stacking) ====================

function showInventory() {
    let m = document.getElementById('inv-m');
    if (!m) {
        m = document.createElement('div');
        m.id = 'inv-m';
        m.className = 'fixed inset-0 bg-black/80 z-[95] flex items-center justify-center p-4';
        m.innerHTML = `
            <div class="fantasy-modal rounded-3xl max-w-md w-full p-5">
                <div class="flex justify-between items-center mb-3 fantasy-modal-header -mx-5 -mt-5 px-5 py-4 rounded-t-3xl border-b border-amber-900/20">
                    <h3 class="font-bold text-lg text-amber-300">Inventory</h3>
                    <button onclick="hideInv()" class="fantasy-btn btn-action text-xl leading-none px-2 py-0 rounded">&times;</button>
                </div>
                <div id="inv-l" class="max-h-[320px] overflow-auto pr-1 space-y-1.5"></div>
                <div class="mt-4 text-xs text-amber-900/70 border-t border-amber-900/20 pt-3">Tap Use to consume potions. Gear is equipped via the shop.</div>
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
                    ${isConsumable ? `<button class="px-3 py-1 text-xs fantasy-btn btn-shop rounded-lg active:scale-[0.985]" onclick="useInvItem(${i})">Use</button>` : ''}
                    <button class="px-3 py-1 text-xs fantasy-btn bg-[#2a2119] text-amber-300 border border-amber-900/50 hover:bg-[#3a2a1f] rounded-lg" onclick="dropInvItem(${i})">Drop</button>
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
            <div class="fantasy-modal rounded-3xl w-full max-w-[680px] overflow-hidden">
                <div class="flex justify-between items-center p-5 fantasy-modal-header border-b border-amber-900/30">
                    <h3 class="font-bold text-xl text-amber-300"><i class="fas fa-scroll mr-2"></i> Quest Journal</h3>
                    <button onclick="document.getElementById('quest-journal').style.display='none'" class="fantasy-btn btn-action text-xl leading-none px-2 py-0 rounded">&times;</button>
                </div>
                <div class="p-5 max-h-[70vh] overflow-auto bg-[#161410]" id="quest-journal-content"></div>
                <div class="p-3 fantasy-modal-header border-t border-amber-900/20 text-xs text-amber-900/70 text-center">
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
        container.innerHTML = `<div class="text-center py-8 text-amber-900/70 italic">You have no active quests.</div>`;
    } else {
        activeQuests.forEach(q => {
            const div = document.createElement('div');
            div.className = 'mb-4 fantasy-panel rounded-2xl p-4 border border-amber-900/20';

            const progressHtml = q.objectives.map(obj => {
                const pct = obj.max ? Math.min(100, Math.floor((obj.current / obj.max) * 100)) : (obj.complete ? 100 : 0);
                return `
                    <div class="mb-2">
                        <div class="flex justify-between text-sm mb-1">
                            <span>${obj.text}</span>
                            <span class="text-emerald-400 font-mono">${obj.current || 0}${obj.max ? '/' + obj.max : ''}</span>
                        </div>
                        <div class="h-1.5 fantasy-stat-bar rounded"><div class="h-1.5 bg-emerald-600 rounded" style="width:${pct}%"></div></div>
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
                    <button onclick="toggleJournalLore('${loreId}')" class="text-xs px-2 py-1 fantasy-btn btn-action rounded flex items-center gap-1">
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

// Descend function for Ruins dungeon (available globally)
window.descendTemple = function descendTemple() {
    if (state.inCombat) return;
    const current = state.templeLevel || 1;
    if (current >= 3) {
        log("You have reached the deepest level of the temple.");
        return;
    }
    state.templeLevel = current + 1;
    log(`You descend deeper into the temple... now on Level ${state.templeLevel}.`, true);
    updateAll();
    save();
};

// Safety
if(typeof window.updateAll!=='function') window.updateAll=()=> { if(typeof updateStats==='function')updateStats(); if(typeof renderActions==='function')renderActions(); if(typeof renderStory==='function')renderStory(); };
setTimeout(()=>{ if(typeof updateAll==='function') updateAll(); if(typeof renderActions==='function') renderActions(); }, 900);