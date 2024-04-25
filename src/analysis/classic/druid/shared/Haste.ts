import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/druid';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    [SPELLS.NATURES_GRACE_BUFF.id]: 0.2,
    [SPELLS.MOONKIN_AURA.id]: 0.03,
  };
}

export default Haste;
