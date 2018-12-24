import React from 'react';
import PropTypes from 'prop-types';

import ManaValues from 'parser/shared/modules/ManaValues';
import HealingDone from 'parser/shared/modules/HealingDone';

import Component from './Component';

class Container extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.shape({
      fight: PropTypes.shape({
        start_time: PropTypes.number.isRequired,
        end_time: PropTypes.number.isRequired,
      }),
      getModule: PropTypes.func.isRequired,
    }).isRequired,
  };

  render() {
    const { parser } = this.props;

    return (
      <Component
        reportCode={parser.report.code}
        actorId={parser.playerId}
        start={parser.fight.start_time}
        end={parser.fight.end_time}
        manaUpdates={parser.getModule(ManaValues).manaUpdates}
        healingBySecond={parser.getModule(HealingDone).bySecond}
      />
    );
  }
}

export default Container;
