import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';
import HolyPowerTracker from './HolyPowerTracker';

import WastedHPIcon from '../../images/paladin_hp.jpg';

const holyPowerIcon = 'inv_helmet_96';

class HolyPowerDetails extends Analyzer {
	static dependencies = {
		holyPowerTracker: HolyPowerTracker,
	};

	get wastedHolyPowerPercent() {
		return this.holyPowerTracker.wasted / (this.holyPowerTracker.wasted + this.holyPowerTracker.generated);
	}

	get suggestionThresholds() {
		return {
			actual: 1 - this.wastedHolyPowerPercent,
			isLessThan: {
				minor: 0.98,
				average: 0.95,
				major: 0.92,
			},
			style: 'percentage',
		};
  }

  suggestions(when) {
		when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
			return suggest(`You wasted ${formatNumber(this.holyPowerTracker.wasted)} Holy Power.`)
				.icon(holyPowerIcon)
				.actual(`${formatPercentage(this.wastedHolyPowerPercent)}% Holy Power wasted`)
				.recommended(`Wasting <${formatPercentage(1 - recommended)}% is recommended.`);
		});
	}

	statistic() {
		return (
			<StatisticBox
				icon={(
					<img
						src={WastedHPIcon}
						alt="Wasted Holy Power"
					/>
				)}
				value={formatNumber(this.holyPowerTracker.wasted)}
				label="Holy Power Wasted"
				tooltip={`${formatPercentage(this.wastedHolyPowerPercent)}% wasted`}
			/>
		);
	}

	tab() {
		return {
			title: 'Holy Power Usage',
			url: 'holy-power-usage',
			render: () => (
				<Tab>
					<ResourceBreakdown
						tracker={this.holyPowerTracker}
						resourceName="Holy Power"
						showSpenders={true}
					/>
				</Tab>
			),
		};
	}
	statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default HolyPowerDetails;
