import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.CHAOTIC_BLADES.id, //Chaos Theory Legendary
        timelineHighlight: true,
        triggeredBySpellId: [SPELLS.DEATH_SWEEP.id, SPELLS.BLADE_DANCE.id],
      },
      {
        spellId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.METAMORPHOSIS_HAVOC.id,
      },
      {
        spellId: SPELLS.IMMOLATION_AURA.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.IMMOLATION_AURA.id,
      },
      {
        spellId: SPELLS.FELBLADE_TALENT.id,
        timelineHighlight: false,
        triggeredBySpellId: SPELLS.FELBLADE_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
