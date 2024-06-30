// Shared
import Report from 'parser/core/Report';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import ReportRaidBuffListItem from './ReportRaidBuffListItem';
import SPECS from 'game/SPECS';
import getConfig from 'parser/getConfig';
import { Class, CombatantInfoEvent } from 'parser/core/Events';
import { isTalent, Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';

// Retail
import SPELLS from 'common/SPELLS';
import {
  TALENTS_DEATH_KNIGHT,
  TALENTS_DEMON_HUNTER,
  TALENTS_DRUID,
  TALENTS_MONK,
  TALENTS_PALADIN,
  TALENTS_PRIEST,
  TALENTS_SHAMAN,
} from 'common/TALENTS';
// Classic
import CLASSIC_SPELLS from 'common/SPELLS/classic';

import './ReportRaidBuffList.scss';
import { useLingui } from '@lingui/react';
import GameBranch from 'game/GameBranch';

// eslint-disable-next-line
const RETAIL_RAID_BUFFS = new Map<Spell | Talent, Array<Class | object>>([
  // Buffs
  //  Stamina
  [SPELLS.POWER_WORD_FORTITUDE, [Class.Priest]],
  //  Attack Power
  [SPELLS.BATTLE_SHOUT, [Class.Warrior]],
  //  Intellect
  [SPELLS.ARCANE_INTELLECT, [Class.Mage]],
  //  Movement CD
  [SPELLS.BLESSING_OF_THE_BRONZE, [Class.Evoker]],
  // Debuffs
  //  Magic vulnerability
  [SPELLS.CHAOS_BRAND, [Class.DemonHunter]],
  //  Physical vulnerability
  [SPELLS.MYSTIC_TOUCH, [Class.Monk]],
  // Raid cooldowns
  [SPELLS.BLOODLUST, [Class.Shaman, Class.Mage, Class.Hunter, Class.Evoker]],
  //  Battle res
  [SPELLS.REBIRTH, [Class.Druid, Class.DeathKnight, Class.Warlock, Class.Paladin]],
  [SPELLS.RALLYING_CRY, [Class.Warrior]],
  [TALENTS_DEATH_KNIGHT.ANTI_MAGIC_ZONE_TALENT, [Class.DeathKnight]],
  [TALENTS_DEMON_HUNTER.DARKNESS_TALENT, [Class.DemonHunter]],
  [TALENTS_PALADIN.AURA_MASTERY_TALENT, [SPECS.HOLY_PALADIN]],
  [TALENTS_SHAMAN.SPIRIT_LINK_TOTEM_TALENT, [SPECS.RESTORATION_SHAMAN]],
  [TALENTS_SHAMAN.HEALING_TIDE_TOTEM_TALENT, [SPECS.RESTORATION_SHAMAN]],
  [TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT, [SPECS.ENHANCEMENT_SHAMAN]],
  [TALENTS_MONK.REVIVAL_TALENT, [SPECS.MISTWEAVER_MONK]],
  [TALENTS_MONK.RESTORAL_TALENT, [SPECS.MISTWEAVER_MONK]],
  [TALENTS_PRIEST.POWER_WORD_BARRIER_TALENT, [SPECS.DISCIPLINE_PRIEST]],
  [TALENTS_PRIEST.DIVINE_HYMN_TALENT, [SPECS.HOLY_PRIEST]],
  [TALENTS_DRUID.TRANQUILITY_TALENT, [SPECS.RESTORATION_DRUID]],
]);

// eslint-disable-next-line
const CLASSIC_RAID_BUFFS = new Map<Spell, Array<Class | object>>([
  // BUFFS
  // Stamina
  [CLASSIC_SPELLS.POWER_WORD_FORTITUDE, [Class.Priest]],
  // Spirit
  [CLASSIC_SPELLS.PRAYER_OF_SPIRIT, [Class.Priest]],
  // Intellect
  [CLASSIC_SPELLS.ARCANE_BRILLIANCE, [Class.Mage]],
  // Stats
  [CLASSIC_SPELLS.GIFT_OF_THE_WILD, [Class.Druid]],
  // Stats %
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_KINGS, [Class.Paladin]],
  // Attack Power
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_MIGHT, [Class.Paladin]],
  // MP5
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_WISDOM, [Class.Paladin]],
  // Melee Crit
  [
    CLASSIC_SPELLS.LEADER_OF_THE_PACK,
    [SPECS.CLASSIC_DRUID_FERAL_COMBAT, SPECS.CLASSIC_DRUID_GUARDIAN],
  ],
  // Attack Power %
  [CLASSIC_SPELLS.UNLEASHED_RAGE, [SPECS.CLASSIC_SHAMAN_ENHANCEMENT]],
  // Strength & Agility
  [CLASSIC_SPELLS.STRENGTH_OF_EARTH_TOTEM, [Class.Shaman]],
  // Melee Haste
  [CLASSIC_SPELLS.ICY_TALONS_BUFF, [SPECS.CLASSIC_DEATH_KNIGHT_FROST]],
  // All Damage %
  [CLASSIC_SPELLS.SANCTIFIED_RETRIBUTION, [SPECS.CLASSIC_PALADIN_RETRIBUTION]],
  // Haste %
  [CLASSIC_SPELLS.MOONKIN_FORM, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Lust
  [CLASSIC_SPELLS.BLOODLUST, [Class.Shaman]],
  // Spell Power
  [CLASSIC_SPELLS.DEMONIC_PACT, [SPECS.CLASSIC_WARLOCK_DEMONOLOGY]],
  // Spell Crit
  [CLASSIC_SPELLS.MOONKIN_AURA, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Spell Haste
  [CLASSIC_SPELLS.WRATH_OF_AIR_TOTEM, [Class.Shaman]],
  // Replenishment
  [CLASSIC_SPELLS.VAMPIRIC_TOUCH, [SPECS.CLASSIC_PRIEST_SHADOW]],
  // Healing %
  [CLASSIC_SPELLS.DIVINE_HYMN, [Class.Priest]],
  // DEBUFFS
  // Bleed Damage
  [CLASSIC_SPELLS.MANGLE_CAT, [SPECS.CLASSIC_DRUID_FERAL_COMBAT]],
  // Physical Damage
  [CLASSIC_SPELLS.SAVAGE_COMBAT, [SPECS.CLASSIC_ROGUE_COMBAT, SPECS.CLASSIC_WARRIOR_ARMS]],
  // Spell Crit Chance %
  [
    CLASSIC_SPELLS.SHADOW_MASTERY_DEBUFF,
    [SPECS.CLASSIC_WARLOCK_DEMONOLOGY, SPECS.CLASSIC_WARLOCK_DESTRUCTION],
  ],
  // Spell Hit Chance %
  [CLASSIC_SPELLS.FAERIE_FIRE, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Spell Damage
  [CLASSIC_SPELLS.EBON_PLAGUE, [SPECS.CLASSIC_DEATH_KNIGHT_UNHOLY]],
  // Armor Reduction
  [CLASSIC_SPELLS.SUNDER_ARMOR, [Class.Warrior]],
  // UTILITY
  // Battle Res
  [CLASSIC_SPELLS.REBIRTH, [Class.Druid]],
  // Immune to Silence and Interrupts
  [CLASSIC_SPELLS.AURA_MASTERY, [SPECS.CLASSIC_PALADIN_HOLY]],
]);

interface Props {
  report: Report;
  combatants: CombatantInfoEvent[];
}

const ReportRaidBuffList = ({ report, combatants }: Props) => {
  const { i18n } = useLingui();
  const isRetail = wclGameVersionToBranch(report.gameVersion) === GameBranch.Retail;
  const getCompositionBreakdown = (combatants: CombatantInfoEvent[]) => {
    const results = new Map<Spell | Talent, number>();

    const AVAILABLE_RAID_BUFFS = isRetail ? RETAIL_RAID_BUFFS : CLASSIC_RAID_BUFFS;

    AVAILABLE_RAID_BUFFS.forEach((providedBy, spell) => {
      results.set(spell, 0);
    });

    return combatants.reduce((map, combatant) => {
      const config = getConfig(
        wclGameVersionToBranch(report.gameVersion),
        combatant.specID,
        combatant.player,
        combatant,
      );

      if (!config) {
        return map;
      }
      // TODO: This is brittle because it depends on selected language
      // TODO: TOPPLE FIX ME
      const className = i18n._(config.spec.className) as Class;
      const combatantTalents = combatant.talentTree.map((talent) => talent.id);

      AVAILABLE_RAID_BUFFS.forEach((providedBy, spell) => {
        const hasTalent = isTalent(spell)
          ? spell.entryIds.some((entryId) => combatantTalents.includes(entryId))
          : true;
        if ((providedBy.includes(className) || providedBy.includes(config.spec)) && hasTalent) {
          map.set(spell, (map.get(spell) ?? 0) + 1);
        }
      });
      return map;
    }, results);
  };

  const buffs = getCompositionBreakdown(combatants);
  return (
    <div className="raidbuffs">
      <h1>Raid Buffs</h1>
      {Array.from(buffs, ([spellId, count]) => (
        <ReportRaidBuffListItem key={spellId.id} spell={spellId} count={count} />
      ))}
    </div>
  );
};

export default ReportRaidBuffList;
