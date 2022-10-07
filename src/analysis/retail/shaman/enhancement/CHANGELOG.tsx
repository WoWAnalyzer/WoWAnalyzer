import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Mae, xunai, Vonn, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 9, 9), <>Initial implementation of Dragonflight Talent system.</>, Vetyst),
  change(date(2022, 8, 22), <>Make <SpellLink id={SPELLS.STORMBRINGER.id} /> a priority only if you have <SpellLink id={TALENTS_SHAMAN.STORMFLURRY_TALENT.id} /> talented.</>, Vetyst),
  change(date(2022, 8, 16), <>Implement an initial version of the Single Target APL checker.</>, Vetyst),
  change(date(2022, 8, 15), <>Track haste gained from <SpellLink id={SPELLS.ELEMENTAL_BLAST.id} />.</>, Vetyst),
  change(date(2022, 8, 17), <>Track bad/missed <SpellLink id={TALENTS_SHAMAN.SUNDERING_TALENT.id} /> casts.</>, Vetyst),
  change(date(2022, 7, 22), <>Properly reduce the cooldown of <SpellLink id={SPELLS.CHAIN_HARVEST.id} /> combined with <SpellLink id={SPELLS.ELEMENTAL_CONDUIT.id}/> legendary effect.</>, Vetyst),
  change(date(2022, 7, 22), <>Separate Stormstrike and Windstrike cooldowns.</>, Vetyst),
  change(date(2022, 7, 22), <>Reset cooldown of <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> when <SpellLink id={SPELLS.TUMBLING_WAVES_CONDUIT.id} /> procs.</>, Vetyst),
  change(date(2022, 7, 22), <>Show covenant abilities on offensive cooldowns checklist.</>, Vetyst),
  change(date(2022, 7, 22), <>Add suggestion for the <SpellLink id={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT.id} /> talent while wearing T28 4 set.</>, Vetyst),
  change(date(2022, 7, 22), <>Remove <SpellLink id={TALENTS_SHAMAN.EARTH_ELEMENTAL_TALENT.id} />  as suggested offensive cooldown.</>, Vetyst),
  change(date(2022, 7, 22), <>Reset <SpellLink id={TALENTS_SHAMAN.STORMSTRIKE_TALENT.id} /> cooldown when <SpellLink id={SPELLS.STORMBRINGER.id} /> is refreshed. </>, Vetyst),
  change(date(2022, 7, 19), <>Reduce the cooldown of <SpellLink id={SPELLS.LAVA_LASH.id} /> when the <SpellLink id={TALENTS_SHAMAN.HOT_HAND_TALENT.id} /> buff is active. </>, Vetyst),
  change(date(2022, 4, 26), <>Added <SpellLink id={SPELLS.FAE_TRANSFUSION.id} /> to the timeline and support for <SpellLink id={SPELLS.SEEDS_OF_RAMPANT_GROWTH.id} /> </>, xunai),
  change(date(2022, 4, 24), <>Added cooldown reduction tracking for <SpellLink id={SPELLS.WITCH_DOCTORS_WOLF_BONES.id} /></>, xunai),
  change(date(2022, 4, 21), <>Added statistics for tier 28 two set bonus and for <SpellLink id={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT.id} /></>, xunai),
  change(date(2022, 4, 11), <>Updated Frost Shock and Flame Shock to be treated as separate abilities on the timeline</>, xunai),
  change(date(2020, 11, 11), <>Added stacks and time spent at cap statisctics for <SpellLink id={SPELLS.MAELSTROM_WEAPON.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statisctics for <SpellLink id={TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statistic and suggestion for <SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added stack statictics for <SpellLink id={TALENTS_SHAMAN.HAILSTORM_TALENT.id} /></>, Mae),
  change(date(2020, 11, 5), <>Added <SpellLink id={SPELLS.FLAME_SHOCK.id} /> statistics</>, Mae),
  change(date(2020, 11, 3), <>Added <SpellLink id={TALENTS_SHAMAN.SUNDERING_TALENT.id} /> to offensive cooldowns checklist.</>, Mae),
  change(date(2020, 10, 12), <>Added Maelstrom Weapon stats for <SpellLink id={TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated statistics for <SpellLink id={TALENTS_SHAMAN.FORCEFUL_WINDS_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated damage statistics for <SpellLink id={TALENTS_SHAMAN.HOT_HAND_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={TALENTS_SHAMAN.FIRE_NOVA_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={TALENTS_SHAMAN.ICE_STRIKE_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for the new <SpellLink id={TALENTS_SHAMAN.HAILSTORM_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for <SpellLink id={TALENTS_SHAMAN.STORMFLURRY_TALENT.id} />.</>, Vonn),
];
