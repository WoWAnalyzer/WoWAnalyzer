import { Trans } from '@lingui/react/macro';
import ArmoryIcon from 'interface/icons/Armory';
import WoWAnalyzerIcon from 'interface/icons/WoWAnalyzer';
import { makeCharacterUrl, makeArmoryUrl } from 'interface/makeAnalyzerUrl';
import { FullCombatant } from 'parser/core/Combatant';
import StatTracker from 'parser/shared/modules/StatTracker';
import { Link } from 'react-router-dom';

import './CharacterTab.scss';
import CharacterRace from './CharacterRace';
import CharacterStats from './CharacterStats';
import PlayerInfo from './PlayerInfo';
import PlayerInfoTalents from './PlayerInfoTalents';
import GameBranch from 'game/GameBranch';

interface Props {
  combatant: FullCombatant;
  statTracker: StatTracker;
}
const CharacterTab = (props: Props) => {
  const { statTracker, combatant } = props;

  const isClassic = combatant.owner.config.branch === GameBranch.Classic;
  const isRetail = combatant.owner.config.branch === GameBranch.Retail;

  return (
    <div className="character-tab">
      <div className="row">
        <div className="col-sm-6">
          <PlayerInfo combatant={combatant} />
        </div>
        <div className="col-sm-6">
          {!isClassic && <CharacterStats statTracker={statTracker} />}

          {!isClassic && combatant.race && <CharacterRace race={combatant.race} />}
        </div>
      </div>
      {isRetail && <PlayerInfoTalents talents={combatant.talentTree} specId={combatant.specId} />}
      {!isClassic && (
        <div className="row">
          <div className="col-md-12">
            <h2>Other pages</h2>
            <div style={{ fontSize: 24 }}>
              {combatant.characterProfile ? (
                <>
                  <Link to={makeCharacterUrl(combatant)}>
                    <WoWAnalyzerIcon mainColor="#FAB700" arrowColor="transparent" /> Character
                    parses
                  </Link>
                  {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
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
        </div>
      )}
    </div>
  );
};

export default CharacterTab;
