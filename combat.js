/* combat.js - Turn-based combat system, spells, and progression for Spellblade Chronicles */

// Spell definitions
const SPELLS = {
    "Firebolt": { cost: 5, baseDmg: 8, scale: 1.5, type: "damage" },
    "Ice Shard": { cost: 8, baseDmg: 12, scale: 1.8, type: "damage" },
    "Heal": { cost: 10, baseDmg: 15, scale: 2.5, type: "heal" },
    "Divine Light": { cost: 9, baseDmg: 14, scale: 1.6, type: "damage", isHoly: true }
};

// ==================== STAT HELPERS ====================
function getPlayerBlockChance() {
    const p = state.player || {};
    let chance = 5 + Math.floor((p.dex || 5) / 3); // base + dex scaling
    if (p.shield && p.shield.blockChance) {
        chance += p.shield.blockChance;
    }
    return Math.min(70, Math.max(5, chance)); // reasonable cap
}

function getPlayerCritChance() {
    const p = state.player || {};
    let chance = 5 + Math.floor((p.dex || 5) / 4);
    return Math.min(40, Math.max(3, chance));
}

// ==================== EXPANDED ENEMY SYSTEM ====================
const ENEMY_TEMPLATES = {
    beast:          { name: 'Corrupted Beast',     hp: 38, maxHp: 38,  dmg: 7  },
    wolf:           { name: 'Forest Wolf',         hp: 32, maxHp: 32,  dmg: 6  },
    goblin:         { name: 'Goblin Scout',        hp: 44, maxHp: 44,  dmg: 8  },
    skeleton:       { name: 'Skeletal Warrior',    hp: 52, maxHp: 52,  dmg: 9  },
    shadow:         { name: 'Shadow Stalker',      hp: 61, maxHp: 61,  dmg: 11 },
    guardian:       { name: 'Temple Guardian',     hp: 78, maxHp: 78,  dmg: 13 },
    // Female Demons (Ruins Level 2+)
    succubus:       { name: 'Succubus Warmaiden',  hp: 68, maxHp: 68,  dmg: 12 },
    demoness:       { name: 'Demoness Guardian',   hp: 85, maxHp: 85,  dmg: 15 },
    overlord:       { name: 'Demoness Overlord',   hp: 110, maxHp: 110, dmg: 18, isBoss: true },
    // Boss
    fallen:         { name: 'Fallen Spellblade',   hp: 115, maxHp: 115, dmg: 16, isBoss: true }
};

function getEnemyImageSrc(key, enemy) {
    const name = (enemy && enemy.name || '').toLowerCase();
    if (key === 'fallen' || name.includes('fallen')) return 'assets/creatures/fallen-spellblade.jpg';
    if (key === 'overlord' || name.includes('overlord')) return 'assets/creatures/demoness-overlord.jpg';
    if (key === 'demoness' || name.includes('demoness guardian')) return 'assets/creatures/demoness-guardian.jpg';
    if (key === 'succubus' || name.includes('succubus')) return 'assets/creatures/demoness-succubus.jpg';
    if (key === 'guardian' || name.includes('guardian') || name.includes('temple')) return 'assets/creatures/temple-guardian.jpg';
    if (key === 'shadow' || name.includes('shadow') || name.includes('stalker')) return 'assets/creatures/shadow-stalker.jpg';
    if (key === 'goblin' || name.includes('goblin') || name.includes('scout')) return 'assets/creatures/goblin-scout.jpg';
    if (key === 'skeleton' || name.includes('skeletal') || name.includes('skeleton')) return 'assets/creatures/skeleton-warrior.jpg';
    if (key === 'wolf' || key === 'beast' || name.includes('wolf') || name.includes('beast')) return 'assets/creatures/forest-wolf.jpg';
    return 'assets/creatures/shadow-stalker.jpg';
}

// Combat system
function startCombat(key = 'beast') {
    state.inCombat = true;
    $('combat').classList.remove('hidden');

    const tpl = ENEMY_TEMPLATES[key] || ENEMY_TEMPLATES.beast;
    state.enemy = JSON.parse(JSON.stringify(tpl));

    if ($('enemy-name')) $('enemy-name').textContent = state.enemy.name;
    if ($('enemy-hp')) $('enemy-hp').textContent = state.enemy.hp;
    if ($('enemy-max')) $('enemy-max').textContent = state.enemy.maxHp;
    if ($('enemy-hp-bar')) $('enemy-hp-bar').style.width = '100%';

    // Load correct creature image (now supports all assets)
    const eimg = $('enemy-img');
    if (eimg) {
        const imgSrc = getEnemyImageSrc(key, state.enemy);
        eimg.src = imgSrc;
        eimg.style.display = 'block';
        eimg.onerror = function () {
            this.style.display = 'none';
            console.warn('Failed to load creature image:', imgSrc);
        };
    }

    let startMsg = `A <b>${state.enemy.name}</b> attacks!`;
    if (window.Lore && Lore.combatStart) {
        if (key === 'skeleton' && Lore.combatStart.ruins) startMsg = Lore.combatStart.ruins;
        else if (typeof Lore.combatStart.default === 'function') startMsg = Lore.combatStart.default(state.enemy.name);
    }
    if (state.enemy.isBoss) startMsg = `The <b>${state.enemy.name}</b> rises to challenge you!`;

    const clog = $('combat-log');
    if (clog) clog.innerHTML = `<div>${startMsg}</div>`;

    renderCombatButtons();
    $('actions').innerHTML = '';
}

function renderCombatButtons() {
    const c = $('combat-buttons'); if (!c) return; c.innerHTML = '';
    const add = (txt, fn) => { const b = document.createElement('button'); b.className = 'py-2 px-3 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-xl'; b.textContent = txt; b.onclick = fn; c.appendChild(b); };

    add('Sword Attack', () => playerAttack('sword'));
    add('Firebolt', () => castSpell('Firebolt'));

    if (state.player.spells && state.player.spells.includes('Ice Shard')) add('Ice Shard', () => castSpell('Ice Shard'));
    if (state.player.spells && state.player.spells.includes('Divine Light')) add('Divine Light', () => castSpell('Divine Light'));
    if (state.player.spells && state.player.spells.includes('Heal')) add('Heal', () => castSpell('Heal'));

    add('Defend', defend);
    add('Flee', fleeCombat);
}

function playerAttack(t) {
    if (!state.enemy) return;
    const p = state.player;
    const weaponBonus = (p.weapon && p.weapon.bonus) || 0;
    let d = 5 + (p.str || 5) + weaponBonus;

    // Slight variance for feel
    d = Math.floor(d * (0.9 + Math.random() * 0.25));

    // Critical hit
    const critChance = getPlayerCritChance();
    let isCrit = false;
    if (Math.random() * 100 < critChance) {
        isCrit = true;
        d = Math.floor(d * 1.65);
    }

    // Holy weapon bonus vs undead
    const enemyName = (state.enemy && state.enemy.name || '').toLowerCase();
    const isUndead = /skeleton|guardian|fallen|shadow/.test(enemyName);
    const weaponName = (p.weapon && p.weapon.name || '').toLowerCase();
    if (isUndead && weaponName.includes('consecrated')) {
        d = Math.floor(d * 1.25);
    }

    state.enemy.hp = Math.max(0, state.enemy.hp - d);

    let msg = `You strike for <b>${d}</b> damage${weaponBonus ? ' <span class="text-emerald-400">(gear)</span>' : ''}.`;
    if (isCrit) msg = `⚔️ <b>CRITICAL!</b> ` + msg;
    if (isUndead && weaponName.includes('consecrated')) msg = `Your consecrated blade burns the undead for <b>${d}</b>!`;

    if ($('combat-log')) $('combat-log').innerHTML += `<div>${msg}</div>`;
    updateEnemyUI();
    if (state.enemy.hp <= 0) endCombat(true);
    else setTimeout(enemyAttack, 580);
}

function castSpell(n) {
    const sp = SPELLS[n];
    if (!sp || (state.player.mp || 0) < sp.cost) return;

    const p = state.player;
    state.player.mp -= sp.cost;

    let val = Math.floor(sp.baseDmg + (p.int || 5) * (sp.scale || 1.5) * 0.9);

    // Holy bonus vs undead (skeletons, guardians, fallen, shadow)
    const enemyName = (state.enemy && state.enemy.name || '').toLowerCase();
    const isUndead = /skeleton|guardian|fallen|shadow|undead/.test(enemyName);
    if (sp.isHoly && isUndead) {
        val = Math.floor(val * 1.35); // 35% extra holy damage
    }

    const clog = $('combat-log');
    if (sp.type === 'heal') {
        state.player.hp = Math.min(state.player.maxHp, (state.player.hp || 0) + val);
        if (clog) clog.innerHTML += `<div>You heal for <b>${val}</b> HP.</div>`;
        updateStats();
    } else {
        state.enemy.hp = Math.max(0, state.enemy.hp - val);
        let dmgText = `${n} hits for <b>${val}</b> damage!`;
        if (sp.isHoly && isUndead) dmgText = `${n} sears the undead for <b>${val}</b>!`;
        if (clog) clog.innerHTML += `<div>${dmgText}</div>`;
        updateEnemyUI();
        if (state.enemy.hp <= 0) { endCombat(true); return; }
    }
    setTimeout(enemyAttack, 620);
}

function defend() {
    if ($('combat-log')) $('combat-log').innerHTML += '<div>You brace for impact.</div>';
    state._defending = true;
    setTimeout(enemyAttack, 380);
}

function enemyAttack() {
    if (!state.enemy) return;
    const p = state.player;
    let d = state.enemy.dmg || 6;

    if (state._defending) {
        d = Math.floor(d * 0.45);
        state._defending = false;
    }

    const armorBonus = (p.armor && p.armor.bonus) || 0;

    // Shield block check (new system)
    const blockChance = getPlayerBlockChance();
    let blocked = false;
    if (p.shield && Math.random() * 100 < blockChance) {
        blocked = true;
        d = Math.floor(d * 0.25); // heavily reduced damage on block
    }

    const real = Math.max(1, d - ((p.def || 3) + armorBonus));

    state.player.hp = Math.max(0, (state.player.hp || 0) - real);

    const clog = $('combat-log');
    if (clog) {
        let msg = `Enemy hits for <b>${real}</b>.`;
        if (blocked) msg = `🛡️ You block with your ${p.shield.name}! Enemy hits for <b>${real}</b>.`;
        if (armorBonus && !blocked) msg += ` <span class="text-emerald-400">(armor)</span>`;
        clog.innerHTML += `<div>${msg}</div>`;
    }

    updateStats();
    updateEnemyUI();
    if ((state.player.hp || 0) <= 0) endCombat(false);
}

function updateEnemyUI(){ if(!state.enemy) return; if($('enemy-hp')) $('enemy-hp').textContent=state.enemy.hp; if($('enemy-hp-bar')) $('enemy-hp-bar').style.width = (state.enemy.hp/state.enemy.maxHp*100)+'%'; }

function fleeCombat(){ if(Math.random()<0.55){ if($('combat-log')) $('combat-log').innerHTML+='<div>Fled successfully.</div>'; setTimeout(()=>endCombat(false),300);} else { if($('combat-log')) $('combat-log').innerHTML+='<div>Flee failed!</div>'; setTimeout(enemyAttack,300); } }

function endCombat(win) {
    state.inCombat = false;
    $('combat').classList.add('hidden');
    if ($('combat-buttons')) $('combat-buttons').innerHTML = '';

    const eimg = $('enemy-img');
    if (eimg) eimg.style.display = 'none';

    const enemy = state.enemy;

    if (win && enemy) {
        let xp = Math.floor((enemy.maxHp || 40) / 2) + 6;
        let g = Math.floor(Math.random() * 8) + 5;

        if (enemy.isBoss) {
            xp += 35;
            g += 28;
            log(`<b>BOSS DEFEATED!</b> +${xp} XP +${g} gold`, true);
            // Progress Quest 2 when boss slain
            if ((state.quest || 0) >= 1) {
                state.templeProgress = (state.templeProgress || 0) + 1;
                if (state.templeProgress >= 1 && (state.quest || 0) < 3) {
                    log('The ancient evil stirs no more... Quest progress updated.', true);
                }
            }
        } else {
            log(`Victory! +${xp}XP +${g}g`, true);
        }

        // New quest triggers
        if (enemy.name === 'Shadow Stalker' && state.location === 'woods') {
            // Treat Shadow Stalker in woods as progress toward Alpha for Thorne's quest
            state.alphaSlain = true;
            log("The beast carried a strange fang... Thorne will want to see this.", true);
        }

        if (enemy.name && enemy.name.toLowerCase().includes('guardian') && state.location === 'ruins') {
            state.sigilRecovered = true;
            log("Among the rubble you find an ancient glowing sigil. Aelric will know what to do with it.", true);
        }

        state.player.xp = (state.player.xp || 0) + xp;
        state.player.gold = (state.player.gold || 0) + g;
        state.kills = (state.kills || 0) + 1;

        if (state.kills >= 3 && state.quest === 1) log('Ready to report to Elder.', true);
        if (typeof checkLevelUp === 'function') checkLevelUp();
    } else if (!win) {
        log('Defeated... recovering.', true);
        state.player.hp = Math.max(5, Math.floor((state.player.maxHp || 50) * 0.4));
    }

    state.enemy = null;
    updateAll();
    renderActions();
    save();
}

function checkLevelUp() {
    const p = state.player;
    while ((p.xp || 0) >= 100) {
        p.xp -= 100;
        p.level = (p.level || 1) + 1;
        p.str = (p.str || 5) + 1;
        p.int = (p.int || 5) + 1;
        p.def = (p.def || 3) + 1;
        p.dex = (p.dex || 5) + 1;   // New stat growth
        p.maxHp = (p.maxHp || 50) + 8;
        p.hp = p.maxHp;
        p.maxMp = 20 + Math.floor(p.int * 2.2);
        p.mp = p.maxMp;

        log('LEVEL UP! Now L' + p.level, true);
        if (typeof showToast === 'function') {
            showToast(`<b>LEVEL UP!</b> You are now Level ${p.level}`, 'success', 2800);
        }

        if (p.level === 3 && !p.spells.includes('Ice Shard')) {
            p.spells.push('Ice Shard');
            log('Ice Shard learned!', true);
            if (typeof showToast === 'function') showToast('New spell: <b>Ice Shard</b>', 'success');
        }
        if (p.level === 5 && !p.spells.includes('Heal')) {
            p.spells.push('Heal');
            log('Heal learned!', true);
            if (typeof showToast === 'function') showToast('New spell: <b>Heal</b>', 'success');
        }
    }
}
