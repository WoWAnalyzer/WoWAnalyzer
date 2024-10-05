import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
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
        spellId: SPELLS.VIPERS_VENOM_BUFF.id,
        timelineHighlight: true, //to show users of the Vipers Venom talent when they were casting Serpent Sting with Viper's Venom active in the timeline
        triggeredBySpellId: SPELLS.SERPENT_STING_SURVIVAL.id,
      },
      {
        spellId: TALENTS.COORDINATED_ASSAULT_TALENT.id,
        timelineHighlight: true,
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
        triggeredBySpellId: [TALENTS.MONGOOSE_BITE_TALENT.id, SPELLS.MONGOOSE_BITE_TALENT_AOTE.id],
      },
      {
        spellId: TALENTS_HUNTER.COORDINATED_ASSAULT_TALENT.id,
        timelineHighlight: true,
        triggeredBySpellId: TALENTS_HUNTER.COORDINATED_ASSAULT_TALENT.id,
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
