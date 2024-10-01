import classColor from 'game/classColor';
import getAverageItemLevel from 'game/getAverageItemLevel';
import { getClassName } from 'game/ROLES';
import Icon from 'interface/Icon';
import { getCharacterById } from 'interface/selectors/characters';
import SpecIcon from 'interface/SpecIcon';
import Config from 'parser/Config';
import Player from 'parser/core/Player';
import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isSupportedRegion } from 'common/regions';
import getConfig from 'parser/getConfig';
import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { makeThumbnailUrl } from 'interface/makeAnalyzerUrl';
import { useLingui } from '@lingui/react';
import { Spec } from 'game/SPECS';
import { useFight } from 'interface/report/context/FightContext';
import { isMythicPlus } from 'common/isMythicPlus';
import { fetchCharacter } from 'interface/reducers/charactersById';
import { useReport } from './context/ReportContext';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import GameBranch from 'game/GameBranch';

interface BlockLoadingProps {
  children: ReactNode;
  message: string;
}
const BlockLoading = ({ children, message }: BlockLoadingProps) => (
  <span
    className="player"
    onClick={() => {
      alert(message);
    }}
  >
    {children}
  </span>
);

interface BasicBlockLoadingProps extends Omit<BlockLoadingProps, 'children'> {
  avatar: string;
  player: Player;
}
const BasicBlockLoading = ({ avatar, player, ...props }: BasicBlockLoadingProps) => (
  <BlockLoading {...props}>
    <div className="role" />
    <div className="card">
      <div className="avatar" style={{ backgroundImage: `url(${avatar})` }} />
      <div className="about">
        <h1>{player.name}</h1>
      </div>
    </div>
  </BlockLoading>
);

interface PlayerTileContentsProps {
  avatar: string;
  player: Player;
  spec: Spec;
}
const PlayerTileContents = ({ avatar, player, spec }: PlayerTileContentsProps) => {
  const { i18n } = useLingui();

  const specName = spec?.specName ? i18n._(spec.specName) : undefined;
  const className = spec?.className ? i18n._(spec.className) : undefined;

  return (
    <>
      <div className="role" />
      <div className="card">
        <div className="avatar" style={{ backgroundImage: `url(${avatar})` }} />
        <div className="about">
          <h1
            className={classColor(spec)}
            // The name can't always fit so use a tooltip. We use title instead of the tooltip library for this because we don't want it to be distracting and the tooltip library would popup when hovering just to click an item, while this has a delay.
            title={player.name}
          >
            {player.name}
          </h1>
          <small title={`${specName} ${className}`}>
            <SpecIcon spec={spec} /> {specName} {className}
          </small>
          <div className="flex text-muted text-small">
            <div className="flex-main">
              <Icon icon="inv_helmet_03" /> {Math.round(getAverageItemLevel(player.combatant.gear))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface PlayerTileProps {
  player: Player;
  makeUrl: (playerId: number) => string;
  config?: Config;
}

// specs with performance issues during analysis. the "can i load this on my underpowered laptop" test is how things end up here.
function isSpecDisabledInDungeons(spec: Spec): boolean {
  return false;
}

const PlayerTile = ({ player, makeUrl, config }: PlayerTileProps) => {
  const characterInfo = useWaSelector((state) => getCharacterById(state, player.guid));
  const dispatch = useWaDispatch();
  const { fight } = useFight();
  const { report } = useReport();
  const classic = wclGameVersionToBranch(report.gameVersion) === GameBranch.Classic;

  useEffect(() => {
    const load = async () => {
      if (!player.region || !player.server || !isSupportedRegion(player.region)) {
        return null;
      }

      const { server, region, guid, name } = player;

      try {
        return await dispatch(fetchCharacter({ guid, name, server, region, classic }));
      } catch (err) {
        // No biggy, just show less info
        console.error('An error occurred fetching', player, '. The error:', err);
        return null;
      }
    };

    if (!characterInfo) {
      // noinspection JSIgnoredPromiseFromCall
      load();
    }
  }, [classic, characterInfo, player, dispatch]);

  const avatar = makeThumbnailUrl(characterInfo, classic);

  if (!config) {
    config = getConfig(GameBranch.Classic, 1, player, player.combatant);
  }
  const spec = config?.spec;

  if (!config || !config.parser) {
    return (
      <BasicBlockLoading
        avatar={avatar}
        message="This player's spec is not currently supported for this expansion. WoWAnalyzer is a community project and requires volunteers to provide support for each spec. See GitHub for more information."
        player={player}
      />
    );
  }
  if (player.combatant.error || !spec) {
    return (
      <BasicBlockLoading
        avatar={avatar}
        message="This player can not be parsed. Warcraft Logs ran into an error parsing the log and is not giving us all the necessary information. Please update your Warcraft Logs Uploader and reupload your log to try again."
        player={player}
      />
    );
  }
  if (isMythicPlus(fight) && isSpecDisabledInDungeons(spec)) {
    return (
      <BlockLoading message="This spec is currently disabled in M+ due to the large number of events generated causing performance problems.">
        <PlayerTileContents avatar={avatar} player={player} spec={spec} />
      </BlockLoading>
    );
  }

  return (
    <Link to={makeUrl(player.id)} className={`player ${getClassName(spec.role)}`}>
      <PlayerTileContents avatar={avatar} player={player} spec={spec} />
    </Link>
  );
};

export default PlayerTile;
