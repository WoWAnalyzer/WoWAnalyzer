import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import SpecIcon from 'common/SpecIcon';
import Icon from 'common/Icon';
import { Character } from 'common/character';
import { getClassName } from 'game/ROLES';
import getAverageItemLevel from 'game/getAverageItemLevel';
import SPECS from 'game/SPECS';
import { getCharacterById } from 'interface/selectors/characters';
import { fetchCharacter, SUPPORTED_REGIONS } from 'interface/actions/characters';

import { getCovenantById } from 'game/shadowlands/COVENANTS';

import { Player } from './index';

interface Props {
  player: Player;
  makeUrl: (playerId: string) => string;
  characterInfo: Character;
  fetchCharacter: (characterId: string, region: string, realm: string, name: string) => void;
}

const PlayerTile = (props: Props) => {
  const { player, characterInfo, makeUrl, fetchCharacter } = props;

  useEffect(() => {
    const load = async () => {
      if (!SUPPORTED_REGIONS.includes(player.region)) {
        return null;
      }

      try {
        return await fetchCharacter(player.guid, player.region, player.server, player.name);
      } catch (err) {
        // No biggy, just show less info
        console.error('An error occured fetching', player, '. The error:', err);
        return null;
      }
    };

    if (!characterInfo) {
      // noinspection JSIgnoredPromiseFromCall
      load();
    }
  }, [characterInfo, player, fetchCharacter]);

  const avatar = characterInfo?.thumbnail
    ? `https://render-${
        characterInfo.region
      }.worldofwarcraft.com/character/${characterInfo.thumbnail.replace('avatar', 'inset')}`
    : '/img/fallback-character.jpg';
  const spec = SPECS[player.combatant.specID];
  const analysisUrl = makeUrl(player.id);
  const covenant = player.combatant.covenantID || null;
  let covenantIcon = "";
  let covenantName: string | undefined = '';
  if(covenant!==null){
    covenantName = getCovenantById(covenant)?.name;
    covenantIcon = '/covenant/' + covenantName + '.jpg';
  }

  const isParsable = !player.combatant.error && spec;

  return isParsable ? (
    <Link to={analysisUrl} className={`player ${getClassName(spec.role)}`}>
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
            <SpecIcon id={spec.id} /> {spec.specName} {spec.className}
          </small>
          {covenant && (
              <div className="flex-main text-muted text-small">
                <img src={covenantIcon} className="icon game" alt="The icon for your Covenant!"/> {covenantName}
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
  ) : (
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
};

const mapStateToProps = (state: any, { player }: { player: Player }) => ({
  characterInfo: getCharacterById(state, player.guid),
});
export default connect(mapStateToProps, {
  fetchCharacter,
})(PlayerTile);
