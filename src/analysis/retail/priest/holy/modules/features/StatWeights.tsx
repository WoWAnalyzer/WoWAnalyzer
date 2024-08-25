import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Combatants from 'parser/shared/modules/Combatants';
import BaseHealerStatValues from 'parser/shared/modules/features/BaseHealerStatValues';
import STAT from 'parser/shared/modules/features/STAT';

import Mastery from '../core/EchoOfLightMastery';
import PRIEST_HEAL_INFO from './StatValuesSpellInfo';

//If this isn't being maintained it should be deleted, just redirect people to QELive

class StatWeights extends BaseHealerStatValues {
  static dependencies = {
    ...BaseHealerStatValues.dependencies,
    combatants: Combatants,
    mastery: Mastery,
  };
  spellInfo = PRIEST_HEAL_INFO;
  qeLive = false;

  _hasteHpm(event: any, healVal: any) {
    if (event.ability.guid === TALENTS.RENEW_TALENT.id && !event.tick) {
      return 0;
    }
    return super._hasteHpm(event, healVal);
  }

  _criticalStrike(event: any, healVal: any) {
    if (this._isCrit(event)) {
      return super._criticalStrike(event, healVal);
    } else if (event.eolCritAmount !== undefined && event.eolCritAmount !== 0) {
      const { baseCritChance, ratingCritChance } = this._getCritChance(event);
      const totalCritChance = baseCritChance + ratingCritChance;
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;
      const rating = this.statTracker.currentCritRating;

      const effectiveCritHealing = event.eolCritAmount;
      return (effectiveCritHealing * ratingCritChanceContribution) / rating;
    }
    return 0;
  }

  _mastery(event: any, healVal: any) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ECHO_OF_LIGHT_HEAL.id) {
      return 0;
    }
    return (
      healVal.effective *
      (1 -
        this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating - 1, true) /
          this.statTracker.masteryPercentage(this.statTracker.currentMasteryRating, true))
    );
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
