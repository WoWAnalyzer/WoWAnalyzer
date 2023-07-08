import SPELLS from 'common/SPELLS/evoker';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/evoker';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: TALENTS.DRAGONRAGE_TALENT.id, // Dragonrage
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.DRAGONRAGE_TALENT.id,
      },
      {
        spellId: SPELLS.HOVER.id, // Hover
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.HOVER.id,
      },
      {
        spellId: SPELLS.BLAZING_SHARDS.id, // T30 4pc
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.BLAZING_SHARDS.id,
      },
      {
        spellId: SPELLS.IRIDESCENCE_RED.id,
        timelineHighlight: false,
        triggeredBySpellId: SPELLS.IRIDESCENCE_RED.id,
      },
      {
        spellId: SPELLS.IRIDESCENCE_BLUE.id,
        timelineHighlight: false,
        triggeredBySpellId: SPELLS.IRIDESCENCE_BLUE.id,
      },
      {
        spellId: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
        triggeredBySpellId: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
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
      {
        spellId: PRIEST_TALENTS.POWER_INFUSION_TALENT.id,
        triggeredBySpellId: PRIEST_TALENTS.POWER_INFUSION_TALENT.id,
        timelineHighlight: true,
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
