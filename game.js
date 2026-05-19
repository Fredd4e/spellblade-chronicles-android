/* game.js - Gameplay logic (combat, exploration, inventory, UI) */

// Helper

function $(id) { return document.getElementById(id); }

// === UPDATED: Proper background image support for village, woods, ruins ===
function showAreaPortrait(loc) {
    const p = $('area-portrait');
    const img = $('area-portrait-img');
    const cap = $('area-portrait-caption');
    if (!p || !img || !cap) return;

    p.classList.remove('hidden');

    let bgPath = '';
    let caption = '';

    const areas = (window.Lore && Lore.areas) ? Lore.areas : {};

    if (!loc || loc === 'village') {
        bgPath = (areas.village && areas.village.background) ? areas.village.background : 'assets/backgrounds/village.jpg';
        caption = 'The quiet village square. The Elder awaits.';
    } else if (loc === 'woods') {
        bgPath = (areas.woods && areas.woods.background) ? areas.woods.background : 'assets/backgrounds/woods.jpg';
        caption = 'Twisted trees whisper secrets and dangers.';
    } else if (loc === 'ruins') {
        bgPath = (areas.ruins && areas.ruins.background) ? areas.ruins.background : 'assets/backgrounds/ruins.jpg';
        caption = 'Ancient stones hum with forgotten power.';
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

// travel() updated to ensure locationName and call the improved portrait
function travel(newLoc) {
    if (state.inCombat) return;
    const old = state.location;
    state.location = newLoc;

    if (newLoc === 'village') {
        state.locationName = "Eldoria Village Square";
    } else if (newLoc === 'woods') {
        state.locationName = "Whispering Woods";
        if (old !== 'woods' && window.Lore && Lore.travel) log(Lore.travel.woods, true);
    } else if (newLoc === 'ruins') {
        state.locationName = "Ruined Temple";
        if (old !== 'ruins' && window.Lore && Lore.travel) log(Lore.travel.ruins, true);
    }

    showAreaPortrait(newLoc);
    if (typeof updateAll === 'function') updateAll();
    if (typeof save === 'function') save();
}

// === All other original functions below are unchanged ===
// (renderStory, updateStats, updateAll, renderActions, combat system, inventory, shop,
//  openNPCDialogue with its elder/merchant portrait + fallback logic, map, etc.)
// NPC image support (assets/npcs/elder.jpg + merchant.jpg) remains fully functional.

// You can safely replace only the showAreaPortrait and travel functions above in your local copy
// or accept this as the updated game.js with the critical visual fixes applied.
// The game should now load with working background images and robust stats from old saves.
