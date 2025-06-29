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
        triggeredBySpellId: [SPELLS.DEATH_AND_DECAY.id, TALENTS.DEFILE_TALENT.id],
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.UNHOLY_GROUND_HASTE_BUFF.id,
        triggeredBySpellId: [SPELLS.DEATH_AND_DECAY.id, TALENTS.DEFILE_TALENT.id],
        enabled: combatant.hasTalent(TALENTS.UNHOLY_GROUND_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.MOGRAINES_MIGHT.id,
        triggeredBySpellId: [SPELLS.DEATH_AND_DECAY.id, TALENTS.DEFILE_TALENT.id],
        enabled: combatant.hasTalent(TALENTS.MOGRAINES_MIGHT_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.PLAGUEBRINGER_BUFF.id,
        triggeredBySpellId: TALENTS.SCOURGE_STRIKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT),
        timelineHighlight: true,
      },
      { spellId: SPELLS.SUDDEN_DOOM_BUFF.id, timelineHighlight: true },
      { spellId: TALENTS.FESTERMIGHT_TALENT.id, timelineHighlight: true },
      {
        spellId: SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id,
        enabled: combatant.hasTalent(TALENTS.GIFT_OF_THE_SANLAYN_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.CLEAVING_STRIKES_TALENT.id, // Note: Consider using a duration tracker in another module if cleave lingers after DnD ends.
        triggeredBySpellId: [SPELLS.DEATH_AND_DECAY.id, TALENTS.DEFILE_TALENT.id],
        enabled: combatant.hasTalent(TALENTS.CLEAVING_STRIKES_TALENT),
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id,
        triggeredBySpellId: TALENTS.DARK_TRANSFORMATION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),

        timelineHighlight: true,
      },
      {
        spellId: TALENTS.DEATH_ROT_TALENT.id,
        triggeredBySpellId: [SPELLS.DEATH_COIL.id, SPELLS.EPIDEMIC.id],
        timelineHighlight: true,
      },

      // region Cooldowns
      {
        spellId: TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EMPOWER_RUNE_WEAPON_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.ABOMINATION_LIMB_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ABOMINATION_LIMB_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.UNHOLY_ASSAULT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.UNHOLY_ASSAULT_TALENT),
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
      {
        spellId: SPELLS.GHOULISH_FRENZY.id,
        enabled: combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
