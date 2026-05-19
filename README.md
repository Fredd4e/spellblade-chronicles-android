# Spellblade Chronicles - Modular Edition

**Fully working modular version** of the story-driven fantasy RPG (now on main).

## Structure
- `index.html` — Main UI shell + modals
- `core.js` — Game state, persistence (save/load), initialization, helpers
- `game.js` — All gameplay: combat, exploration (village/woods/ruins), quests, inventory, shop, map, character progression
- `lore.js` — Narrative data, dialogues, item/spell definitions (for easy modding)
- `assets/` — Images (map, creatures)

## Features
- Turn-based combat with sword, spells (Firebolt, Ice Shard, Heal), defend, flee
- Leveling, stat growth, new spells unlocked
- Exploration across 3 locations with dynamic actions
- Quests (Elder beast-slaying questline)
- Shop, full Inventory (use/equip/drop)
- Character stats + rename
- Interactive map (zoom/pan)
- Save/load, story export

## How to play
Open `index.html` in any modern browser (or add as PWA on Android).

**Main branch is now fully playable** thanks to the modular full-restore merge.

Web version: https://fredd4e.github.io/spellblade-chronicles-android/