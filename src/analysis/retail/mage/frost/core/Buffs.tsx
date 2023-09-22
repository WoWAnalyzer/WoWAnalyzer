import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.BRAIN_FREEZE_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.BRAIN_FREEZE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FINGERS_OF_FROST_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.FINGERS_OF_FROST_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICY_VEINS_TALENT.id,
        triggeredBySpellId: TALENTS.ICY_VEINS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICY_VEINS_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICE_BARRIER_TALENT.id,
        triggeredBySpellId: TALENTS.ICE_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICE_BARRIER_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICE_BLOCK_TALENT.id,
        triggeredBySpellId: TALENTS.ICE_BLOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICE_BLOCK_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.MIRROR_IMAGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MIRROR_IMAGE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
