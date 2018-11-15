import React from 'react';
import PropTypes from 'prop-types';

import ManaValues from 'parser/shared/modules/ManaValues';
import HealingDone from 'parser/shared/modules/HealingDone';
import Tab from 'interface/others/Tab';

import ManaLevelGraph from './ManaLevelGraph';
import ManaUsageGraph from './ManaUsageGraph';

const Mana = ({ parser }) => (
  <Tab style={{ padding: '15px 22px' }}>
    <h1>Mana pool</h1>
    <ManaLevelGraph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      manaUpdates={parser.getModule(ManaValues).manaUpdates}
      currentTimestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}

    <h1>Mana usage</h1>
    <ManaUsageGraph
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      healingBySecond={parser.getModule(HealingDone).bySecond}
      manaUpdates={parser.getModule(ManaValues).manaUpdates}
      timestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}
  </Tab>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
