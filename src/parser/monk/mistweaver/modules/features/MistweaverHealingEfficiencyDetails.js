import React from 'react';

import Tab from 'interface/others/Tab';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

class MistweaverHealingEfficiencyDetails extends HealingEfficiencyDetails {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  tab() {
    return {
      title: 'Mana Efficiency',
      url: 'mana-efficiency',
      render: () => {
        return [(<Tab key={"healingEfficiencyTracker"}>
          <HealingEfficiencyBreakdown
            tracker={this.healingEfficiencyTracker}
            showSpenders
          /> 
        </Tab>), 
        <Tab style={{ padding: '15px 22px 15px 15px' }} className="flex" key={"healingEfficiencyTrackerTextInfo"}>
            <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> healing is added to the appropriate spell that caused the gust. <SpellLink id={SPELLS.ESSENCE_FONT.id} /> is given the healing from duplicated gusts, since without <SpellLink id={SPELLS.ESSENCE_FONT.id} /> the second gust would not have happened. <SpellLink id={SPELLS.RENEWING_MIST.id} /> is given the splash healing of <SpellLink id={SPELLS.VIVIFY.id} />'s heal since without <SpellLink id={SPELLS.RENEWING_MIST.id} />, <SpellLink id={SPELLS.VIVIFY.id} /> wouldn't have splashed.
        </Tab>];
      },
    };
  }
}

export default MistweaverHealingEfficiencyDetails;
