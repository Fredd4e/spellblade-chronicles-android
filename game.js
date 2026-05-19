// game.js - Combat, UI, Quests, World logic (combined for simplicity)

function renderStory() {
    const el = document.getElementById('story');
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
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = Math.max(0, pct) + '%'; };

    set('player-name', p.name);
    set('level', p.level);
    set('hp', `${p.hp}/${p.maxHp}`);
    set('mp', `${p.mp}/${p.maxMp}`);
    set('xp', `${p.xp}/${p.level * 80 + 20}`);
    set('gold', p.gold);
    set('str', p.str);
    set('int', p.int);
    set('def', p.def);
    setWidth('hp-bar', (p.hp / p.maxHp) * 100);
    setWidth('mp-bar', (p.mp / p.maxMp) * 100);
    set('location', state.locationName);
}

// ==================== COMBAT ====================
function startFight() {
    let pool = [
        {name:"Goblin Scout",hp:22,maxHp:22,atk:7,def:2,xp:18,gold:6},
        {name:"Forest Wolf",hp:32,maxHp:32,atk:8,def:3,xp:26,gold:9}
    ];
    if (state.player.level >= 2) {
        pool.push({name:"Shadow Stalker",hp:28,maxHp:28,atk:10,def:2,xp:32,gold:12});
    }
    state.enemy = pool[Math.floor(Math.random()*pool.length)];
    state.inCombat = true;
    const logEl = document.getElementById('combat-log');
    if (logEl) logEl.innerHTML = '';
    // setEnemyImage(state.enemy.name);
    addCombatLog(`A <b>${state.enemy.name}</b> emerges from the shadows!`);
    updateCombatUI();
    renderActions();
}

function endCombatWin() {
    const e = state.enemy;
    const p = state.player;
    p.gold += e.gold || 10;
    p.xp += e.xp || 20;
    state.kills++;

    // Merchant Quest Completion Fix
    if (state.quest === 10 && (e.name === "Corrupted Wolf" || e.name.toLowerCase().includes('corrupted'))) {
        state.quest = 11;
        const reward = 60;
        p.gold += reward;
        log(`<b>Quest Complete!</b> You defeated the corrupted wolf! (+${reward} gold)`, true);
    }

    if (p.xp >= p.level * 80 + 20) {
        p.level++;
        p.xp = 0;
        p.maxHp += 7;
        p.hp = p.maxHp;
        p.str++;
        p.int++;
        p.def++;
        recalculateMaxStats();
        log(`<b>LEVEL UP!</b> You are now Level ${p.level}!`, true);
    }
    endCombat();
}

function endCombat() {
    state.inCombat = false;
    state.enemy = null;
    const combat = document.getElementById('combat');
    if (combat) combat.classList.add('hidden');
    renderActions();
    updateAll();
    save();
}

function addCombatLog(msg) {
    const el = document.getElementById('combat-log');
    if (!el) return;
    const d = document.createElement('div');
    d.innerHTML = msg;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
}

function updateCombatUI() {
    if (!state.enemy) return;
    const e = state.enemy;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    set('enemy-name', e.name);
    set('enemy-hp', e.hp);
    set('enemy-max', e.maxHp);
    const bar = document.getElementById('enemy-hp-bar');
    if (bar) bar.style.width = Math.max(0, (e.hp / e.maxHp) * 100) + '%';
}

// Placeholder functions (to be expanded)
function swordAttack() {}
function castSpell() {}
function castFirebolt() {}
function castIceShard() {}
function castHealSpell() {}
function renderCombatButtons() {}
function defend() {}
function flee() {}

// Quest functions
function showElderQuests() {}
function completeElderQuest() {}
function showMerchantQuests() {}

// UI & World functions
function showInventory() {}
function showStats() {}
function renderActions() {}
function showMap() {}
function setupMapDragging() {}

console.log("game.js loaded");
