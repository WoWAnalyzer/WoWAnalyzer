/* eslint-disable @typescript-eslint/no-var-requires */
import RubySanctum from './images/RubySanctum.jpg';
import { Raid } from 'game/raids';

export default {
  name: 'Ruby Sanctum',
  background: RubySanctum,
  bosses: {
    Halion: require('./Halion').default,
  },
} satisfies Raid;
