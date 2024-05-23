import { Raid } from 'game/raids';
import ConclaveOfWind from './ConclaveOfWind';

export const bot = {
  name: 'Bastion of Twilight',
  bosses: {},
} satisfies Raid;

export const bwd = {
  name: 'Blackwing Descent',
  bosses: {},
} satisfies Raid;

export const totfw = {
  name: 'Throne of the Four Winds',
  bosses: {
    ConclaveOfWind,
  },
} satisfies Raid;
