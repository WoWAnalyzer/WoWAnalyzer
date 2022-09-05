import { spellIndexableList } from '../Spell';
import Conduits from './conduits';
import Covenants from './covenants';
import Crafted from './crafted';
import Dungeons from './dungeons';
import Enchants from './enchants';
import Legendaries from './legendaries';
import Oils from './oils';
import Others from './others';
import Potions from './potions';
import Raids from './raids';
import Soulbinds from './soulbinds';

const spells = spellIndexableList({
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
});

export default spells;
