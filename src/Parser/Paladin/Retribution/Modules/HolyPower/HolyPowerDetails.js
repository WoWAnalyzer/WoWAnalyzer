import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import HolyPowerTracker from './HolyPowerTracker';

class HolyPowerDetails extends Analyzer {
	static dependencies = {
		holyPowerTracker: HolyPowerTracker,
	};

	get suggestionThresholds() {
		const hpWastedPercent = this.holyPowerTracker.wasted / this.holyPowerTracker.generated;
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

	tab() {
		return {
			title: 'Holy Power Usage',
			url: 'holy-power-usage',
			render: () => (
				<Tab title="Holy Power usage breakdown">
					<ResourceBreakdown
						tracker={this.holyPowerTracker}
						resourceName="Holy Power"
						showSpenders={true}
					/>
				</Tab>
			),
		};
	}
}

export default HolyPowerDetails;