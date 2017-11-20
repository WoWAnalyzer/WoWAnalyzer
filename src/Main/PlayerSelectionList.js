import React  from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { getFightId } from 'selectors/url/report';
import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';
import { getCombatants } from 'selectors/combatants';
import SPECS from 'common/SPECS';
import ROLES from 'common/ROLES';

import makeAnalyzerUrl from './makeAnalyzerUrl';

class PlayerSelectionList extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    fightId: PropTypes.number.isRequired,
    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
    })).isRequired,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  renderRoleIcon(spec) {
    let icon;
    switch (spec.role) {
      case ROLES.TANK: icon = 'tank'; break;
      case ROLES.HEALER: icon = 'healer'; break;
      case ROLES.DPS.MELEE: icon = 'dps'; break;
      case ROLES.DPS.RANGED: icon = 'dps.ranged'; break;
      default: break;
    }

    return (
      <img src={`/roles/${icon}.jpg`} alt="Role icon" style={{ borderRadius: '50%', marginLeft: -5, marginRight: 10 }} />
    );
  }
  renderSpecIcon(spec) {
    return (
      <img src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`} alt="Spec logo" />
    );
  }

  render() {
    const { report, fightId, combatants } = this.props;

    return (
      <ul className="list selection players">
        {combatants.length === 0 && (
          <li className="text-danger" style={{ padding: '15px 22px' }}>
            Could not find any players in this report. Make sure the log is recorded with Advanced Combat Logging enabled. You can enable this in-game in the network settings.
          </li>
        )}
        {
          report.friendlies
            .map(friendly => ({
              friendly,
              combatant: combatants.find(combatant => combatant.sourceID === friendly.id),
            }))
            .filter(player => !!player.combatant)
            .sort((a, b) => {
              // The combatlog can error out while would cause the combatant to not have a spec specified, in that case sort them at the bottom.
              const aSpec = SPECS[a.combatant.specID] || { role: 10 };
              const bSpec = SPECS[b.combatant.specID] || { role: 10 };
              if (aSpec.role > bSpec.role) {
                return 1;
              } else if (aSpec.role < bSpec.role) {
                return -1;
              }
              if (a.friendly.name > b.friendly.name) {
                return 1;
              } else if (a.friendly.name < b.friendly.name) {
                return -1;
              }
              return 0;
            })
            .map(({ friendly, combatant }) => {
              const spec = SPECS[combatant.specID];

              if (!spec) {
                // Spec might not be found if the combatantinfo errored, this happens extremely rarely. Example report: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)
                return (
                  <li key={friendly.id} className="item selectable">
                    <Link
                      to={makeAnalyzerUrl(report, fightId, friendly.name)}
                      onClick={e => {
                        e.preventDefault();
                        alert('The combatlog did not give us any information about this player. This player can not be analyzed.');
                      }}
                    >
                      {friendly.name} (Error - Spec unknown)
                    </Link>
                  </li>
                );
              }

              return (
                <li key={friendly.id} className="item selectable">
                  <Link to={makeAnalyzerUrl(report, fightId, friendly.name)}>
                    {this.renderRoleIcon(spec)}{' '}
                    {this.renderSpecIcon(spec)}{' '}
                    {friendly.name} ({spec.specName} {spec.className})
                  </Link>
                </li>
              );
            })
        }
      </ul>
    );
  }
}

const mapStateToProps = state => {
  const fightId = getFightId(state);

  return ({
    fightId,

    report: getReport(state),
    fight: getFightById(state, fightId),
    combatants: getCombatants(state),
  });
};

export default connect(
  mapStateToProps
)(PlayerSelectionList);
