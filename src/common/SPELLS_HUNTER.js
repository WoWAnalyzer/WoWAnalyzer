export default {
  // All
  // Spec: Marksmanship
  // Spec: Beast Mastery
  // Spec: Survival
  // Talents: Marksmanship
  // Tier 1
  LONE_WOLF_TALENT: {
    id: 155228,
    name: 'Lone Wolf',
    icon: 'spell_hunter_lonewolf',
    description: 'Use at all times since it simply provides the most damage and requires no management. It also improves target switching capability by removing the pet, putting more of the total damage in the hands of the hunter.',
  },
  STEADY_FOCUS_TALENT: {
    id: 193533,
    name: 'Steady Focus',
    icon: 'ability_hunter_improvedsteadyshot',
    description: 'Decent choice if you enjoy having a pet, but with the new patch where Focus is not the limit as much as it is time, it is significantly worse than <a href="http://www.wowhead.com/spell=155228/lone-wolf" target="_blank">Lone Wolf</a> in terms of damage output, and even worse in terms of target switching since you will have a pet if you use this talent.',
  },
  CAREFUL_AIM_TALENT: {
    id: 53238,
    name: 'Careful Aim',
    icon: 'ability_hunter_zenarchery',
    description: 'Vastly inferior choice to <a href="http://www.wowhead.com/spell=155228/lone-wolf" target="_blank">Lone Wolf</a>.',
  },
  // Tier 2
  LOCK_AND_LOAD_TALENT: {
    id: 194595,
    name: 'Lock and Load',
    icon: 'ability_hunter_lockandload',
    description: 'Always use when there is regular target switching in the fight.',
  },
  BLACK_ARROW_TALENT: {
    id: 194599,
    name: 'Black Arrow',
    icon: 'spell_shadow_painspike',
    description: 'Not worth using for any PvE situation outside leveling.',
  },
  TRUE_AIM_TALENT: {
    id: 199527,
    name: 'True Aim',
    icon: 'spell_hunter_focusingshot',
    description: 'The best pure single-target option by a fair bit, but only really when combined with the level 100 talent <a href="http://www.wowhead.com/spell=199522/trick-shot" target="_blank">Trick Shot</a> on a pure single-target, as they add together to vastly increase Aimed Shot damage. When not using <a href="http://www.wowhead.com/spell=199522/trick-shot" target="_blank">Trick Shot</a>, <a href="http://www.wowhead.com/spell=194595/lock-and-load" target="_blank">Lock and Load</a> is always the best choice. NOTE: <a href="http://www.wowhead.com/spell=199527/true-aim" target="_blank">True Aim</a> cannot be used together with <a href="http://www.wowhead.com/spell=199522/trick-shot" target="_blank">Trick Shot</a> for situations where you will be making use of <a href="http://www.wowhead.com/spell=199522/trick-shot" target="_blank">Trick Shot</a>\'s ability to cleave, since the AoE-Aimed Shots that <a href="http://www.wowhead.com/spell=199522/trick-shot" target="_blank">Trick Shot</a> causes will cancel out <a href="http://www.wowhead.com/spell=199527/true-aim" target="_blank">True Aim</a>\'s beneficial effect on a single target, as it will constantly reproc on different targets.',
  },
  // Tier 3
  POSTHASTE_TALENT: {
    id: 109215,
    name: 'Posthaste',
    icon: 'ability_hunter_posthaste',
    description: 'Default choice as it will make you much better at covering long distances on a regular basis.',
  },
  FARSTRIDER_TALENT: {
    id: 199523,
    name: 'Farstrider',
    icon: 'ability_hunter_pet_chimera',
    description: 'You can use this if you never have to move more than the distance a single Posthaste Icon Posthaste will take you.',
  },
  TRAILBLAZER_TALENT: {
    id: 199921,
    name: 'Trailblazer',
    icon: 'ability_hunter_aspectmastery',
    description: 'Only really worth using for non-mounted periods where you will be moving between combat zones for a long time. There is a conceivably use for it for Survival in dungeons, since the spec does not have a lot of mobility when running between packs besides its <a href="http://www.wowhead.com/spell=190925/harpoon" target="_blank">Harpoon</a> ability.',
  },
  // Tier 4
  EXPLOSIVE_SHOT_TALENT: {
    id: 212431,
    name: 'Explosive Shot',
    icon: 'ability_hunter_explosiveshot',
    description: 'Together with <a href="http://www.wowhead.com/spell=198670/piercing-shot" target="_blank">Piercing Shot</a> constitutes what is known in the community as the "meme build". It is extremely powerful for multi-target situations of all kinds, and it is much more mobile than Trick Shot builds. Great whenever you can reliably hit more than 1 target/use its burst AoE.',
  },
  SENTINEL_TALENT: {
    id: 206817,
    name: 'Sentinel',
    icon: 'spell_nature_sentinal',
    description: 'Not worth choosing in any situation.',
  },
  PATIENT_SNIPER_TALENT: {
    id: 234588,
    name: 'Patient Sniper',
    icon: 'ability_hunter_snipertraining',
    description: 'The best pure/primarily single-target choice.',
  },
  // Tier 5
  BINDING_SHOT_TALENT: {
    id: 109248,
    name: 'Binding Shot',
    icon: 'spell_shaman_bindelemental',
    description: 'Should generally be your default choice. It can bring some raid utility, as it can be used as a reliable stun for fights with adds. It can also be used as an interrupt, since placing it so that the add is at the edge of the targeted area will instantly stun it, regardless of whether or not it moves.',
  },
  WYVERN_STING_TALENT: {
    id: 19386,
    name: 'Wyvern Sting',
    icon: 'inv_spear_02',
  },
  CAMOUFLAGE_TALENT: {
    id: 199483,
    name: 'Camouflage',
    icon: 'ability_hunter_camouflage',
  },
  // Tier 6
  A_MURDER_OF_CROWS_TALENT: {
    id: 131894,
    name: 'A Murder of Crows',
    icon: 'ability_hunter_murderofcrows',
    description: 'The best choice for pure single-target encounters or encounters where you can use it to burst down single, important targets',
  },
  BARRAGE_TALENT: {
    id: 120360,
    name: 'Barrage',
    icon: 'ability_hunter_rapidregeneration',
    description: 'Currently the strongest choice in this tier for encounters with <em>a lot</em> of <strong>spread AoE</strong>. It has been <strong><u><em>significantly nerfed on single-target and is now no longer worth using for it at all</em></u></strong>, with Volley providing better single-target and AoE, albeit in a smaller area. It should be used on any fight where the AoE is VERY bursty and where single-target is not an issue, i.e. <strong>NO SUCH FIGHT IN CURRENT CONTENT</strong>.',
  },
  VOLLEY_TALENT: {
    id: 194386,
    name: 'Volley',
    icon: 'ability_marksmanship',
    description: 'Use for cleavy stuff. Does more AoE damage than <a href="http://www.wowhead.com/spell=120360/barrage" target="_blank">Barrage</a> but it requires enemies to be stacked on top of each other, which is not always the case. You should pick Volley for fights where you can reliably hit more than 1 target with it. It is very close to <a href="http://www.wowhead.com/spell=131894/a-murder-of-crows" target="_blank">A Murder of Crows</a> in terms of single-target, so it does not take much cleaving to pull ahead.',
  },
  // Talents: Beast Mastery
  // Talents: Survival
  // Traits: Marksmanship
  // Traits: Beast Mastery
  // Traits: Survival
};
