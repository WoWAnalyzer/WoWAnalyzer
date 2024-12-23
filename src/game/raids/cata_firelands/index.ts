import { Raid } from 'game/raids';
import Alysrazor from './Alysrazor';
import Baleroc from './Baleroc';
import Bethtilac from './Bethtilac';
import LordRhyolith from './LordRhyolith';
import MajordomoStaghelm from './MajordomoStaghelm';
import Ragnaros from './Ragnaros';
import Shannox from './Shannox';

export default {
  name: 'Firelands',
  bosses: {
    Shannox,
    LordRhyolith,
    Bethtilac,
    Alysrazor,
    Baleroc,
    MajordomoStaghelm,
    Ragnaros,
  },
} satisfies Raid;
