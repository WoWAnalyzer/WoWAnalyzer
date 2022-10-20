import { spellIndexableList } from '../Spell';
import * as SPELLS from 'analysis/classic/priest/SPELLS';

const spells = spellIndexableList({
  RENEWED_HOPE_TALENT: {
    id: SPELLS.RENEWED_HOPE_TALENT,
    name: 'Renewed Hope',
    icon: 'spell_holy_holyprotection',
  },
  PRAYER_OF_MENDING: {
    id: SPELLS.PRAYER_OF_MENDING,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
});

export default spells;
