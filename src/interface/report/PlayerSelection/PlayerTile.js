import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import SpecIcon from 'common/SpecIcon';
import { getClassName } from 'game/ROLES';
import getAverageItemLevel from 'game/getAverageItemLevel';
import Icon from 'common/Icon';
import SPECS from 'game/SPECS';
import { getCharacterById } from 'interface/selectors/characters';
import { fetchCharacter, SUPPORTED_REGIONS } from 'interface/actions/characters';

class PlayerTile extends React.PureComponent {
  static propTypes = {
    player: PropTypes.object.isRequired,
    makeUrl: PropTypes.func.isRequired,
    characterInfo: PropTypes.shape({
      region: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      heartOfAzeroth: PropTypes.any,
    }),
    fetchCharacter: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    if (!this.props.characterInfo) {
      // noinspection JSIgnoredPromiseFromCall
      this.load();
    }
  }

  async load() {
    const { player, fetchCharacter } = this.props;
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
  }

  render() {
    const { player, characterInfo, makeUrl } = this.props;
    const avatar = characterInfo && characterInfo.thumbnail ? `https://render-${characterInfo.region}.worldofwarcraft.com/character/${characterInfo.thumbnail.replace('avatar', 'inset')}` : '/img/fallback-character.jpg';
    const spec = SPECS[player.combatant.specID];
    const analysisUrl = makeUrl(player.id);
    const heartOfAzeroth = characterInfo && characterInfo.heartOfAzeroth ? characterInfo.heartOfAzeroth : null;

    player.parsable = !player.combatant.error && spec;
    if (!player.parsable) {
      return (
        <span
          className="player"
          onClick={() => {
            alert(`This player can not be parsed. Warcraft Logs ran into an error parsing the log and is not giving us all the necessary information. Please update your Warcraft Logs Uploader and reupload your log to try again.`);
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
      <Link
        to={analysisUrl}
        className={`player ${getClassName(spec.role)}`}
      >
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
            <small
              title={`${spec.specName} ${spec.className}`}
            >
              <SpecIcon id={spec.id} /> {spec.specName} {spec.className}
            </small>
            <div className="flex text-muted text-small">
              <div className="flex-main">
                <Icon icon="inv_helmet_03" /> {Math.round(getAverageItemLevel(player.combatant.gear))}
              </div>

              {heartOfAzeroth && (
                <div className="flex-main text-right">
                  <Icon icon={heartOfAzeroth.icon} /> {heartOfAzeroth.azeriteItemLevel}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

const mapStateToProps = (state, { player }) => ({
  characterInfo: getCharacterById(state, player.guid),
});
export default connect(
  mapStateToProps,
  {
    fetchCharacter,
  },
)(PlayerTile);
