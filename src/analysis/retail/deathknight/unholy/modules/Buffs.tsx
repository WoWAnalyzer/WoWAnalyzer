import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/deathknight';
import SPELLS from 'common/SPELLS/deathknight';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      // region Rotational
      {
        spellId: SPELLS.DEATH_AND_DECAY_BUFF.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MOGRAINES_MIGHT.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        enabled: combatant.hasTalent(TALENTS.MOGRAINES_MIGHT_TALENT),
        timelineHighlight: false,
      },
      { spellId: SPELLS.SUDDEN_DOOM_BUFF.id, timelineHighlight: true },
      {
        spellId: TALENTS.CLEAVING_STRIKES_TALENT.id,
        triggeredBySpellId: SPELLS.DEATH_AND_DECAY.id,
        enabled: combatant.hasTalent(TALENTS.CLEAVING_STRIKES_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id,
        triggeredBySpellId: TALENTS.DARK_TRANSFORMATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.COMMANDER_OF_THE_DEAD_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.GHOULISH_FRENZY.id,
        enabled: combatant.hasTalent(TALENTS.GHOULISH_FRENZY_TALENT),
        timelineHighlight: true,
      },

      // region San'layn Hero Talents
      {
        spellId: SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.GIFT_OF_THE_SANLAYN_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.VAMPIRIC_STRIKE_TRIGGER_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.VAMPIRIC_STRIKE_TALENT),
        timelineHighlight: false,
      },

      // region Cooldowns
      {
        spellId: TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EMPOWER_RUNE_WEAPON_TALENT),
        timelineHighlight: true,
      },

      // region Tier Set & Midnight
      {
        spellId: SPELLS.UNHOLY_TIER_2PC_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.UNHOLY_TIER_4PC_BUFF.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.LESSER_GHOUL_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FORBIDDEN_KNOWLEDGE.id,
        timelineHighlight: true,
      },

      // region Defensive
      {
        spellId: SPELLS.LICHBORNE.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICEBOUND_FORTITUDE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ANTI_MAGIC_ZONE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ANTI_MAGIC_ZONE_TALENT),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
