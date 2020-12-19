import Conduits from './conduits';
import Dungeons from './dungeons';
import Raids from './raids';
import Soulbinds from './soulbinds';
import Covenants from './covenants';
import Legendaries from './legendaries';
import Enchants from './enchants';
import Potions from './potions';
import Oils from './oils';
import Others from './others';

export default {
  ...Conduits,
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
