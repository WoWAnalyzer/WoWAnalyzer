import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'interface/Icon';

const RaidCompositionDetails = props => {
  const { tanks, healers, dps, ranged, ilvl } = props;

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
};

RaidCompositionDetails.propTypes = {
  tanks: PropTypes.number.isRequired,
  healers: PropTypes.number.isRequired,
  dps: PropTypes.number.isRequired,
  ranged: PropTypes.number.isRequired,
  ilvl: PropTypes.number.isRequired,
};

export default RaidCompositionDetails;
