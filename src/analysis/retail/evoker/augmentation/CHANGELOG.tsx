import { change, date } from 'common/changelog';
import { Vollmer, KYZ } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2025, 2, 26), <>Updated for 11.1. Updated <SpellLink spell={TALENTS.EBON_MIGHT_TALENT}/> module. Added a module for <SpellLink spell={TALENTS.UPHEAVAL_TALENT}/> <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF}/> procs. Multiple adjustments when <SpellLink spell={TALENTS.MOTES_OF_POSSIBILITY_TALENT}/> talent is taken.</>, KYZ),
  change(date(2025, 1, 21), "Update guide section", KYZ),
  change(date(2025, 1, 16),  <>Implement <SpellLink spell={TALENTS.TIME_SPIRAL_TALENT}/>, <SpellLink spell={TALENTS.TIME_CONVERGENCE_TALENT}/>, <SpellLink spell={TALENTS.MASTER_OF_DESTINY_TALENT}/>, <SpellLink spell={TALENTS.MOTES_OF_ACCELERATION_TALENT}/>, <SpellLink spell={TALENTS.GOLDEN_OPPORTUNITY_TALENT}/>, <SpellLink spell={TALENTS.OVERLORD_TALENT}/>, and <SpellLink spell={TALENTS.HOARDED_POWER_TALENT}/> modules</>, KYZ),
  change(date(2024, 12, 30), "Update guide section", KYZ),
  change(date(2024, 12, 27), <>Implement <SpellLink spell={TALENTS.MOMENTUM_SHIFT_TALENT}/>, <SpellLink spell={TALENTS.PRIMACY_TALENT}/> and <SpellLink spell={SPELLS.VOLCANIC_UPSURGE}/> modules</>, KYZ),
  change(date(2024, 12, 25), <>Add <SpellLink spell={TALENTS.REVERBERATIONS_TALENT}/> damage to <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> statistics</>, Vollmer),
  change(date(2024, 12, 22), <>Implement <SpellLink spell={TALENTS.REVERBERATIONS_TALENT}/> module</>, KYZ),
  change(date(2024, 12, 22), <>Enable <SpellLink spell={TALENTS.CHRONO_FLAME_TALENT}/> and <SpellLink spell={TALENTS.THREADS_OF_FATE_TALENT}/> modules</>, KYZ),
  change(date(2024, 11, 26), <>Update multipliers for <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> module & add guide section</>, Vollmer),
  change(date(2024, 11, 18), <>Fix issue with <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> module when buff targets don't have proper combatant info</>, Vollmer),
  change(date(2024, 10, 24), <>Fix event issues with <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> & MajorDefensives modules</>, Vollmer),
  change(date(2024, 10, 4), <>Fix an issue with external <SpellLink spell={TALENTS.RENEWING_BLAZE_TALENT}/> for MajorDefensive module</>, Vollmer),
  change(date(2024, 10, 4), <>Fix some edgecases for <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> module</>, Vollmer),
  change(date(2024, 9, 16), "Update Buff Helper note gen for Frame Glows WA", Vollmer),
  change(date(2024, 9, 10), "Update Ability Filters for Helper Modules for TWW S1", Vollmer),
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS.WINGLEADER_TALENT}/> module</>, Vollmer),
  change(date(2024, 9, 6), <>Update MajorDefensive module for <SpellLink spell={TALENTS.LIFECINDERS_TALENT}/> and <SpellLink spell={TALENTS.HARDENED_SCALES_TALENT}/></>, Vollmer), 
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS.SLIPSTREAM_TALENT}/> module</>, Vollmer), 
  change(date(2024, 9, 6), <>Implement <SpellLink spell={TALENTS.EXTENDED_BATTLE_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 14), <>Implement <SpellLink spell={TALENTS.DIVERTED_POWER_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 14), <>Implement <SpellLink spell={TALENTS.UNRELENTING_SIEGE_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 11), 'Bump compatibility to 11.0.2', Vollmer), 
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS.MELT_ARMOR_TALENT}/> module</>, Vollmer), 
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS.MIGHT_OF_THE_BLACK_DRAGONFLIGHT_TALENT}/> module</>, Vollmer),
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS.MASS_ERUPTION_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 22), <>Update <SpellLink spell={TALENTS.REACTIVE_HIDE_TALENT}/> multiplier</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS.RUMBLING_EARTH_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 19), <>Update IDs for <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /></>, Vollmer),
  change(date(2024, 7, 18), <>Add <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> module</>, Vollmer),
];
