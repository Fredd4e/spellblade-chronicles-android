# Spellblade Chronicles - Modular Edition

**Fully working modular version** of the story-driven fantasy RPG (now on main).

## Structure
- `index.html` — Main UI shell + modals
- `core.js` — Game state, persistence (save/load), initialization, helpers
- `ui.js` — UI rendering, modals (inventory, map, stats), area portraits, story & action button display
- `combat.js` — Turn-based combat system, spell casting, enemy AI, leveling/progression
- `game.js` — World exploration, location actions (talk/explore/search), travel, quest orchestration (kept slim)
- `lore.js` — Narrative data, dialogues, area metadata, quests, item/spell definitions (for easy modding)
- `assets/` — Images (backgrounds, creatures, map, npcs)

## Features
- Turn-based combat with sword, spells (Firebolt, Ice Shard, Heal), defend, flee
- Leveling, stat growth, new spells unlocked at milestones
- Exploration across 3 locations with dynamic contextual actions
- Quests (Elder beast-slaying questline with progression)
- Shop (stub), full Inventory system (use/drop)
- Character stats view + rename
- Interactive map with zoom
- Persistent save/load via localStorage, story log export

## How to play
Open `index.html` in any modern browser (or add as PWA / WebView on Android).

**Main branch is fully playable and now better modularized** — large game.js was split to keep source files maintainable as the game grows.

Web version: https://fredd4e.github.io/spellblade-chronicles-android/

## Development Notes
- All modules use global scope for simplicity (no bundler yet)
- Load order in index.html matters for init: lore → core → ui → combat → game
- Easy to extend: add new areas/quests in lore.js, new actions in game.js, new UI in ui.js, combat mechanics in combat.js
