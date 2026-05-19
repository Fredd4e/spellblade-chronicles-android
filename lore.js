// lore.js - All story text, dialogues, flavor, and game data for modularity

const Lore = {
    intro: {
        title: "The Shadow Rises",
        paragraphs: [
            "For generations, the village of <b>Eldoria</b> lived in peace, protected by ancient wards.",
            "But something has changed. Twisted creatures have begun emerging from the Whispering Woods — things that were once men and beasts.",
            "You are <b>Aether</b>, a young Spellblade trained in both blade and arcane arts. The village Elder has summoned you.",
            "The shadows grow bolder with each passing night. If no one stands against them, Eldoria will fall."
        ]
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
            "<b>Elder:</b> 'The Ruined Temple was once a place of great power. Now it festers. Whatever sleeps there must not wake.'"
        ],
        default: [
            "<b>Elder:</b> 'Return when you have slain more of the foul creatures in the woods.'"
        ]
    },

    travel: {
        village: "You return to the safety of Eldoria Village.",
        woods: "You step into the dark Whispering Woods...",
        ruins: "You enter the ancient and ominous Ruined Temple."
    },

    combatStart: {
        default: (enemyName) => `A <b>${enemyName}</b> emerges from the shadows!`,
        ruins: "A skeletal warrior rises from the dust!"
    },

    loot: {
        foundGold: (amount) => `You found <b>${amount} Gold</b> hidden beneath the roots.`,
        nothing: "Your search turned up nothing of value.",
        danger: "Your search attracted something dangerous..."
    },

    levelUp: (level) => `<b>LEVEL UP!</b> You are now Level ${level}!`,

    itemFlavors: {
        "Health Potion": "A simple red potion that mends wounds.",
        "Mana Potion": "Restores magical energy.",
        "Iron Sword": "A sturdy blade forged in the village smithy.",
        "Leather Armor": "Light but reliable protection."
    },

    // Game data for modularity
    spells: {
        "Firebolt": { cost: 5, baseDmg: 8, scaling: 1.5, desc: "Hurls a bolt of fire at the enemy." },
        "Ice Shard": { cost: 8, baseDmg: 12, scaling: 1.8, desc: "Launches sharp shards of ice." },
        "Heal": { cost: 10, baseHeal: 15, scaling: 2.5, desc: "Channels magic to mend your wounds." }
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

// Make available globally
window.Lore = Lore;