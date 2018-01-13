import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';

import HolyPowerBreakdown from './HolyPowerBreakdown';
import HolyPowerTracker from './HolyPowerTracker';

import WastedHPIcon from '../../images/paladin_hp.jpg';

const holyPowerIcon = 'inv_helmet_96';

class HolyPowerDetails extends Analyzer {
	static dependencies = {
		holyPowerTracker: HolyPowerTracker,
	};

	get hpWasted() {
		return this.holyPowerTracker.holyPowerWasted;
	}

	get suggestionThresholds() {
		const hpWastedPercent = this.hpWasted / this.holyPowerTracker.totalHolyPowerGained;
		return {
			actual: hpWastedPercent,
			isGreaterThan: {
				minor: 0.02,
				average: 0.05,
				major: 0.08,
			},
			style: 'percentage',
		};
  }

	suggestions(when) {
		when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
				return suggest(`You wasted ${formatPercentage(actual)}% of your Holy Power.`)
					.icon(holyPowerIcon)
					.actual(`${this.hpWasted} Holy Power wasted`)
					.recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`);
		});
	}

	statistic() {
		const totalHPGained = this.holyPowerTracker.totalHolyPowerGained;
		return (
			<StatisticBox
		    	icon={(
          			<img
            			src={WastedHPIcon}
            			alt="Wasted Holy Power"
          			/>
        		)}
		        value={formatNumber(this.hpWasted)}
		        label="Holy Power Wasted"
		        tooltip={`${formatPercentage(this.hpWasted / totalHPGained)}% wasted`}
      		/>
		);
	}

	tab() {
    return {
      title: 'Holy Power Usage',
      url: 'holy-power',
      render: () => (
        <Tab title="Holy Power Usage Breakdown">
          <HolyPowerBreakdown
            hpGeneratedAndWasted={this.holyPowerTracker.generatedAndWasted}
          />
        </Tab>
      ),
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default HolyPowerDetails;