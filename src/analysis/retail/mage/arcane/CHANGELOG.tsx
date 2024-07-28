import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

export default [
  change(date(2024, 7, 28), <>Added Guide view and started removing Suggestions and Checklist.</>, Sharrq),
  change(date(2024, 7, 28), <>Complete rewrite of <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />, <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />, <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />, <SpellLink spell={SPELLS.ARCANE_BARRAGE} />, <SpellLink spell={SPELLS.ARCANE_ORB} />, <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />, <SpellLink spell={TALENTS.EVOCATION_TALENT} />, and <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />.</>, Sharrq),
  change(date(2024, 6, 15), <>Removed the Radiant Spark, Rule of Threes, and Arcane Familiar modules.</>, Sharrq),
  change(date(2024, 6, 15), <>Updated the Arcane Spec Spellbook and the Mage Class Spellbook.</>, Sharrq),
  change(date(2024, 6, 15), <>Initial The War Within support.</>, Sharrq),
];
