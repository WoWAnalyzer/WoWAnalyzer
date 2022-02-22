import CoreBuffs from 'parser/core/modules/Buffs';

import * as SPELLS from '@wowanalyzer/tbc-priest/src/SPELLS';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.POWER_WORD_FORTITUDE,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHADOW_PROTECTION,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DIVINE_SPIRIT,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRAYER_OF_FORTITUDE,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRAYER_OF_SHADOW_PROTECTION,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PRAYER_OF_SPIRIT,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INNER_FIRE,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FEAR_WARD,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INNER_FOCUS,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.POWER_INFUSION,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PAIN_SUPPRESSION,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHADOW_FORM,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
