/**
 * All Evoker abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from './Spell';

const spells = spellIndexableList({
  // Preservation Spells
  MASTERY_LIFEBINDER: {
    id: 363510,
    name: 'Mastery: Life-Binder',
    icon: 'ability_evoker_masterylifebinder',
  },
  DREAM_BREATH: {
    id: 355941,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  TWIN_GUARDIAN_SHIELD: {
    id: 370889,
    name: 'Twin Guardian',
    icon: 'ability_skyreach_shielded',
  },
  DREAM_BREATH_ECHO: {
    id: 376788,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  TEMPORAL_ANOMALY_SHIELD: {
    id: 373862,
    name: 'Temporal Anomaly',
    icon: 'ability_evoker_temporalanomaly',
  },
  DREAM_BREATH_CAST: {
    id: 382614,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  RENEWING_BREATH: {
    id: 381923,
    name: 'Renewing Breath',
    icon: 'ability_evoker_dreambreath',
  },
  SPIRITBLOOM: {
    id: 355999,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  SPIRITBLOOM_SPLIT: {
    id: 355998,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  // Shared
  BLESSING_OF_THE_BRONZE: {
    id: 364342,
    name: 'Blessing of the Bronze',
    icon: 'ability_evoker_blessingofthebronze',
  },
  LIVING_FLAME_DAMAGE: {
    id: 361500,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
  },
  LIVING_FLAME_HEAL: {
    id: 361509,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
  },
  AZURE_STRIKE: {
    id: 362969,
    name: 'Azure Strike',
    icon: 'ability_evoker_azurestrike',
  },
  EMERALD_BLOSSOM: {
    id: 355913,
    name: 'Emerald Blossom',
    icon: 'ability_evoker_emeraldblossom',
  },
  DEEP_BREATH: {
    id: 357210,
    name: 'Deep Breath',
    icon: 'ability_evoker_deepbreath',
  },
  FIRE_BREATH: {
    id: 357208,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
  },
  DISINTEGRATE: {
    id: 356995,
    name: 'Disintegrate',
    icon: 'ability_evoker_disintegrate',
  },
  HOVER: {
    id: 358267,
    name: 'Hover',
    icon: 'ability_evoker_hover',
  },
  RETURN: {
    id: 361227,
    name: 'Return',
    icon: 'ability_evoker_return',
  },
  PERMEATING_CHILL: {
    id: 381773,
    name: 'Permeating Chill',
    icon: 'spell_frost_coldhearted',
  },
});

export default spells;
