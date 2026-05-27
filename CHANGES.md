# Spellblade Chronicles — Local Fixes & Improvements (applied in this workspace)

> All changes made locally only. No git push performed.

## Spell Cooldown System Overhaul
- Added proper **World of Warcraft-style pie/clock cooldown overlays** on spell buttons in combat.
  - Dark sweeping conic-gradient overlay that shrinks as cooldown ticks down.
  - Large remaining cooldown number displayed in the center of the button.
- All spells now have a **minimum 2-round cooldown**:
  - Firebolt, Ice Shard, Divine Light: 2 rounds
  - Heal: 3 rounds
- Cooldowns now **fully reset** when combat ends (win or lose).
- Cooldown visuals update live every turn.
- Improved spell button rendering to support the new overlay system cleanly.

## Combat & Exploration Polish
- **Combat Window completely redesigned** to feel like the Dialogue modal:
  - Much larger enemy portrait (w-36 h-36) with strong border treatment.
  - Full-width, taller combat log for better readability.
  - Cleaner header layout with enemy name + HP positioned beside the portrait.
  - Buttons remain accessible at the bottom.
- **Dialogue Window**: Increased NPC portrait size (now w-32 h-32) and brought it closer to the modal edges for stronger presence.
- **Button Cleanup**:
  - Removed all "Return to Village/Square" buttons from Woods, Ruins, and Church (travel now exclusively via Map for major locations).
  - Removed "Search for Loot" from Whispering Woods.
  - Removed "Search Ancient Stones" from Ruined Temple.
  - Unified hostile area actions under a single **"Explore"** button in both Woods and Ruins.
- **New Exploration System**:
  - "Explore" now has higher combat encounter rate.
  - Added flavorful non-combat discoveries with rich lore text (e.g. locket with faded portrait, stained-glass shard, painting of a black horse before a burning temple, sealed letter to Elara, etc.).
  - Discoveries can also reward gold.
  - More atmospheric and interesting than simple loot rolls.

## Major UI Aesthetic Overhaul (Fantasy Flavor Update)
- Complete visual redesign for dark fantasy atmosphere:
  - New deep vignette background and warmer stone/aged-wood color palette.
  - New `.fantasy-panel`, `.fantasy-modal`, and themed button system (btn-holy, btn-combat, btn-action, btn-dialogue, btn-shop, spell-specific buttons).
  - Context-aware buttons: Church actions now use elegant gold styling, Ruins use aggressive combat styling.
- Greatly improved all major UI elements:
  - Main panels (Stats, Story Log, Combat, Area Portrait) now use consistent fantasy framing with subtle gold borders and inset effects.
  - All modals (Dialogue, Shop, Inventory, Character Sheet, Quest Journal, Map, Intro) upgraded with richer borders, dark stone backgrounds, and warm amber accents.
  - Combat buttons fully redesigned with icons and color-coded spells (Fire, Ice, Heal, Divine).
- Progress bars, location header, close buttons, and many generated UI elements polished for better immersion.
- Overall result: The game now feels like a cohesive dark fantasy RPG instead of a generic dark UI.

## Critical Bug Fixes
- Added missing `renameCharacter()` — player name header now works (prompt + save + toast).
- **Equipment now matters**: Weapon bonus added to player attacks; armor bonus reduces incoming damage.
- Inventory fully rewritten: clean readable code, Mana potions work, proper quantity/stacking, nice UI with icons.
- Replaced all native `alert()` with in-game toast notifications (shop, feedback, etc.).

## Combat & Progression
- Expanded enemy roster (Forest Wolf, Goblin Scout, Shadow Stalker, Temple Guardian + Fallen Spellblade boss) with correct images from assets.
- Better rewards and combat log feedback for bosses.
- Quest 2 ("Secrets of the Temple") now progresses via temple exploration and boss kills. Elder dialogue shows both quests.
- Level-up now shows prominent toasts + new spell announcements.

## Exploration & Map
- Woods and Ruins exploration now pull from the full enemy pool for variety.
- Map supports mouse + touch drag/panning (uses existing core variables). Zoom + pan combined.
- Travel remains convenient while Map is the primary navigation tool.

## New Content: The Church
- Added **Church of the Silver Light** location (accessible from village only — no new map pin needed).
- New NPC: **Sister Elara** (24-year-old nun with rich, compassionate lore and multiple dialogue lines).
- Full holy-themed shop only available from her:
  - Holy Water, Silver Pendant, Consecrated Blade, Prayer Shawl, Tome of Radiance.
- New spell: **Divine Light** (learns from the Tome; deals bonus damage to undead).
- "Pray for Strength" action in church — restores HP + MP with nice flavor.
- Holy weapons and Divine Light now deal bonus damage against undead enemies (skeletons, guardians, fallen, etc.).
- Village action buttons cleaned up: direct travel to Woods/Ruins removed (use the Map), Church button added.
- Church has its own location handling and actions.

## Major System Expansion: Stats & Equipment
- New core stat: **DEX (Dexterity)** — grows on level up. Influences Block Chance and Crit Chance.
- New equipment slot: **Shield** (with variable blockChance %).
- Combat improvements:
  - Critical hits (DEX-based) — 65% extra damage.
  - Shield blocking — greatly reduces incoming damage when successful.
- Greatly improved **Character Sheet**:
  - Clear explanations for every stat (STR, INT, DEF, DEX).
  - Live combat stats: Block % and Crit %.
  - Proper display of all equipment slots including Shield.
- Shops expanded with shields:
  - Merchant sells basic shields (Wooden Shield, Iron Buckler).
  - Sister Elara sells a powerful holy shield (Aegis of Light).
- Buy/equip logic fully updated to support shields.
- Save/load and level-up systems updated for the new stats and gear.

## Visual Polish: Item Images
- Added 16 custom-generated item icons using Grok Imagine (consistent dark fantasy style with matching moody stone background and warm amber lighting).
- All shop items (Merchant + Nun) now display high-quality images in the shop modal.
- Inventory now shows item thumbnails instead of generic icons (with graceful fallback).
- Character sheet "EQUIPPED" section now displays small images for Weapon, Armor, and Shield (with proper fallbacks for starting gear).
- Equipped items and purchased consumables now correctly carry their image data.
- All images live in `assets/items/` and are referenced from `lore.js` item definitions.

## New Feature: Ruined Temple Dungeon (Levels)
- The Ruins now have **3 progressive levels** (a mini-dungeon).
- Start at Level 1. Use the new **"Descend to Level X"** button to go deeper.
- Each deeper level has stronger and more dangerous enemies, including new **Female Demons** (Succubus Warmaiden, Demoness Guardian, Demoness Overlord).
- New creature images added for the female demons (consistent dark fantasy style, following the requested aesthetic).
- Minimalistic level tracker now appears next to "Ruined Temple" in the location bar (e.g. **Ruined Temple [1 - 2 - 3]** with the current level bolded).
- Temple level resets when leaving the Ruins.
- Stronger enemies and better risk/reward as you go deeper.

## Story & World Expansion
- Added two new major characters with full portraits (generated consistently):
  - **Thorne the Warden** (Woods) — Grizzled former temple guardian turned hunter.
  - **Aelric the Bound** (Ruins) — Tragic spectral remnant of the original sealers.
- Two new story-rich side quests with meaningful lore:
  - "The Warden's Watch" — Hunt the Corrupted Alpha with Thorne.
  - "The Unfinished Oath" — Help Aelric recover his Sunsteel Sigil.
- New dialogue branches, quest progression flags, and rewards (including a new defensive spell "Warden's Resolve").
- Expanded main story arc: The corruption has a name and a tragic history ("The First Betrayer" / "Vael'thyr the Whisperer").
- New action buttons in Woods and Ruins to access the new characters.
- Quest completion now feels more impactful with custom log messages and permanent rewards.
- The world now has clearer narrative depth and multiple paths to power and understanding.

## Quality & Polish
- Hardened `save()` with try/catch (private mode / quota safe).
- Removed dead code (`talkToElder` duplication in game.js).
- Shop auto-refreshes after purchases; better feedback.
- Many defensive null checks, improved combat log readability.
- Toast system added (reusable, themed success/error/gold/info).

## Mobile / UX
- Larger tap targets and active states preserved/improved.
- No more blocking native dialogs.
- Map is now usable on touch devices.

## Files Changed
- ui.js (major: toasts, rename, inventory rewrite, map drag, quest UI, shop polish)
- combat.js (equipment integration, expanded enemies, better endCombat, level-up toasts)
- game.js (richer encounter tables, quest 2 triggers, dead code removal)
- core.js (save hardening)
- New: CHANGES.md

The game should now feel complete, fair, and fun to test locally.

Run with a local server (not file://) and enjoy!
