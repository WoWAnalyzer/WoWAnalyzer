import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import TALENTS from 'common/TALENTS/hunter';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.FLANKERS_ADVANTAGE.id,
        timelineHighlight: true,
        triggeredBySpellId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
      },
      {
        spellId: TALENTS.TAKEDOWN_TALENT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TIP_OF_THE_SPEAR_CAST.id,
        timelineHighlight: true,
        triggeredBySpellId: [TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id],
      },
      {
        spellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        timelineHighlight: true,
      },
      {
        spellId: [SPELLS.PRIMAL_RAGE_1.id, SPELLS.PRIMAL_RAGE_2.id],
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MONGOOSE_FURY.id,
        timelineHighlight: true,
        triggeredBySpellId: [TALENTS.RAPTOR_STRIKE_TALENT.id, SPELLS.RAPTOR_STRIKE_AOTE.id],
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
