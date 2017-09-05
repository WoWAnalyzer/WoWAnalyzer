import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class HalfMoon extends Module {

    halfMoonOrder = 0;
    firstMoonTime = 0;
    firstCastTime = 0;
    firstCast = false;
    firstMoonCast = false;
    orderFound = false;

    on_byPlayer_cast(event) {
        if (!this.firstCast) {
            this.firstCastTime = event.timestamp;
            this.firstCast = true;
        }

        const spellId = event.ability.guid;
        if (this.orderFound || (SPELLS.FULL_MOON.id !== spellId && SPELLS.HALF_MOON.id !== spellId && SPELLS.NEW_MOON.id !== spellId)) {
            return;
        }

        if (!this.firstMoonCast){
            this.firstMoonTime = (event.timestamp - this.firstCastTime) / 1000;
            this.firstMoonCast = true;
        }

        if (spellId !== SPELLS.HALF_MOON.id)
            this.halfMoonOrder ++;
        else
            this.orderFound = true;
    }

    suggestions(when) {
        const abilityTracker = this.owner.modules.abilityTracker;
        
        const offSet = this.firstMoonTime + 15;
        const totalFromCD = ((this.owner.fightDuration/1000) - offSet) / 15;
        const eachMoon = Math.floor(totalFromCD / 3);
        let hmAvailableCasts = eachMoon + 1;

        const extraMoons = ((totalFromCD / 3) - eachMoon) * 3;
        if (extraMoons > this.halfMoonOrder) hmAvailableCasts ++;

        const hmCasted = abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts;

        const percCasted = hmCasted / hmAvailableCasts;

        when(percCasted).isLessThan(1)
        .addSuggestion((suggest, actual, recommended) => {
            return suggest(<span> You casted {Math.round(formatPercentage(actual))}% of total available <SpellLink id={SPELLS.HALF_MOON.id} />, unless you have extended periods of downtime you should cast {Math.round(formatPercentage(recommended))}%.</span>)
            .icon(SPELLS.HALF_MOON.icon)
            .actual(`${Math.round(formatPercentage(actual))}% casted`)
            .recommended(`${Math.round(formatPercentage(recommended))}% Half Moon available casts is recommended`)
            .regular(recommended - 0.1).major(recommended - 0.2);
        });
    }

    statistic() {
        const abilityTracker = this.owner.modules.abilityTracker;
        
        const offSet = this.firstMoonTime + 15;
        const totalFromCD = ((this.owner.fightDuration/1000) - offSet) / 15;
        const eachMoon = Math.floor(totalFromCD / 3);
        let hmAvailableCasts = eachMoon + 1;

        const extraMoons = ((totalFromCD / 3) - eachMoon) * 3;
        if (extraMoons > this.halfMoonOrder) hmAvailableCasts ++;

        const hmCasted = abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts;
        
        return (
        <StatisticBox
            icon={<SpellIcon id={SPELLS.HALF_MOON.id} />}
            value={`${hmCasted}/${hmAvailableCasts}`}
            label='Half Moon casts'
        />
        );
    }
    statisticOrder = STATISTIC_ORDER.CORE(4);
}
  
export default HalfMoon;