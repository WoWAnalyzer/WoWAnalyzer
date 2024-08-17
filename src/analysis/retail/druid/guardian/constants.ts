import Combatant from 'parser/core/Combatant';
import { TALENTS_DRUID } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';

export const BARKSKIN_BASE_MIT = 0.2;
export const RAGE_OF_THE_SLEEPER_MIT = 0.2;
export const SURVIVAL_INSTINCTS_BASE_MIT = 0.5;
export const PULVERIZE_MIT = 0.35;
export const REINFORCED_FUR_ADDITIONAL_MIT = 0.1;
export const OAKSKIN_ADDITIONAL_MIT = 0.1;

export function barkskinMitigation(c: Combatant): number {
  return (
    BARKSKIN_BASE_MIT +
    c.getTalentRank(TALENTS_DRUID.REINFORCED_FUR_TALENT) * REINFORCED_FUR_ADDITIONAL_MIT +
    c.getTalentRank(TALENTS_DRUID.OAKSKIN_TALENT) * OAKSKIN_ADDITIONAL_MIT
  );
}

export function survivalInstinctsMitigation(c: Combatant): number {
  return (
    SURVIVAL_INSTINCTS_BASE_MIT +
    c.getTalentRank(TALENTS_DRUID.OAKSKIN_TALENT) * OAKSKIN_ADDITIONAL_MIT
  );
}

export function cdSpell(c: Combatant): Spell {
  return c.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT)
    ? SPELLS.INCARNATION_GUARDIAN_OF_URSOC
    : SPELLS.BERSERK_BEAR;
}

export function cdDuration(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT)
    ? 30_000 // TODO TWW 11.0.2 - to 20_000
    : 15_000;
}

/** True iff combatant has Berserk (or Incarn if talented) active */
export function inBerserk(c: Combatant): boolean {
  return c.hasBuff(cdSpell(c).id);
}
