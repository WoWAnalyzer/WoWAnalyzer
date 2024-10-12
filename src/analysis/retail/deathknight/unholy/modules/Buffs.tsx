import CoreAuras, { AuraOptions } from 'parser/core/modules/Auras';
import talents from 'common/TALENTS/deathknight';
import SPELLS from 'common/SPELLS/deathknight';

class Buffs extends CoreAuras {
  auras(options: AuraOptions) {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      ...super.auras(options),
      {
        spellId: SPELLS.LICHBORNE.id,
        timelineHighlight: true,
      },
      {
        spellId: talents.EMPOWER_RUNE_WEAPON_TALENT.id,
        enabled: combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DEATH_AND_DECAY_BUFF.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        enabled: !combatant.hasTalent(talents.DEFILE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.UNHOLY_GROUND_HASTE_BUFF.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        enabled: combatant.hasTalent(talents.UNHOLY_GROUND_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: talents.ABOMINATION_LIMB_TALENT.id,
        enabled: combatant.hasTalent(talents.ABOMINATION_LIMB_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MOGRAINES_MIGHT.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        enabled: !combatant.hasTalent(talents.MOGRAINES_MIGHT_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: talents.UNHOLY_ASSAULT_TALENT.id,
        enabled: combatant.hasTalent(talents.UNHOLY_ASSAULT_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: talents.ICEBOUND_FORTITUDE_TALENT.id,
        enabled: combatant.hasTalent(talents.ICEBOUND_FORTITUDE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.GHOULISH_FRENZY.id,
        enabled: combatant.hasTalent(talents.DARK_TRANSFORMATION_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: talents.ANTI_MAGIC_ZONE_TALENT.id,
        enabled: combatant.hasTalent(talents.ANTI_MAGIC_ZONE_TALENT),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
