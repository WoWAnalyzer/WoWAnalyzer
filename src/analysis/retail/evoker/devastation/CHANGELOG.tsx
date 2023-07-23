import { change, date } from 'common/changelog';
import { ToppleTheNun, Tyndi, Vireve, Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';

export default [
  change(date(2023, 7, 23), 'Update example log.', Vollmer),
  change(date(2023, 7, 18), 'Update patch compatability for 10.1.5.', Vollmer),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 30), <>Added <SpellLink spell={SPELLS.DISINTEGRATE} />, <SpellLink spell={SPELLS.FIRE_BREATH} />, and <SpellLink spell={SPELLS.ETERNITY_SURGE} /> to channel list.</>, Vollmer),
  change(date(2023, 6, 11), <>Updated Guides for 10.1</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.ARCANE_INTENSITY_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.ENGULFING_BLAZE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.EYE_OF_INFINITY_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.HEAT_WAVE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.HONED_AGGRESSION_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.IRIDESCENCE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.LAY_WASTE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.SPELLWEAVERS_DOMINANCE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 10), <>Added <SpellLink spell={TALENTS.TITANIC_WRATH_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 9), <>Added <SpellLink spell={TALENTS.CATALYZE_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 9), <>Added <SpellLink spell={TALENTS.SCINTILLATION_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 9), <>Added <SpellLink spell={TALENTS.VOLATILITY_TALENT} /> module</>, Vollmer),
  change(date(2023, 6, 9), <>Added T30 module along with a guide</>, Vollmer),
  change(date(2023, 6, 6), <>Added CDR handling from <SpellLink spell={TALENTS.CAUSALITY_TALENT} /> along with a module</>, Vollmer),
  change(date(2023, 6, 3), 'Initial update for 10.1', Vollmer),
  change(date(2022, 12, 31), 'Move rotation module further down and mark experimental', Vireve),
  change(date(2022, 12, 25), 'Initialize a primitive guide for Devastation!', Vireve),
  change(date(2022, 10, 25), 'Updated abilities list to include all available abilities.', Tyndi),
  change(date(2022, 9, 30), <>Added first module to Devastation</>, Tyndi),
];
