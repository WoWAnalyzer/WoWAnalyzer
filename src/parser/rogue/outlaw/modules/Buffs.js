import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      // Core
      {
        spellId: SPELLS.ADRENALINE_RUSH.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BLADE_RUSH_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id),
      },
      {
        spellId: SPELLS.SLICE_AND_DICE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.OPPORTUNITY.id,
      },

      // Roll the Bones
      {
        spellId: SPELLS.ROLL_THE_BONES.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.RUTHLESS_PRECISION.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spellId: SPELLS.GRAND_MELEE.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spellId: SPELLS.BROADSIDE.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spellId: SPELLS.SKULL_AND_CROSSBONES.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spellId: SPELLS.BURIED_TREASURE.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },
      {
        spellId: SPELLS.TRUE_BEARING.id,
        enabled: !combatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id),
      },

      // Misc
      {
        spellId: SPELLS.CLOAK_OF_SHADOWS.id,
      },
      {
        spellId: SPELLS.CRIMSON_VIAL.id,
      },
      {
        spellId: SPELLS.FEINT.id,
      },
      {
        spellId: SPELLS.RIPOSTE.id,
      },
      {
        spellId: SPELLS.SPRINT.id,
      },
      {
        spellId: SPELLS.SHROUD_OF_CONCEALMENT.id,
      },

      // Bloodlust Buffs
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
