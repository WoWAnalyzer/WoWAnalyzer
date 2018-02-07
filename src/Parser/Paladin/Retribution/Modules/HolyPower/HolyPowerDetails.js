import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import HolyPowerTracker from './HolyPowerTracker';

class HolyPowerDetails extends Analyzer {
	static dependencies = {
		holyPowerTracker: HolyPowerTracker,
	};

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