import { change, date } from 'common/changelog';
import { TALENTS_MONK } from 'common/TALENTS';
import { emallson, Trevor} from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10, 16), <>Added module for <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 16), <>Fixed Uplifted Spirits CDR</>, Trevor),
  change(date(2022, 10, 13), <>Cleaned up MW spells/talents files</>, Trevor),
  change(date(2022, 10, 13), <>Updated Rising Mist module for Dragonflight</>, Trevor),
  change(date(2022, 10, 9), <>Added Secret Infusion haste buff and fixed <SpellLink id={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 8), <>Added support for existing MW talents</>, Trevor),
  change(date(2022, 9, 4), <>Updated guide link in checklist.</>, emallson),
];
