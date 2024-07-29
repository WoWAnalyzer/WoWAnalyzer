import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.CELESTIAL_ALIGNMENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ECLIPSE_LUNAR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ECLIPSE_SOLAR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.WILD_CHARGE_TALENT.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.BALANCE_OF_ALL_THINGS_LUNAR.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.OWLKIN_FRENZY.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.BARKSKIN.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.STARLORD.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.TOUCH_THE_COSMOS.id,
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.GATHERING_STARSTUFF.id, // T29 - 2P
        timelineHighlight: false,
      },
      {
        spellId: SPELLS.CONVOKE_SPIRITS.id,
        timelineHighlight: false,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
