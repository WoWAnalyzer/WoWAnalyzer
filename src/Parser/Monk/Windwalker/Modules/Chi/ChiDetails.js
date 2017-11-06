import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import ChiBreakdown from './ChiBreakdown';
import ChiTracker from './ChiTracker';


class ChiDetails extends Analyzer {
    static dependencies = {
        chiTracker: ChiTracker,
    };

    suggestions(when) {
        const pointsWasted = this.chiTracker.pointsWasted;
        const pointsWastedPerMinute = (pointsWasted / this.owner.fightDuration) * 1000 * 60;
        const MINOR = 5;
        const AVG = 10;
        const MAJOR = 15;
        when(pointsWastedPerMinute).isGreaterThan(MINOR)
            .addSuggestion((suggest, actual, recommended) => {
                return suggest('You are wasting Combo Points. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
                    .icon('creatureportrait_bubble')
                    .actual(`${pointsWasted} Combo Points wasted (${pointsWastedPerMinute.toFixed(2)} per minute)`)
                    .recommended(`< ${recommended.toFixed(2)} Combo Points per minute wasted are recommended`)
                    .regular(AVG).major(MAJOR);
            });
        const maxComboPointCasts = this.chiTracker.maxCPCasts;
        const totalCasts = this.chiTracker.totalCasts;
        const maxComboPointPercent = maxComboPointCasts / totalCasts;

        when(maxComboPointPercent).isLessThan(0.95)
            .addSuggestion((suggest, actual, recommended) => {
                return suggest(<span>You are casting too many finishers with less that 5 combo points. Try to make sure that you are generating 5 combo points before casting a finisher unless it is an emergency.</span>)
                    .icon('creatureportrait_bubble')
                    .actual(`${formatPercentage(actual)}% of finishers were cast with 5 combo points`)
                    .recommended(`>${formatPercentage(recommended)}% is recommended`)
                    .regular(recommended - 0.05).major(recommended - 0.10);
            });
    }

    statistic() {
        const pointsWasted = this.chiTracker.pointsWasted;
        return (
            <StatisticBox
                
                value={`${pointsWasted}`}
                label="Wasted Combo Points"
            />
        );
    }

    tab() {
        return {
            title: 'Combo Point usage',
            url: 'combo-points',
            render: () => (
              <Tab title="Combo Point usage breakdown">
                <ChiBreakdown
                  pointsGained={this.chiTracker.gained}
                  pointsSpent={this.chiTracker.spent}
                  pointsWasted={this.chiTracker.wasted}
                  pointsCast={this.chiTracker.casts}
                    />
                </Tab>
            ),
        };
    }

    statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ChiDetails;
