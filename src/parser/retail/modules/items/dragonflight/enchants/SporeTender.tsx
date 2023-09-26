import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatDuration } from 'common/format';
import { RetailSpec } from 'game/SPECS';
import RoleIcon from 'interface/RoleIcon';
import Combatant from 'parser/core/Combatant';
import { Options, SELECTED_PLAYER } from 'parser/core/EventSubscriber';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import WeaponEnchantAnalyzer, { EnchantRank } from './WeaponEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Spore Tender R1
// https://www.warcraftlogs.com/reports/aHMGwg4bV1mtN2Qk#fight=6&type=summary&source=74
// Spore Tender R2 (With refresh)
// https://www.warcraftlogs.com/reports/bGafrjQ8Mp6VcLDt#fight=3&type=summary&source=1
// Spore Tender R3
// https://www.warcraftlogs.com/reports/CkDv213xNw8Lj4Xa#fight=11&type=summary&source=234

interface SporeTenderEnchantRank extends EnchantRank {
  value: number;
}

const RANKS: SporeTenderEnchantRank[] = [
  { rank: 1, enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R1, value: 348 },
  { rank: 2, enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R2, value: 381 },
  { rank: 3, enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R3, value: 414 },
];

export function getSporeTenderBuffValue(caster: Combatant | null): number {
  return (
    (caster && RANKS.find(({ enchant }) => caster.hasWeaponEnchant(enchant))?.value) ||
    // If we can't find the enchant, assume the highest rank
    RANKS[RANKS.length - 1].value
  );
}

class SporeTender extends WeaponEnchantAnalyzer<SporeTenderEnchantRank> {
  static dependencies = {
    ...WeaponEnchantAnalyzer.dependencies,
    combatants: Combatants,
  };
  combatants!: Combatants;

  private value = 0;
  private targetStatistics: {
    [targetId: number]: {
      count: number;
      periods: {
        start?: number;
        end?: number;
      }[];
    };
  } = {};

  constructor(options: Options) {
    super(SPELLS.SPORE_TENDER_ENCHANT, RANKS, options);

    this.active = RANKS.some(({ enchant }) => this.selectedCombatant.hasWeaponEnchant(enchant));

    if (!this.active) {
      return;
    }

    this.value = getSporeTenderBuffValue(this.selectedCombatant);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_SPORE_CLOUD),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_SPORE_CLOUD),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_SPORE_CLOUD),
      this.onRemove,
    );
  }

  private onApply({ targetID, timestamp }: ApplyBuffEvent) {
    if (this.targetStatistics[targetID] == null) {
      this.targetStatistics[targetID] = {
        count: 0,
        periods: [],
      };
    }

    this.targetStatistics[targetID].count += 1;
    this.targetStatistics[targetID].periods.push({ start: timestamp });
  }

  private onRefresh({ targetID }: RefreshBuffEvent) {
    if (this.targetStatistics[targetID] == null) {
      this.targetStatistics[targetID] = {
        count: 0,
        periods: [],
      };
    }

    this.targetStatistics[targetID].count += 1;
  }

  private onRemove({ targetID, timestamp }: RemoveBuffEvent) {
    if (this.targetStatistics[targetID] == null) {
      this.targetStatistics[targetID] = {
        count: 0,
        periods: [],
      };
    }

    if (this.targetStatistics[targetID].periods.length === 0) {
      this.targetStatistics[targetID].periods.push({ end: timestamp });
    } else {
      this.targetStatistics[targetID].periods[
        this.targetStatistics[targetID].periods.length - 1
      ].end = timestamp;
    }
  }

  statisticParts() {
    const entries = Object.entries(this.targetStatistics);
    const rows = entries
      .map(([targetId, { count, periods }]) => {
        const target = this.combatants.getEntities()[Number(targetId)];
        const role = target.spec?.role ?? null;
        const classSlug = (() => {
          const spec = target.spec as RetailSpec | undefined;

          if (spec == null) {
            return '';
          }

          return spec.wclClassName.replace(' ', '');
        })();
        const name = target?.name ?? 'Unknown';
        const uptime = periods.reduce((total, { start, end }) => {
          if (start == null || end == null) {
            return total;
          }
          return total + (end - start);
        }, 0);

        return {
          targetId,
          name,
          role,
          classSlug,
          count,
          uptime,
        };
      })
      .sort((a, b) => b.uptime - a.uptime)
      .map(({ targetId, classSlug, role, name, count, uptime }) => (
        <tr key={targetId}>
          <td className="text-left">
            <RoleIcon roleId={role} /> <span className={classSlug}>{name}</span>
          </td>
          <td>{count}</td>
          <td>{formatDuration(uptime)}</td>
        </tr>
      ));

    const dropdown = (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Target</th>
            <th>Count</th>
            <th>Uptime</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );

    const totalProcs = Object.values(this.targetStatistics).reduce(
      (total, { count }) => total + count,
      0,
    );

    return {
      dropdown: dropdown,
      tooltip: (
        <>
          {this.procCount(totalProcs)}, giving {entries.length} different players {this.value} of
          their highest secondary stat.
        </>
      ),
      content: (
        <>
          {totalProcs}{' '}
          <small>
            buffs of <strong>{this.value}</strong> secondary stats
          </small>
        </>
      ),
    };
  }
}

export default SporeTender;
