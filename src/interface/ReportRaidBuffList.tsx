import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import { Class, CombatantInfoEvent } from 'parser/core/Events';

import './ReportRaidBuffList.scss';

import ReportRaidBuffListItem from './ReportRaidBuffListItem';
import { TALENTS_DEMON_HUNTER, TALENTS_MONK } from 'common/TALENTS';

// eslint-disable-next-line
const AVAILABLE_RAID_BUFFS = new Map<number, Array<Class | object>>([
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
  [SPELLS.BLOODLUST.id, [Class.Shaman, Class.Mage, Class.Hunter]],
  //  Battle res
  [SPELLS.REBIRTH.id, [Class.Druid, Class.DeathKnight, Class.Warlock]],
  [SPELLS.RALLYING_CRY.id, [Class.Warrior]],
  [SPELLS.ANTI_MAGIC_ZONE.id, [Class.DeathKnight]],
  [TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id, [Class.DemonHunter]],
  [SPELLS.AURA_MASTERY.id, [SPECS.HOLY_PALADIN]],
  [SPELLS.SPIRIT_LINK_TOTEM.id, [SPECS.RESTORATION_SHAMAN]],
  [SPELLS.HEALING_TIDE_TOTEM_CAST.id, [SPECS.RESTORATION_SHAMAN]],
  [TALENTS_MONK.REVIVAL_TALENT.id, [SPECS.MISTWEAVER_MONK]],
  [TALENTS_MONK.RESTORAL_TALENT.id, [SPECS.MISTWEAVER_MONK]],
  [SPELLS.POWER_WORD_BARRIER_CAST.id, [SPECS.DISCIPLINE_PRIEST]],
  [TALENTS_PRIEST.DIVINE_HYMN_TALENT.id, [SPECS.HOLY_PRIEST]],
  [SPELLS.TRANQUILITY_CAST.id, [SPECS.RESTORATION_DRUID]],
]);

const getCompositionBreakdown = (combatants: CombatantInfoEvent[]) => {
  const results = new Map<number, number>();
  AVAILABLE_RAID_BUFFS.forEach((providedBy, spellId) => {
    results.set(spellId, 0);
  });

  return combatants.reduce((map, combatant) => {
    const spec = SPECS[combatant.specID];
    if (!spec) {
      return map;
    }
    const className = spec.className as Class;

    AVAILABLE_RAID_BUFFS.forEach((providedBy, spellId) => {
      if (providedBy.includes(className) || providedBy.includes(spec)) {
        map.set(spellId, map.get(spellId)! + 1);
      }
    });
    return map;
  }, results);
};

interface Props {
  combatants: CombatantInfoEvent[];
}

const ReportRaidBuffList = ({ combatants }: Props) => {
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
