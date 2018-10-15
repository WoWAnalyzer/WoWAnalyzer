import React from 'react';
import PropTypes from 'prop-types';
import Textfit from 'react-textfit';
import { Trans } from '@lingui/macro';

import getBossName from 'common/getBossName';
import SpecIcon from 'common/SpecIcon';

import SkullRaidMarker from './images/skull-raidmarker.png';

class Headers extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        className: PropTypes.string.isRequired,
        specName: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    playerName: PropTypes.string.isRequired,
    playerIcon: PropTypes.string,
    boss: PropTypes.shape({
      headshot: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object.isRequired,
  };

  render() {
    const { config: { spec }, playerName, playerIcon, boss, fight } = this.props;

    return (
      <header>
        <div className={`player ${spec.className.replace(' ', '')}`}>
          {playerIcon ? <img src={playerIcon} alt="" /> : <SpecIcon id={spec.id} style={{ marginTop: 0 }} />}{' '}
          <Textfit mode="single" max={80}>
            {playerName}
          </Textfit>
        </div>
        <div className="versus"><Trans>versus</Trans></div>
        <div className="boss">
          <img src={boss ? boss.headshot : SkullRaidMarker} alt="" />
          <Textfit mode="single" max={80}>
            {getBossName(fight)}
          </Textfit>
        </div>
      </header>
    );
  }
}

export default Headers;
