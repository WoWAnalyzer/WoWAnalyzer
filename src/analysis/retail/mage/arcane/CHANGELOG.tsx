import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq, Sref } from 'CONTRIBUTORS';

export default [
  change(date(2024, 7, 29), <>Enhanced Guide view for <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} /></>, Sref),
  change(date(2024, 7, 29), <>Removed ability to load Checklist.</>, Sharrq),
  change(date(2024, 7, 29), <>Increased spec support to 11.0, Partial Support.</>, Sharrq),
  change(date(2024, 7, 29), <>Added a warning to the Overview page for Prepatch.</>, Sharrq),
  change(date(2024, 7, 28), <>Added Guide view and started removing Suggestions and Checklist.</>, Sharrq),
  change(date(2024, 7, 28), <>Complete rewrite of <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />, <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />, <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />, <SpellLink spell={SPELLS.ARCANE_BARRAGE} />, <SpellLink spell={SPELLS.ARCANE_ORB} />, <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />, <SpellLink spell={TALENTS.EVOCATION_TALENT} />, and <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />.</>, Sharrq),
];
