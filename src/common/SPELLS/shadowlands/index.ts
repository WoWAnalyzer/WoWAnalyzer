import { spellIndexableList } from '../Spell';
import Conduits from './conduits';
import Covenants from './covenants';
import Crafted from './crafted';
import Enchants from './enchants';
import Legendaries from './legendaries';
import Oils from './oils';
import Others from './others';
import Potions from './potions';
import Soulbinds from './soulbinds';

const spells = spellIndexableList({
  ...Conduits,
  ...Crafted,
  ...Soulbinds,
  ...Covenants,
  ...Legendaries,
  ...Enchants,
  ...Potions,
  ...Oils,
  ...Others,
});

export default spells;
