import { change, date } from 'common/changelog';
import { Vollmer, Baumritter, KYZ } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_MID1_ID } from 'common/ITEMS';

export default [
  change(date(2026, 6, 12), <>Fixed display error of <SpellLink spell={SPELLS.DISINTEGRATE} /> module</>, Baumritter),
  change(date(2026, 6, 12), <>Added statistic for tracking empower rank usage.</>, Baumritter),
  change(date(2026, 6, 7), <>Fixed display issues for <SpellLink spell={SPELLS.LEAPING_FLAMES_BUFF} /> </>, Baumritter),
  change(date(2026, 6, 3), <>Updated display of <SpellLink spell={SPELLS.DISINTEGRATE} /> modules</>, Baumritter),
  change(date(2026, 6, 1), <>Updated display of <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> module</>, Baumritter),
  change(date(2026, 5, 24), <>Corrected logging issues for <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /></>, Baumritter),
  change(date(2026, 5, 10), <>Added breakdown chart for <SpellLink spell={TALENTS.CONSUME_FLAME_TALENT} /> triggers</>, KYZ),
  change(date(2026, 4, 20), <>Fixed <SpellLink spell={SPELLS.HOVER} /> not counting as castable while casting</>, Baumritter),
  change(date(2026, 3, 30),  <>Update <SpellLink spell={TALENTS.WINGLEADER_TALENT} /> CDR modifier.</>, Vollmer),
  change(date(2026, 3, 23), "Update guide section for midnight and introduce new No Wasted Buffs section.", Vollmer),
  change(date(2026, 3, 17), <>Add statistics for <SpellLink spell={TALENTS.RISING_FURY_3_DEVASTATION_TALENT}/> and <ItemSetLink id={EVOKER_MID1_ID}>MID Season 1 Tier Set</ItemSetLink>.</>, Vollmer),
  change(date(2026, 2, 7), <>Add statistics for <SpellLink spell={TALENTS.CONCENTRATED_POWER_TALENT} />.</>, Vollmer),
  change(date(2026, 2, 1), <>Improve statistics for <SpellLink spell={TALENTS.IRIDESCENCE_TALENT} />.</>, Vollmer),
  change(date(2026, 1, 27), "Improve Empower handling to handle bugged casts", Vollmer),
  change(date(2026, 1, 27), <>Add statistics for <SpellLink spell={TALENTS.ESSENCE_WELL_TALENT}/>, <SpellLink spell={TALENTS.TWIN_FLAME_TALENT}/> and <SpellLink spell={TALENTS.FIRE_TORRENT_TALENT}/>.</>, Vollmer),
  change(date(2026, 1, 25), <>Add statistics for <SpellLink spell={TALENTS.STRAFING_RUN_TALENT}/>, <SpellLink spell={TALENTS.AZURE_SWEEP_TALENT}/>, <SpellLink spell={TALENTS.SHATTERING_STARS_TALENT}/> and <SpellLink spell={TALENTS.STAR_SALVO_TALENT}/>.</>, Vollmer),
  change(date(2026, 1, 17), <>Update <SpellLink spell={TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT}/> module for Midnight.</>, Vollmer),
  change(date(2026, 1, 12), "Update core talent modules and improve Disintegrate analysis accuracy", Vollmer),
  change(date(2026, 1, 9), "Initial Midnight support", Vollmer),
];
