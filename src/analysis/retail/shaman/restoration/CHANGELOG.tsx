import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Adoraci, niseko, Abelito75, Shamorisse, Vetyst, Arlie, Fassbrause } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 8), <>Added <SpellLink id={TALENTS.CHAIN_HEAL_TALENT}></SpellLink> to the <SpellLink id={TALENTS.TIDAL_WAVES_TALENT}></SpellLink> buff usage breakdown and Tidal Waves suggestions.</>, Fassbrause),
  change(date(2022, 12, 24), <>Added <SpellLink id={TALENTS.HEALING_RAIN_TALENT}></SpellLink>, <SpellLink id={TALENTS.DOWNPOUR_TALENT}></SpellLink> and <SpellLink id={TALENTS.WELLSPRING_TALENT}></SpellLink> to the <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT}></SpellLink> buff usage breakdown.</>, Fassbrause),
  change(date(2022, 11, 7), <>Added a statistic to display the healing gained from <SpellLink id={TALENTS.UNDERCURRENT_TALENT.id} />.</>, niseko),
  change(date(2022, 11, 6), <>Add support for <SpellLink id={TALENTS.FLASH_FLOOD_TALENT.id}/> haste increases per rank.</>, Arlie),
  change(date(2022, 10, 29), <>Converted Shadowlands spells and talents to Dragonflight versions</>, Arlie),
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
  change(date(2022, 8, 1), `Removed some outdated modules.`, niseko),
  change(date(2022, 7, 22), <>Reset cooldown of <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> when <SpellLink id={SPELLS.TUMBLING_WAVES_CONDUIT.id} /> procs.</>, Vetyst),
  change(date(2022, 7, 22), <>Properly reduce the cooldown of <SpellLink id={SPELLS.CHAIN_HARVEST.id} /> combined with <SpellLink id={SPELLS.ELEMENTAL_CONDUIT.id}/> legendary effect.</>, Vetyst),
  change(date(2022, 5, 19), <>Fixed Always be Healing.</>, Abelito75),
  change(date(2022, 1, 7), <>Fixed bugs in the display of Cooldowns and Feeding tabs.</>, Shamorisse),
  change(date(2021, 11, 13), <>Fixed a bug with Ancestral Vigor where it was including non-players and damage events from friendly targets.</>, Abelito75),
  change(date(2021, 4, 3), <>Bumped support to 9.0.5, updated <SpellLink id={SPELLS.JONATS_NATURAL_FOCUS.id} /> chain heal increase value.</>, Adoraci),
  change(date(2020, 12, 15), <>Fixed mana costs of a few spells being vastly off.</>, niseko),
  change(date(2020, 12, 15), <>Added support for <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> and <SpellLink id={SPELLS.CHAIN_HARVEST.id} />.</>, niseko),
  change(date(2020, 12, 9), <>Fixing loading errors due to hanging spellIds.</>, Abelito75),
  change(date(2020, 11, 8), <>Fixed <SpellLink id={SPELLS.PRIMAL_TIDE_CORE.id} /> module not catching the <SpellLink id={TALENTS.RIPTIDE_TALENT.id} /> initial heal.</>, niseko),
  change(date(2020, 11, 23), `Updated everything to Shadowlands Level 60 values, prepatch logs will be showing inaccurate results.`, niseko),
  change(date(2020, 11, 8), <>Added the legendaries <SpellLink id={SPELLS.JONATS_NATURAL_FOCUS.id} /> and <SpellLink id={SPELLS.EARTHEN_HARMONY.id} />.</>, niseko),
  change(date(2020, 11, 8), <>Added the legendary <SpellLink id={SPELLS.PRIMAL_TIDE_CORE.id} />.</>, niseko),
  change(date(2020, 11, 8), <>Added the conduit <SpellLink id={SPELLS.NATURES_FOCUS.id} />.</>, niseko),
  change(date(2020, 10, 26), <>Added statistics, suggestions and checklist entries for <SpellLink id={TALENTS.WATER_SHIELD_TALENT.id} /> and <SpellLink id={TALENTS.EARTH_SHIELD_TALENT.id} />.</>, niseko),
  change(date(2020, 10, 26), <>Added statistics, suggestions and checklist entries for <SpellLink id={320746} />.</>, niseko),
  change(date(2020, 10, 23), <>Added a statistic for <SpellLink id={TALENTS.MANA_TIDE_TOTEM_TALENT.id} />.</>, niseko),
  change(date(2020, 10, 22), <>Added a module to show the estimated damage reduction from <SpellLink id={TALENTS.SPIRIT_LINK_TOTEM_TALENT.id} />, as Blizzard finally added the buff to combat logs.</>, niseko),
  change(date(2020, 10, 17), `Fixed imports so we stop crashing!`, Abelito75),
  change(date(2020, 10, 17), `Made almost all of Restoration Shaman localizable.`, niseko),
  change(date(2020, 10, 16), <>Fixed <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} /> not displaying its full healing contribution.</>, niseko),
  change(date(2020, 10, 13), <>Added the potency conduits <SpellLink id={SPELLS.EMBRACE_OF_EARTH.id} />, <SpellLink id={SPELLS.HEAVY_RAINFALL.id} /> and <SpellLink id={SPELLS.SWIRLING_CURRENTS.id} />.</>, Abelito75),
  change(date(2020, 10, 13), (
    <>
      Updated Restoration Shaman for Shadowlands.<br />
      Changes include:<br />
      <ul>
        <li>Updated Abilities.</li>
        <li>Added the new Abilities.</li>
        <li>Don't use primal strike.</li>
        <li>More coming soon.</li>
      </ul>
    </>
  ), niseko),
];
