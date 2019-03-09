import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { makeCharacterUrl, makeArmoryUrl } from 'interface/common/makeAnalyzerUrl';
import WoWAnalyzerIcon from 'interface/icons/WoWAnalyzer';
import ArmoryIcon from 'interface/icons/Armory';
import Combatant from 'parser/core/Combatant';
import StatTracker from 'parser/shared/modules/StatTracker';

import './CharacterTab.css';
import PlayerInfo from './PlayerInfo';
import Stats from './Stats';
import Race from './Race';

class CharacterTab extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.instanceOf(StatTracker).isRequired,
    combatant: PropTypes.instanceOf(Combatant).isRequired,
  };

  render() {
    const { statTracker, combatant } = this.props;

    return (
      <div className="character-tab">
        <div className="row">
          <div className="col-sm-6">
            <PlayerInfo combatant={combatant} />
          </div>
          <div className="col-sm-6">
            <Stats statTracker={statTracker} />

            <Race race={combatant.race} />

            <div className="row">
              <div className="col-md-12">
                <h2>
                  Other pages
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 hpadding-lg-30" style={{ fontSize: 24 }}>{/* some bonus padding so it looks to be aligned with the icon for stats */}
                <Link to={makeCharacterUrl(combatant)}><WoWAnalyzerIcon /> Character parses</Link><br />
                <a
                  href={makeArmoryUrl(combatant)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArmoryIcon /> Armory
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterTab;
