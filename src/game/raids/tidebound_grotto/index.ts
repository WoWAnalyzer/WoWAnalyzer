import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './background.jpg';

export default {
  name: 'Tidebound Grotto',
  background,
  bosses: {
    Rotmire: buildBoss({
      id: 3379,
      name: 'Nymrissa Wavecaller',
    }),
  },
} satisfies Raid;
