import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Panel from 'interface/statistics/Panel';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';

class MistweaverHealingEfficiencyDetails extends HealingEfficiencyDetails {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title="Mana efficiency"
        explanation={(
          <>
            <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> healing is added to the appropriate spell that caused the gust. <br /> <SpellLink id={SPELLS.ESSENCE_FONT.id} /> is given the healing from duplicated gusts, since without <SpellLink id={SPELLS.ESSENCE_FONT.id} /> the second gust would not have happened. <br /> <SpellLink id={SPELLS.RENEWING_MIST.id} /> is given the splash healing of <SpellLink id={SPELLS.VIVIFY.id} />'s heal since without <SpellLink id={SPELLS.RENEWING_MIST.id} />, <SpellLink id={SPELLS.VIVIFY.id} /> wouldn't have splashed. <br /> <SpellLink id={SPELLS.ENVELOPING_MIST.id} /> is given the healing of <SpellLink id={SPELLS.ENVELOPING_BREATH.id} /> since without casting <SpellLink id={SPELLS.ENVELOPING_MIST.id} />, <SpellLink id={SPELLS.ENVELOPING_BREATH.id} /> healing would not occur.
          </>
        )}
        pad={false}
        position={120}
      >
        <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
      </Panel>
    );
  }
}

export default MistweaverHealingEfficiencyDetails;
