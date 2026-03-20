import { change, date } from 'common/changelog';
import { Topple, Texleretour } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';
import SpellLink from 'interface/SpellLink';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

// prettier-ignore
export default [
  change(date(2026, 3, 20), 'Add disclaimer regarding Reap-related analysis', Texleretour),
  change(date(2026, 2, 7), <>{<SpellLink spell={TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT} />} cast analysis</>, Texleretour),
  change(date(2026, 2, 3), 'Core analysis', Texleretour),
  change(date(2026, 1, 30), 'Add more complete foundation', Texleretour),
  change(date(2025, 10, 24), 'Add basic support for the spec.', Topple),
  ...SHARED_CHANGELOG,
];
