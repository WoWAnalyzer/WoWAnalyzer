import Anduin from './Anduin';
import Dausegne from './Dausegne';
import Halondrus from './Halondrus';
import Background from './images/overview.jpg';
// Bosses
import Jailer from './Jailer';
import Lihuvim from './Lihuvim';
import LordsOfDread from './LordsOfDread';
import PrototypePantheon from './PrototypePantheon';
import Rygelon from './Rygelon';
import Skolex from './Skolex';
import VigilantGuardian from './VigilantGuardian';
import Xymox from './Xymox';

export default {
  name: 'Sepulcher of the First Ones',
  background: Background,
  bosses: {
    VigilantGuardian,
    Skolex,
    Dausegne,
    Xymox,
    PrototypePantheon,
    Halondrus,
    Lihuvim,
    Anduin,
    LordsOfDread,
    Rygelon,
    Jailer,
  },
};
