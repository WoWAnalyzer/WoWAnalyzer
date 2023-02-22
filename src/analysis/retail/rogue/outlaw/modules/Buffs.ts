import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/rogue';

class Buffs extends CoreAuras {
  auras() {
    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      // Core
      {
        spellId: TALENTS.ADRENALINE_RUSH_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: TALENTS.BLADE_RUSH_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.OPPORTUNITY.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.AUDACITY_TALENT_BUFF.id,
        timelineHighlight: true,
      },

      // Talents
      {
        spellId: TALENTS.ALACRITY_TALENT.id,
      },

      // Roll the Bones
      {
        spellId: TALENTS.ROLL_THE_BONES_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.RUTHLESS_PRECISION.id,
      },
      {
        spellId: SPELLS.GRAND_MELEE.id,
      },
      {
        spellId: SPELLS.BROADSIDE.id,
      },
      {
        spellId: SPELLS.SKULL_AND_CROSSBONES.id,
      },
      {
        spellId: SPELLS.BURIED_TREASURE.id,
      },
      {
        spellId: SPELLS.TRUE_BEARING.id,
      },

      // Misc
      {
        spellId: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
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
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
