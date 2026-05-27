// lore.js - All story text, dialogues, flavor, and game data for modularity
// Enhanced for scalability: structured quests, area metadata, easy to add more NPCs/quests/areas

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

    // Structured quests for future expansion (supports multiple, objectives, rewards)
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
            description: "Investigate the Ruined Temple and uncover what ancient evil stirs within.",
            objective: "Explore the depths of the Ruined Temple",
            target: 1,
            progressKey: "templeProgress",
            reward: { gold: 75, item: "Ancient Relic" },
            stages: {
                offer: "The Ruined Temple was once a place of great power. Now it festers. Whatever sleeps there must not wake. Will you investigate?",
                accepted: "Go with caution, Spellblade. The shadows there are older than our village.",
                completed: "You have braved the temple. The answers you seek may change everything..."
            }
        },
        // NEW QUESTS
        wardensWatch: {
            id: 3,
            title: "The Warden's Watch",
            description: "Thorne believes a powerful corrupted beast is coordinating the attacks. Slay the Alpha and bring proof.",
            objective: "Defeat the Corrupted Alpha in the Woods",
            target: 1,
            progressKey: "alphaSlain",
            reward: { gold: 60, xp: 45, item: "Warden's Charm" },
            stages: {
                offer: "The beasts aren't mindless anymore. There's an Alpha — bigger, smarter, leading the others. Help me end it before the pack grows too strong.",
                accepted: "Good. The Alpha roams the deepest parts of the woods. Bring me its heart or its fang. Anything to prove it's dead.",
                completed: "You did it. The pack will scatter for a time. The woods are safer... for now. Take this charm — it was my father's."
            }
        },
        unfinishedOath: {
            id: 4,
            title: "The Unfinished Oath",
            description: "Help the bound spirit Aelric complete his final duty so the temple's seal can be properly understood.",
            objective: "Recover Aelric's Sunsteel Sigil from the Ruins",
            target: 1,
            progressKey: "sigilRecovered",
            reward: { gold: 50, xp: 60, spell: "Warden's Resolve" },
            stages: {
                offer: "I was one of the last to stand against the Whisperer. My brothers fell. I could not finish the rite. Help me atone, Spellblade.",
                accepted: "Deep in the sanctum lies my Sunsteel Sigil. Without it, the final seal cannot be understood... or perhaps broken.",
                completed: "You have returned what was lost. With this, I can finally pass... and you now carry a fragment of the old power."
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

    areas: {
        village: {
            name: "Eldoria Village Square",
            bgImage: "assets/backgrounds/village.jpg",
            caption: "The quiet village square. The Elder awaits.",
            flavor: "Home. Safety. Whispers of worry in every doorway."
        },
        woods: {
            name: "Whispering Woods",
            bgImage: "assets/backgrounds/woods.jpg",
            caption: "Twisted trees whisper secrets and dangers.",
            flavor: "The air is thick with unnatural mist. Every shadow could be watching."
        },
        ruins: {
            name: "Ruined Temple",
            bgImage: "assets/backgrounds/ruins.jpg",
            caption: "Ancient stones hum with forgotten power.",
            flavor: "Broken pillars and faded runes. Something old and hungry stirs below."
        }
    },

    // Enhanced NPC data with age, conditional options, and type
    npcs: {
        elder: {
            name: "Village Elder",
            portrait: "assets/npcs/elder.jpg",
            title: "Keeper of Eldoria's Wards",
            age: 67,
            married: "Widowed",
            hasQuests: true,
            hasShop: false,
            type: "elder"
        },
        merchant: {
            name: "Merchant",
            portrait: "assets/npcs/merchant.jpg",
            title: "Travelling Trader",
            age: 42,
            married: "Married",
            hasQuests: false,
            hasShop: true,
            type: "merchant"
        },
        nun: {
            name: "Sister Elara",
            portrait: "assets/npcs/nun.jpg",
            title: "Sister of the Silver Light",
            age: 24,
            married: "Not married",
            hasQuests: false,
            hasShop: true,
            type: "nun"
        },
        thorne: {
            name: "Thorne the Warden",
            portrait: "assets/npcs/thorne.jpg",
            title: "The Last Forest Warden",
            age: 52,
            married: "Widowed",
            hasQuests: true,
            hasShop: false,
            type: "thorne"
        },
        aelric: {
            name: "Aelric the Bound",
            portrait: "assets/npcs/aelric.jpg",
            title: "Spectral Warden of the Temple",
            age: 37,
            married: "Not applicable",
            hasQuests: true,
            hasShop: false,
            type: "aelric"
        },
        mother: {
            name: "Mother Seraphine",
            portrait: "assets/npcs/mother_seraphine.jpg",
            title: "High Mother of the Silver Light",
            age: 48,
            married: "Widowed",
            hasQuests: false,
            hasShop: true,
            type: "mother"
        }
    },

    spells: {
        "Firebolt": { cost: 5, baseDmg: 8, scaling: 1.5, desc: "Hurls a bolt of fire at the enemy." },
        "Ice Shard": { cost: 8, baseDmg: 12, scaling: 1.8, desc: "Launches sharp shards of ice." },
        "Heal": { cost: 10, baseHeal: 15, scaling: 2.5, desc: "Channels magic to mend your wounds." }
    },

    shopItems: [
        {name:"Iron Sword",type:"weapon",bonus:7,price:55,effect:"+7 Damage", image:"assets/items/iron-sword.jpg"},
        {name:"Leather Armor",type:"armor",bonus:4,price:45,effect:"+4 Defense", image:"assets/items/leather-armor.jpg"},
        {name:"Mail Armor",type:"armor",bonus:10,price:150,effect:"+10 DEF, +20 Max HP, +20 Max MP", isSpecial: true, healthBonus:20, manaBonus:20, image:"assets/items/mail-armor.jpg"},
        {name:"Health Potion",type:"consumable",bonus:30,price:12,effect:"Restores 30 HP", image:"assets/items/health-potion.jpg"},
        {name:"Mana Potion",type:"consumable",bonus:15,price:15,effect:"Restores 15 MP", image:"assets/items/mana-potion.jpg"},
        {name:"Spell Tome: Ice Shard",type:"spell",price:95,effect:"Learn Ice Shard spell", image:"assets/items/spell-tome-ice-shard.jpg"},
        {name:"Wooden Shield", type:"shield", blockChance:15, price:45, effect:"+15% Block Chance", image:"assets/items/wooden-shield.jpg"},
        {name:"Iron Buckler", type:"shield", blockChance:22, price:85, effect:"+22% Block Chance", image:"assets/items/iron-buckler.jpg"}
    ],

    // Holy-themed items sold only by Sister Elara at the Church
    nunShopItems: [
        {name:"Holy Water", type:"consumable", bonus:25, price:18, effect:"Restores 25 HP + 10 MP. Stronger vs the undead.", image:"assets/items/holy-water.jpg"},
        {name:"Silver Pendant", type:"armor", bonus:3, price:75, effect:"+3 DEF, +4 vs undead", isHoly: true, undeadBonus:4, image:"assets/items/silver-pendant.jpg"},
        {name:"Consecrated Blade", type:"weapon", bonus:9, price:120, effect:"+9 Damage. Holy light guides your strikes.", isHoly: true, image:"assets/items/consecrated-blade.jpg"},
        {name:"Prayer Shawl", type:"armor", bonus:6, price:95, effect:"+6 DEF, +12 Max MP", isSpecial: true, manaBonus:12, image:"assets/items/prayer-shawl.jpg"},
        {name:"Tome of Radiance", type:"spell", price:135, effect:"Learn Divine Light — a holy spell that burns the corrupt.", image:"assets/items/tome-of-radiance.jpg"},
        {name:"Aegis of Light", type:"shield", blockChance:28, price:160, effect:"+28% Block Chance. Holy shield that protects the faithful.", image:"assets/items/aegis-of-light.jpg"}
    ],

    // Dialogue flavor for the Nun (young, compassionate, lore-rich)
    nun: {
        greeting: "The Light still shines in these dark times, traveler. How may the Church aid you?",
        talk: [
            "<b>Sister Elara:</b> 'I was only a girl when the wards first began to weaken. I remember the old hymns still echoing through these halls.'",
            "<b>Sister Elara:</b> 'The creatures in the woods were once our neighbors. It breaks my heart to see what the shadow has done to them.'",
            "<b>Sister Elara:</b> 'Some say the Ruined Temple holds the source of this corruption. Others believe it is our only hope for cleansing it.'",
            "<b>Sister Elara:</b> 'Stay a while and pray with me, if your heart is heavy. The Light listens even when the world feels silent.'"
        ],
        shopIntro: "The Church has kept a few sacred relics and blessed draughts. They are not for sale to just anyone... but I see the courage in your eyes, Spellblade."
    },

    // New NPC dialogue
    thorne: {
        greeting: "Another fool wandering the woods? Or are you here to actually do something about the darkness?",
        talk: [
            "<b>Thorne:</b> 'I was a temple warden once. We thought the seal would hold forever. We were wrong.'",
            "<b>Thorne:</b> 'The Alpha isn't just another beast. It's what happens when the shadow gets its claws into something that used to think.'",
            "<b>Thorne:</b> 'If you kill it, the lesser ones will lose direction for a while. That might buy us time.'"
        ],
        questOffer: "The beasts have an Alpha now. A big bastard with too many eyes. Help me kill it before the whole forest turns."
    },

    aelric: {
        greeting: "...You can see me. That means the veil is thinner than I feared.",
        talk: [
            "<b>Aelric:</b> 'I died here centuries ago, yet I remain. The seal was never meant to last without the Sigil.'",
            "<b>Aelric:</b> 'The First Betrayer still whispers from below. Every beast you kill is one less voice added to his choir.'",
            "<b>Aelric:</b> 'If you find my Sunsteel Sigil... bring it to me. Perhaps then I can finally rest... and give you what power remains in these stones.'"
        ],
        questOffer: "The Sigil was shattered and scattered when the seal cracked. Find the largest piece in the deepest sanctum. Only then can I pass on my final gift."
    },

    // Mother Seraphine (Sister Elara's mother, senior nun)
    mother: {
        greeting: "The Light has guided you here, child. My daughter Elara speaks highly of you.",
        talk: [
            "<b>Mother Seraphine:</b> 'I raised Elara in these very halls. She was always too soft-hearted for this world... but perhaps that is what the Light needs most right now.'",
            "<b>Mother Seraphine:</b> 'The corruption in the temple is older than any of us. My husband gave his life trying to reinforce the old wards. I still wear his ring beneath these robes.'",
            "<b>Mother Seraphine:</b> 'If you truly wish to help, speak with my daughter first. She carries the gentler half of the faith. I carry the resolve.'",
            "<b>Mother Seraphine:</b> 'The faithful have grown fewer, but those who remain burn all the brighter. Do not let the shadows dim that flame.'"
        ],
        shopIntro: "I keep a small collection of relics and consecrated arms for those who walk the true path. They are not for the faint of heart."
    }
};

window.Lore = Lore;