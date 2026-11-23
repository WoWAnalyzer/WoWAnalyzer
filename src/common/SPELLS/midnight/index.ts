import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Embellishments from './embellishments';
import Flasks from './flasks';
import Food from './food';
import Others from './others';
import Potions from './potions';
import Raids from './raids';
import Trinkets from './trinkets';
import Engineering from './engineering';

const spells = safeMerge(
  Enchants,
  Embellishments,
  Flasks,
  Food,
  Others,
  Potions,
  Raids,
  Trinkets,
  Engineering,
);

export default spells;
