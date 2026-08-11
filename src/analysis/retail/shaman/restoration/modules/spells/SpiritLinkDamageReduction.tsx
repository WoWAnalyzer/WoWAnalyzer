import { Trans } from '@lingui/react/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatThousands, formatNumber } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';
import { DAMAGE_REDUCTION } from 'src/analysis/retail/shaman/restoration/constants';
import DonutChart from 'parser/ui/DonutChart';
import { RESTORATION_COLORS } from 'src/analysis/retail/shaman/restoration/constants';

/**
 * >> Spirit Link Totem
 * Summons a totem at the target location for 6 sec, which reduces damage taken by all party and raid members within 10 yards by 10%.
 * Immediately and every 1 sec, the health of all affected players is redistributed evenly.
 *
 * >> Spouting Spirits
 * Spirit Link Totem reduces damage taken by an additional 5%, and it restores health to all nearby allies 1 second after it is dropped.
 * Healing reduced beyond 5 targets.
 */
class SpiritLinkDamageReduction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasSpoutingSpirits = false;
  damageReductionPercent = DAMAGE_REDUCTION.SPIRIT_LINK_TOTEM_BASE;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT);
    if (!this.active) {
      return;
    }

    this.hasSpoutingSpirits = this.selectedCombatant.hasTalent(TALENTS.SPOUTING_SPIRITS_TALENT);
    this.damageReductionPercent = this.hasSpoutingSpirits
      ? DAMAGE_REDUCTION.SPIRIT_LINK_TOTEM_SPOUTING_SPIRITS
      : DAMAGE_REDUCTION.SPIRIT_LINK_TOTEM_BASE;
  }

  totalDamageTaken = 0;
  damageReduced = 0;
  baseDamageReduced = 0;
  spoutingSpiritsDamageReduced = 0;

  get drps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  get filter() {
    const playerName = this.owner.player.name;

    return `
      IN RANGE
        FROM type='${EventType.ApplyBuff}'
          AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
          AND source.owner.name='${playerName}'
        TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
          AND source.owner.name='${playerName}'
        GROUP BY target
      END
    `;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      json = json as WCLDamageTakenTableResponse;

      this.totalDamageTaken = (json.entries as WCLDamageTaken[]).reduce(
        (damageTaken: number, entry) => damageTaken + entry.total,
        0,
      );
      this.damageReduced =
        (this.totalDamageTaken / (1 - this.damageReductionPercent)) * this.damageReductionPercent;

      if (this.hasSpoutingSpirits) {
        const preMitigationDamage = this.totalDamageTaken + this.damageReduced;
        this.baseDamageReduced = preMitigationDamage * DAMAGE_REDUCTION.SPIRIT_LINK_TOTEM_BASE;
        this.spoutingSpiritsDamageReduced = this.damageReduced - this.baseDamageReduced;
      } else {
        this.baseDamageReduced = this.damageReduced;
        this.spoutingSpiritsDamageReduced = 0;
      }
    });
  }

  get damageReductionSourceChart() {
    const items = [
      {
        color: RESTORATION_COLORS.SPIRIT_LINK_TOTEM_BASE,
        label: <Trans id="shaman.restoration.slt.chart.base">Base</Trans>,
        spellId: TALENTS.SPIRIT_LINK_TOTEM_TALENT.id,
        value: this.baseDamageReduced,
        valueTooltip: formatThousands(this.baseDamageReduced),
      },
      {
        color: RESTORATION_COLORS.SPOUTING_SPIRITS,
        label: <Trans id="shaman.restoration.slt.chart.spoutingSpirits">Spouting Spirits</Trans>,
        spellId: TALENTS.SPOUTING_SPIRITS_TALENT.id,
        value: this.spoutingSpiritsDamageReduced,
        valueTooltip: formatThousands(this.spoutingSpiritsDamageReduced),
      },
    ].filter((item) => item.value > 0);

    return <DonutChart items={items} />;
  }

  statistic() {
    const tooltip = (
      <Trans id="shaman.restoration.slt.statistic.tooltip">
        The total estimated damage reduced during Spirit Link was{' '}
        {formatThousands(this.damageReduced)} ({formatNumber(this.drps)} DRPS). This has a 99%
        accuracy.
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br />
        This value is calculated using the <i>Optional DRs</i> method. This results in the lowest
        possible damage reduction value being shown. This should be the correct value in most
        circumstances. Health redistribution is not part of this calculated value.
      </Trans>
    );

    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.SPIRIT_LINK_TOTEM_TALENT} />}
        value={
          <Trans id="shaman.restoration.slt.statistic.value">≈{formatNumber(this.drps)} DRPS</Trans>
        }
        label={<Trans id="shaman.restoration.slt.statistic.label">Damage reduction</Trans>}
        tooltip={tooltip}
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      >
        {this.hasSpoutingSpirits && (
          <aside className="pad">
            <hr />
            <header>
              <label>
                <Trans id="shaman.restoration.slt.chart.header">Damage Reduction Sources</Trans>
              </label>
            </header>
            {this.damageReductionSourceChart}
          </aside>
        )}
      </LazyLoadStatisticBox>
    );
  }
}

export default SpiritLinkDamageReduction;
