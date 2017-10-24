import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

const BONUS_BUFF_TIME_PER_SOUL = 1500;
const BUFF_TIME_PER_SOUL = 6500;
const BASE_BUFF_TIME_PER_SOUL = 5000;
const MAX_BUFF_DURATION = 78000;

class ReapAndSow extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _tormentedSoulCounter = 0;
  _expectedBuffEndTimestamp = 0;
  totalTimeGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.REAP_AND_SOW.id);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      this._tormentedSoulCounter = 1;
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      this._tormentedSoulCounter = event.stack;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REAP_SOULS.id) {
      return;
    }
    // first Reap
    if (this.totalTimeGained === 0) {
      this.totalTimeGained += this._tormentedSoulCounter * BONUS_BUFF_TIME_PER_SOUL;
      this._expectedBuffEndTimestamp = event.timestamp + this._tormentedSoulCounter * BUFF_TIME_PER_SOUL;
    } else {
      // we either refresh the buff or cast a fresh new reap
      // new reap will never exceed MAX_BUFF_DURATION (Tormented Souls has max stacks of 12 and the MAX_BUFF_DURATION = 12 * BUFF_TIME_PER_SOUL)
      if (event.timestamp >= this._expectedBuffEndTimestamp) {
        // we casted a new reap
        this.totalTimeGained += this._tormentedSoulCounter * BONUS_BUFF_TIME_PER_SOUL;
        this._expectedBuffEndTimestamp = event.timestamp + this._tormentedSoulCounter * BUFF_TIME_PER_SOUL;
      } else {
        // we refreshed the buff
        const remainingDuration = this._expectedBuffEndTimestamp - event.timestamp;
        const buffDuration = this._tormentedSoulCounter * BUFF_TIME_PER_SOUL;
        let effectiveBonusTimeGained;
        if (remainingDuration + buffDuration > MAX_BUFF_DURATION) {
          // we will exceed the max duration
          // TODO: a log where this actually happens would be nice to have
          const maxBuffTimestamp = event.timestamp + MAX_BUFF_DURATION;

          const timeTillMax = maxBuffTimestamp - this._expectedBuffEndTimestamp;

          // this should contain how many full buffs (full 6,5 sec duration) will fit till max duration
          const numberOfFullBuffsTillMax = Math.floor(timeTillMax / BUFF_TIME_PER_SOUL);

          effectiveBonusTimeGained = numberOfFullBuffsTillMax * BONUS_BUFF_TIME_PER_SOUL;


          // but perhaps another bonus time is right on the edge of the maximum duration - like this:
          // [-----base 5 sec duration-----][----||---]   <---- 1,5 sec legendary bonus
          //                                ^    MAX
          //                                |
          const maxBuffWithoutLastBonusTimestamp = this._expectedBuffEndTimestamp + numberOfFullBuffsTillMax * BUFF_TIME_PER_SOUL + BASE_BUFF_TIME_PER_SOUL; // honestly I ran out of ideas how to call it
          // i.e. time at which the buff should've ended + how many full 6,5s buffs we can fit till the max + 5 sec base buff
          if (maxBuffWithoutLastBonusTimestamp < maxBuffTimestamp) {
            // that means that only a part of the bonus time is wasted and part is gained
            effectiveBonusTimeGained += maxBuffTimestamp - maxBuffWithoutLastBonusTimestamp;
          }
          this._expectedBuffEndTimestamp = maxBuffTimestamp;
        } else {
          effectiveBonusTimeGained = this._tormentedSoulCounter * BONUS_BUFF_TIME_PER_SOUL;
          this._expectedBuffEndTimestamp = event.timestamp + this._tormentedSoulCounter * BUFF_TIME_PER_SOUL;
        }
        this.totalTimeGained += effectiveBonusTimeGained;
      }
    }
    this._tormentedSoulCounter = 0;
  }

  item() {
    return {
      item: ITEMS.REAP_AND_SOW,
      result: `Extra ${(this.totalTimeGained / 1000).toFixed(2)} seconds of buff gained.`,
    };
  }
}

export default ReapAndSow;
