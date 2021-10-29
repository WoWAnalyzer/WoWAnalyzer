import ArmoryIcon from 'interface/icons/Armory';
import { Build } from 'parser/Config';
import React from 'react';

const DEFAULT_BUILD: Build = {
  name: 'Standard Build',
  url: 'standard',
  visible: true,
  icon: <ArmoryIcon />,
};

export default DEFAULT_BUILD;
