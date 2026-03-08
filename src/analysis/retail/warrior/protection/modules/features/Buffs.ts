import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/warrior';

class Buffs extends CoreAuras {
  auras() {
    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.AVATAR_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHIELD_BLOCK_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.SHIELD_WALL_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.SPELL_REFLECTION_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.RALLYING_CRY_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.INTO_THE_FRAY_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.SHIELD_SLAM.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.WILD_STRIKES.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.BURST_OF_POWER_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.THUNDER_BLAST_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.REVENGE_FREE_CAST.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.BEST_SERVED_COLD_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.DEFENSIVE_STANCE_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.THUNDERLORD_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: TALENTS.IGNORE_PAIN_PROTECTION_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.SHIELD_BLOCK_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.KEEP_YOUR_FEET_ON_THE_GROUND_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.SPELL_REFLECTION_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.PHALANX_BUFF.id,
        timelineHighlight: false,
      },
    ];
  }
}

export default Buffs;
