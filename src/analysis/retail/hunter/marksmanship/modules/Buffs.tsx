import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.TRUESHOT.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.TRUESHOT.id,
      },
      {
        spellId: SPELLS.PRECISE_SHOTS.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.AIMED_SHOT.id,
      },
      {
        spellId: SPELLS.LOCK_AND_LOAD_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: TALENTS_HUNTER.LOCK_AND_LOAD_TALENT.id,
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHighlight: true, // showing because it's relevant to know when we couldn't attack (this could explain some downtime)
        triggeredBySpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
