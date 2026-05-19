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
    if (typeof p.maxHp !== 'number' || p.maxHp < 50) p.maxHp = 50;
    const calculatedMaxMp = 20 + Math.floor(p.int * 2.2);
    if (calculatedMaxMp > (p.maxMp || 20)) {
        p.maxMp = calculatedMaxMp;
    }
    p.mp = Math.min(p.mp || 0, p.maxMp);
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
            const parsed = JSON.parse(s);
            Object.assign(state, parsed);

            // Repair nested player object for compatibility with old saves
            if (parsed.player) {
                const p = state.player || {};
                state.player = {
                    name: p.name || "Aether",
                    level: p.level || 1,
                    hp: p.hp || 50,
                    maxHp: p.maxHp || 50,
                    mp: p.mp || 20,
                    maxMp: p.maxMp || 20,
                    xp: p.xp || 0,
                    gold: p.gold || 20,
                    str: p.str || 5,
                    int: p.int || 5,
                    def: p.def || 3,
                    weapon: p.weapon || { name: "Rusty Sword", bonus: 3 },
                    armor: p.armor || { name: "Cloth Tunic", bonus: 1 },
                    spells: Array.isArray(p.spells) ? p.spells : ["Firebolt"]
                };
            }

            // Ensure locationName exists
            if (!state.locationName && state.location) {
                const nameMap = { village: "Eldoria Village Square", woods: "Whispering Woods", ruins: "Ruined Temple" };
                state.locationName = nameMap[state.location] || state.location;
            }

            recalculateMaxStats();
        } catch (e) {
            console.warn('Save load failed, using defaults');
        }
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

    // NEW: Show initial background portrait on load
    if (typeof showAreaPortrait === 'function') {
        showAreaPortrait(state.location);
    }
}

function updateAll() {
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderActions === 'function') renderActions();
    if (typeof renderStory === 'function') renderStory();
}
