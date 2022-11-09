import { Trans } from '@lingui/macro';
import ArmoryIcon from 'interface/icons/Armory';
import WoWAnalyzerIcon from 'interface/icons/WoWAnalyzer';
import { makeCharacterUrl, makeArmoryUrl } from 'interface/makeAnalyzerUrl';
import Combatant from 'parser/core/Combatant';
import StatTracker from 'parser/shared/modules/StatTracker';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './CharacterTab.css';
import CharacterRace from './CharacterRace';
import CharacterStats from './CharacterStats';
import PlayerInfo from './PlayerInfo';

const CharacterTab = (props) => {
  const { statTracker, combatant } = props;

  // HACK: this doesn't use the enum because i don't want to convert this to TS right now.
  const isClassic = combatant.owner.config.expansion < 9;

  return (
    <div className="character-tab">
      <div className="row">
        <div className="col-sm-6">
          <PlayerInfo combatant={combatant} />
        </div>
        <div className="col-sm-6">
          {!isClassic && <CharacterStats statTracker={statTracker} />}

          {!isClassic && <CharacterRace race={combatant.race} />}

          {!isClassic && (
            <>
              <div className="row">
                <div className="col-md-12">
                  <h2>Other pages</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 hpadding-lg-30" style={{ fontSize: 24 }}>
                  {/* some bonus padding so it looks to be aligned with the icon for stats */}
                  {combatant.characterProfile ? (
                    <>
                      <Link to={makeCharacterUrl(combatant)}>
                        <WoWAnalyzerIcon /> Character parses
                      </Link>
                      <br />
                      <a href={makeArmoryUrl(combatant)} target="_blank" rel="noopener noreferrer">
                        <ArmoryIcon />
                        &nbsp;
                        <Trans id="interface.armory.text">Armory</Trans>
                      </a>
                    </>
                  ) : (
                    <small>Unavailable because your character could not be found.</small>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CharacterTab.propTypes = {
  statTracker: PropTypes.instanceOf(StatTracker).isRequired,
  combatant: PropTypes.instanceOf(Combatant).isRequired,
};

export default CharacterTab;
