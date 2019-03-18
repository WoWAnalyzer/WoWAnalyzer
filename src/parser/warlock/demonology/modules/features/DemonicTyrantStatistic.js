import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Statistic from 'interface/statistics/Statistic';

class DemonicTyrantStatistic extends React.PureComponent {
  static propTypes = {
    pets: PropTypes.object.isRequired,
    average: PropTypes.number.isRequired,
    casts: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentWillMount() {
    this.setState({
      expanded: false,
    });
  }

  componentWillReceiveProps() {
    this.setState({
      expanded: false,
    });
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  get petRows() {
    const { pets } = this.props;
    return Object.entries(pets).map(([summonAbility, average]) => (
      <tr key={summonAbility}>
        <td><SpellLink id={Number(summonAbility)} /></td>
        <td>{average.toFixed(2)}</td>
      </tr>
    ));
  }

  render() {
    const { average, casts } = this.props;
    return (
      <Statistic
        size="flexible"
        style={{ zIndex: this.state.expanded ? 2 : 1 }}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} /></label>
          <div className="value">
            {average.toFixed(2)} <small>pets empowered on average</small>
          </div>
        </div>

        {casts > 0 && (
          <>
            <div className="row">
              <div className="col-xs-12">
                {this.state.expanded && (
                  <div className="statistic-expansion">
                    <table className="table table-condensed">
                      <thead>
                        <tr>
                          <th>Pet source</th>
                          <th>Average pets per cast</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.petRows}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="statistic-expansion-button-holster">
              <button onClick={this.toggleExpansion} className="btn btn-primary">
                {!this.state.expanded && <span className="glyphicon glyphicon-chevron-down" />}
                {this.state.expanded && <span className="glyphicon glyphicon-chevron-up" />}
              </button>
            </div>
          </>
        )}
      </Statistic>
    );
  }
}

export default DemonicTyrantStatistic;
