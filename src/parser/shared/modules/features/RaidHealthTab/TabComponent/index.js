import React from 'react';
import PropTypes from 'prop-types';

import Panel from 'interface/others/Panel';
import { Trans } from '@lingui/macro';

import Graph from './Graph';

const Mana = ({ parser }) => (
  <Panel
    title={<Trans id="shared.raidHealth.tab.title">Raid health</Trans>}
    explanation={<Trans id="shared.raidHealth.tab.explanation">The stacked health of your raid to give an idea of the healing intensity. Most progression raid fights the raid will rarely be topped.</Trans>}
  >
    <Graph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      offset={parser.fight.offset_time}
    />
  </Panel>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
