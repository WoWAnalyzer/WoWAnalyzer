import React from 'react';

import Image from './images/WarcraftLogs-logo.png';

const icon = props => (
  <img src={Image} alt="Warcraft Logs" className="icon" {...props} />
);

export default icon;
