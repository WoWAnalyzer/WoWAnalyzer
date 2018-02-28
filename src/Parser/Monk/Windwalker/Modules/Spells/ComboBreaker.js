import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const CB_DURATION = 15000;
const debug = false;

class ComboBreaker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };
  CBProcsTotal = 0;
  lastCBProcTime = null;
  consumedCBProc = 0;
  overwrittenCBProc = 0;
  serenityBoKCast = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.COMBO_BREAKER_BUFF.id === spellId) {
      this.lastCBProcTime = event.timestamp;
      debug && console.log('CB Proc Applied');
      this.CBProcsTotal += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.COMBO_BREAKER_BUFF.id === spellId) {
      this.lastCBProcTime = event.timestamp;
      debug && console.log('CB Proc Overwritten');
      this.CBProcsTotal += 1;
      this.overwrittenCBProc += 1;
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_KICK.id !== spellId) {
      return;
    }
    if (this.lastCBProcTime !== event.timestamp) {
     if (this.lastCBProcTime === null) {
        return;
      }
      const cbTimeframe = this.lastCBProcTime + CB_DURATION;
      if (event.timestamp <= cbTimeframe) {
       this.consumedCBProc += 1;
        debug && console.log(`CB Proc Consumed / Timestamp: ${event.timestamp}`);
       this.lastCBProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedCBprocs = 1 - (this.consumedCBProc / this.CBProcsTotal);
    const unusedProcsRecommended = this.combatants.selected.hasBuff(SPELLS.WW_TIER21_2PC.id) ? 0.05 : 0.1;
    when(unusedCBprocs).isGreaterThan(unusedProcsRecommended)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs should be used before you tiger palm again so they are not overwritten. While some will be overwritten due to higher priority of getting Chi for spenders, wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs is not optimal.</span>)
          .icon(SPELLS.COMBO_BREAKER_BUFF.icon)
         .actual(`${formatPercentage(unusedCBprocs)}% Unused Combo Breaker procs`)
         .recommended(`<${formatPercentage(recommended)}% wasted Combo Breaker Procs is recommended`)
          .regular(recommended * 2).major(recommended * 3);
    });
  }
  
  statistic() {
    const unusedCBProcs = 1 - (this.consumedCBProc / this.CBProcsTotal);
    let procsFromTigerPalm = this.CBProcsTotal;
    // Strike of the Windlord procs Combo Breaker if legendary head "The Wind Blows" is equipped
    if (this.combatants.selected.hasHead(ITEMS.THE_WIND_BLOWS.id)) {
      procsFromTigerPalm = this.CBProcsTotal - this.abilityTracker.getAbility(SPELLS.STRIKE_OF_THE_WINDLORD.id).casts;
    }
    const averageCBProcs = this.abilityTracker.getAbility(SPELLS.TIGER_PALM.id).casts * (0.08 + 0.02 * this.combatants.selected.traitsBySpellId[SPELLS.STRENGTH_OF_XUEN.id]);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.COMBO_BREAKER_BUFF.id} />}
        value={`${formatPercentage(unusedCBProcs)}%`}
        label={`Unused Procs`}
        tooltip={`You got a total of <b>${this.CBProcsTotal} Combo Breaker procs</b> and <b>used ${this.consumedCBProc}</b> of them. Average number of procs from your tiger palms this fight is <b>${averageCBProcs.toFixed(2)}</b>, and you got <b>${procsFromTigerPalm}</b>.`}
      />
   );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(20);
}

export default ComboBreaker;
