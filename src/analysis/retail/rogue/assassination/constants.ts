import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { CastEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';

// from https://www.wowhead.com/spell=137037/assassination-rogue
export const ABILITIES_AFFECTED_BY_DAMAGE_INCREASES = [
  SPELLS.MELEE,
  // SPELLS.BLINDSIDE_TALENT,
  // SPELLS.CRIMSON_TEMPEST_TALENT,
  SPELLS.ENVENOM,
  SPELLS.FAN_OF_KNIVES,
  SPELLS.GARROTE,
  SPELLS.MUTILATE,
  SPELLS.MUTILATE_MAINHAND,
  SPELLS.MUTILATE_OFFHAND,
  SPELLS.POISON_BOMB,
  SPELLS.POISONED_KNIFE,
  SPELLS.RUPTURE,
  // SPELLS.INTERNAL_BLEEDING_TALENT,
  SPELLS.DEADLY_POISON_DOT,
  SPELLS.DEADLY_POISON_PROC,
  SPELLS.WOUND_POISON,
];

// from https://www.wowhead.com/spell=196864/master-poisoner
export const ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES = [
  SPELLS.DEADLY_POISON_DOT,
  SPELLS.DEADLY_POISON_PROC,
  SPELLS.WOUND_POISON,
];

export const NIGHTSTALKER_BLACKLIST = [
  SPELLS.MELEE,
  SPELLS.RUPTURE,
  SPELLS.GARROTE,
  // SPELLS.CRIMSON_TEMPEST_TALENT,
  SPELLS.DEADLY_POISON_DOT,
];

export const GARROTE_BASE_DURATION = 18000;
export const getGarroteDuration = (): number => GARROTE_BASE_DURATION;

export const getMaxComboPoints = (c: Combatant) =>
  5 + c.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT);

export const RUPTURE_BASE_DURATION = 4000;
export const RUPTURE_DURATION_PR_CP_SPENT = 4000;
export const getRuptureDuration = (cast: CastEvent): number =>
  RUPTURE_BASE_DURATION +
  RUPTURE_DURATION_PR_CP_SPENT * getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS);

export const getRuptureFullDuration = (c: Combatant) =>
  RUPTURE_BASE_DURATION + RUPTURE_DURATION_PR_CP_SPENT * getMaxComboPoints(c);

export const CRIMSON_TEMPEST_BASE_DURATION = 2000;
export const CRIMSON_TEMPEST_DURATION_PR_CP_SPENT = 2000;
export const getCrimsonTempestDuration = (cast: CastEvent): number =>
  CRIMSON_TEMPEST_BASE_DURATION +
  CRIMSON_TEMPEST_DURATION_PR_CP_SPENT * getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS);

export const getCrimsonTempestFullDuration = (c: Combatant) =>
  CRIMSON_TEMPEST_BASE_DURATION + CRIMSON_TEMPEST_DURATION_PR_CP_SPENT * getMaxComboPoints(c);

/** Max time left on a DoT for us to not yell if snapshot is downgraded */
export const SNAPSHOT_DOWNGRADE_BUFFER = 2000;

export const BUILDERS: Spell[] = [
  SPELLS.MUTILATE,
  SPELLS.GARROTE,
  SPELLS.AMBUSH,
  SPELLS.FAN_OF_KNIVES,
  SPELLS.POISONED_KNIFE,
  SPELLS.CHEAP_SHOT,
  TALENTS.SHIV_TALENT,
  TALENTS.GOUGE_TALENT,
  TALENTS.ECHOING_REPRIMAND_TALENT,
  TALENTS.MARKED_FOR_DEATH_TALENT,
  TALENTS.SEPSIS_TALENT,
  TALENTS.SERRATED_BONE_SPIKE_TALENT,
  TALENTS.KINGSBANE_TALENT,
];

export const FINISHERS: Spell[] = [
  SPELLS.RUPTURE,
  SPELLS.ENVENOM,
  TALENTS.CRIMSON_TEMPEST_TALENT,
  SPELLS.SLICE_AND_DICE,
  SPELLS.KIDNEY_SHOT,
];
