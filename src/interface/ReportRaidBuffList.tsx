// Shared
import Report from 'parser/core/Report';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import { isRetailExpansion } from 'game/Expansion';
import ReportRaidBuffListItem from './ReportRaidBuffListItem';
import SPECS from 'game/SPECS';
import getConfig from 'parser/getConfig';
import { Class, CombatantInfoEvent } from 'parser/core/Events';
import './ReportRaidBuffList.scss';
// Retail
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST, TALENTS_SHAMAN } from 'common/TALENTS';
import { TALENTS_DEMON_HUNTER, TALENTS_MONK, TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
// Classic
import CLASSIC_SPELLS from 'common/SPELLS/classic';

// eslint-disable-next-line
const RETAIL_RAID_BUFFS = new Map<number, Array<Class | object>>([
  // Buffs
  //  Stamina
  [SPELLS.POWER_WORD_FORTITUDE.id, [Class.Priest]],
  //  Attack Power
  [SPELLS.BATTLE_SHOUT.id, [Class.Warrior]],
  //  Intellect
  [SPELLS.ARCANE_INTELLECT.id, [Class.Mage]],
  //  Movement CD
  [SPELLS.BLESSING_OF_THE_BRONZE.id, [Class.Evoker]],
  // Debuffs
  //  Magic vulnerability
  [SPELLS.CHAOS_BRAND.id, [Class.DemonHunter]],
  //  Physical vulnerability
  [SPELLS.MYSTIC_TOUCH.id, [Class.Monk]],
  // Raid cooldowns
  [SPELLS.BLOODLUST.id, [Class.Shaman, Class.Mage, Class.Hunter, Class.Evoker]],
  //  Battle res
  [SPELLS.REBIRTH.id, [Class.Druid, Class.DeathKnight, Class.Warlock, Class.Paladin]],
  [SPELLS.RALLYING_CRY.id, [Class.Warrior]],
  [TALENTS_DEATH_KNIGHT.ANTI_MAGIC_ZONE_TALENT.id, [Class.DeathKnight]],
  [TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id, [Class.DemonHunter]],
  [SPELLS.AURA_MASTERY.id, [SPECS.HOLY_PALADIN]],
  [TALENTS_SHAMAN.SPIRIT_LINK_TOTEM_TALENT.id, [SPECS.RESTORATION_SHAMAN]],
  [TALENTS_SHAMAN.HEALING_TIDE_TOTEM_TALENT.id, [SPECS.RESTORATION_SHAMAN]],
  [TALENTS_MONK.REVIVAL_TALENT.id, [SPECS.MISTWEAVER_MONK]],
  [TALENTS_MONK.RESTORAL_TALENT.id, [SPECS.MISTWEAVER_MONK]],
  [SPELLS.POWER_WORD_BARRIER_CAST.id, [SPECS.DISCIPLINE_PRIEST]],
  [TALENTS_PRIEST.DIVINE_HYMN_TALENT.id, [SPECS.HOLY_PRIEST]],
  [SPELLS.TRANQUILITY_CAST.id, [SPECS.RESTORATION_DRUID]],
]);

// eslint-disable-next-line
const CLASSIC_RAID_BUFFS = new Map<number, Array<Class | object>>([
  // BUFFS
  // Stamina
  [CLASSIC_SPELLS.PRAYER_OF_FORTITUDE.id, [Class.Priest]],
  // Spirit
  [CLASSIC_SPELLS.PRAYER_OF_SPIRIT.id, [Class.Priest]],
  // Intellect
  [CLASSIC_SPELLS.ARCANE_BRILLIANCE.id, [Class.Mage]],
  // Stats
  [CLASSIC_SPELLS.GIFT_OF_THE_WILD.id, [Class.Druid]],
  // Stats %
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_KINGS.id, [Class.Paladin]],
  // Attack Power
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_MIGHT.id, [Class.Paladin]],
  // MP5
  [CLASSIC_SPELLS.GREATER_BLESSING_OF_WISDOM.id, [Class.Paladin]],
  // Melee Crit
  [
    CLASSIC_SPELLS.LEADER_OF_THE_PACK.id,
    [SPECS.CLASSIC_DRUID_FERAL_COMBAT, SPECS.CLASSIC_DRUID_GUARDIAN],
  ],
  // Attack Power %
  [CLASSIC_SPELLS.UNLEASHED_RAGE.id, [SPECS.CLASSIC_SHAMAN_ENHANCEMENT]],
  // Strength & Agility
  [CLASSIC_SPELLS.STRENGTH_OF_EARTH_TOTEM.id, [Class.Shaman]],
  // Melee Haste
  [CLASSIC_SPELLS.ICY_TALONS_BUFF.id, [SPECS.CLASSIC_DEATH_KNIGHT_FROST]],
  // All Damage %
  [CLASSIC_SPELLS.SANCTIFIED_RETRIBUTION.id, [SPECS.CLASSIC_PALADIN_RETRIBUTION]],
  // Haste %
  [CLASSIC_SPELLS.MOONKIN_FORM.id, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Lust
  [CLASSIC_SPELLS.BLOODLUST.id, [Class.Shaman]],
  // Spell Power
  [CLASSIC_SPELLS.DEMONIC_PACT.id, [SPECS.CLASSIC_WARLOCK_DEMONOLOGY]],
  // Spell Crit
  [CLASSIC_SPELLS.MOONKIN_AURA.id, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Spell Haste
  [CLASSIC_SPELLS.WRATH_OF_AIR_TOTEM.id, [Class.Shaman]],
  // Replenishment
  [CLASSIC_SPELLS.VAMPIRIC_TOUCH.id, [SPECS.CLASSIC_PRIEST_SHADOW]],
  // Healing %
  [CLASSIC_SPELLS.DIVINE_HYMN.id, [Class.Priest]],
  // DEBUFFS
  // Bleed Damage
  [CLASSIC_SPELLS.MANGLE_CAT.id, [SPECS.CLASSIC_DRUID_FERAL_COMBAT]],
  // Physical Damage
  [CLASSIC_SPELLS.SAVAGE_COMBAT.id, [SPECS.CLASSIC_ROGUE_COMBAT, SPECS.CLASSIC_WARRIOR_ARMS]],
  // Spell Crit Chance %
  [
    CLASSIC_SPELLS.SHADOW_MASTERY_DEBUFF.id,
    [SPECS.CLASSIC_WARLOCK_DEMONOLOGY, SPECS.CLASSIC_WARLOCK_DESTRUCTION],
  ],
  // Spell Hit Chance %
  [CLASSIC_SPELLS.FAERIE_FIRE.id, [SPECS.CLASSIC_DRUID_BALANCE]],
  // Spell Damage
  [CLASSIC_SPELLS.EBON_PLAGUE.id, [SPECS.CLASSIC_DEATH_KNIGHT_UNHOLY]],
  // Armor Reduction
  [CLASSIC_SPELLS.SUNDER_ARMOR.id, [Class.Warrior]],
  // UTILITY
  // Battle Res
  [CLASSIC_SPELLS.REBIRTH.id, [Class.Druid]],
  // Immune to Silence and Interrupts
  [CLASSIC_SPELLS.AURA_MASTERY.id, [SPECS.CLASSIC_PALADIN_HOLY]],
]);

interface Props {
  report: Report;
  combatants: CombatantInfoEvent[];
}

const ReportRaidBuffList = ({ report, combatants }: Props) => {
  const isRetail = isRetailExpansion(wclGameVersionToExpansion(report.gameVersion));
  const getCompositionBreakdown = (combatants: CombatantInfoEvent[]) => {
    const results = new Map<number, number>();

    const AVAILABLE_RAID_BUFFS = isRetail ? RETAIL_RAID_BUFFS : CLASSIC_RAID_BUFFS;

    AVAILABLE_RAID_BUFFS.forEach((providedBy, spellId) => {
      results.set(spellId, 0);
    });

    return combatants.reduce((map, combatant) => {
      const config = getConfig(
        wclGameVersionToExpansion(report.gameVersion),
        combatant.specID,
        combatant.player,
        combatant,
      );

      if (!config) {
        return map;
      }
      const className = config.spec.className as Class;

      AVAILABLE_RAID_BUFFS.forEach((providedBy, spellId) => {
        if (providedBy.includes(className) || providedBy.includes(config.spec)) {
          map.set(spellId, map.get(spellId)! + 1);
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
        <ReportRaidBuffListItem key={spellId} spellId={Number(spellId)} count={count} />
      ))}
    </div>
  );
};

export default ReportRaidBuffList;
