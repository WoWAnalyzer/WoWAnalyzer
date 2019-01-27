import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestion';
import SpellUsable from 'parser/shared/modules/SpellUsable';


const DOTS = [
  {
    name: 'Nightblade',
    debuffId: SPELLS.NIGHTBLADE.id,
    castId: SPELLS.NIGHTBLADE.id,
    duration: 18000,
  },
];

const MAX_SYMBOLS_COOLDOWN = 5000;
const MINOR_THRESHOLD = 0.95;
const AVERAGE_THRESHOLD = 0.9;
const MAJOR_THRESHOLD = 0.7;

class NightbladeEarlyRefresh extends EarlyDotRefreshesCore {
  static dependencies = {
    ...EarlyDotRefreshesCore.dependencies,
    spellUsable: SpellUsable,
  };

  static dots = DOTS;
  
  lastCastGoodCdStatus = false;
  afterLastCastSet(event) {    
    if (this.spellUsable.isOnCooldown(SPELLS.SYMBOLS_OF_DEATH.id)) {
      if(this.spellUsable.cooldownRemaining(SPELLS.SYMBOLS_OF_DEATH.id) < MAX_SYMBOLS_COOLDOWN) {
        //Early Nightblade refresh is fine for going in to burst.
        this.lastCastGoodCdStatus = true;
      }
      else {
        //No reason to refresh early.
        this.lastCastGoodCdStatus = false;
      }
    }
    //This is questionable, when executing the rotation properly Symbols should never be on cooldown.
    //The only reasonable explanation for symbols being off cooldown is saving for burst.
    //In this case, we also may want to refresh Nightblade for this burst.
    //So putting an error here would be like double punishment for legitimate play.
    this.lastCastGoodCdStatus = true;
  }

  // Checks the status of the last cast and marks it accordingly.
  getLastBadCastText(event, dot) {    
    if (this.lastCastGoodCdStatus) {
      return '';
    }
    return super.getLastBadCastText(event,dot);
    }

  on_byPlayer_spendresource(event) {
    const comboPointsSpent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    //Update duration.
    DOTS[0].duration = (comboPointsSpent * 2 + 6) * 1000;
  }

  get suggestionThresholdsNightblade() {
    return {
      spell: SPELLS.NIGHTBLADE,
      count: this.badCasts[DOTS[0].castId],
      actual: this.badCastsPercent(DOTS[0].castId),
      isGreaterThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsNightbladeEfficiency() {
    return {
      spell: SPELLS.NIGHTBLADE,
      actual: 1 - this.badCastsPercent(DOTS[0].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsNightblade);
  }
}

export default NightbladeEarlyRefresh;
