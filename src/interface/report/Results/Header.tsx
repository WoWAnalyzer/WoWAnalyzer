/* eslint-disable react/prop-types */
import getBossName from 'common/getBossName';
import { getLabel as getDifficultyLabel } from 'game/DIFFICULTIES';
import { Boss, Phase } from 'game/raids';
import Ad, { Location } from 'interface/Ad';
import Config from 'parser/Config';
import { ParseResultsTab } from 'parser/core/Analyzer';
import CharacterProfile from 'parser/core/CharacterProfile';
import Fight from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';

import BuildSelection from './BuildSelection';
import HeaderBackground from './HeaderBackground';
import NavigationBar from './NavigationBar';
import PhaseSelector from './PhaseSelector';
import TimeFilter from './TimeFilter';

import './Header.scss';

interface Props {
  config: Config;
  player: PlayerInfo;
  characterProfile: CharacterProfile;
  boss: Boss | null;
  handlePhaseSelection: (phase: string, instance: number) => void;
  applyFilter: (start: number, end: number) => void;
  phases: { [key: string]: Phase } | null;
  build?: string;
  selectedPhase: string;
  selectedInstance: number;
  isLoading: boolean;
  fight: Fight;
  makeTabUrl: (tab: string, build?: string) => string;
  selectedTab: string;
  tabs: ParseResultsTab[];
}

const Header = ({
  config: { spec, builds, expansion },
  build,
  player: { name, icon },
  fight,
  boss,
  handlePhaseSelection,
  selectedPhase,
  selectedInstance,
  phases,
  isLoading,
  applyFilter,
  characterProfile,
  makeTabUrl,
  tabs,
  selectedTab,
}: Props) => {
  let playerThumbnail;
  if (characterProfile?.thumbnail) {
    playerThumbnail = `https://render-${characterProfile.region}.worldofwarcraft.com/character/${characterProfile.thumbnail}`;
  } else {
    playerThumbnail = `/specs/${icon}.jpg`.replace(/ /, '');
  }

  return (
    <header>
      <HeaderBackground boss={boss} expansion={expansion} />

      <Ad location={Location.Top} />

      <div className="subnavigation container">
        {phases && Object.keys(phases).length > 0 && (
          <div className="phaseselector">
            <PhaseSelector
              fight={fight}
              phases={phases}
              handlePhaseSelection={handlePhaseSelection}
              selectedPhase={selectedPhase}
              selectedInstance={selectedInstance}
              isLoading={isLoading}
            />
          </div>
        )}
        <div className="timefilter">
          <TimeFilter fight={fight} isLoading={isLoading} applyFilter={applyFilter} />
        </div>
      </div>

      <div className="info container">
        <div className="boss" data-testid="boss-difficulty-and-name">
          <h2>{getDifficultyLabel(fight.difficulty)}</h2>
          <h1>{boss ? boss.name : getBossName(fight, false)}</h1>
        </div>
        <div className="player">
          <div className="avatar">
            <img src={playerThumbnail} alt="" />
          </div>
          <div className="details">
            {builds && (
              <BuildSelection
                builds={builds}
                activeBuild={build}
                makeUrl={(build: string) => makeTabUrl(selectedTab, build)}
                className="builds"
              />
            )}
            <h2>
              {spec.specName} {spec.className}
            </h2>
            <h1 className="name">{name}</h1>
          </div>
        </div>
      </div>

      <NavigationBar makeTabUrl={makeTabUrl} tabs={tabs} selectedTab={selectedTab} />
    </header>
  );
};

export default Header;
