import React from 'react';
import PropTypes from 'prop-types';

import SkullIcon from 'Icons/Skull';
import CancelIcon from 'Icons/Cancel';

import DIFFICULTIES from 'common/DIFFICULTIES';

import ProgressBar from './ProgressBar';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const Fight = ({ difficulty, name, kill, start_time, end_time, wipes, fightPercentage, ...others }) => {
  const duration = Math.round((end_time - start_time) / 1000);

  delete others.boss;
  delete others.bossPercentage;
  delete others.partial;
  delete others.fightPercentage;
  delete others.lastPhaseForPercentageDisplay;

  const Icon = kill ? SkullIcon : CancelIcon;

  return (
    <div className="flex wrapable" {...others}>
      <div className="flex-sub" style={{ minWidth: 350 }}>
        {DIFFICULTIES[difficulty]} {name} {!kill && `(Wipe ${wipes})`}
      </div>
      <div className={`flex-main ${kill ? 'kill' : 'wipe'}`} style={{ whiteSpace: 'nowrap' }}>
        <Icon style={{ fontSize: '1.8em' }} />
        {' '}{formatDuration(duration)}
        <ProgressBar percentage={kill ? 100 : (10000 - fightPercentage) / 100} height={8} />
      </div>
    </div>
  );
};
Fight.propTypes = {
  id: PropTypes.number.isRequired,
  difficulty: PropTypes.number.isRequired,
  boss: PropTypes.number.isRequired,
  start_time: PropTypes.number.isRequired,
  end_time: PropTypes.number.isRequired,
  wipes: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  kill: PropTypes.bool.isRequired,
  fightPercentage: PropTypes.number,
};

export default Fight;
