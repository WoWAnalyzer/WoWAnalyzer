import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './background.jpg';

export default {
  name: 'Sporefall',
  background,
  bosses: {
    Rotmire: buildBoss({
      id: 3159,
      name: 'Rotmire',
    }),
  },
} satisfies Raid;
