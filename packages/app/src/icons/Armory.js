import React from 'react';

import ArmoryLogo from './images/Armory-logo.png';

const icon = props => (
  <img src={ArmoryLogo} alt="World of Warcraft Armory" className="icon" {...props} />
);

export default icon;
