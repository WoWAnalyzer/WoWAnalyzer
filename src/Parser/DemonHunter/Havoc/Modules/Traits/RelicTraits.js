import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import CriticalChaos from './CriticalChaos';

class RelicTraits extends Analyzer {
	static dependencies = {
		criticalChaos: CriticalChaos,
	};

	statistic() {
		return (
			<StatisticsListBox
				title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight."
        style={{ minHeight: 186 }}
			>
				{this.criticalChaos.subStatistic()}
			</StatisticsListBox>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;