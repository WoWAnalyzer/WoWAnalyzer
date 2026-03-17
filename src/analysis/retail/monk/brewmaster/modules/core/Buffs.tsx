import { type SpellbookAura } from 'parser/core/modules/Aura';
import Auras from 'parser/core/modules/Auras';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';

export default class Buffs extends Auras {
  auras() {
    return [
      {
        spellId: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id,
        timelineHighlight: true,
        enabled: this.selectedCombatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT),
      },
      {
        spellId: SPELLS_COMMON.CHARRED_PASSIONS_BUFF.id,
        timelineHighlight: true,
        enabled: this.selectedCombatant.hasTalent(SPELLS.CHARRED_PASSIONS_TALENT),
      },
      {
        spellId: SPELLS_COMMON.BLACKOUT_COMBO_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.BLACKOUT_KICK.id,
        enabled: this.selectedCombatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT),
      },
    ] satisfies SpellbookAura[];
  }
}
