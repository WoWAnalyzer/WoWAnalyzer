import Auras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * Guardian Druid's defensives, for timeline and death recap display.
 */
export default class Buffs extends Auras {
  auras() {
    const combatant = this.selectedCombatant;
    return [
      {
        spellId: SPELLS.IRONFUR.id,
      },
      {
        spellId: SPELLS.FRENZIED_REGENERATION.id,
      },
      {
        spellId: SPELLS.BARKSKIN.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SURVIVAL_INSTINCTS.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_DRUID.LUNAR_BEAM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.LUNAR_BEAM_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BERSERK_BEAR.id,
        enabled: !combatant.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT),
        timelineHighlight: true,
      },
    ];
  }
}
