import CoreAuras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS/classic';
import DK_SPELLS from 'common/SPELLS/classic/deathknight';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';

class Buffs extends CoreAuras {
  // Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      // Procs — highest priority, always visible
      {
        spellId: DK_SPELLS.KILLING_MACHINE.id,
        timelineHighlight: true,
      },
      {
        spellId: DK_SPELLS.FREEZING_FOG.id,
        timelineHighlight: true,
      },
      // Major cooldowns
      {
        spellId: SPELLS.PILLAR_OF_FROST.id,
        triggeredBySpellId: SPELLS.PILLAR_OF_FROST.id,
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
      // Fallen Crusader proc (Rune of the Fallen Crusader → Unholy Strength)
      {
        spellId: DK_SPELLS.FALLEN_CRUSADER.id,
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
