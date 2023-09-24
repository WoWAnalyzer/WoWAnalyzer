import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatDuration } from 'common/format';
import { RetailSpec } from 'game/SPECS';
import { SpellLink } from 'interface';
import RoleIcon from 'interface/RoleIcon';
import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/EventSubscriber';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Spore Tender R1
// https://www.warcraftlogs.com/reports/aHMGwg4bV1mtN2Qk#fight=6&type=summary&source=74
// Spore Tender R2 (With refresh)
// https://www.warcraftlogs.com/reports/bGafrjQ8Mp6VcLDt#fight=3&type=summary&source=1
// Spore Tender R3
// https://www.warcraftlogs.com/reports/CkDv213xNw8Lj4Xa#fight=11&type=summary&source=234

export const SPORE_TENDER_R3 = { enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R3, value: 414 };

const RANKS = [
  { enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R1, value: 348 },
  { enchant: ITEMS.ENCHANT_WEAPON_SPORE_TENDER_R2, value: 381 },
  SPORE_TENDER_R3,
];

class SporeTender extends Analyzer {
  static dependencies = {
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
    super(options);

    this.active = RANKS.some(({ enchant }) => this.selectedCombatant.hasWeaponEnchant(enchant));

    if (!this.active) {
      return;
    }

    this.value = RANKS.find(({ enchant }) => this.selectedCombatant.hasWeaponEnchant(enchant))
      ?.value as number;

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

  statistic() {
    const rows = Object.entries(this.targetStatistics)
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

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        dropdown={dropdown}
        tooltip={
          <>
            <SpellLink spell={SPELLS.SPORE_TENDER_ENCHANT} /> triggered {totalProcs} times (
            {this.owner.getPerMinute(totalProcs).toFixed(1)} procs per minute)
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SPORE_TENDER_ENCHANT}>
          {totalProcs}{' '}
          <small>
            buffs of <strong>{this.value}</strong> secondary stats
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SporeTender;
