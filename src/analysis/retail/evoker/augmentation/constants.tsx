// Accretion
export const ACCRETION_CDR_MS = 1000;

// Ebon Might
export const EBON_MIGHT_BASE_DURATION_MS = 10000;

// Mastery aura extension
export const TIMEWALKER_BASE_EXTENSION = 0.04;

// Sands of Time
export const ERUPTION_EXTENSION_MS = 1000;
export const EMPOWER_EXTENSION_MS = 2000;
export const BREATH_OF_EONS_EXTENSION_MS = 5000;
export const DREAM_OF_SPRINGS_EXTENSION_MS = 1000;
export const SANDS_OF_TIME_CRIT_MOD = 0.5;

// Prescience
export const PRESICENCE_BASE_DURATION_MS = 18000;

// Talent multipliers
export const REACTIVE_HIDE_MULTIPLIER = 0.1;
export const RICOCHETING_PYROCLAST_MULTIPLIER = 0.3;
export const RICOCHETING_PYROCLAST_MAX_MULTIPLIER = 1.5;
export const TECTONIC_LOCUS_MULTIPLIER = 0.5;
export const VOLCANISM_ESSENCE_REDUCTION = 1;
export const ANACHRONISM_ESSCENCE_CHANCE = 0.35;
export const SYMBIOTIC_HEALING_INCREASE = 0.03;

// Breath of Eons multiplier
export const BREATH_OF_EONS_MULTIPLIER = 0.1;

// Tier
export const TREMBLING_EARTH_EXTENSION_MS = 200;
export const TREMBLING_EART_STACK_LIMIT = 5;

/** SpellIds to blacklist, ie. trinkets that doesnt add contribution */
export const ABILITY_BLACKLIST: number[] = [
  409632, // Breath of Eons
  402583, // Beacon
  408682, // Dragonfire Bomb Dispenser
  408694, // Dragonfire Bomb Dispenser
  401324, // Pocket Anvil (Echoed Flare)
  401306, // Pocket Anvil (Anvil Strike)
  401422, // Vessel of Searing Shadow (Shadow Spike)
  401428, // Vessel of Searing Shadow (Ravenous Shadowflame)
  418774, // Mirror of Fractured Tomorrows ()
  418588, // Mirror of Fractured Tomorrows (Sand Cleave)
  419591, // Mirror of Fractured Tomorrows (Auto Attack)
  418607, // Mirror of Fractured Tomorrows (Sand Bolt)
  406251, // Roiling Shadowflame
  406889, // Roiling Shadowflame (Self Harm)
  379403, // Toxic Thorn Footwraps (Launched Thorns)
  408791, // Ashkandur, Fall of the Brotherhood
  378426, // Slimy Expulsion Boots boots (Corrosive Slime)
  381006, // Acidic Hailstone Treads (Deep Chill)
  381700, // Forgestorm (Forgestorm Ignited)
  406764, // Shadowflame Wreathe
  394453, // Broodkeeper's Blaze
  370794, // Unstable Frostfire Belt (Lingering Frostspark)
  408836, // Djaruun, Pillar of the Elder Flame
  408815, // Djaruun, Pillar of the Elder Flame
  381475, // Erupting Spear Fragment
  281721, // Bile-Stained Crawg Tusks (Vile Bile)
  214397, // Mark of Dargrul (Landslide)
  408469, // Call to Suffering (Self Harm)
  374087, // Glacial Fury
  370817, // Shocking Disclosure
  426564, // Augury of the Primal Flame (Annihilating Flame)
  417458, // Accelerating Sandglass
  424965, // Thorn Spirit
  425181, // Thorn Blast
  419737, // Timestrike
  265953, // Touch of Gold
  425154, // Vicious Brand
  425156, // Radiating Brand
  422146, // Solar Maelstrom
  426341, // Tindral's Fowl Fantasia
  426431, // Denizen Of The Flame
  426486, // Denizen Of The Flame Final
  426339, // Igiras Cruel Nightmare
  426527, // Flaying Torment
  259756, // Entropic Embrace
  427209, // Web of Dreams
  422956, // Essence Splice
  427161, // Essence Splice
  424324, // Hungering Shadowflame
  419279, // Extinction Blast
  215444, // Dark Blast
  214168, // Brutal Haymaker
  214169, // Brutal Haymaker
  228784, // Brutal Haymaker Vulnerability
  214350, // Nightmare Essence
  422750, // Shadowflame Rage
  425701, // Shadowflame Lash Enemy
  422750, // Tainted Heart
  425461, // Tainted Heart Enemy Damage
  417458, // Accelerating Sandglass
  215407, // Dark Blast
  270827, // Webweavers Soul Gem
  213785, // Nightfall
  425509, // Severed Embers (Branch of the Tormented Ancient)
  414532, // Mark of Fyr'alath (Fyr'alath the Dreamrender)
  417134, // Rage of Fyr'alath (Fyr'alath the Dreamrender)
  413584, // Explosive Rage (Fyr'alath the Dreamrender)
  424094, // Rage of Fyr'alath (Fyr'alath the Dreamrender)
  386301, // Completely Safe Rocket
  243991, // Blazefury Medallion
];
