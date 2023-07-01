import SPELLS from 'common/SPELLS/evoker';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/evoker';

class Buffs extends CoreAuras {
  auras() {
    return [
      // Cooldowns
      {
        spellId: TALENTS.BREATH_OF_EONS_TALENT.id,
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.BREATH_OF_EONS_TALENT.id,
      },
      {
        spellId: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
        triggeredBySpellId: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
        timelineHighlight: true,
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
      // Bloodlust
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
