import React from 'react';
import PropTypes from 'prop-types';

import SkullIcon from 'Icons/Skull';
import CancelIcon from 'Icons/Cancel';

import ProgressBar from './ProgressBar';
import DIFFICULTIES from './DIFFICULTIES';

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
    <div className="row" {...others}>
      <div className="col-xs-6 col-sm-5 col-md-4 col-lg-3">
        {DIFFICULTIES[difficulty]} {name} {!kill && `(Wipe ${wipes})`}
      </div>
      <div className={`col-xs-6 col-sm-7 col-md-8 col-lg-9 ${kill ? 'kill' : 'wipe'}`}>
        <Icon style={{ fontSize: '1.8em', display: 'inline-block', marginBottom: '-0.25em' }} />
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
