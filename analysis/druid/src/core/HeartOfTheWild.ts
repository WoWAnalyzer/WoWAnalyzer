import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';

export function getHeartOfTheWildSpellId(c: Combatant): number {
  if (c.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id)) {
    return SPELLS.HEART_OF_THE_WILD_BALANCE_AFFINITY.id;
  } else if (
    c.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id) ||
    c.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_BALANCE.id) ||
    c.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN.id)
  ) {
    return SPELLS.HEART_OF_THE_WILD_FERAL_AFFINITY.id;
  } else if (
    c.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id) ||
    c.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_FERAL.id)
  ) {
    return SPELLS.HEART_OF_THE_WILD_GUARDIAN_AFFINITY.id;
  } else {
    return SPELLS.HEART_OF_THE_WILD_RESTO_AFFINITY.id;
  }
}
