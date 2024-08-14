import { change, date } from 'common/changelog';
import { Trevor, Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';

export default [
  change(date(2024, 8, 11), <>Update <SpellLink spell={TALENTS_EVOKER.TITANIC_WRATH_TALENT}/> multiplier</>, Vollmer), 
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS_EVOKER.MELT_ARMOR_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS_EVOKER.MIGHT_OF_THE_BLACK_DRAGONFLIGHT_TALENT}/> module</>, Vollmer),
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT}/> module</>, Vollmer),
  change(date(2024, 8, 10), <>Add Always Be Casting guide section</>, Vollmer), 
  change(date(2024, 7, 22), <>Update <SpellLink spell={TALENTS_EVOKER.HEAT_WAVE_TALENT}/> and <SpellLink spell={TALENTS_EVOKER.HONED_AGGRESSION_TALENT}/> multipliers</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS_EVOKER.SCORCHING_EMBERS_TALENT} /> module</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS_EVOKER.IMMINENT_DESTRUCTION_DEVASTATION_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 19), <>Update IDs for <SpellLink spell={SPELLS.DEEP_BREATH} /></>, Vollmer),
  change(date(2024, 6, 30), <>Update periodic IDs for <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> module</>, Vollmer),
  change(date(2024, 6, 22), <>Add <SpellLink spell={TALENTS_EVOKER.RED_HOT_TALENT} /> module</>, Trevor),
  change(date(2024, 6, 20), <>Integrate <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> into <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Add <SpellLink spell={TALENTS_EVOKER.FAN_THE_FLAMES_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Implement <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 16), <>Implement <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> module</>, Trevor),
];
