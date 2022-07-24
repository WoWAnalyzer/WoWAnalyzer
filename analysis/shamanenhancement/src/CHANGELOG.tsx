import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Abelito75, HawkCorrigan, Mae, MusicMeister, xunai, Vonn, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 7, 24), <>Display correct total uptime of <SpellLink id={SPELLS.ELEMENTAL_BLAST_TALENT.id} />.</>, Vetyst),
  change(date(2022, 7, 22), <>Properly reduce the cooldown of <SpellLink id={SPELLS.CHAIN_HARVEST.id} /> combined with <SpellLink id={SPELLS.ELEMENTAL_CONDUIT.id}/> legendary effect.</>, Vetyst),
  change(date(2022, 7, 22), <>Separate Stormstrike and Windstrike cooldowns.</>, Vetyst),
  change(date(2022, 7, 22), <>Reset cooldown of <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> when <SpellLink id={SPELLS.TUMBLING_WAVES_CONDUIT} /> procs.</>, Vetyst),
  change(date(2022, 7, 22), <>Show covenant abilities on offensive cooldowns checklist.</>, Vetyst),
  change(date(2022, 7, 22), <>Add suggestion for the <SpellLink id={SPELLS.ELEMENTAL_SPIRITS_TALENT.id} /> talent while wearing T28 4 set.</>, Vetyst),
  change(date(2022, 7, 22), <>Remove <SpellLink id={SPELLS.EARTH_ELEMENTAL.id} />  as suggested offensive cooldown.</>, Vetyst),
  change(date(2022, 7, 22), <>Reset <SpellLink id={SPELLS.STORMSTRIKE_CAST.id} /> cooldown when <SpellLink id={SPELLS.STORMBRINGER.id} /> is refreshed. </>, Vetyst),
  change(date(2022, 7, 19), <>Reduce the cooldown of <SpellLink id={SPELLS.LAVA_LASH.id} /> when the <SpellLink id={SPELLS.HOT_HAND_TALENT.id} /> buff is active. </>, Vetyst),
  change(date(2022, 4, 26), <>Added <SpellLink id={SPELLS.FAE_TRANSFUSION.id} /> to the timeline and support for <SpellLink id={SPELLS.SEEDS_OF_RAMPANT_GROWTH.id} /> </>, xunai),
  change(date(2022, 4, 24), <>Added cooldown reduction tracking for <SpellLink id={SPELLS.WITCH_DOCTORS_WOLF_BONES.id} /></>, xunai),
  change(date(2022, 4, 21), <>Added statistics for tier 28 two set bonus and for <SpellLink id={SPELLS.ELEMENTAL_SPIRITS_TALENT.id} /></>, xunai),
  change(date(2022, 4, 11), <>Updated Frost Shock and Flame Shock to be treated as separate abilities on the timeline</>, xunai),
  change(date(2022, 3, 23), <>Fixed an issue in ability.tsx where the spell object was being passed instead of the ID</>, Abelito75),
  change(date(2020, 11, 11), <>Added stacks and time spent at cap statisctics for <SpellLink id={SPELLS.MAELSTROM_WEAPON.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statisctics for <SpellLink id={SPELLS.WINDFURY_TOTEM.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added uptime statistic and suggestion for <SpellLink id={SPELLS.LASHING_FLAMES_DEBUFF.id} /></>, Mae),
  change(date(2020, 11, 8), <>Added stack statictics for <SpellLink id={SPELLS.HAILSTORM_TALENT.id} /></>, Mae),
  change(date(2020, 11, 5), <>Added <SpellLink id={SPELLS.FLAME_SHOCK.id} /> statistics</>, Mae),
  change(date(2020, 11, 3), <>Added <SpellLink id={SPELLS.SUNDERING_TALENT.id} /> to offensive cooldowns checklist.</>, Mae),
  change(date(2020, 10, 12), <>Added Maelstrom Weapon stats for <SpellLink id={SPELLS.FERAL_SPIRIT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated statistics for <SpellLink id={SPELLS.FORCEFUL_WINDS_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.ELEMENTAL_ASSAULT_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Updated damage statistics for <SpellLink id={SPELLS.HOT_HAND_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.FIRE_NOVA_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 12), <>Added damage statistics for <SpellLink id={SPELLS.ICE_STRIKE_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for the new <SpellLink id={SPELLS.HAILSTORM_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 11), <>Added damage statistics for <SpellLink id={SPELLS.STORMFLURRY_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 9), <>Added damage statistics for <SpellLink id={SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id} />.</>, Vonn),
  change(date(2020, 10, 9), <>Added damage statistics for <SpellLink id={SPELLS.LASHING_FLAMES_TALENT.id} />.</>, Vonn),
  change(date(2020, 10, 6), <>Updated spells and abilities for current Shadowlands beta.</>, Vonn),
  change(date(2020, 9, 23), <>Removed <SpellLink id={SPELLS.EARTH_ELEMENTAL.id} /> from recommended offensive spells.</>, MusicMeister),
  change(date(2020, 8, 28), <>First go at removing obsolete Spells and Azerite.</>, HawkCorrigan),
];
