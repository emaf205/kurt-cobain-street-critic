/* ==========================================================================
   VIA SAVONA CRITIC: Kurt in Milan - English Dialogues & Archetypes
   Setting: Via Savona / Zona Tortona (Milan Fashion & Design District)
   Protagonist: Kurt Cobain (Disillusioned, rude, anti-corporate grunge icon)
   ========================================================================== */

export const PEDESTRIAN_TYPES = {
  FASHION_VICTIM: 'fashion_victim',
  DESIGN_ARCHITECT: 'design_architect',
  APERITIVO_BRO: 'aperitivo_bro',
  CASTING_MODEL: 'casting_model',
  PR_BOUNCER: 'pr_bouncer',
  MILANESE_SCIURA: 'milanese_sciura',
  SPECIALTY_BARISTA: 'specialty_barista',
  ELECTRIC_COURIER: 'electric_courier'
};

export const PEDESTRIAN_CONFIG = {
  [PEDESTRIAN_TYPES.FASHION_VICTIM]: {
    name: 'Fashion Week Influencer',
    title: 'Archive Runway Purist',
    colorOutfit: 0x111111, // All-black avant-garde designer outfit
    colorPants: 0x1a1a1a,
    accessory: 'sunglasses_phone',
    dialogues: [
      {
        kurt: "Nice vintage jacket. Did you buy authenticity off a showroom rack, or does your stylist handle all your existential dread?",
        pedestrian: "Excuse me?! This is archival Margiela! You look like you slept under a bridge in Seattle!"
      },
      {
        kurt: "You're recording an outfit check while standing next to overflowing dumpster bags. Poetic corporate decay.",
        pedestrian: "Security! Someone get this unwashed relic out of my camera frame!"
      },
      {
        kurt: "Oversized sunglasses indoors at 3 PM? What are you hiding from, your own lack of original personality?",
        pedestrian: "I have 400K followers! You probably don't even have a LinkedIn profile!"
      },
      {
        kurt: "Four thousand euros for distressing on denim that looks like it got mauled by a lawnmower. Late capitalism is hilarious.",
        pedestrian: "It's called deconstructivism, you utter peasant!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.DESIGN_ARCHITECT]: {
    name: 'Fuorisalone Architect',
    title: 'Spatial Concept Visionary',
    colorOutfit: 0x222222, // Black turtleneck
    colorPants: 0x424949,
    accessory: 'round_glasses_folder',
    dialogues: [
      {
        kurt: "'Spatial sustainability'? Bro, you're charging eight grand for a brutalist chair that gives people permanent spine damage.",
        pedestrian: "It's a theoretical manifesto on ergonomic discomfort! You wouldn't understand post-industrial dialectics!"
      },
      {
        kurt: "You converted an old factory where workers lost their fingers into a showroom for Scandinavian scented candles. Bravo.",
        pedestrian: "This is urban regeneration! We are revitalizing the creative ecosystem of Milan!"
      },
      {
        kurt: "Round horn-rimmed glasses and a black turtleneck. You're an Ikea catalog with a nicotine habit.",
        pedestrian: "At least I build tangible structures instead of whining into an amplifier!"
      },
      {
        kurt: "Every sentence out of your mouth has 'synergy', 'curation' and 'narrative'. Say one real word, I dare you.",
        pedestrian: "Get off my installation pavement! This concrete is imported from Berlin!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.APERITIVO_BRO]: {
    name: 'Finance / Aperitivo Bro',
    title: 'Senior Venture Associate',
    colorOutfit: 0x1c2833, // Blue blazer
    colorPants: 0xd5dbdb, // Beige chinos
    accessory: 'cocktail_glass',
    dialogues: [
      {
        kurt: "Standing on the sidewalk sipping a twelve-euro spritz while shouting into AirPods about Q4 KPIs. Bleak existence, man.",
        pedestrian: "Bro, my bonus this quarter buys your whole thrift shop wardrobe ten times over!"
      },
      {
        kurt: "You work ninety hours a week so your firm's partner can buy a yacht. But hey, free olives at happy hour, right?",
        pedestrian: "Walk away, loser! Some of us actually contribute to the GDP of this city!"
      },
      {
        kurt: "Slicked-back hair and a monogrammed shirt. You look like a walking lawsuit for insider trading.",
        pedestrian: "Don't spill dirty street water on my Loro Piana loafers, you freak!"
      },
      {
        kurt: "You're laughing at spreadsheet memes on your Apple Watch. Have some self-respect.",
        pedestrian: "I'm networking! Something you clearly never learned to do in your mother's basement!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.CASTING_MODEL]: {
    name: 'Runway Casting Model',
    title: 'Fashion Week Hopeful',
    colorOutfit: 0x2c3e50,
    colorPants: 0x17202a,
    accessory: 'portfolio_book',
    dialogues: [
      {
        kurt: "Running on cobblestones in four-inch heels with a portfolio book. The fashion industry is a meat grinder and you're the burger.",
        pedestrian: "I have five minutes to get to Spazio Savona, move your filthy board!"
      },
      {
        kurt: "They're gonna pay you in leftover sample bags and exposure while the creative director buys another villa in Como.",
        pedestrian: "Stop talking to me! Bad vibes ruin my skin texture!"
      },
      {
        kurt: "Don't faint on the crosswalk, girl. A diet of black coffee and vape fumes isn't a sustainable breakfast.",
        pedestrian: "You smell like wet flannel and teenage resentment! Back off!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.PR_BOUNCER]: {
    name: 'Showroom Door Hostess',
    title: 'Guestlist Gatekeeper',
    colorOutfit: 0x0a0a0a, // Sleek black jumpsuit
    colorPants: 0x0a0a0a,
    accessory: 'headset_clipboard',
    dialogues: [
      {
        kurt: "Holding an iPad by a velvet rope acting like St. Peter at the gates of Heaven. It's a party for hand sanitizer, relax.",
        pedestrian: "You're definitely not on the VIP guestlist, sir. Step beyond the barriers immediately!"
      },
      {
        kurt: "You rejected people all night just to let in three minor DJs and a guy who sells crypto. High standards.",
        pedestrian: "This is a private preview for Press and Tier-1 Talents! Call the police!"
      },
      {
        kurt: "Standing in the Milan drizzle checking barcodes for minimum wage. Corporate servitude with a radio headset.",
        pedestrian: "I am authorized to have you removed from Via Savona! Keep walking!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.MILANESE_SCIURA]: {
    name: 'Zona Tortona Aristocrat',
    title: 'The Neighborhood Matriarch',
    colorOutfit: 0x784212, // Camel hair coat
    colorPants: 0x1b2631,
    accessory: 'pearls_poodle',
    dialogues: [
      {
        kurt: "Ma'am, that toy poodle is genetically a descendant of gray wolves. Stop giving it an organic cashmere cardigan.",
        pedestrian: "Che orrore! A scruffy vagrant in Via Savona! Where are the Carabinieri?!"
      },
      {
        kurt: "Don't clutch your Hermès bag so tight, lady. I write songs, I don't mug grandmothers.",
        pedestrian: "Disgusting insolence! The youth in this district have completely lost all decorum!"
      },
      {
        kurt: "Nice facelift. If you smile any harder, your ears are gonna touch behind your head.",
        pedestrian: "You hooligan! I have lived in this palazzo since 1974, get your board off my sidewalk!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.SPECIALTY_BARISTA]: {
    name: 'Specialty Coffee Snob',
    title: 'Artisan Pour-Over Alchemist',
    colorOutfit: 0x5d4037, // Brown canvas work apron
    colorPants: 0x263238,
    accessory: 'apron_beanie',
    dialogues: [
      {
        kurt: "Charging seven euros for fermented Ethiopian bean juice dripped through an origami filter. Just give people caffeine, man.",
        pedestrian: "It's an anaerobic naturally processed light roast with notes of bergamot and jasmine, you barbarian!"
      },
      {
        kurt: "Knitted wool beanie in thirty-degree summer heat. Your brain is literally boiling for aesthetic points.",
        pedestrian: "It's a lifestyle statement! You probably drink instant commodity Robusta from a vending machine!"
      },
      {
        kurt: "Tattooed hands, raw denim apron, twelve minutes to pour a cup. You're an actor playing a coffee shop worker.",
        pedestrian: "Extraction pressure is a science! Take your negative energy back to Seattle!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.ELECTRIC_COURIER]: {
    name: 'Food App Rider',
    title: 'The Algorithmic Speeder',
    colorOutfit: 0xe67e22, // High-vis courier jacket
    colorPants: 0x17202a,
    accessory: 'delivery_box',
    dialogues: [
      {
        kurt: "Risking your collarbone on wet tram tracks so some marketing director can get cold poke bowls. Revolt against the app, dude.",
        pedestrian: "Hey! I have three minutes before my delivery rating drops! Get out of my lane!"
      },
      {
        kurt: "The algorithm controls your pedals and your bladder breaks. You're living in a cyberpunk dystopia with neon logos.",
        pedestrian: "I don't have time for philosophy, man! Move your skateboard!"
      }
    ]
  }
};

export function getRandomDialogue(pedestrianType) {
  const config = PEDESTRIAN_CONFIG[pedestrianType] || PEDESTRIAN_CONFIG[PEDESTRIAN_TYPES.FASHION_VICTIM];
  const list = config.dialogues;
  const index = Math.floor(Math.random() * list.length);
  return {
    ...list[index],
    name: config.name,
    title: config.title
  };
}
