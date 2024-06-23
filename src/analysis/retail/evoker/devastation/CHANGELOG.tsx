import { change, date } from 'common/changelog';
import { Trevor } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS/evoker';

export default [
  change(date(2024, 6, 20), <>Integrate <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> into <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Add <SpellLink spell={TALENTS_EVOKER.FAN_THE_FLAMES_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Implement <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 16), <>Implement <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> module</>, Trevor),
];
