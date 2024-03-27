import SPELLS from 'common/SPELLS/evoker';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/evoker';
import { TIERS } from 'game/TIERS';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    return [
      // Cooldowns
      {
        spellId: TALENTS.DRAGONRAGE_TALENT.id,
        timelineHighlight: true,
        enabled: combatant.hasTalent(TALENTS.DRAGONRAGE_TALENT),
      },
      // Rotational Buffs
      {
        spellId: SPELLS.POWER_SWELL_BUFF.id,
        timelineHighlight: false,
        enabled: combatant.hasTalent(TALENTS.POWER_SWELL_TALENT),
      },
      {
        spellId: SPELLS.IRIDESCENCE_RED.id,
        timelineHighlight: false,
        enabled: combatant.hasTalent(TALENTS.IRIDESCENCE_TALENT),
      },
      {
        spellId: SPELLS.IRIDESCENCE_BLUE.id,
        timelineHighlight: false,
        enabled: combatant.hasTalent(TALENTS.IRIDESCENCE_TALENT),
      },
      {
        spellId: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BURNOUT_BUFF.id,
        timelineHighlight: true,
        enabled: combatant.hasTalent(TALENTS.BURNOUT_TALENT),
      },
      // Tier Set
      {
        spellId: SPELLS.EMERALD_TRANCE_T31_4PC_BUFF.id,
        timelineHighlight: true,
        enabled: combatant.has4PieceByTier(TIERS.DF3),
      },
      // Defensive
      {
        spellId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
        timelineHighlight: false,
        enabled: combatant.hasTalent(TALENTS.OBSIDIAN_SCALES_TALENT),
      },
      {
        spellId: TALENTS.RENEWING_BLAZE_TALENT.id,
        timelineHighlight: false,
        enabled: combatant.hasTalent(TALENTS.RENEWING_BLAZE_TALENT),
      },
      // Util
      {
        spellId: SPELLS.HOVER.id,
        timelineHighlight: true,
      },
      // Externals
      {
        spellId: PRIEST_TALENTS.POWER_INFUSION_TALENT.id,
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
