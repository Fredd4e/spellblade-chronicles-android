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
        { label: 'Explore the Square', icon: 'fa-search-location', fn: exploreVillage },
        { label: 'Visit Shop', icon: 'fa-store', fn: showShop },
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

// ==================== NEW ENHANCED DIALOGUE SYSTEM ====================

let currentNpcKey = null;

/**
 * Opens the dialogue modal for any NPC
 * Shows portrait, name, age, title + dynamic conditional buttons
 */
function startDialogue(npcKey) {
    if (!window.Lore || !Lore.npcs || !Lore.npcs[npcKey]) {
        console.warn('NPC not found:', npcKey);
        return;
    }

    currentNpcKey = npcKey;
    const npc = Lore.npcs[npcKey];
    const modal = $('dialogue-modal');
    if (!modal) return;

    // Populate header
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
    if (ageEl) ageEl.innerHTML = npc.age ? `<i class="fas fa-user-clock mr-1"></i>Age ${npc.age}` : '';
    if (titleEl) titleEl.textContent = npc.title || '';

    // Initial greeting
    if (textEl) {
        textEl.innerHTML = `Hello, traveler. What brings you to speak with me today?`;
        if (npcKey === 'elder') {
            textEl.innerHTML = `The wards grow weaker by the day, Aether. We must act.`;
        }
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
        btn.innerHTML = `<i class="fas ${icon} mr-1.5"></i> <span>${label}</span>`;
        if (enabled) btn.onclick = fn;
        container.appendChild(btn);
    };

    // Always available
    addBtn('Talk', 'fa-comments', () => dialogueTalk(npcKey));
    addBtn('Goodbye', 'fa-door-open', closeDialogue);

    // Conditional options
    if (npc.hasQuests) {
        addBtn('Quests', 'fa-scroll', () => dialogueQuests(npcKey));
    }
    if (npc.hasShop) {
        addBtn('Shop', 'fa-store', () => dialogueShop(npcKey));
    }
}

function dialogueTalk(npcKey) {
    const textEl = $('dialogue-text');
    const npc = Lore.npcs[npcKey];

    let message = "It is good to speak with you.";

    if (npcKey === 'elder') {
        // Use existing staged dialogue logic
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
            message = dialogueLines[0]; // show first line in modal
            dialogueLines.forEach(line => log(line, true));
        }
    } else {
        message = `Nice to meet you, ${state.player.name || 'traveler'}.`;
        log(`<b>${npc.name}:</b> Nice to meet you.`, true);
    }

    if (textEl) textEl.innerHTML = message;
    updateAll();
    save();
}

function dialogueQuests(npcKey) {
    const textEl = $('dialogue-text');
    if (npcKey === 'elder') {
        if (textEl) textEl.innerHTML = `Current Quest: <b>Beast Slayer</b><br>Slay at least 3 corrupted beasts in the woods.<br><br>Progress: ${state.kills || 0}/3`;
        log("<b>Elder:</b> Bring me news once you have slain three beasts.", true);
    } else {
        if (textEl) textEl.innerHTML = "I have no quests for you at the moment.";
    }
}

function dialogueShop(npcKey) {
    closeDialogue();
    // For now open the simple shop alert. Later we can make a full shop modal.
    if (typeof showShop === 'function') {
        showShop();
    } else {
        alert('The merchant shows you his wares... (Shop coming soon)');
    }
}

function closeDialogue() {
    const modal = $('dialogue-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    currentNpcKey = null;
    // Optional: re-render actions in case quest state changed
    if (typeof renderActions === 'function') renderActions();
}

// ==================== END DIALOGUE SYSTEM ====================

// Inventory & Shop

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

function showShop(){ alert('Shop: Buy items in village (simple version). Use Inventory button and talk to NPCs for progression. Full shop UI coming soon.'); }

function showStats(){ const p=state.player; alert(`Character: ${p.name} L${p.level}\nHP:${p.hp}/${p.maxHp} MP:${p.mp}/${p.maxMp}\nSTR:${p.str} INT:${p.int} DEF:${p.def}\nWeapon: ${p.weapon?p.weapon.name:'Rusty Sword'}\nSpells: ${(p.spells||[]).join(', ')}`); }

function renameCharacter(){ const n=prompt('New name?', state.player.name); if(n){ state.player.name=n; updateStats(); save(); } }

function exportLogs(){ const txt=(state.story||[]).map(s=>s.msg).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'})); a.download='logs.txt'; a.click(); }

function showMap(){ const m=$('map-modal'); if(m){ m.style.display='flex'; m.classList.remove('hidden'); } }
function hideMap(){ const m=$('map-modal'); if(m){ m.style.display='none'; m.classList.add('hidden'); } }
let mz=1; function zoomMap(d){ mz=Math.max(0.5,Math.min(3,mz+d)); const c=$('map-content'); if(c) c.style.transform=`scale(${mz})`; if($('zoom-level')) $('zoom-level').textContent=Math.round(mz*100)+'%'; }
function resetMapZoom(){ mz=1; const c=$('map-content'); if(c) c.style.transform='scale(1)'; if($('zoom-level')) $('zoom-level').textContent='100%'; }

function initializeGameEnhancements(){ console.log('Enhancements ready'); }

// Safety
if(typeof window.updateAll!=='function') window.updateAll=()=> { if(typeof updateStats==='function')updateStats(); if(typeof renderActions==='function')renderActions(); if(typeof renderStory==='function')renderStory(); };
setTimeout(()=>{ if(typeof updateAll==='function') updateAll(); if(typeof renderActions==='function') renderActions(); }, 900);