import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import SpecIcon from 'common/SpecIcon';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import ActivityIndicator from 'interface/common/ActivityIndicator';

const UNKNOWN_ROLE = 'UNKNOWN_ROLE';

export class PlayerSelectionPanelList extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    fight: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
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

  renderFriendly(report, fight, friendly) {
    const spec = SPECS[friendly.combatant.specID];

    if (!spec) {
      // Spec might not be found if the combatantinfo errored, this happens extremely rarely. Example report: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)
      return (
        <Link
          to={makeAnalyzerUrl(report, fight.id, friendly.id)}
          style={{ marginLeft: 47 }}
          onClick={e => {
            e.preventDefault();
            alert('The combatlog did not give us any information about this player. This player can not be analyzed.');
          }}
        >
          {friendly.name} (Error - Spec unknown)
        </Link>
      );
    } else {
      return (
        <Link to={makeAnalyzerUrl(report, fight.id, friendly.id)} className={spec.className.replace(' ', '')} style={{ marginLeft: 47 }}>
          <SpecIcon id={spec.id} /> {friendly.name} ({spec.specName})
        </Link>
      );
    }
  }

  render() {
    const { report, fight, combatants } = this.props;

    if (!combatants) {
      return <ActivityIndicator text="Fetching players..." />;
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
            <ul className="list selection players item-divider item-divider-top clearfix" style={{ border: 0 }}>
              {friendlies
                .sort((a, b) => {
                  if (a.name > b.name) {
                    return 1;
                  } else if (a.name < b.name) {
                    return -1;
                  }
                  return 0;
                })
                .map(friendly => (
                  <li key={friendly.id} className="item selectable col-md-6">
                    {this.renderFriendly(report, fight, friendly)}
                  </li>
                ))}
            </ul>
          </div>
        );
      });
  }
}

export default PlayerSelectionPanelList;
