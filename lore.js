// lore.js - All story text, dialogues, flavor, and game data for Spellblade Chronicles
// Enhanced with more lore, stat tooltips, and quest rewards

const Lore = {
    intro: {
        title: "The Shadow Rises",
        paragraphs: [
            "For generations, the village of <b>Eldoria</b> lived in peace, protected by ancient wards woven by the first Spellblades.",
            "But something has changed. Twisted creatures have begun emerging from the Whispering Woods — things that were once men and beasts, now corrupted by an ancient evil stirring beneath the Ruined Temple.",
            "You are <b>Aether</b>, a young Spellblade trained in both blade and arcane arts. The village Elder has summoned you to the square.",
            "The shadows grow bolder with each passing night. If no one stands against them, Eldoria — and all the lands beyond — will fall into darkness forever.",
            "Your journey begins here. Wield your sword, master your spells, and uncover the truth behind the rising shadow."
        ]
    },

    // Structured quests with rewards (gold, xp, items)
    quests: {
        beastSlayer: {
            id: 1,
            title: "Beast Slayer",
            description: "Slay at least three corrupted beasts in the Whispering Woods to help the Elder understand the darkness.",
            objective: "Defeat 3 corrupted beasts",
            target: 3,
            progressKey: "kills",
            reward: { gold: 40, xp: 30 },
            stages: {
                offer: "Dark creatures have begun crawling from the Whispering Woods. They were once men and beasts of these lands. I need someone brave enough to slay at least <b>three</b> of them...",
                accepted: "Thank you, Aether. The safety of Eldoria may depend on your courage. Return to me when the deed is done.",
                completed: "You have done well. The creatures you slew were once men and beasts of these woods. Something ancient stirs in the Ruined Temple..."
            }
        },
        templeSecret: {
            id: 2,
            title: "Secrets of the Temple",
            description: "Investigate the Ruined Temple and uncover what ancient evil stirs within. Retrieve any artifacts you find.",
            objective: "Explore the depths of the Ruined Temple",
            target: 1,
            progressKey: "templeProgress",
            reward: { gold: 75, xp: 50, item: "Ancient Relic" },
            stages: {
                offer: "The Ruined Temple was once a place of great power. Now it festers. Whatever sleeps there must not wake. Will you investigate and bring back anything of importance?",
                accepted: "Go with caution, Spellblade. The shadows there are older than our village. Return with answers... or artifacts.",
                completed: "You have braved the temple. The answers you seek may change everything... The relic you found pulses with forgotten power."
            }
        }
    },

    elder: {
        stage0: [
            "<b>Elder:</b> 'Aether... the wards are failing. Dark things crawl from the Whispering Woods.'",
            "<b>Elder:</b> 'Slay at least three of the corrupted beasts. Then I will tell you what truly lies deeper in the forest.'"
        ],
        stage1_complete: [
            "<b>Elder:</b> 'You have done well. The creatures you slew were once men and beasts of these woods.'",
            "<b>Elder:</b> 'Something ancient stirs in the Ruined Temple. Take this gold and go — but beware. The shadows there are older than our village.'"
        ],
        stage2: [
            "<b>Elder:</b> 'The Ruined Temple was once a place of great power. Now it festers. Whatever sleeps there must not wake. Bring back any relics you discover.'"
        ],
        default: [
            "<b>Elder:</b> 'Return when you have slain more of the foul creatures in the woods.'"
        ]
    },

    travel: {
        village: "You return to the safety of Eldoria Village.",
        woods: "You step into the dark Whispering Woods... the trees seem to watch your every move.",
        ruins: "You enter the ancient and ominous Ruined Temple. The air hums with residual magic and decay.",
        church: "You enter the peaceful sanctuary of the Eldoria Church. Candlelight flickers against stained glass windows depicting ancient heroes and Spellblades of old."
    },

    combatStart: {
        default: (enemyName) => `A <b>${enemyName}</b> emerges from the shadows!`,
        ruins: "A skeletal warrior rises from the dust, ancient armor clattering!"
    },

    loot: {
        foundGold: (amount) => `You found <b>${amount} Gold</b> hidden beneath the roots and stones.`,
        nothing: "Your search turned up nothing of value.",
        danger: "Your search attracted something dangerous..."
    },

    levelUp: (level) => `<b>LEVEL UP!</b> You are now Level ${level}! Your power grows...`,

    itemFlavors: {
        "Health Potion": "A simple red potion that mends wounds.",
        "Mana Potion": "Restores magical energy.",
        "Iron Sword": "A sturdy blade forged in the village smithy.",
        "Leather Armor": "Light but reliable protection.",
        "Ancient Relic": "A mysterious artifact from the Ruined Temple. It seems to resonate with your Spellblade powers."
    },

    areas: {
        village: {
            name: "Eldoria Village Square",
            bgImage: "assets/backgrounds/village.jpg",
            caption: "The quiet village square. The Elder awaits your return.",
            flavor: "Home. Safety. Whispers of worry in every doorway. The scent of woodsmoke and fresh bread lingers."
        },
        woods: {
            name: "Whispering Woods",
            bgImage: "assets/backgrounds/woods.jpg",
            caption: "Twisted trees whisper secrets and dangers.",
            flavor: "The air is thick with unnatural mist. Every shadow could be watching. Twisted roots and glowing fungi light the path."
        },
        ruins: {
            name: "Ruined Temple",
            bgImage: "assets/backgrounds/ruins.jpg",
            caption: "Ancient stones hum with forgotten power.",
            flavor: "Broken pillars and faded runes. Something old and hungry stirs below. The weight of centuries presses down."
        },
        church: {
            name: "Eldoria Church",
            bgImage: "assets/backgrounds/village.jpg",
            caption: "A serene stone church with stained glass windows and soft candlelight.",
            flavor: "Incense and quiet prayers fill the air. A sanctuary where even Spellblades may find renewal and guidance from the Light."
        }
    },

    npcs: {
        elder: {
            name: "Village Elder",
            portrait: "assets/npcs/elder.jpg",
            title: "Keeper of Eldoria's Wards",
            age: 67,
            hasQuests: true,
            hasShop: false,
            type: "elder"
        },
        merchant: {
            name: "Merchant",
            portrait: "assets/npcs/merchant.jpg",
            title: "Travelling Trader",
            age: 42,
            hasQuests: false,
            hasShop: true,
            type: "merchant"
        },
        sarah: {
            name: "Sarah",
            portrait: "assets/npcs/nun.jpg",
            title: "Priest of Eldoria",
            age: 22,
            hasQuests: false,
            hasShop: false,
            type: "priest"
        }
    },

    spells: {
        "Firebolt": { cost: 5, baseDmg: 8, scaling: 1.5, desc: "Hurls a bolt of fire at the enemy." },
        "Ice Shard": { cost: 8, baseDmg: 12, scaling: 1.8, desc: "Launches sharp shards of ice." },
        "Heal": { cost: 10, baseHeal: 15, scaling: 2.5, desc: "Channels magic to mend your wounds." }
    },

    // NEW: Stat descriptions for tooltips in character pane
    statDescriptions: {
        str: "<b>Strength (STR)</b><br>Increases the damage of your sword attacks and physical strikes. The foundation of a warrior Spellblade.",
        int: "<b>Intelligence (INT)</b><br>Amplifies spell damage and raises your maximum Mana Points (MP). Essential for casting powerful magic.",
        def: "<b>Defense (DEF)</b><br>Reduces physical damage taken from enemy attacks. Provides flat damage reduction. Every point counts in prolonged fights.",
        crit: "<b>Critical Chance (CRIT)</b><br>The chance to land a devastating critical hit dealing <b>150% damage</b> on melee attacks and damaging spells. Increases as you level up!"
    },

    shopItems: [
        {name:"Iron Sword",type:"weapon",bonus:7,price:55,effect:"+7 Damage"},
        {name:"Leather Armor",type:"armor",bonus:4,price:45,effect:"+4 Defense"},
        {name:"Mail Armor",type:"armor",bonus:10,price:150,effect:"+10 DEF, +20 Max HP, +20 Max MP", isSpecial: true, healthBonus:20, manaBonus:20},
        {name:"Health Potion",type:"consumable",bonus:30,price:12,effect:"Restores 30 HP"},
        {name:"Mana Potion",type:"consumable",bonus:15,price:15,effect:"Restores 15 MP"},
        {name:"Spell Tome: Ice Shard",type:"spell",price:95,effect:"Learn Ice Shard spell"}
    ]
};

window.Lore = Lore;