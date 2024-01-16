import { change, date } from 'common/changelog';
import { ToppleTheNun, Tyndi, Vireve, Vollmer } from 'CONTRIBUTORS';
import { ResourceLink, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default [
  change(date(2023, 12, 31), <>Improved tracking of <ResourceLink id={RESOURCE_TYPES.ESSENCE.id}/> for a more precise representation on the <ResourceLink id={RESOURCE_TYPES.ESSENCE.id}/> Graph.</>, Vollmer),
  change(date(2023, 12, 6), <>Update APL Check.</>, Vollmer),
  change(date(2023, 11, 30), <>Update <SpellLink spell={SPELLS.DISINTEGRATE}/> guide section.</>, Vollmer),
  change(date(2023, 11, 12), <>Properly track dropped ticks when only 1 tick is remaining for <SpellLink spell={SPELLS.DISINTEGRATE}/> graph.</>, Vollmer),
  change(date(2023, 10, 30), <>Removed rogue points in <SpellLink spell={SPELLS.DISINTEGRATE}/> graph.</>, Vollmer),
  change(date(2023, 10, 21), <>Added stats for T31 4pc buff <SpellLink spell={SPELLS.EMERALD_TRANCE_T31_2PC_BUFF}/>.</>, Vollmer),
  change(date(2023, 10, 20), <>Added stats for T31 2pc buff <SpellLink spell={SPELLS.EMERALD_TRANCE_T31_2PC_BUFF}/>.</>, Vollmer),
  change(date(2023, 9, 8), <>Add graph for <SpellLink spell={SPELLS.DISINTEGRATE}/> module for more in-depth analysis.</>, Vollmer),
  change(date(2023, 8, 25), <>Add <SpellLink spell={TALENTS.LEAPING_FLAMES_TALENT} /> module.</>, Vollmer),
  change(date(2023, 7, 26), <>Update <SpellLink spell={TALENTS.CAUSALITY_TALENT} /> module & CDR calculation.</>, Vollmer),
  change(date(2023, 7, 24), <>Added <SpellLink spell={SPELLS.DEEP_BREATH} /> to channel list.</>, Vollmer),
  change(date(2023, 7, 24), 'Update APL Check.', Vollmer),
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
