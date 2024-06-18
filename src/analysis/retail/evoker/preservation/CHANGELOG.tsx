import { change, date } from 'common/changelog';
import { Trevor, Harrek} from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';

export default [
  change(date(2024, 6, 17), <>Add <SpellLink spell={TALENTS_EVOKER.TITANS_GIFT_TALENT} /> module</>, Harrek),
  change(date(2024, 6, 16), <>Add T32 tier set module</>, Trevor),
  change(date(2024, 6, 16), <>Split up linking normalizer files</>, Trevor),
  change(date(2024, 6, 16), <>Cleanup old tier sets</>, Trevor),
  change(date(2024, 6, 16), <>Re-enable Preservation and cleanup dead code</>, Trevor),
];
