import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { SpellbookAura } from 'parser/core/modules/Aura';
import CoreAuras from '../../shared/Buffs';

class BUFFS extends CoreAuras {
  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    const buffs = [
      ...super.auras(),
      {
        spellId: [SPELLS.ASCENDANCE_RESTORATION_BUFF.id],
        enabled: combatant.getMultipleTalentRanks(
          TALENTS.ASCENDANCE_RESTORATION_TALENT,
          TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT,
          ) > 0,
        triggeredBySpellId: [TALENTS.ASCENDANCE_RESTORATION_TALENT.id],
        timelineHighlight: true,
      },
      {
        spellId: [SPELLS.ANCESTRAL_SWIFTNESS_CAST.id],
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
        triggeredBySpellId: [SPELLS.ANCESTRAL_SWIFTNESS_CAST.id],
      },
      {
        spellId: [SPELLS.CALL_OF_THE_ANCESTORS_BUFF.id],
        enabled: combatant.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT),
        triggeredBySpellId: [SPELLS.ANCESTRAL_SWIFTNESS_CAST.id],
        timelineHighlight: false,
      },
      {
        spellId: [SPELLS.TIDECALLERS_GUARD.id],
        enabled: combatant.hasTalent(TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT),
        triggeredBySpellId: [SPELLS.TIDECALLERS_GUARD.id],
        timelineHighlight: false,
      },
      {
        spellId: [SPELLS.LAVA_SURGE.id],
        enabled: combatant.hasTalent(TALENTS.LAVA_BURST_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: [SPELLS.EARTHLIVING_WEAPON_HEAL.id],
        enabled: combatant.hasTalent(TALENTS.EARTHLIVING_WEAPON_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: [SPELLS.STORMSTREAM_TOTEM_PROC.id],
        enabled:
          combatant.getMultipleTalentRanks(
            TALENTS.STORMSTREAM_TOTEM_1_RESTORATION_TALENT,
            TALENTS.STORMSTREAM_TOTEM_2_RESTORATION_TALENT,
            TALENTS.STORMSTREAM_TOTEM_3_RESTORATION_TALENT,
          ) > 0,
        triggeredBySpellId: [SPELLS.NATURES_SWIFTNESS_BUFF.id, SPELLS.ANCESTRAL_SWIFTNESS_CAST.id],
        timelineHighlight: false,
      },
    ];
    return buffs;
  }
}

export default BUFFS;
