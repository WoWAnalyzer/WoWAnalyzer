import { change, date } from 'common/changelog';
import { Vollmer } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/evoker';

export default [
  change(date(2026, 2, 1), <>Improve statistics for <SpellLink spell={TALENTS.IRIDESCENCE_TALENT} />.</>, Vollmer),
  change(date(2026, 1, 27), "Improve Empower handling to handle bugged casts", Vollmer),
  change(date(2026, 1, 27), <>Add statistics for <SpellLink spell={TALENTS.ESSENCE_WELL_TALENT}/>, <SpellLink spell={TALENTS.TWIN_FLAME_TALENT}/> and <SpellLink spell={TALENTS.FIRE_TORRENT_TALENT}/>.</>, Vollmer),
  change(date(2026, 1, 25), <>Add statistics for <SpellLink spell={TALENTS.STRAFING_RUN_TALENT}/>, <SpellLink spell={TALENTS.AZURE_SWEEP_TALENT}/>, <SpellLink spell={TALENTS.SHATTERING_STARS_TALENT}/> and <SpellLink spell={TALENTS.STAR_SALVO_TALENT}/>.</>, Vollmer),
  change(date(2026, 1, 17), <>Update <SpellLink spell={TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT}/> module for Midnight.</>, Vollmer),
  change(date(2026, 1, 12), "Update core talent modules and improve Disintegrate analysis accuracy", Vollmer),
  change(date(2026, 1, 9), "Initial Midnight support", Vollmer),
];
