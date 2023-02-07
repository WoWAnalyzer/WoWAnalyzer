import SPELLS from 'common/SPELLS/rogue';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';

export const SHARED_ABILITY_COOLDOWNS: Spell[] = [
  SPELLS.CRIMSON_VIAL,
  SPELLS.SPRINT,
  SPELLS.KIDNEY_SHOT,
  TALENTS.EVASION_TALENT,
  SPELLS.FEINT,
  TALENTS.BLIND_TALENT,
  TALENTS.CLOAK_OF_SHADOWS_TALENT,
  TALENTS.TRICKS_OF_THE_TRADE_TALENT,
  TALENTS.DREADBLADES_TALENT,
  TALENTS.SHADOWSTEP_SHARED_TALENT,
  SPELLS.SHADOW_DANCE,
  SPELLS.SHROUD_OF_CONCEALMENT,
  SPELLS.VANISH,
];

export const SUBTLETY_ABILITY_COOLDOWNS: Spell[] = [
  SPELLS.SYMBOLS_OF_DEATH,
  TALENTS.SHADOW_BLADES_TALENT,
  TALENTS.SHADOWSTEP_SPEC_TALENT,
];

export const ASSASSINATION_ABILITY_COOLDOWNS: Spell[] = [TALENTS.SHADOWSTEP_SPEC_TALENT];

export const OUTLAW_ABILITY_COOLDOWNS: Spell[] = [
  SPELLS.BETWEEN_THE_EYES,
  TALENTS.BLADE_FLURRY_TALENT,
  TALENTS.ROLL_THE_BONES_TALENT,
  TALENTS.ADRENALINE_RUSH_TALENT,
  TALENTS.GRAPPLING_HOOK_TALENT,
];

export const ASSASSINATION_BLEED_DEBUFFS = [
  SPELLS.GARROTE,
  SPELLS.RUPTURE,
  TALENTS.CRIMSON_TEMPEST_TALENT,
  SPELLS.INTERNAL_BLEEDING_DEBUFF,
];

export const NIGHTSTALKER_DAMAGE_BUFF = [0, 0.04, 0.08];
export const IMPROVED_GARROTE_DAMAGE_BUFF = [0, 0.5];
