import SPELLS from 'common/SPELLS/classic/deathknight';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.BONE_SHIELD.id,
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
        spellId: SPELLS.UNHOLY_PRESENCE.id,
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
