import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Arlie, Elitesparkle, Fassbrause, niseko, ToppleTheNun, Vetyst, Vohrr, Ypp } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 12, 2), <>Update suggestions for T31 set bonuses</>, Ypp),
  change(date(2023, 11, 16), <>Reactivate Restoration, implement T31 Tier Set for Restoration</>, Ypp),
  change(date(2023, 11, 12), <>Restoration not supported</>, Vohrr),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 5, 8), <>Fix Mana Costs for Shaman Spells and Talents.</>, Elitesparkle),
  change(date(2023, 5, 8), <><SpellLink spell={TALENTS.FLOW_OF_THE_TIDES_TALENT}/> fix to tally additional hit healing regardless of riptides being consumed.</>, Vohrr),
  change(date(2023, 5, 4), <>Fixed bug with <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT}/> uptime segments on the guide. Added <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT}/> cast entry row, reformatted <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT}/> module for visual consistency</>, Vohrr),
  change(date(2023, 5, 4), <>Add <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT}/> uptime to core section of the Guide</>, Vohrr),
  change(date(2023, 5, 3), <><SpellLink spell={TALENTS.EARTHEN_HARMONY_TALENT}/> code review cleanup</>, Vohrr),
  change(date(2023, 5, 3), <>Fixed a bug with <SpellLink spell={TALENTS.EARTHEN_HARMONY_TALENT}/> not calculating the damage mitigated from <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT}/> that were applied pre-pull</>, Vohrr),
  change(date(2023, 5, 2), <>Implement Guide prototype</>, Vohrr),
  change(date(2023, 5, 1), <>Added Tier 30 module</>, Vohrr),
  change(date(2023, 5, 1), <> Updated <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT}/> to show talent contribution breakdown</>, Vohrr),
  change(date(2023, 4, 30), <>Added <SpellLink spell={TALENTS.FLOW_OF_THE_TIDES_TALENT}/> module</>, Vohrr),
  change(date(2023, 3, 16), <>Fixed <SpellLink spell={TALENTS.ANCESTRAL_VIGOR_TALENT}/> to work for each talent rank</>, Vohrr),
  change(date(2023, 3, 8), <>Fixed <SpellLink spell={TALENTS.HIGH_TIDE_TALENT}/> module and mark Resto Shaman as supported for 10.0.7</>, Vohrr),
  change(date(2023, 3, 7), <>Added <SpellLink spell={TALENTS.ANCESTRAL_REACH_TALENT}/> module</>, Vohrr),
  change(date(2023, 3, 5), <>Rewrite <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT}/></>, Vohrr),
  change(date(2023, 2, 25), <>Added <SpellLink spell={TALENTS.WAVESPEAKERS_BLESSING_TALENT}/> module.</>, Vohrr),
  change(date(2023, 2, 23), <>Various bug fixes and format updates to bring modules up to date for Dragonflight. Fixed and re-enabled <SpellLink spell={SPELLS.WATER_SHIELD}/>. Fixed <SpellLink spell={TALENTS.MANA_TIDE_TOTEM_TALENT}/>. Fixed <SpellLink spell={TALENTS.RESURGENCE_TALENT}/>. Fixed <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT}/>. Improved accuracy of <SpellLink spell={TALENTS.DELUGE_TALENT}/>. Re-added <SpellLink spell={TALENTS.ANCESTRAL_GUIDANCE_TALENT}/> and <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT}/> to the Cooldown Throughput Tracker. Added missing abilities to Ability Tracker</>, Vohrr),
  change(date(2023, 2, 22), <>Added <SpellLink spell={TALENTS.PRIMAL_TIDE_CORE_TALENT}/> module. Added event linking to improve the accuracy of <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT}/> and for future guide / module implementation. Updated sample report. Added Vohrr as a contributor</>, Vohrr),
  change(date(2023, 1, 16), <>Added support for <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> target increases for <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT}></SpellLink>, <SpellLink spell={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink spell={TALENTS.HEALING_RAIN_TALENT}></SpellLink> statistics.</>, Fassbrause),
  change(date(2023, 1, 8), <>Added <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT}></SpellLink> to the <SpellLink spell={TALENTS.TIDAL_WAVES_TALENT}></SpellLink> buff usage breakdown and Tidal Waves suggestions.</>, Fassbrause),
  change(date(2022, 12, 24), <>Added <SpellLink spell={TALENTS.HEALING_RAIN_TALENT}></SpellLink>, <SpellLink spell={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink spell={TALENTS.WELLSPRING_TALENT}></SpellLink> to the <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> buff usage breakdown.</>, Fassbrause),
  change(date(2022, 11, 7), <>Added a statistic to display the healing gained from <SpellLink spell={TALENTS.UNDERCURRENT_TALENT} />.</>, niseko),
  change(date(2022, 11, 6), <>Add support for <SpellLink spell={TALENTS.FLASH_FLOOD_TALENT}/> haste increases per rank.</>, Arlie),
  change(date(2022, 10, 29), <>Converted Shadowlands spells and talents to Dragonflight versions</>, Arlie),
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
];
