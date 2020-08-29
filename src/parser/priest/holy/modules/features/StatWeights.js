import SPELLS from 'common/SPELLS';
import STAT from 'parser/shared/modules/features/STAT';

import BaseHealerStatValues from 'parser/shared/modules/features/BaseHealerStatValues';
import Combatants from 'parser/shared/modules/Combatants';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import Mastery from '../core/EchoOfLightMastery';

import PRIEST_HEAL_INFO from './StatValuesSpellInfo';

class StatWeights extends BaseHealerStatValues {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    mastery: Mastery,
  };

  spellInfo = PRIEST_HEAL_INFO;
  qeLive = false;

  _hasteHpm(event, healVal) {
    if (event.ability.guid === SPELLS.RENEW.id && !event.tick) {
      return 0;
    }
    return super._hasteHpm(event, healVal);
  }

  _criticalStrike(event, healVal) {
    if (this._isCrit(event)) {
      return super._criticalStrike(event, healVal);
    } else if (event.eolCritAmount !== undefined && event.eolCritAmount !== 0) {
      const { baseCritChance, ratingCritChance } = this._getCritChance(event);
      const totalCritChance = baseCritChance + ratingCritChance;
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;
      const rating = this.statTracker.currentCritRating;

      const effectiveCritHealing = event.eolCritAmount;
      return effectiveCritHealing * ratingCritChanceContribution / rating;
    }
    return 0;
  }

  _mastery(event, healVal) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ECHO_OF_LIGHT_HEAL.id) {
      return 0;
    }
    return healVal.effective * (1 - (this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating - 1, true) / this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating, true)));
  }

  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      STAT.HASTE_HPCT,
      STAT.HASTE_HPM,
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }

}

export default StatWeights;
