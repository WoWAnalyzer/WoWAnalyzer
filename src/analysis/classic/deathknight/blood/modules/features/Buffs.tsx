import CoreAuras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS/classic';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';

class Buffs extends CoreAuras {
  // A list of Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      // Update and Add to the spells below
      {
        spellId: SPELLS.UNHOLY_PRESENCE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLOOD_PRESENCE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FROST_PRESENCE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BONE_SHIELD.id,
        triggeredBySpellId: SPELLS.BONE_SHIELD.id,
      },
      // Do not adjust the lines below
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(ITEM_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
