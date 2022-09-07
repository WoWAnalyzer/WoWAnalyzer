import SPELLS from 'common/SPELLS/demonhunter';
import { FELBLADE_TALENT } from 'common/TALENTS/demonhunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
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
        spellId: FELBLADE_TALENT.id,
        timelineHighlight: false,
        triggeredBySpellId: FELBLADE_TALENT.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
