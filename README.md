# Spellblade Chronicles - Modular Edition (hotfix/full-restore)

**Fully working modular version** of the story-driven fantasy RPG.

## Structure
- `index.html` — Main UI shell + modals
- `core.js` — Game state, persistence (save/load), initialization, helpers
- `game.js` — All gameplay: combat, exploration (village/woods/ruins), quests, inventory, shop, map, character progression
- `lore.js` — Narrative data, dialogues, item/spell definitions (for easy modding)
- `assets/` — Images (map, creatures)

## Features (now complete)
- Turn-based combat with sword, spells (Firebolt, Ice Shard, Heal), defend, flee
- Leveling, stat growth, new spells unlocked at levels 3/5
- Exploration across 3 locations (Village, Whispering Woods, Ruined Temple) with dynamic action buttons
- Quests (Elder beast-slaying questline with progression)
- Shop (buy weapons, armor, potions, spell tomes)
- Full Inventory system (use consumables, equip weapons/armor, drop)
- Character stats modal + rename feature
- Interactive pannable/zoomable World Map
- Save/load via localStorage (`spellblade_v3`)
- Story log export to .txt
- Death/respawn handling, area travel

## How to play
1. Open `index.html` directly in any modern browser (Chrome, Firefox, etc.)
2. Works great as PWA on Android (add to home screen)
3. The Android native wrapper (Kotlin/WebView) can be built from other branches if desired

The **modular architecture** (core / game / lore separation) makes it easy to extend with new content, balance changes, or additional features without touching everything.

**Status:** ✅ Fully restored and playable on the hotfix/full-restore branch.

Based on the working v0.1-stable logic, completed and enhanced in modular form.

Web demo (main): https://fredd4e.github.io/spellblade-chronicles-android/