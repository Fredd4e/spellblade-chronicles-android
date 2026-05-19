/* combat.js - Turn-based combat system, spells, and progression for Spellblade Chronicles */

// Spell definitions
const SPELLS = {
    "Firebolt": { cost: 5, baseDmg: 8, scale: 1.5, type: "damage" },
    "Ice Shard": { cost: 8, baseDmg: 12, scale: 1.8, type: "damage" },
    "Heal": { cost: 10, baseDmg: 15, scale: 2.5, type: "heal" }
};

// NEW: Crit calculation helper - returns {dmg, isCrit}
function calculateDamage(baseDmg) {
    let dmg = baseDmg;
    const critChance = ((state && state.player && state.player.crit) || 5) / 100;
    if (Math.random() < critChance) {
        dmg = Math.floor(dmg * 1.5);
        return { dmg, isCrit: true };
    }
    return { dmg, isCrit: false };
}

// Combat system
function startCombat(key='beast') {
    state.inCombat=true; $('combat').classList.remove('hidden');
    const templates = { beast:{name:'Corrupted Beast',hp:38,maxHp:38,dmg:7}, skeleton:{name:'Skeletal Warrior',hp:52,maxHp:52,dmg:9} };
    state.enemy = JSON.parse(JSON.stringify(templates[key]||templates.beast));
    if($('enemy-name')) $('enemy-name').textContent = state.enemy.name;
    if($('enemy-hp')) $('enemy-hp').textContent = state.enemy.hp;
    if($('enemy-max')) $('enemy-max').textContent = state.enemy.maxHp;
    if($('enemy-hp-bar')) $('enemy-hp-bar').style.width='100%';

    // FIX: Load creature image from assets/creatures/ based on enemy type.
    const eimg = $('enemy-img');
    if (eimg) {
        let imgSrc = 'assets/creatures/shadow-stalker.jpg';
        const ename = (state.enemy.name || '').toLowerCase();
        if (key === 'skeleton' || ename.includes('skeletal') || ename.includes('skeleton')) {
            imgSrc = 'assets/creatures/skeleton-warrior.jpg';
        } else if (key === 'beast' || ename.includes('beast') || ename.includes('wolf')) {
            imgSrc = 'assets/creatures/forest-wolf.jpg';
        }
        eimg.src = imgSrc;
        eimg.style.display = 'block';
        eimg.onerror = function() {
            this.style.display = 'none';
            console.warn('Failed to load creature image:', imgSrc);
        };
    }

    let startMsg = `A <b>${state.enemy.name}</b> attacks!`;
    if (window.Lore && Lore.combatStart) {
        if (key === 'skeleton' && Lore.combatStart.ruins) startMsg = Lore.combatStart.ruins;
        else if (typeof Lore.combatStart.default === 'function') startMsg = Lore.combatStart.default(state.enemy.name);
    }
    const clog=$('combat-log'); if(clog) clog.innerHTML = `<div>${startMsg}</div>`;
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

function playerAttack(t){ 
    if(!state.enemy) return; 
    let baseD = 5+(state.player.str||5);
    const result = calculateDamage(baseD);
    let d = result.dmg;
    state.enemy.hp=Math.max(0,state.enemy.hp-d); 
    let msg = `You hit for ${d}.`;
    if (result.isCrit) {
        msg = `<span class="text-red-400 font-bold">CRITICAL HIT!</span> You hit for ${d} damage!`;
    }
    if($('combat-log')) $('combat-log').innerHTML += `<div>${msg}</div>`; 
    updateEnemyUI(); 
    if(state.enemy.hp<=0) endCombat(true); 
    else setTimeout(enemyAttack,600); 
}

function castSpell(n){ 
    const sp=SPELLS[n]; 
    if(!sp || (state.player.mp||0)<sp.cost) return; 
    state.player.mp-=sp.cost; 
    let baseVal = Math.floor(sp.baseDmg+(state.player.int||5)*sp.scale*0.9);
    let val = baseVal;
    let isCrit = false;
    if (sp.type === 'damage') {
        const result = calculateDamage(baseVal);
        val = result.dmg;
        isCrit = result.isCrit;
    }
    const clog=$('combat-log');
    if(sp.type==='heal'){ 
        state.player.hp=Math.min(state.player.maxHp, (state.player.hp||0)+val); 
        if(clog)clog.innerHTML+=`<div>Healed ${val} HP.</div>`; 
        updateStats(); 
    }
    else { 
        state.enemy.hp=Math.max(0,state.enemy.hp-val); 
        let spellMsg = `${n} for ${val} dmg!`;
        if (isCrit) spellMsg = `<span class="text-red-400 font-bold">CRITICAL ${n}!</span> for ${val} dmg!`;
        if(clog)clog.innerHTML+=`<div>${spellMsg}</div>`; 
        updateEnemyUI(); 
        if(state.enemy.hp<=0){endCombat(true);return;} 
    }
    setTimeout(enemyAttack,650);
}

function defend(){ if($('combat-log')) $('combat-log').innerHTML += '<div>You defend, bracing for impact.</div>'; state._defending=true; setTimeout(enemyAttack,400); }

function enemyAttack(){ 
    if(!state.enemy) return; 
    let d=state.enemy.dmg||6; 
    if(state._defending){d=Math.floor(d*0.5);state._defending=false;} 
    // DEF now feels more impactful with slight scaling for better gameplay feel
    const defReduction = Math.max(0, Math.floor((state.player.def||3) * 0.85));
    const real=Math.max(1, d - defReduction); 
    state.player.hp=Math.max(0,(state.player.hp||0)-real);
    if($('combat-log')) $('combat-log').innerHTML += `<div>Enemy hits for ${real}.</div>`; 
    updateStats(); 
    updateEnemyUI(); 
    if((state.player.hp||0)<=0) endCombat(false);
}

function updateEnemyUI(){ if(!state.enemy) return; if($('enemy-hp')) $('enemy-hp').textContent=state.enemy.hp; if($('enemy-hp-bar')) $('enemy-hp-bar').style.width = (state.enemy.hp/state.enemy.maxHp*100)+'%'; }

function fleeCombat(){ if(Math.random()<0.55){ if($('combat-log')) $('combat-log').innerHTML+='<div>Fled successfully.</div>'; setTimeout(()=>endCombat(false),300);} else { if($('combat-log')) $('combat-log').innerHTML+='<div>Flee failed!</div>'; setTimeout(enemyAttack,300); } }

function endCombat(win){ 
    state.inCombat=false; $('combat').classList.add('hidden'); if($('combat-buttons')) $('combat-buttons').innerHTML='';
    const eimg = $('enemy-img'); if(eimg) eimg.style.display = 'none';
    if(win && state.enemy){ 
        const xp=Math.floor(state.enemy.maxHp/2)+6; 
        const g=Math.floor(Math.random()*8)+5; 
        state.player.xp=(state.player.xp||0)+xp; 
        state.player.gold=(state.player.gold||0)+g; 
        state.kills=(state.kills||0)+1; 
        log(`Victory! +${xp}XP +${g}g`,true); 
        if(state.kills>=3 && state.quest===1) log('Ready to report to Elder.',true); 
        if(typeof checkLevelUp==='function') checkLevelUp(); 
    }
    else if(!win){ 
        log('Defeated... recovering.',true); 
        state.player.hp=Math.max(5,Math.floor((state.player.maxHp||50)*0.4)); 
    }
    state.enemy=null; 
    updateAll(); 
    renderActions(); 
    save();
}

function checkLevelUp(){ 
    const p=state.player; 
    while((p.xp||0)>=100){ 
        p.xp-=100; 
        p.level=(p.level||1)+1; 
        p.str=(p.str||5)+1; 
        p.int=(p.int||5)+1; 
        p.def=(p.def||3)+1; 
        p.crit = (p.crit || 5) + 1;  // NEW: +1% crit chance per level up!
        p.maxHp=(p.maxHp||50)+8; 
        p.hp=p.maxHp; 
        p.maxMp=20+Math.floor(p.int*2.2); 
        p.mp=p.maxMp; 
        log('LEVEL UP! Now L'+p.level + '  |  +1 STR, +1 INT, +1 DEF, +1% CRIT', true); 
        if(p.level===3 && !p.spells.includes('Ice Shard')){p.spells.push('Ice Shard');log('Ice Shard learned!',true);} 
        if(p.level===5 && !p.spells.includes('Heal')){p.spells.push('Heal');log('Heal learned!',true);} 
    } 
}