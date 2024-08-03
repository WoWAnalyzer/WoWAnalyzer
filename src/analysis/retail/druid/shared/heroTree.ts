import Combatant from 'parser/core/Combatant';
import { TALENTS_DRUID } from 'common/TALENTS';

export function isDruidOfTheClaw(c: Combatant) {
  return c.hasTalent(TALENTS_DRUID.RAVAGE_TALENT);
}

export function isElunesChosen(c: Combatant) {
  return c.hasTalent(TALENTS_DRUID.BOUNDLESS_MOONLIGHT_TALENT);
}

export function isKeeperOfTheGrove(c: Combatant) {
  return c.hasTalent(TALENTS_DRUID.DREAM_SURGE_TALENT);
}

export function isWildstalker(c: Combatant) {
  return c.hasTalent(TALENTS_DRUID.THRIVING_GROWTH_TALENT);
}
