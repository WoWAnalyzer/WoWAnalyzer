import React from 'react';
import PropTypes from 'prop-types';

import Panel from 'interface/others/Panel';

import ManaLevelGraph from './ManaLevelGraph';
import ManaUsageGraph from './ManaUsageGraph';

class Mana extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    manaUpdates: PropTypes.array.isRequired,
    healingBySecond: PropTypes.object.isRequired,
  };

  render() {
    const { reportCode, actorId, start, end, manaUpdates, healingBySecond } = this.props;

    return (
      <>
        <Panel
          title="Mana pool"
          explanation="As a rule of thumb aim to burn mana about as quickly as the boss is losing health. Some fights require specific mana management though."
        >
          <ManaLevelGraph
            reportCode={reportCode}
            actorId={actorId}
            start={start}
            end={end}
            manaUpdates={manaUpdates}
          />
        </Panel>

        <Panel
          title="Mana usage"
          explanation="This shows you your mana usage in correlation with your throughput. Big spikes in mana usage without increases in throughput may indicate poor mana usage. The scale for both mana lines is 0-100% where 100% is aligned with the max HPS throughput."
        >
          <ManaUsageGraph
            start={start}
            end={end}
            healingBySecond={healingBySecond}
            manaUpdates={manaUpdates}
          />
        </Panel>
      </>
    );
  }
}

export default Mana;
