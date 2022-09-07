import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

import * as SPELLS from '../SPELLS';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.BEAST_WITHIN_BUFF,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.BESTIAL_WRATH,
      },
      {
        spellId: SPELLS.RAPID_FIRE,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.RAPID_FIRE,
      },
      {
        spellId: SPELLS.MISDIRECTION,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.MISDIRECTION,
      },
      {
        spellId: SPELLS.QUICK_SHOTS,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ABACUS_HASTE_BUFF,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DRAGONSPINE_TROPHY_BUFF,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.KILL_COMMAND,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
