import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Arlie, Fassbrause, niseko, Vetyst, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 5, 1), <>Added Tier 30 module</>, Vohrr),
  change(date(2023, 5, 1), <> Updated <SpellLink id={TALENTS.EARTH_SHIELD_TALENT.id}/> to show talent contribution breakdown</>, Vohrr),
  change(date(2023, 4, 30), <>Added <SpellLink id={TALENTS.FLOW_OF_THE_TIDES_TALENT.id}/> module</>, Vohrr),
  change(date(2023, 3, 16), <>Fixed <SpellLink id={TALENTS.ANCESTRAL_VIGOR_TALENT.id}/> to work for each talent rank</>, Vohrr),
  change(date(2023, 3, 8), <>Fixed <SpellLink id={TALENTS.HIGH_TIDE_TALENT.id}/> module and mark Resto Shaman as supported for 10.0.7</>, Vohrr),
  change(date(2023, 3, 7), <>Added <SpellLink id={TALENTS.ANCESTRAL_REACH_TALENT.id}/> module</>, Vohrr),
  change(date(2023, 3, 5), <>Rewrite <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id}/></>, Vohrr),
  change(date(2023, 2, 25), <>Added <SpellLink id={TALENTS.WAVESPEAKERS_BLESSING_TALENT.id}/> module.</>, Vohrr),
  change(date(2023, 2, 23), <>Various bug fixes and format updates to bring modules up to date for Dragonflight. Fixed and re-enabled <SpellLink id={SPELLS.WATER_SHIELD.id}/>. Fixed <SpellLink id={TALENTS.MANA_TIDE_TOTEM_TALENT.id}/>. Fixed <SpellLink id={TALENTS.RESURGENCE_TALENT.id}/>. Fixed <SpellLink id={TALENTS.EARTH_SHIELD_TALENT.id}/>. Improved accuracy of <SpellLink id={TALENTS.DELUGE_TALENT.id}/>. Re-added <SpellLink id={TALENTS.ANCESTRAL_GUIDANCE_TALENT.id}/> and <SpellLink id={TALENTS.ASCENDANCE_RESTORATION_TALENT.id}/> to the Cooldown Throughput Tracker. Added missing abilities to Ability Tracker</>, Vohrr),
  change(date(2023, 2, 22), <>Added <SpellLink id={TALENTS.PRIMAL_TIDE_CORE_TALENT.id}/> module. Added event linking to improve the accuracy of <SpellLink id={TALENTS.PRIMORDIAL_WAVE_TALENT.id}/> and for future guide / module implementation. Updated sample report. Added Vohrr as a contributor</>, Vohrr),
  change(date(2023, 1, 16), <>Added support for <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> target increases for <SpellLink id={TALENTS.CHAIN_HEAL_TALENT}></SpellLink>, <SpellLink id={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink id={TALENTS.HEALING_RAIN_TALENT}></SpellLink> statistics.</>, Fassbrause),
  change(date(2023, 1, 8), <>Added <SpellLink id={TALENTS.CHAIN_HEAL_TALENT}></SpellLink> to the <SpellLink id={TALENTS.TIDAL_WAVES_TALENT}></SpellLink> buff usage breakdown and Tidal Waves suggestions.</>, Fassbrause),
  change(date(2022, 12, 24), <>Added <SpellLink id={TALENTS.HEALING_RAIN_TALENT}></SpellLink>, <SpellLink id={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink id={TALENTS.WELLSPRING_TALENT}></SpellLink> to the <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> buff usage breakdown.</>, Fassbrause),
  change(date(2022, 11, 7), <>Added a statistic to display the healing gained from <SpellLink id={TALENTS.UNDERCURRENT_TALENT.id} />.</>, niseko),
  change(date(2022, 11, 6), <>Add support for <SpellLink id={TALENTS.FLASH_FLOOD_TALENT.id}/> haste increases per rank.</>, Arlie),
  change(date(2022, 10, 29), <>Converted Shadowlands spells and talents to Dragonflight versions</>, Arlie),
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
];
