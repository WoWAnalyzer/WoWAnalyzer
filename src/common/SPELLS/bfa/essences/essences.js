/**
 * All azerite essences go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

 // Trait IDs
  //   2 = "Azeroth's Undying Gift"
  //   3 = "Sphere of Suppression"
  //   4 = "Worldvein Resonance"
  //   5 = "Essence of the Focusing Iris"
  //   6 = "Purification Protocol"
  //   7 = "Anima of Life and Death"
  //  12 = "The Crucible of Flame"
  //  13 = "Nullification Dynamo"
  //  14 = "Condensed Life-Force"
  //  15 = "Ripple in Space"
  //  17 = "The Ever-Rising Tide"
  //  18 = "Artifice of Time"
  //  19 = "The Well of Existence"
  //  20 = "Life-Binder's Invocation"
  //  21 = "Vitality Conduit"
  //  22 = "Vision of Perfection"
  //  23 = "Blood of the Enemy"
  //  25 = "Aegis of the Deep"
  //  27 = "Memory of Lucid Dreams"
  //  28 = "The Unbound Force"
  //  32 = "Conflict and Strife"

// well https://www.warcraftlogs.com/reports/wg7GpmZxhat6TLjV/#fight=41&source=3
// well wehere he actually uses it https://www.warcraftlogs.com/reports/HKnChBYqyXk61g3V#boss=-2&difficulty=0&source=23&type=healing
//  https://www.warcraftlogs.com/reports/HKnChBYqyXk61g3V/#fight=8
export default {
  EVER_RISING_TIDE: {
    id: 299879,
    traitId: 17,
    name: 'The Ever-Rising Tide',
    icon: 'inv_elemental_mote_mana',
  },
  EVER_RISING_TIDE_MAJOR: {
    id: 299876,
    name: 'Overcharge Mana',
    icon: 'spell_azerite_essence09',
  },
  EVER_RISING_TIDE_HEALING_BUFF: {
    id: 299624,
    name: 'Overcharge Mana',
    icon: 'spell_azerite_essence09',
  },
  EVER_RISING_TIDE_CHARGING_BUFF: {
    id: 296072,
    name: 'Overcharge Mana',
    icon: 'spell_azerite_essence09',
  },
  EVER_RISING_TIDE_STAT_BUFF: {
    id: 296059,
    name: 'The Ever-Rising Tide',
    icon: 'inv_elemental_mote_mana',
  },
  EVER_RISING_TIDE_ENERGIZE: {
    id: 296065,
    name: 'The Ever-Rising Tide',
    icon: 'inv_elemental_mote_mana',
  },
  
  WELL_OF_EXISTENCE: {
    id: 299936,
    traitId: 19,
    name: 'The Well Of Existence',
    icon: 'creatureportrait_twilightshammer_summoningportal_water01',
  },
  // This is the 3+ version that won't overheal. But same is case for ERT. 
  WELL_OF_EXISTENCE_MAJOR: {
    id: 299933,
    name: 'Refreshment',
    icon: 'creatureportrait_twilightshammer_summoningportal_water01',
  },
  WELL_OF_EXISTENCE_MAJOR_ABILITY: {
    id: 296197,
    name: 'Refreshment',
    icon: 'creatureportrait_twilightshammer_summoningportal_water01',
  },
  WELL_OF_EXISTENCE_HEAL: {
    id: 296184,
    name: 'The Well of Existence',
    icon: 'creatureportrait_twilightshammer_summoningportal_water01',
  },
};
