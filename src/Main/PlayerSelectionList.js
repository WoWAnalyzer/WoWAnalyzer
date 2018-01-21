import React from 'react';
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

const UNKNOWN_ROLE = 'UNKNOWN_ROLE';

export class PlayerSelectionList extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    fightId: PropTypes.number.isRequired,
    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
      specID: PropTypes.number.isRequired,
    })),
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  groupByRole(friendlies) {
    return friendlies.reduce((obj, friendly) => {
      const spec = SPECS[friendly.combatant.specID];
      const role = spec && spec.role !== null ? spec.role : UNKNOWN_ROLE;
      obj[role] = obj[role] || [];
      obj[role] = [...obj[role], friendly];
      return obj;
    }, {});
  }

  renderRoleHeader(roleID, numFriendlies) {
    let icon;
    let header;
    let styles = {
      borderRadius: '50%',
      marginLeft: 10,
      marginRight: 10,
    };
    switch (Number(roleID)) {
      case ROLES.TANK:
        icon = 'tank';
        header = numFriendlies === 1 ? 'Tank' : 'Tanks';
        break;
      case ROLES.HEALER:
        icon = 'healer';
        header = numFriendlies === 1 ? 'Healer' : 'Healers';
        break;
      case ROLES.DPS.MELEE:
        icon = 'dps';
        header = 'Melee DPS';
        break;
      case ROLES.DPS.RANGED:
        icon = 'dps.ranged';
        header = 'Ranged DPS';
        break;
      default: // Use a non-visible image for correct spacing
        icon = 'tank';
        header = 'Unparsable due to corrupt combatlog event.';
        styles = {
          ...styles,
          visibility: 'hidden',
        };
        break;
    }

    return (
      <h4 className="card-title">
        <img src={`/roles/${icon}.jpg`} alt="Role Icon" style={styles} />{header}
      </h4>
    );
  }

  renderFriendly(report, fightId, friendly) {
    const spec = SPECS[friendly.combatant.specID];

    if (!spec) {
      // Spec might not be found if the combatantinfo errored, this happens extremely rarely. Example report: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)
      return (
        <li key={friendly.id} className="item selectable">
          <Link
            to={makeAnalyzerUrl(report, fightId, friendly.name)}
            style={{ marginLeft: 47 }}
            onClick={e => {
              e.preventDefault();
              alert('The combatlog did not give us any information about this player. This player can not be analyzed.');
            }}
          >
            {friendly.name} (Error - Spec unknown)
          </Link>
        </li>
      );
    } else {
      return (
        <li key={friendly.id} className="item selectable">
          <Link to={makeAnalyzerUrl(report, fightId, friendly.name)} className={spec.className.replace(' ', '')} style={{ marginLeft: 47 }}>
            {this.renderSpecIcon(spec)} {friendly.name} ({spec.specName})
          </Link>
        </li>
      );
    }
  }

  renderSpecIcon(spec) {
    return (
      <img src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`} alt="Spec logo" />
    );
  }

  render() {
    const { report, fightId, combatants } = this.props;

    if (!combatants) {
      return (
        <div className="container">
          <div>
            <h1>Fetching players...</h1>

            <div className="spinner" />
          </div>
        </div>
      );
    }
    if (combatants.length === 0) {
      return (
        <div className="text-danger" style={{ padding: '15px 22px' }}>
          No player data (such as gear, talents and traits) was found for this fight. This usually happens because you did not record with <b>Advanced Combat Logging</b> enabled. Make sure it is enabled, you can enable this in-game in the network settings.
        </div>
      );
    }

    const roleGroups = this.groupByRole(
      report.friendlies
        .map(friendly => ({
          ...friendly,
          combatant: combatants.find(combatant => combatant.sourceID === friendly.id),
        }))
        .filter(player => !!player.combatant)
    );

    return Object.keys(roleGroups)
      .map(roleID => {
        const friendlies = roleGroups[roleID];
        return (
          <div key={roleID === null ? -1 : roleID} className="card">
            {this.renderRoleHeader(roleID, friendlies.length)}
            <ul className="list selection players item-divider item-divider-top">
              {friendlies
                .sort((a, b) => {
                  if (a.name > b.name) {
                    return 1;
                  } else if (a.name < b.name) {
                    return -1;
                  }
                  return 0;
                })
                .map(friendly => this.renderFriendly(report, fightId, friendly))}
            </ul>
          </div>
        );
      });
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
