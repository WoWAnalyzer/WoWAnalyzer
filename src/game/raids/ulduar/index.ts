import type { Raid } from 'game/raids';

import Ulduar from './images/Ulduar.jpg';
import FlameLeviathan from './FlameLeviathan';
import Ignis from './Ignis';
import Razorscale from './Razorscale';
import XT002 from './XT002';
import IronCouncil from './IronCouncil';
import Kologarn from './Kologarn';
import Auriaya from './Auriaya';
import Hodir from './Hodir';
import Thorim from './Thorim';
import Freya from './Freya';
import Mimiron from './Mimiron';
import GeneralVezax from './GeneralVezax';
import YoggSaron from './YoggSaron';
import Algalon from './Algalon';

export default {
  name: 'Ulduar', // T8
  background: Ulduar,
  bosses: {
    FlameLeviathan,
    Ignis,
    Razorscale,
    XT002,
    IronCouncil,
    Kologarn,
    Auriaya,
    Hodir,
    Thorim,
    Freya,
    Mimiron,
    GeneralVezax,
    YoggSaron,
    Algalon,
  },
} satisfies Raid;
