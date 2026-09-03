import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/rogue';

//-- TODO: Would be usefull to be able to toggle rtb buffs on and off in the timeline as showing everyone of them at all time can get messy

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
        spellId: TALENTS.LOADED_DICE_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLADE_RUSH_TALENT_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BETWEEN_THE_EYES.id,
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

      {
        spellId: SPELLS.SLICE_AND_DICE.id,
      },

      // Talents
      {
        spellId: TALENTS.ALACRITY_TALENT.id,
      },
      {
        spellId: TALENTS.THISTLE_TEA_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SUBTERFUGE_BUFF.id,
        timelineHighlight: true,
      },

      // Roll the Bones
      {
        spellId: SPELLS.ROLL_THE_BONES.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ONE_OF_A_KIND.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DOUBLE_TROUBLE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TRIPLE_THREAT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.JACKPOT.id,
        timelineHighlight: true,
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
