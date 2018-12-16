import React from 'react';
import PropTypes from 'prop-types';

import ManaValues from 'parser/shared/modules/ManaValues';
import HealingDone from 'parser/shared/modules/HealingDone';
import Panel from 'interface/others/Panel';

import ManaLevelGraph from './ManaLevelGraph';
import ManaUsageGraph from './ManaUsageGraph';

const Mana = ({ parser }) => (
  <>
    <Panel
      title="Mana pool"
      explanation="Good mana usage usually means your mana pool is at a similar level as the boss' health. Some fights require specific mana management though."
    >
      <ManaLevelGraph
        reportCode={parser.report.code}
        actorId={parser.playerId}
        start={parser.fight.start_time}
        end={parser.fight.end_time}
        manaUpdates={parser.getModule(ManaValues).manaUpdates}
      />
    </Panel>

    <Panel
      title="Mana usage"
      explanation="This shows you your mana usage in correlation with your throughput. Big spikes in mana usage without increases in throughput may indicate poor mana usage. The scale for both mana lines is 0-100% where 100% is aligned with the max HPS throughput."
    >
      <ManaUsageGraph
        start={parser.fight.start_time}
        end={parser.fight.end_time}
        healingBySecond={parser.getModule(HealingDone).bySecond}
        manaUpdates={parser.getModule(ManaValues).manaUpdates}
      />
    </Panel>
  </>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
