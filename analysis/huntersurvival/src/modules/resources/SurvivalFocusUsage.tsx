import { FocusUsage as SharedHunterFocusUsage } from '@wowanalyzer/hunter';
import { LIST_OF_FOCUS_SPENDERS_SV } from '@wowanalyzer/hunter-survival/src/constants';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';

class SurvivalFocusUsage extends SharedHunterFocusUsage {
  static listOfResourceSpenders: Spell[] = [...LIST_OF_FOCUS_SPENDERS_SV];

  static spellsThatShouldShowAsOtherSpells: {
    [key: number]: { id: number; name: string; abilityIcon: string; type: number };
  } = {
    [SPELLS.MONGOOSE_BITE_TALENT_AOTE.id]: SPELLS.MONGOOSE_BITE_TALENT,
    [SPELLS.RAPTOR_STRIKE_AOTE.id]: SPELLS.RAPTOR_STRIKE,
  };
}

export default SurvivalFocusUsage;
