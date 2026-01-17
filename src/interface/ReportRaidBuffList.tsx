// Shared
import Report from 'parser/core/Report';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import ReportRaidBuffListItem from './ReportRaidBuffListItem';
import SPECS from 'game/SPECS';
import getConfig from 'parser/getConfig';
import { Class } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';

// Retail
import SPELLS from 'common/SPELLS';
// Classic
import CLASSIC_SPELLS from 'common/SPELLS/classic';

import './ReportRaidBuffList.scss';
import GameBranch from 'game/GameBranch';
import { PlayerDetails } from 'parser/core/Player';

const RETAIL_RAID_BUFFS = new Map<Spell, Array<Class | object>>([
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
  [SPELLS.SKYFURY, [Class.Shaman]],
]);

const CLASSIC_RAID_BUFFS = new Map<Spell, Array<Class | object>>([
  // BUFFS
  // Stamina
  [CLASSIC_SPELLS.POWER_WORD_FORTITUDE, [Class.Priest]],
  // Intellect
  [CLASSIC_SPELLS.ARCANE_BRILLIANCE, [Class.Mage]],
  // Stats
  [CLASSIC_SPELLS.MARK_OF_THE_WILD, [Class.Druid]],
  // Stats %
  // Attack Power
  // MP5
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
  // All Damage %
  [CLASSIC_SPELLS.SANCTIFIED_RETRIBUTION, [SPECS.CLASSIC_PALADIN_RETRIBUTION]],
  // Haste %
  [CLASSIC_SPELLS.MOONKIN_FORM, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Lust
  [CLASSIC_SPELLS.BLOODLUST, [Class.Shaman]],
  // Spell Power
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
  players: PlayerDetails[];
}

const ReportRaidBuffList = ({ report, players }: Props) => {
  const isRetail = wclGameVersionToBranch(report.gameVersion) === GameBranch.Retail;
  const getCompositionBreakdown = (combatants: PlayerDetails[]) => {
    const results = new Map<Spell, number>();

    const AVAILABLE_RAID_BUFFS = isRetail ? RETAIL_RAID_BUFFS : CLASSIC_RAID_BUFFS;

    AVAILABLE_RAID_BUFFS.forEach((_, spell) => {
      results.set(spell, 0);
    });

    return combatants.reduce((map, player) => {
      const config = getConfig(
        wclGameVersionToBranch(report.gameVersion),
        player.specID ?? 0,
        player,
      );

      if (!config) {
        return map;
      }
      const className = player.className as Class;

      AVAILABLE_RAID_BUFFS.forEach((providedBy, spell) => {
        if (providedBy.includes(className) || providedBy.includes(config.spec)) {
          map.set(spell, (map.get(spell) ?? 0) + 1);
        }
      });
      return map;
    }, results);
  };

  const buffs = getCompositionBreakdown(players);
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
