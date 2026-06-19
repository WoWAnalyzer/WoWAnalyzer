import CoreAuras from 'parser/core/modules/Auras';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';
import SPELLS from 'common/SPELLS/classic/deathknight';

class Buffs extends CoreAuras {
  // Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      // Procs
      {
        spellId: SPELLS.SUDDEN_DOOM.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHADOW_INFUSION.id,
        timelineHighlight: true,
      },
      // Major cooldowns
      {
        spellId: SPELLS.DARK_TRANSFORMATION.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.UNHOLY_FRENZY.id,
        timelineHighlight: true,
      },
      // Presences
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
      // Fallen Crusader proc
      {
        spellId: SPELLS.FALLEN_CRUSADER.id,
        timelineHighlight: true,
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
