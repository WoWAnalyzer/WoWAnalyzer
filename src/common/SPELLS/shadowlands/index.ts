import Conduits from './conduits';
import Crafted from './crafted';
import Dungeons from './dungeons';
import Raids from './raids';
import Soulbinds from './soulbinds';
import Covenants from './covenants';
import Legendaries from './legendaries';
import Enchants from './enchants';
import Potions from './potions';
import Oils from './oils';
import Others from './others';

const spells = {
  ...Conduits,
  ...Crafted,
  ...Dungeons,
  ...Raids,
  ...Soulbinds,
  ...Covenants,
  ...Legendaries,
  ...Enchants,
  ...Potions,
  ...Oils,
  ...Others,
} as const;

export default spells; 