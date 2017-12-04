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

  renderRoleGroups(report, fightId, friendlies) {
    const roleGroups = {};
    roleGroups[ROLES.TANK] = [];
    roleGroups[ROLES.HEALER] = [];
    roleGroups[ROLES.DPS.MELEE] = [];
    roleGroups[ROLES.DPS.RANGED] = [];
    roleGroups[null] = []; // Spec might not be found if the combatantinfo errored, this happens extremely rarely. Example report: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)

    friendlies.forEach(({ friendly, combatant }) => {
      const spec = SPECS[combatant.specID];
      roleGroups[spec ? spec.role : null].push([friendly, combatant]);
    });

    const rows = [];
    Object.keys(roleGroups).forEach(( roleID ) => {
      if ( roleID !== "null" || roleGroups[roleID].length > 0 ) {
        rows.push(this.renderRoleGroup(report, fightId, parseInt(roleID, 10), roleGroups[roleID]));
      }
    });
    return(rows);
  }

  renderRoleGroup(report, fightId, roleID, friendlies) {
    let role;
    switch (roleID) {
      case ROLES.TANK: role = 'tanks'; break;
      case ROLES.HEALER: role = 'healers'; break;
      case ROLES.DPS.MELEE: role = 'melee-dps'; break;
      case ROLES.DPS.RANGED: role = 'ranged-dps'; break;
      default: role = 'role-unknown'; break;
    }

    return(
      <div key={role} className="card">
        { this.renderRoleHeader(roleID, friendlies.length) }
        <ul className="list selection players">
          {
            friendlies.map(( arr ) => {
              return this.renderFriendly(report, fightId, arr[0], arr[1]);
            })
          }
        </ul>
      </div>
    );
  }

  renderRoleHeader(roleID, countFriendlies) {
    let icon;
    let header;
    switch (roleID) {
      case ROLES.TANK:
        icon = 'tank';
        header = countFriendlies === 1 ? 'Tank' : 'Tanks';
        break;
      case ROLES.HEALER:
        icon = 'healer';
        header = countFriendlies === 1 ? 'Healer' : 'Healers';
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
        header = 'Unknown';
        break;
    }

    const styles = isNaN(roleID) ? { marginLeft: 10, marginRight: 10, visibility: 'hidden' } : { borderRadius: '50%', marginLeft: 10, marginRight: 10 };

    return(
      <h4 className="card-title">
        <img src={`/roles/${icon}.jpg`} alt="Role Icon" style={styles} />{header}
      </h4>
    );
  }

  renderFriendly(report, fightId, friendly, combatant) {
    const spec = SPECS[combatant.specID];

    if (!spec) {
      // Spec might not be found if the combatantinfo errored, this happens extremely rarely. Example report: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)
      return(
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
      return(
        <li key={friendly.id} className="item selectable">
          <Link to={makeAnalyzerUrl(report, fightId, friendly.name)} className={spec.className} style={{ marginLeft: 47 }}>
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

    if ( combatants.length === 0 ) {
      return(
        <li className="text-danger" style={{ padding: '15px 22px' }}>
          Could not find any players in this report. Make sure the log is recorded with Advanced Combat Logging enabled. You can enable this in-game in the network settings.
        </li>
      );
    } else {
      return(
        this.renderRoleGroups(report, fightId,
          report.friendlies
            .map(friendly => ({
              friendly,
              combatant: combatants.find(combatant => combatant.sourceID === friendly.id),
            }))
            .filter(player => !!player.combatant)
            .sort((a, b) => {
              if (a.friendly.name > b.friendly.name) {
                return 1;
              } else if (a.friendly.name < b.friendly.name) {
                return -1;
              }
              return 0;
            })
        )
      );
    }
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
