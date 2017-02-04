import React from 'react';

const Progress = ({ progress }) => (
  <div className="progress">
    <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${progress}%` }}>
      {progress}%
    </div>
  </div>
);

export default Progress;
