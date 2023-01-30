import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

import SPELLS from 'common/SPELLS/classic/hunter';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.RAPID_FIRE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MISDIRECTION.id,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
