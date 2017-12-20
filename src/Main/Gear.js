import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getPlayerName } from 'selectors/url/report';

class Gear extends React.PureComponent {
  static propTypes = {
    combatants: PropTypes.object.isRequired,
    playerName: PropTypes.string.isRequired,
  };
  render() {
    const playersList = this.props.combatants.players;
    const iconBaseUrl = 'http://render-us.worldofwarcraft.com/icons/56/';
    const toolTipBaseUrl='http://www.wowhead.com/item=';
    let currentPlayer;
    for (const prop in playersList) {
      if (playersList[prop]._combatantInfo.name === this.props.playerName) {
        currentPlayer=  playersList[prop]._combatantInfo;
      }
    }
    return(
      <div>
        <div style={{marginLeft: 'auto', marginRight: 'auto', display: 'block', width: '90%'}}>
          {currentPlayer.gear.map(item => {
            return (
              <div style={{display: 'inline-block', textAlign: 'center'}}>
                {item.itemLevel}
                <a key={item.id} href={`${toolTipBaseUrl}${item.id}`} style={{ margin: '5px', display: 'block' }}>
                  <img  alt='' target='_blank' rel='noopener noreferrer' src={`${iconBaseUrl}${item.icon}`}/>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  playerName: getPlayerName(state),
});

export default connect(
  mapStateToProps
)(Gear);
