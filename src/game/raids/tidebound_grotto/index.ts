import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './background.jpg';

export default {
  name: 'Tidebound Grotto',
  background,
  bosses: {
    NymrissaWavecaller: buildBoss({
      id: 3379,
      name: 'Nymrissa Wavecaller',
    }),
  },
} satisfies Raid;
