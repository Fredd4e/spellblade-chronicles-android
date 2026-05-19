// core.js - State, Save/Load, Init, Helpers

let state = {
    player: {
        name: "Aether",
        level: 1,
        hp: 50,
        maxHp: 50,
        mp: 20,
        maxMp: 20,
        xp: 0,
        gold: 20,
        str: 5,
        int: 5,
        def: 3,
        weapon: { name: "Rusty Sword", bonus: 3 },
        armor: { name: "Cloth Tunic", bonus: 1 },
        spells: ["Firebolt"]
    },
    inventory: [
        { id: 1, name: "Health Potion", type: "consumable", bonus: 30, desc: "Restores 30 HP", quantity: 2 }
    ],
    location: "village",
    locationName: "Eldoria Village Square",
    quest: 0,
    kills: 0,
    inCombat: false,
    enemy: null,
    story: [],
    lastLootTime: 0
};

let storyOpen = true;
let mapZoom = 1;
let mapPanX = 0;
let mapPanY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let villageSpot = 'square';

function recalculateMaxStats() {
    const p = state.player;
    const calculatedMaxMp = 20 + Math.floor(p.int * 2.2);
    if (calculatedMaxMp > p.maxMp) {
        p.maxMp = calculatedMaxMp;
        p.mp = Math.min(p.mp, p.maxMp);
    }
}

function log(msg, important = false) {
    state.story.push({ msg, important });
    if (state.story.length > 15) state.story.shift();
    if (typeof renderStory === 'function') renderStory();
}

function save() {
    localStorage.setItem('spellblade_v3', JSON.stringify(state));
}

function load() {
    const s = localStorage.getItem('spellblade_v3');
    if (s) {
        try {
            Object.assign(state, JSON.parse(s));
            recalculateMaxStats();
        } catch (e) {}
    }
}

function init() {
    load();
    recalculateMaxStats();
    villageSpot = 'square';
    if (state.story.length === 0) {
        setTimeout(() => {
            if (typeof showIntro === 'function') showIntro();
        }, 800);
    }
    const combatEl = document.getElementById('combat');
    if (combatEl) combatEl.classList.add('hidden');
    if (typeof updateAll === 'function') updateAll();
}

function updateAll() {
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderActions === 'function') renderActions();
    if (typeof renderStory === 'function') renderStory();
}
