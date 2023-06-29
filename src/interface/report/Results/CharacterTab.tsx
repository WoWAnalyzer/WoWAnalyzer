import ArmoryIcon from 'interface/icons/Armory';
import WoWAnalyzerIcon from 'interface/icons/WoWAnalyzer';
import { makeCharacterUrl, makeArmoryUrl } from 'interface/makeAnalyzerUrl';
import Combatant from 'parser/core/Combatant';
import StatTracker from 'parser/shared/modules/StatTracker';
import { Link } from 'react-router-dom';
import { isRetailExpansion } from 'game/Expansion';

import './CharacterTab.css';
import CharacterRace from './CharacterRace';
import CharacterStats from './CharacterStats';
import PlayerInfo from './PlayerInfo';

interface Props {
  combatant: Combatant;
  statTracker: StatTracker;
}
const CharacterTab = (props: Props) => {
  const { statTracker, combatant } = props;

  const isClassic = !isRetailExpansion(combatant.owner.config.expansion);

  return (
    <div className="character-tab">
      <div className="row">
        <div className="col-sm-6">
          <PlayerInfo combatant={combatant} />
        </div>
        <div className="col-sm-6">
          {!isClassic && <CharacterStats statTracker={statTracker} />}

          {!isClassic && combatant.race && <CharacterRace race={combatant.race} />}

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
                        <WoWAnalyzerIcon mainColor="#FAB700" arrowColor="transparent" /> Character
                        parses
                      </Link>
                      <br />
                      <a href={makeArmoryUrl(combatant)} target="_blank" rel="noopener noreferrer">
                        <ArmoryIcon />
                        &nbsp;
                        <>Armory</>
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

export default CharacterTab;
