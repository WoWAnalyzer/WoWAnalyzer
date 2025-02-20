import { Raid } from '../index';
import Cauldron from './Cauldron';
import Gallywix from './Gallywix';
import MugZee from './MugZee';
import OneArmedBandit from './OneArmedBandit';
import RikReverb from './RikReverb';
import Sprocketmonger from './Sprocketmonger';
import Stix from './Stix';
import Vexie from './Vexie';
import background from './backgrounds/Undermine.jpg';

export default {
  name: 'Liberation of Undermine',
  background,
  bosses: {
    Vexie,
    Stix,
    Cauldron,
    RikReverb,
    Sprocketmonger,
    OneArmedBandit,
    MugZee,
    Gallywix,
  },
} satisfies Raid;
