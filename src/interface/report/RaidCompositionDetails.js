import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';

class RaidCompositionDetails extends React.PureComponent {
  static propTypes = {
    tanks: PropTypes.number.isRequired,
    healers: PropTypes.number.isRequired,
    dps: PropTypes.number.isRequired,
    ranged: PropTypes.number.isRequired,
    ilvl: PropTypes.number.isRequired,
    heartLvl: PropTypes.number.isRequired,
  };

  render() {
    const { tanks, healers, dps, ranged, ilvl, heartLvl } = this.props;

    return (
      <div className="raid-composition">
        <div className="bar">
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="flex">
              <div className="flex-sub icon">
                <Icon icon="inv_helmet_03" />
                <div className="role-count" style={{ fontSize: '0.78em' }}>
                  {/*Ilvl is gonna be a larger number than the composition so it's shrunk slightly to avoid different sized tiles */}
                  {Math.round(ilvl)}
                </div>
              </div>
              <div className="flex-sub icon">
                <Icon icon="inv_heartofazeroth" />
                <div className="role-count" style={{ fontSize: '0.78em' }}>
                  {/*heartLvl is gonna be a larger number than the composition so it's shrunk slightly to avoid different sized tiles */}
                  {Math.round(heartLvl)}
                </div>
              </div>
              <div className="flex-sub icon">
                <img
                  src="/roles/tank.jpg"
                  alt="Tanks"
                />
                <div className="role-count">
                  {tanks}
                </div>
              </div>
              <div className="flex-sub icon">
                <img
                  src="/roles/healer.jpg"
                  alt="Healers"
                />
                <div className="role-count">
                  {healers}
                </div>
              </div>
              <div className="flex-sub icon">
                <img
                  src="/roles/dps.jpg"
                  alt="DPS"
                />
                <div className="role-count">
                  {dps}
                </div>
              </div>
              <div className="flex-sub icon">
                <img
                  src="/roles/dps.ranged.jpg"
                  alt="Ranged DPS"
                />
                <br />
                <div className="role-count">
                  {ranged}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RaidCompositionDetails;
