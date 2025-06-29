import { change, date } from 'common/changelog';
import { Trevor, Vollmer, KYZ } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';

export default [
  change(date(2025, 6, 20), "Update example report for 11.1.7", Vollmer),
  change(date(2025, 4, 17), <>Update Empower performance evaluation for <SpellLink spell={SPELLS.JACKPOT_BUFF}/> module</>, Vollmer),
  change(date(2025, 4, 11), <>Fix consumption tracking for <SpellLink spell={SPELLS.JACKPOT_BUFF} /> module</>, Vollmer),
  change(date(2025, 4, 11), <>Update Guide section for <SpellLink spell={SPELLS.DISINTEGRATE}/></>, Vollmer),
  change(date(2025, 3, 27), <>Fix some issues for <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> & <SpellLink spell={SPELLS.DISINTEGRATE}/> module</>, Vollmer),
  change(date(2025, 3, 25), <>Update Empower performance evaluation for <SpellLink spell={SPELLS.JACKPOT_BUFF}/> module</>, Vollmer),
  change(date(2025, 3, 25), <>Implement <SpellLink spell={TALENTS_EVOKER.FLAME_SIPHON_TALENT}/> module</>, Vollmer), 
  change(date(2025, 3, 24), <>Add a Guide Section for <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/></>, Vollmer),
  change(date(2025, 3, 3), <>Implement TWW S2 4pc module</>, Vollmer),
  change(date(2025, 2, 25), <>Update various modules & abilities for 11.1</>, Vollmer),
  change(date(2025, 2, 25), <>Update handling of <SpellLink spell={TALENTS_EVOKER.MASS_DISINTEGRATE_TALENT}/> ticks</>, Vollmer),
  change(date(2025, 1, 16), <>Implement <SpellLink spell={TALENTS_EVOKER.TIME_SPIRAL_TALENT}/> module</>, KYZ),
  change(date(2024, 11, 18), <>Update <SpellLink spell={TALENTS_EVOKER.SHATTERING_STAR_TALENT}/> & <SpellLink spell={TALENTS_EVOKER.ETERNITY_SURGE_TALENT}/> cooldown when using TWW1 4pc</>, Vollmer),
  change(date(2024, 10, 4), <>Fix an issue with external <SpellLink spell={TALENTS_EVOKER.RENEWING_BLAZE_TALENT}/> for MajorDefensive module</>, Vollmer),
  change(date(2024, 9, 10), "Update various Modules & Guide Sections for TWW S1", Vollmer),
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS_EVOKER.WINGLEADER_TALENT}/> module</>, Vollmer),
  change(date(2024, 9, 6), <>Update MajorDefensive module for <SpellLink spell={TALENTS_EVOKER.LIFECINDERS_TALENT}/> and <SpellLink spell={TALENTS_EVOKER.HARDENED_SCALES_TALENT}/></>, Vollmer), 
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS_EVOKER.SLIPSTREAM_TALENT}/> module</>, Vollmer), 
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS_EVOKER.EXTENDED_BATTLE_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 14), <>Implement <SpellLink spell={TALENTS_EVOKER.DIVERTED_POWER_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 14), <>Implement <SpellLink spell={TALENTS_EVOKER.UNRELENTING_SIEGE_TALENT}/> module</>, Vollmer), 
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
  change(date(2024, 6, 19), <>Add Fan The Flames module</>, Trevor),
  change(date(2024, 6, 19), <>Implement <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 16), <>Implement <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> module</>, Trevor),
];
