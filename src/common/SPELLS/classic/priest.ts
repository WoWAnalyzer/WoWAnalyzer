/**
 * All Priest abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

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
