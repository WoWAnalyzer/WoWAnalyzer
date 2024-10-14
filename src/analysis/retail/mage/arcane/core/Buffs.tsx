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
        spellId: SPELLS.CLEARCASTING_ARCANE.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.EVOCATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EVOCATION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ARCANE_SURGE_BUFF.id,
        triggeredBySpellId: TALENTS.ARCANE_SURGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SIPHON_STORM_BUFF.id,
        triggeredBySpellId: TALENTS.EVOCATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EVOCATION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.NETHER_PRECISION_BUFF.id,
        triggeredBySpellId: TALENTS.ARCANE_MISSILES_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        triggeredBySpellId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.PRISMATIC_BARRIER_TALENT.id,
        triggeredBySpellId: TALENTS.PRISMATIC_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PRISMATIC_BARRIER_TALENT),
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
        spellId: SPELLS.ARCANE_HARMONY_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.ARCANE_HARMONY_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ARCANE_TEMPO_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT),
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
