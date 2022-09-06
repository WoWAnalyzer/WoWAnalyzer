import { FocusUsage as SharedHunterFocusUsage } from 'analysis/retail/hunter/shared';
import { LIST_OF_FOCUS_SPENDERS_SV } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';

class SurvivalFocusUsage extends SharedHunterFocusUsage {
  static listOfResourceSpenders: Spell[] = [...LIST_OF_FOCUS_SPENDERS_SV];

  static spellsThatShouldShowAsOtherSpells: {
    [key: number]: Spell;
  } = {
    [SPELLS.MONGOOSE_BITE_TALENT_AOTE.id]: SPELLS.MONGOOSE_BITE_TALENT,
    [SPELLS.RAPTOR_STRIKE_AOTE.id]: SPELLS.RAPTOR_STRIKE,
  };
}

export default SurvivalFocusUsage;
