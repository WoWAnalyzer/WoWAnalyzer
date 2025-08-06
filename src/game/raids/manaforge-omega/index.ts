import { type Raid } from '../index';
import Dimensius from './Dimensius';
import ForgeweaverAraz from './ForgeweaverAraz';
import Fractillus from './Fractillus';
import Loomithar from './Loomithar';
import NexusKingSalhadaar from './NexusKingSalhadaar';
import PlexusSentinel from './PlexusSentinel';
import SoulHunters from './SoulHunters';
import SoulbinderNaazindhri from './SoulbinderNaazindhri';
import background from './backgrounds/ManaforgeOmega.jpg';

export default {
  name: 'Manaforge Omega',
  background,
  bosses: {
    PlexusSentinel,
    Loomithar,
    SoulbinderNaazindhri,
    ForgeweaverAraz,
    SoulHunters,
    Fractillus,
    NexusKingSalhadaar,
    Dimensius,
  },
} satisfies Raid;
