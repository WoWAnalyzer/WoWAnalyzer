import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

import * as SPELL_EFFECTS from '../SPELL_EFFECTS';
import SPELLS from 'common/SPELLS/classic/shaman';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELL_EFFECTS.CLEARCASTING,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TOTEM_OF_WRATH.id,
        timelineHighlight: true,
      },
      {
        spellId: [
          SPELL_EFFECTS.FLURRY_5,
          SPELL_EFFECTS.FLURRY_4,
          SPELL_EFFECTS.FLURRY_3,
          SPELL_EFFECTS.FLURRY_2,
          SPELL_EFFECTS.FLURRY_1,
        ],
        timelineHighlight: true,
      },
      {
        spellId: [
          SPELL_EFFECTS.UNLEASHED_RAGE_5,
          SPELL_EFFECTS.UNLEASHED_RAGE_4,
          SPELL_EFFECTS.UNLEASHED_RAGE_3,
          SPELL_EFFECTS.UNLEASHED_RAGE_2,
          SPELL_EFFECTS.UNLEASHED_RAGE_1,
        ],
        timelineHighlight: true,
      },
      {
        spellId: SPELL_EFFECTS.SHAMANISTIC_FOCUS,
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
