import getAverageItemLevel from 'game/getAverageItemLevel';
import { getClassName } from 'game/ROLES';
import { getCovenantById } from 'game/shadowlands/COVENANTS';
import { fetchCharacter } from 'interface/actions/characters';
import Icon from 'interface/Icon';
import { RootState } from 'interface/reducers';
import { getCharacterById } from 'interface/selectors/characters';
import SpecIcon from 'interface/SpecIcon';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import Player from 'parser/core/Player';
import getBuild from 'parser/getBuild';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { isSupportedRegion } from 'common/regions';
import { CLASSIC_EXPANSION } from 'game/Expansion';
import getConfig from 'parser/getConfig';

interface Props {
  player: Player;
  makeUrl: (playerId: number, build?: string) => string;
  config?: Config;
}

const PlayerTile = ({ player, makeUrl, config }: Props) => {
  const characterInfo = useSelector<RootState, CharacterProfile>((state) =>
    getCharacterById(state, player.guid),
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const load = async () => {
      if (
        player.combatant.expansion === 'wotlk' ||
        !player.region ||
        !player.server ||
        !isSupportedRegion(player.region)
      ) {
        return null;
      }

      try {
        return await dispatch(
          fetchCharacter(player.guid, player.region, player.server, player.name),
        );
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
  }, [characterInfo, player, dispatch]);

  const avatar = characterInfo?.thumbnail
    ? `https://render-${
        characterInfo.region
      }.worldofwarcraft.com/character/${characterInfo.thumbnail.replace('avatar', 'inset')}`
    : '/img/fallback-character.jpg';

  if (!config && CLASSIC_EXPANSION) {
    config = getConfig(CLASSIC_EXPANSION, 1, player.type, player.icon);
  }
  const spec = config?.spec;
  const build = getBuild(config, player.combatant);
  const missingBuild = config?.builds && !build;
  const covenant = player.combatant.covenantID || null;
  let covenantName: string | undefined = '';
  if (covenant !== null) {
    covenantName = getCovenantById(covenant)?.name;
  }
  if (!config || missingBuild) {
    return (
      <span
        className="player"
        onClick={() => {
          alert(
            `This player's spec is not currently supported for this expansion. WoWAnalyzer is a community project and requires volunteers to provide support for each spec. See GitHub for more information.`,
          );
        }}
      >
        <div className="role" />
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${avatar})` }} />
          <div className="about">
            <h1>{player.name}</h1>
          </div>
        </div>
      </span>
    );
  }
  if (player.combatant.error || !spec) {
    return (
      <span
        className="player"
        onClick={() => {
          alert(
            `This player can not be parsed. Warcraft Logs ran into an error parsing the log and is not giving us all the necessary information. Please update your Warcraft Logs Uploader and reupload your log to try again.`,
          );
        }}
      >
        <div className="role" />
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${avatar})` }} />
          <div className="about">
            <h1>{player.name}</h1>
          </div>
        </div>
      </span>
    );
  }

  return (
    <Link to={makeUrl(player.id, build?.url)} className={`player ${getClassName(spec?.role)}`}>
      <div className="role" />
      <div className="card">
        <div className="avatar" style={{ backgroundImage: `url(${avatar})` }} />
        <div className="about">
          <h1
            className={spec.className.replace(' ', '')}
            // The name can't always fit so use a tooltip. We use title instead of the tooltip library for this because we don't want it to be distracting and the tooltip library would popup when hovering just to click an item, while this has a delay.
            title={player.name}
          >
            {player.name}
          </h1>
          <small title={`${spec.specName} ${spec.className}`}>
            <SpecIcon spec={spec} /> {spec.specName} {spec.className}
          </small>
          {covenant && (
            <div className="flex-main text-muted text-small">
              <Icon icon={getCovenantById(covenant)?.icon} /> {covenantName}
            </div>
          )}
          <div className="flex text-muted text-small">
            <div className="flex-main">
              <Icon icon="inv_helmet_03" /> {Math.round(getAverageItemLevel(player.combatant.gear))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayerTile;
