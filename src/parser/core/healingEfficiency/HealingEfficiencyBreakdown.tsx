import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import PerformanceBar from 'parser/ui/PerformanceBar';
import { Component } from 'react';
import Toggle from 'react-toggle';

import HealingEfficiencyTracker, { SpellInfoDetails } from './HealingEfficiencyTracker';

interface Props<T extends HealingEfficiencyTracker = HealingEfficiencyTracker> {
  tracker: T;
  disableDamageToggle?: boolean;
}
interface State {
  showHealing: boolean;
  detailedView: boolean;
  showCooldowns: boolean;
  showEchoOfLight?: boolean;
}

class HealingEfficiencyBreakdown extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showHealing: true,
      detailedView: false,
      showCooldowns: false,
    };
  }

  HealingEfficiencyTable = (props: Props) => {
    const { tracker } = props;
    const { spells, topHpm, topDpm, topHpet, topDpet } = tracker.getAllSpellStats(
      this.state.showCooldowns,
    );

    const spellArray = Object.values(spells);

    spellArray.sort((a, b) => {
      if (this.state.showHealing) {
        if (a.hpm < b.hpm) {
          return 1;
        } else if (a.hpm > b.hpm) {
          return -1;
        }
      } else {
        if (a.dpm < b.dpm) {
          return 1;
        } else if (a.dpm > b.dpm) {
          return -1;
        }
      }

      return 0;
    });

    const spellRows = spellArray.map((spellDetail) => {
      if (spellDetail.casts > 0) {
        return this.HealingEfficiencySpellRow(spellDetail, topHpm, topDpm, topHpet, topDpet);
      }
      return null;
    });

    return <>{spellRows}</>;
  };

  HealingEfficiencySpellRow = (
    spellDetail: SpellInfoDetails,
    topHpm: number,
    topDpm: number,
    topHpet: number,
    topDpet: number,
  ) => (
    <tr key={spellDetail.spell.id}>
      <td>
        <SpellLink spell={spellDetail.spell} />
      </td>
      {this.state.detailedView
        ? this.DetailView(spellDetail)
        : this.BarView(spellDetail, topHpm, topDpm, topHpet, topDpet)}
    </tr>
  );

  BarHeader = () => (
    <>
      <th>
        <Trans id="shared.healingEfficiency.tableHeader.manaSpent">Mana Spent</Trans>
      </th>
      {this.state.showHealing && (
        <>
          <th colSpan={2} className="text-center">
            <Trans id="common.stat.healingPerMana">Healing per mana spent</Trans>
          </th>
          <th colSpan={2} className="text-center">
            <TooltipElement
              content={
                <Trans id="common.stat.healingPerExecutionTime.long">
                  Healing per second spent casting the spell, including GCD wait time.
                </Trans>
              }
            >
              <Trans id="common.stat.healingPerExecutionTime">
                Healing per second spent casting
              </Trans>
            </TooltipElement>
          </th>
        </>
      )}
      {!this.state.showHealing && (
        <>
          <th colSpan={2} className="text-center">
            <Trans id="common.stat.damagePerMana">Damage per mana spent</Trans>
          </th>
          <th colSpan={2} className="text-center">
            <Trans id="common.stat.damagePerExecutionTime.long">
              Damage per second spent casting the spell
            </Trans>
          </th>
        </>
      )}
    </>
  );

  BarView = (
    spellDetail: SpellInfoDetails,
    topHpm: number,
    topDpm: number,
    topHpet: number,
    topDpet: number,
  ) => {
    const hasHealing = spellDetail.healingDone;
    const hasDamage = spellDetail.damageDone > 0;
    const barWidth = 20;

    return (
      <>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        {this.state.showHealing && (
          <>
            <td className="text-right">{hasHealing ? spellDetail.hpm.toFixed(2) : '-'}</td>
            <td width={barWidth + '%'}>
              <PerformanceBar percent={spellDetail.hpm / topHpm} />
            </td>

            <td className="text-right">
              {hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}
            </td>
            <td width={barWidth + '%'}>
              <PerformanceBar percent={spellDetail.hpet / topHpet} />
            </td>
          </>
        )}
        {!this.state.showHealing && (
          <>
            <td className="text-right">{hasDamage ? spellDetail.dpm.toFixed(2) : '-'}</td>
            <td width={barWidth + '%'}>
              <PerformanceBar percent={spellDetail.dpm / topDpm} />
            </td>

            <td className="text-right">
              {hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}
            </td>
            <td width={barWidth + '%'}>
              <PerformanceBar percent={spellDetail.dpet / topDpet} />
            </td>
          </>
        )}
      </>
    );
  };

  DetailHeader = () => (
    <>
      <th>
        <TooltipElement
          content={
            <Trans id="shared.healingEfficiency.tableHeader.casts.tooltip">
              Total Casts (Number of targets hit)
            </Trans>
          }
        >
          <Trans id="shared.healingEfficiency.tableHeader.casts">Casts</Trans>
        </TooltipElement>
      </th>
      <th>
        <Trans id="shared.healingEfficiency.tableHeader.manaSpent">Mana Spent</Trans>
      </th>
      <th>
        <Trans id="shared.healingEfficiency.tableHeader.timeSpent">Time Spent</Trans>
      </th>
      {this.state.showHealing && (
        <>
          <th>
            <Trans id="shared.healingEfficiency.tableHeader.healingDone">Healing Done</Trans>
          </th>
          <th>
            <Trans id="shared.healingEfficiency.tableHeader.overhealingDone">Overhealing</Trans>
          </th>
          <th>
            <TooltipElement
              content={
                <Trans id="common.stat.healingPerMana.long">
                  Healing per mana spent casting the spell
                </Trans>
              }
            >
              <Trans id="common.stat.healingPerMana.short">HPM</Trans>
            </TooltipElement>
          </th>
          <th>
            <TooltipElement
              content={
                <Trans id="common.stat.healingPerExecutionTime.long">
                  Healing per second spent casting the spell, including GCD wait time.
                </Trans>
              }
            >
              <Trans id="common.stat.healingPerExecutionTime.short">HPET</Trans>
            </TooltipElement>
          </th>
        </>
      )}
      {!this.state.showHealing && (
        <>
          <th>
            <Trans id="shared.healingEfficiency.tableHeader.damageDone">Damage Done</Trans>
          </th>
          <th>
            <TooltipElement
              content={
                <Trans id="common.stat.damagePerMana.long">
                  Damage per mana spent casting the spell
                </Trans>
              }
            >
              <Trans id="common.stat.damagePerMana.short">DPM</Trans>
            </TooltipElement>
          </th>
          <th>
            <TooltipElement
              content={
                <Trans id="common.stat.damagePerExecutionTime.long">
                  Damage per second spent casting the spell
                </Trans>
              }
            >
              <Trans id="common.stat.damagePerExecutionTime.short">DPET</Trans>
            </TooltipElement>
          </th>
        </>
      )}
    </>
  );

  DetailView = (spellDetail: SpellInfoDetails) => {
    const hasHealing = spellDetail.healingDone;
    const hasOverhealing = spellDetail.healingDone > 0 || spellDetail.overhealingDone > 0;
    const hasDamage = spellDetail.damageDone > 0;

    return (
      <>
        <td>
          {spellDetail.casts} (
          {this.state.showHealing
            ? Math.floor(spellDetail.healingHits)
            : Math.floor(spellDetail.damageHits)}
          )
        </td>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        <td>
          {spellDetail.timeSpentCasting !== 0
            ? formatDuration(spellDetail.timeSpentCasting) +
              ' (' +
              formatPercentage(spellDetail.percentTimeSpentCasting) +
              '%)'
            : '-'}
        </td>
        {this.state.showHealing && (
          <>
            <td>
              {hasHealing ? formatNumber(spellDetail.healingDone) : '-'}
              {hasHealing ? ' (' + formatPercentage(spellDetail.percentHealingDone) + '%)' : ''}
            </td>
            <td>
              {hasOverhealing ? formatNumber(spellDetail.overhealingDone) : '-'}
              {hasOverhealing
                ? ' (' + formatPercentage(spellDetail.percentOverhealingDone) + '%)'
                : ''}
            </td>
            <td>{hasHealing ? spellDetail.hpm.toFixed(2) : '-'}</td>
            <td>{hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}</td>
          </>
        )}
        {!this.state.showHealing && (
          <>
            <td>
              {hasDamage ? formatNumber(spellDetail.damageDone) : '-'}
              {hasDamage ? ' (' + formatPercentage(spellDetail.percentDamageDone) + '%)' : ''}
            </td>
            <td>{hasDamage ? spellDetail.dpm.toFixed(2) : '-'}</td>
            <td>{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
          </>
        )}
      </>
    );
  };

  render() {
    const { tracker } = this.props;

    return (
      <>
        <div className="pad" style={{ paddingTop: 10 }}>
          <div className="pull-left">
            <div className="toggle-control pull-right" style={{ marginRight: '.5em' }}>
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={(event) => this.setState({ detailedView: event.target.checked })}
                id="detailed-toggle"
              />
              <label htmlFor="detailed-toggle" style={{ marginLeft: '0.5em' }}>
                <Trans id="shared.healingEfficiency.toggle.detailed">Detailed View</Trans>
              </label>
            </div>
          </div>
          <div className="pull-right">
            <div
              className="toggle-control pull-left"
              style={{ marginLeft: '.5em', marginRight: '.5em' }}
            >
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={(event) => this.setState({ showCooldowns: event.target.checked })}
                id="cooldown-toggle"
              />
              <label htmlFor="cooldown-toggle" style={{ marginLeft: '0.5em' }}>
                <Trans id="shared.healingEfficiency.toggle.cooldowns">Show Cooldowns</Trans>
              </label>
            </div>
            {!this.props.disableDamageToggle && (
              <div className="toggle-control pull-left" style={{ marginLeft: '.5em' }}>
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                  <Trans id="shared.healingEfficiency.toggle.damage">Show Damage</Trans>
                </label>
                <Toggle
                  defaultChecked
                  icons={false}
                  onChange={(event) => this.setState({ showHealing: event.target.checked })}
                  id="healing-toggle"
                />
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em' }}>
                  <Trans id="shared.healingEfficiency.toggle.healing">Show Healing</Trans>
                </label>
              </div>
            )}
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <Trans id="common.ability">Ability</Trans>
              </th>
              {this.state.detailedView ? <this.DetailHeader /> : <this.BarHeader />}
            </tr>
          </thead>
          <tbody>
            <this.HealingEfficiencyTable tracker={tracker} />
          </tbody>
        </table>
      </>
    );
  }
}

export default HealingEfficiencyBreakdown;
