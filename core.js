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
        dex: 5,                    // New: affects block chance, crit chance, and feel
        weapon: { name: "Rusty Sword", bonus: 3, image: "assets/items/rusty-sword.jpg" },
        armor: { name: "Cloth Tunic", bonus: 1, image: "assets/items/cloth-tunic.jpg" },
        shield: null,              // New equipment slot: { name, blockChance, image }
        spells: ["Firebolt"],
        spellSlots: [null, null],     // Two active spell slots for combat
        spellCooldowns: {}            // { "Heal": 1, ... } remaining rounds
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
    lastLootTime: 0,
    templeLevel: 1   // New: 1 = standard Ruins, 2 & 3 = deeper dungeon levels
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
    try {
        localStorage.setItem('spellblade_v3', JSON.stringify(state));
    } catch (e) {
        console.warn('Save failed (storage full or private mode?)', e);
    }
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
                    dex: p.dex || 5,
                    weapon: p.weapon ? { ...p.weapon, image: p.weapon.image || "assets/items/rusty-sword.jpg" } : { name: "Rusty Sword", bonus: 3, image: "assets/items/rusty-sword.jpg" },
                    armor: p.armor ? { ...p.armor, image: p.armor.image || "assets/items/cloth-tunic.jpg" } : { name: "Cloth Tunic", bonus: 1, image: "assets/items/cloth-tunic.jpg" },
                    shield: p.shield ? { ...p.shield, image: p.shield.image } : null,
                    spells: Array.isArray(p.spells) ? p.spells : ["Firebolt"]
                };
            }

            // Ensure locationName exists
            if (!state.locationName && state.location) {
                const nameMap = {
                    village: "Eldoria Village Square",
                    woods: "Whispering Woods",
                    ruins: "Ruined Temple",
                    church: "Church of the Silver Light"
                };
                state.locationName = nameMap[state.location] || state.location;
            }

            // Ensure templeLevel exists (for Ruins dungeon)
            if (typeof state.templeLevel !== 'number' || state.templeLevel < 1) {
                state.templeLevel = 1;
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
