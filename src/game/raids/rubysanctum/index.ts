import RubySanctum from './images/RubySanctum.jpg';
import Halion from './Halion';
import type { Raid } from 'game/raids';

export default {
  name: 'Ruby Sanctum',
  background: RubySanctum,
  bosses: {
    Halion,
  },
} satisfies Raid;
