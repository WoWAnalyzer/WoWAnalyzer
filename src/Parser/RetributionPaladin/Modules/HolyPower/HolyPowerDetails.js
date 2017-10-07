import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import HolyPowerBreakdown from './HolyPowerBreakdown';
import HolyPowerTracker from './HolyPowerTracker';

import WastedHPIcon from '../../images/paladin_hp.jpg';

const holyPowerIcon = 'inv_helmet_96';

class HolyPowerDetails extends Module {
	static dependencies = {
		holyPowerTracker: HolyPowerTracker,
	};

	suggestions(when) {
		const hpWasted = this.holyPowerTracker.holyPowerWasted;
		const hpWastedPercent = hpWasted / this.holyPowerTracker.totalHolyPowerGained;
		const MINOR = 0.02;
		const AVG = 0.05;
		const MAJOR = 0.08;
		when(hpWastedPercent).isGreaterThan(MINOR)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(`You wasted ${formatPercentage(hpWastedPercent)}% of your Holy Power.`)
					.icon(holyPowerIcon)
					.actual(`${hpWasted} Holy Power wasted`)
					.recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`)
					.regular(AVG).major(MAJOR);
			});
	}

	statistic() {
		const hpWasted = this.holyPowerTracker.holyPowerWasted;
		const totalHPGained = this.holyPowerTracker.totalHolyPowerGained;
		return (
			<StatisticBox
		    	icon={(
          			<img
            			src={WastedHPIcon}
            			alt="Wasted Holy Power"
          			/>
        		)}
		        value={`${formatPercentage(hpWasted / totalHPGained)} %`}
		        label="Holy Power Wasted"
		        tooltip={`${hpWasted} Holy Power wasted`}
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