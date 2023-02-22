import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import { Arlie, Fassbrause, niseko, Vetyst, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 2, 22), <>Added <SpellLink id={TALENTS.PRIMAL_TIDE_CORE_TALENT.id}/> module. Added event linking to improve the accuracy of <SpellLink id={TALENTS.PRIMORDIAL_WAVE_TALENT.id}/> and for future guide / module implemenation. Updated sample report. Added Vohrr as a contributor</>, Vohrr),
  change(date(2023, 1, 16), <>Added support for <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> target increases for <SpellLink id={TALENTS.CHAIN_HEAL_TALENT}></SpellLink>, <SpellLink id={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink id={TALENTS.HEALING_RAIN_TALENT}></SpellLink> statistics.</>, Fassbrause),
  change(date(2023, 1, 8), <>Added <SpellLink id={TALENTS.CHAIN_HEAL_TALENT}></SpellLink> to the <SpellLink id={TALENTS.TIDAL_WAVES_TALENT}></SpellLink> buff usage breakdown and Tidal Waves suggestions.</>, Fassbrause),
  change(date(2022, 12, 24), <>Added <SpellLink id={TALENTS.HEALING_RAIN_TALENT}></SpellLink>, <SpellLink id={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink id={TALENTS.WELLSPRING_TALENT}></SpellLink> to the <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> buff usage breakdown.</>, Fassbrause),
  change(date(2022, 11, 7), <>Added a statistic to display the healing gained from <SpellLink id={TALENTS.UNDERCURRENT_TALENT.id} />.</>, niseko),
  change(date(2022, 11, 6), <>Add support for <SpellLink id={TALENTS.FLASH_FLOOD_TALENT.id}/> haste increases per rank.</>, Arlie),
  change(date(2022, 10, 29), <>Converted Shadowlands spells and talents to Dragonflight versions</>, Arlie),
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
];
