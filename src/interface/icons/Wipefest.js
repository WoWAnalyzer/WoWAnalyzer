import React from 'react';

import Image from './images/Wipefest-logo.png';

const icon = props => (
  <img src={Image} alt="Wipefest" className="icon" {...props} />
);

export default icon;
