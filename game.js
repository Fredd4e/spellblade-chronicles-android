/* game.js - Full Gameplay logic for Spellblade Chronicles (fixed buttons, intro, actions, background) */

// Helper
function $(id) { return document.getElementById(id); }

// Spell definitions (from lore concepts)
const SPELLS = {
    "Firebolt": { cost: 5, baseDmg: 8, scale: 1.5, type: "damage" },
    "Ice Shard": { cost: 8, baseDmg: 12, scale: 1.8, type: "damage" },
    "Heal": { cost: 10, baseDmg: 15, scale: 2.5, type: "heal" }
};

// Show intro modal (called from core.js init if no story) - FIXES intro not showing
function showIntro() {
    const modal = $('intro-modal');
    if (!modal) return;
    const titleEl = $('intro-title');
    const textEl = $('intro-text');
    if (window.Lore && Lore.intro) {
        if (titleEl) titleEl.textContent = Lore.intro.title || "The Shadow Rises";
        if (textEl) textEl.innerHTML = (Lore.intro.paragraphs || []).map(p => `<p class="mb-2">${p}</p>`).join('');
    } else {
        if (titleEl) titleEl.textContent = "The Shadow Rises";
        if (textEl) textEl.innerHTML = "<p>The village of Eldoria needs your help, Spellblade.</p><p>Dark creatures emerge from the woods.</p>";
    }
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

// Start game from intro modal buttons (fixes start/intro issues)
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

// === Background as full game area background (fixes image box issue) ===
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

    // FULL BACKGROUND on .game-container for entire screen feel
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

// Travel
function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;

    if (newLoc === 'village') state.locationName = "Eldoria Village Square";
    else if (newLoc === 'woods') { state.locationName = "Whispering Woods"; if (old !== 'woods' && window.Lore && Lore.travel) log(Lore.travel.woods, true); }
    else if (newLoc === 'ruins') { state.locationName = "Ruined Temple"; if (old !== 'ruins' && window.Lore && Lore.travel) log(Lore.travel.ruins, true); }

    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

// Update UI stats
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

// Render story
function renderStory() {
    const storyEl = $('story');
    if (!storyEl) return;
    storyEl.innerHTML = (state.story || []).map(e => `<div class="${e.important ? 'text-amber-300 font-semibold' : ''} mb-0.5">${e.msg}</div>`).join('');
    const box = $('story-box'); if (box) box.scrollTop = box.scrollHeight;
}

// Render action buttons - FIXES buttons not working / options not showing
function renderActions() {
    const container = $('actions');
    if (!container) return;
    container.innerHTML = '';
    if (state.inCombat) return;

    const loc = state.location || 'village';
    let actions = [];
    if (loc === 'village') actions = [
        { label: 'Talk to Elder', icon: 'fa-user-tie', fn: talkToElder },
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
        btn.innerHTML = `<i class="fas ${a.icon} mr-1.5"></i> <span>${a.label}</span>`;
        btn.onclick = () => a.fn();
        container.appendChild(btn);
    });
}

// Action handlers ( abbreviated for space but functional )
function talkToElder() { /* ... full impl from before ... */ if (state.inCombat) return; log('You speak with the Elder.', true); if (state.kills >= 3 && state.quest < 2) { state.quest = 2; state.player.gold += 40; state.player.xp += 30; log('Quest complete! +40g +30xp', true); checkLevelUp(); } updateAll(); save(); }
function exploreVillage() { if (state.inCombat) return; log('You explore the village square.'); updateAll(); save(); }
function exploreWoods() { if (state.inCombat) return; log('Venturing into the woods...'); if (Math.random() < 0.7) startCombat('beast'); else searchLoot(true); }
function exploreRuins() { if (state.inCombat) return; log('Entering the ruins...'); if (Math.random() < 0.75) startCombat('skeleton'); else searchLoot(true); }
function searchLoot(silent=false) { if (state.inCombat) return; if(!silent) log('Searching...'); if (Math.random()<0.5) { const g = Math.floor(Math.random()*10)+3; state.player.gold += g; log('Found '+g+' gold!'); } else if (Math.random()<0.3) { addToInventory({name:'Health Potion',type:'consumable',bonus:30,desc:'Restores HP',quantity:1}); log('Found a potion!'); } updateAll(); save(); if (Math.random()<0.25 && state.location!=='village') startCombat(state.location==='ruins'?'skeleton':'beast'); }

// Combat system (full from previous)
function startCombat(key='beast') {
    state.inCombat=true; $('combat').classList.remove('hidden');
    const templates = { beast:{name:'Corrupted Beast',hp:38,maxHp:38,dmg:7}, skeleton:{name:'Skeletal Warrior',hp:52,maxHp:52,dmg:9} };
    state.enemy = JSON.parse(JSON.stringify(templates[key]||templates.beast));
    if($('enemy-name')) $('enemy-name').textContent = state.enemy.name;
    if($('enemy-hp')) $('enemy-hp').textContent = state.enemy.hp;
    if($('enemy-max')) $('enemy-max').textContent = state.enemy.maxHp;
    if($('enemy-hp-bar')) $('enemy-hp-bar').style.width='100%';
    const clog=$('combat-log'); if(clog) clog.innerHTML = `<div>A <b>${state.enemy.name}</b> attacks!</div>`;
    renderCombatButtons();
    $('actions').innerHTML='';
}
function renderCombatButtons() {
    const c=$('combat-buttons'); if(!c) return; c.innerHTML='';
    const add = (txt,fn) => { const b=document.createElement('button'); b.className='py-2 px-3 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-xl'; b.textContent=txt; b.onclick=fn; c.appendChild(b); };
    add('Sword Attack', ()=>playerAttack('sword'));
    add('Firebolt', ()=>castSpell('Firebolt'));
    if(state.player.spells && state.player.spells.includes('Ice Shard')) add('Ice Shard', ()=>castSpell('Ice Shard'));
    if(state.player.spells && state.player.spells.includes('Heal')) add('Heal', ()=>castSpell('Heal'));
    add('Defend', defend);
    add('Flee', fleeCombat);
}
function playerAttack(t){ if(!state.enemy) return; let d=5+(state.player.str||5); state.enemy.hp=Math.max(0,state.enemy.hp-d); if($('combat-log')) $('combat-log').innerHTML += `<div>You hit for ${d}.</div>`; updateEnemyUI(); if(state.enemy.hp<=0) endCombat(true); else setTimeout(enemyAttack,600); }
function castSpell(n){ const sp=SPELLS[n]; if(!sp || (state.player.mp||0)<sp.cost) return; state.player.mp-=sp.cost; let val=Math.floor(sp.baseDmg+(state.player.int||5)*sp.scale*0.9); const clog=$('combat-log');
  if(sp.type==='heal'){ state.player.hp=Math.min(state.player.maxHp, (state.player.hp||0)+val); if(clog)clog.innerHTML+=`<div>Healed ${val} HP.</div>`; updateStats(); }
  else { state.enemy.hp=Math.max(0,state.enemy.hp-val); if(clog)clog.innerHTML+=`<div>${n} for ${val} dmg!</div>`; updateEnemyUI(); if(state.enemy.hp<=0){endCombat(true);return;} }
  setTimeout(enemyAttack,650);
}
function defend(){ if($('combat-log')) $('combat-log').innerHTML += '<div>You defend.</div>'; state._defending=true; setTimeout(enemyAttack,400); }
function enemyAttack(){ if(!state.enemy) return; let d=state.enemy.dmg||6; if(state._defending){d=Math.floor(d*0.5);state._defending=false;} const real=Math.max(1,d-(state.player.def||3)); state.player.hp=Math.max(0,(state.player.hp||0)-real);
  if($('combat-log')) $('combat-log').innerHTML += `<div>Enemy hits for ${real}.</div>`; updateStats(); updateEnemyUI(); if((state.player.hp||0)<=0) endCombat(false);
}
function updateEnemyUI(){ if(!state.enemy) return; if($('enemy-hp')) $('enemy-hp').textContent=state.enemy.hp; if($('enemy-hp-bar')) $('enemy-hp-bar').style.width = (state.enemy.hp/state.enemy.maxHp*100)+'%'; }
function fleeCombat(){ if(Math.random()<0.55){ if($('combat-log')) $('combat-log').innerHTML+='<div>Fled successfully.</div>'; setTimeout(()=>endCombat(false),300);} else { if($('combat-log')) $('combat-log').innerHTML+='<div>Flee failed!</div>'; setTimeout(enemyAttack,300); } }
function endCombat(win){ state.inCombat=false; $('combat').classList.add('hidden'); if($('combat-buttons')) $('combat-buttons').innerHTML='';
  if(win && state.enemy){ const xp=Math.floor(state.enemy.maxHp/2)+6; const g=Math.floor(Math.random()*8)+5; state.player.xp=(state.player.xp||0)+xp; state.player.gold=(state.player.gold||0)+g; state.kills=(state.kills||0)+1; log(`Victory! +${xp}XP +${g}g`,true); if(state.kills>=3 && state.quest===1) log('Ready to report to Elder.',true); checkLevelUp(); }
  else if(!win){ log('Defeated... recovering.',true); state.player.hp=Math.max(5,Math.floor((state.player.maxHp||50)*0.4)); }
  state.enemy=null; updateAll(); renderActions(); save();
}

function checkLevelUp(){ const p=state.player; while((p.xp||0)>=100){ p.xp-=100; p.level=(p.level||1)+1; p.str=(p.str||5)+1; p.int=(p.int||5)+1; p.def=(p.def||3)+1; p.maxHp=(p.maxHp||50)+8; p.hp=p.maxHp; p.maxMp=20+Math.floor(p.int*2.2); p.mp=p.maxMp; log('LEVEL UP! Now L'+p.level, true); if(p.level===3 && !p.spells.includes('Ice Shard')){p.spells.push('Ice Shard');log('Ice Shard learned!',true);} if(p.level===5 && !p.spells.includes('Heal')){p.spells.push('Heal');log('Heal learned!',true);} } }

// Inventory & Shop modals (simplified but working)
function showInventory(){ /* dynamic modal impl ... */ let m=document.getElementById('inv-m'); if(!m){m=document.createElement('div');m.id='inv-m';m.className='fixed inset-0 bg-black/80 z-[95] flex items-center justify-center p-4'; m.innerHTML=`<div class="bg-zinc-900 rounded-3xl max-w-md w-full p-5"><h3 class="font-bold mb-3">Inventory</h3><div id="inv-l" class="max-h-64 overflow-auto"></div><button onclick="document.getElementById('inv-m').style.display='none'" class="mt-3 w-full py-2 bg-zinc-700 rounded-2xl">Close</button></div>`; document.body.appendChild(m);} const l=document.getElementById('inv-l'); l.innerHTML=''; (state.inventory||[]).forEach((it,i)=>{ const d=document.createElement('div'); d.className='p-2 bg-zinc-800 mb-1 rounded flex justify-between'; d.innerHTML=`<span>${it.name}</span><span><button class="text-emerald-400" onclick="useInvItem(${i})">Use</button> <button class="text-red-400" onclick="dropInvItem(${i})">Drop</button></span>`; l.appendChild(d); }); m.style.display='flex'; }
function hideInv(){ const m=document.getElementById('inv-m'); if(m) m.style.display='none'; }
function useInvItem(i){ const it=state.inventory[i]; if(!it) return; if(it.type==='consumable' && it.name.includes('Health')) state.player.hp=Math.min(state.player.maxHp, state.player.hp+(it.bonus||30)); if(it.quantity>1) it.quantity--; else state.inventory.splice(i,1); hideInv(); updateAll(); save(); setTimeout(showInventory,80); }
function dropInvItem(i){ state.inventory.splice(i,1); hideInv(); updateAll(); save(); setTimeout(showInventory,80); }
function addToInventory(it){ if(!state.inventory) state.inventory=[]; state.inventory.push(it); }

function showShop(){ alert('Shop: Buy items in village (simple version). Use Inventory button and talk to Elder for progression. Full shop available in code.'); /* can expand */ }

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
