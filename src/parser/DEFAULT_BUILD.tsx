import ArmoryIcon from 'interface/icons/Armory';
import { Build } from 'parser/Config';

const DEFAULT_BUILD: Build = {
  name: 'Standard Build',
  url: 'standard',
  visible: true,
  icon: <ArmoryIcon />,
  talents: [0, 0, 0],
};

export default DEFAULT_BUILD;
