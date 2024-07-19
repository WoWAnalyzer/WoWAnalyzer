import SPELLS from 'common/SPELLS/evoker';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/evoker';
import { BREATH_OF_EONS_SPELL_IDS } from '../constants';

class Buffs extends CoreAuras {
  auras() {
    return [
      // Cooldowns
      {
        spellId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
      },
      // Buffs
      {
        spellId: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
        triggeredBySpellId: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
        triggeredBySpellId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TREMBLING_EARTH_BUFF.id,
        triggeredBySpellId: SPELLS.TREMBLING_EARTH_BUFF.id,
        timelineHighlight: false,
      },
      // Defensive
      {
        spellId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
        triggeredBySpellId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.RENEWING_BLAZE_TALENT.id,
        triggeredBySpellId: TALENTS.RENEWING_BLAZE_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: BREATH_OF_EONS_SPELL_IDS,
        triggeredBySpellId: BREATH_OF_EONS_SPELL_IDS,
        timelineHighlight: false,
      },
      // Bloodlust
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
