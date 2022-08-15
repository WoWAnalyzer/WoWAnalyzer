import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.COORDINATED_ASSAULT.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.COORDINATED_ASSAULT.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHighlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      /** Covenant Specific */
      //Venthyr
      {
        spellId: SPELLS.FLAYERS_MARK.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.FLAYED_SHOT.id,
      },
      //Night Fae
      {
        spellId: SPELLS.WILD_SPIRITS_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.WILD_SPIRITS.id,
      },
      //Kyrian
      {
        spellId: SPELLS.RESONATING_ARROW_DAMAGE_AND_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.RESONATING_ARROW.id,
      },
    ];
  }
}

export default Buffs;
