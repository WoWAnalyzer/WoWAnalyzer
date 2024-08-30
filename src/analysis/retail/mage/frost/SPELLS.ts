/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from 'common/SPELLS/Spell';

const spells = {
  MASTERY_ICICLES: {
    id: 76613,
    name: 'Mastery: Icicles',
    icon: 'spell_frost_iceshard',
  },
  ICICLES_BUFF: {
    id: 205473,
    name: 'Icicles',
    icon: 'spell_frost_iceshard',
  },
  ICICLE_DAMAGE: {
    id: 148022,
    name: 'Icicle',
    icon: 'spell_frost_iceshard',
  },
  FROSTBOLT: {
    id: 116,
    name: 'Frostbolt',
    icon: 'spell_frost_frostbolt02',
  },
  FROSTBOLT_DAMAGE: {
    id: 228597,
    name: 'Frostbolt',
    icon: 'spell_frost_frostbolt02',
  },
  BLIZZARD: {
    id: 190356,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm',
  },
  WATERBOLT: {
    id: 31707,
    name: 'Waterbolt',
    icon: 'spell_frost_frostbolt',
  },
  ICE_LANCE_DAMAGE: {
    id: 228598,
    name: 'Ice Lance',
    icon: 'spell_frost_frostblast',
  },
  BRAIN_FREEZE_BUFF: {
    id: 190446,
    name: 'Brain Freeze',
    icon: 'ability_mage_brainfreeze',
  },
  FINGERS_OF_FROST_BUFF: {
    id: 44544,
    name: 'Fingers of Frost',
    icon: 'ability_mage_wintersgrasp',
  },
  WINTERS_CHILL: {
    id: 228358,
    name: "Winter's Chill",
    icon: 'spell_frost_frostward',
  },
  GLACIAL_SPIKE_BUFF: {
    id: 199844,
    name: 'Glacial Spike!',
    icon: 'ability_mage_glacialspike',
  },
  BLIZZARD_DAMAGE: {
    id: 190357,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm',
  },
  FLURRY_DAMAGE: {
    id: 228354,
    name: 'Flurry',
    icon: 'ability_warlock_burningembersblue',
  },
  FREEZE: {
    id: 33395,
    name: 'Freeze',
    icon: 'ability_mage_freeze',
  },
  FROZEN_ORB_DAMAGE: {
    id: 84721,
    name: 'Frozen orb',
    icon: 'spell_frost_frozenorb',
  },
  COMET_STORM_DAMAGE: {
    id: 153596,
    name: 'Comet Storm',
    icon: 'spell_mage_cometstorm',
  },
  GLACIAL_SPIKE_DAMAGE: {
    id: 228600,
    name: 'Glacial Spike',
    icon: 'ability_mage_glacialspike',
  },
  RING_OF_FROST_DAMAGE: {
    id: 82691,
    name: 'Ring of Frost',
    icon: 'spell_frost_ringoffrost',
  },
  FREEZING_RAIN_BUFF: {
    id: 270232,
    name: 'Freezing Rain',
    icon: 'spell_frost_icestorm',
  },
  BONE_CHILLING_BUFF: {
    id: 205766,
    name: 'Bone Chilling',
    icon: 'ability_mage_chilledtothebone',
  },
  COLD_FRONT_BUFF: {
    id: 327327,
    name: 'Cold Front',
    icon: 'ability_mage_coldasice',
  },
  COLD_SNAP: {
    id: 235219,
    name: 'Cold Snap',
    icon: 'spell_frost_wizardmark',
  },
  CHAIN_REACTION_BUFF: {
    id: 278310,
    name: 'Chain Reaction',
    icon: 'spell_frost_frostblast',
  },
  CRYOPATHY_BUFF: {
    id: 417492,
    name: 'Cryopathy',
    icon: 'ability_hunter_pointofnoescape',
  },
  SPELLFROST_TEACHINGS_BUFF: {
    id: 458411,
    name: 'Spellfrost Teachings',
    icon: '70_inscription_vantus_rune_azure',
  },
} satisfies Record<string, Spell>;

export default spells;
