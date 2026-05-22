import { Trans } from '@lingui/react/macro';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import PerformanceBar from 'parser/ui/PerformanceBar';
import { useState } from 'react';
import Toggle from 'interface/react-toggle';

import HealingEfficiencyTracker, { SpellInfoDetails } from './HealingEfficiencyTracker';
import type Spell from 'common/SPELLS/Spell';

interface Props<T extends HealingEfficiencyTracker = HealingEfficiencyTracker> {
  tracker: T;
  disableDamageToggle?: boolean;
}

export const BarHeader = ({ showHealing }: { showHealing: boolean }) => (
  <>
    <th>
      <Trans id="shared.healingEfficiency.tableHeader.manaSpent">Mana Spent</Trans>
    </th>
    {showHealing && (
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
            <Trans id="common.stat.healingPerExecutionTime">Healing per second spent casting</Trans>
          </TooltipElement>
        </th>
      </>
    )}
    {!showHealing && (
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

export const DetailHeader = ({ showHealing }: { showHealing: boolean }) => (
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
    {showHealing && (
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
    {!showHealing && (
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

const BarView = (
  spellDetail: SpellInfoDetails,
  topHpm: number,
  topDpm: number,
  topHpet: number,
  topDpet: number,
  showHealing: boolean,
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
      {showHealing && (
        <>
          <td className="text-right">{hasHealing ? spellDetail.hpm.toFixed(2) : '-'}</td>
          <td width={barWidth + '%'}>
            <PerformanceBar percent={spellDetail.hpm / topHpm} />
          </td>

          <td className="text-right">{hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}</td>
          <td width={barWidth + '%'}>
            <PerformanceBar percent={spellDetail.hpet / topHpet} />
          </td>
        </>
      )}
      {!showHealing && (
        <>
          <td className="text-right">{hasDamage ? spellDetail.dpm.toFixed(2) : '-'}</td>
          <td width={barWidth + '%'}>
            <PerformanceBar percent={spellDetail.dpm / topDpm} />
          </td>

          <td className="text-right">{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
          <td width={barWidth + '%'}>
            <PerformanceBar percent={spellDetail.dpet / topDpet} />
          </td>
        </>
      )}
    </>
  );
};

const DetailView = (spellDetail: SpellInfoDetails, showHealing: boolean) => {
  const hasHealing = spellDetail.healingDone;
  const hasOverhealing = spellDetail.healingDone > 0 || spellDetail.overhealingDone > 0;
  const hasDamage = spellDetail.damageDone > 0;

  return (
    <>
      <td>
        {spellDetail.casts} (
        {showHealing ? Math.floor(spellDetail.healingHits) : Math.floor(spellDetail.damageHits)})
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
      {showHealing && (
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
      {!showHealing && (
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

const HealingEfficiencySpellRow = (
  spellDetail: SpellInfoDetails,
  topHpm: number,
  topDpm: number,
  topHpet: number,
  topDpet: number,
  showHealing: boolean,
  detailedView: boolean,
) => (
  <tr key={spellDetail.spell.id}>
    <td>
      <SpellLink
        spell={'icon' in spellDetail.spell ? (spellDetail.spell as Spell) : spellDetail.spell.id}
      />
    </td>
    {detailedView
      ? DetailView(spellDetail, showHealing)
      : BarView(spellDetail, topHpm, topDpm, topHpet, topDpet, showHealing)}
  </tr>
);

interface TableProps {
  tracker: HealingEfficiencyTracker;
  showHealing: boolean;
  detailedView: boolean;
  showCooldowns: boolean;
}

export const HealingEfficiencyTable = ({
  tracker,
  showHealing,
  detailedView,
  showCooldowns,
}: TableProps) => {
  const { spells, topHpm, topDpm, topHpet, topDpet } = tracker.getAllSpellStats(showCooldowns);

  const spellArray = Object.values(spells);

  spellArray.sort((a, b) => {
    if (showHealing) {
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
      return HealingEfficiencySpellRow(
        spellDetail,
        topHpm,
        topDpm,
        topHpet,
        topDpet,
        showHealing,
        detailedView,
      );
    }
    return null;
  });

  return <>{spellRows}</>;
};

const HealingEfficiencyBreakdown = ({ tracker, disableDamageToggle }: Props) => {
  const [showHealing, setShowHealing] = useState(true);
  const [detailedView, setDetailedView] = useState(false);
  const [showCooldowns, setShowCooldowns] = useState(false);

  return (
    <>
      <div className="pad" style={{ paddingTop: 10 }}>
        <div className="pull-left">
          <div className="toggle-control pull-right" style={{ marginRight: '.5em' }}>
            <Toggle
              defaultChecked={false}
              icons={false}
              onChange={(event) => setDetailedView(event.target.checked)}
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
              onChange={(event) => setShowCooldowns(event.target.checked)}
              id="cooldown-toggle"
            />
            <label htmlFor="cooldown-toggle" style={{ marginLeft: '0.5em' }}>
              <Trans id="shared.healingEfficiency.toggle.cooldowns">Show Cooldowns</Trans>
            </label>
          </div>
          {!disableDamageToggle && (
            <div className="toggle-control pull-left" style={{ marginLeft: '.5em' }}>
              <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                <Trans id="shared.healingEfficiency.toggle.damage">Show Damage</Trans>
              </label>
              <Toggle
                defaultChecked
                icons={false}
                onChange={(event) => setShowHealing(event.target.checked)}
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
            {detailedView ? (
              <DetailHeader showHealing={showHealing} />
            ) : (
              <BarHeader showHealing={showHealing} />
            )}
          </tr>
        </thead>
        <tbody>
          <HealingEfficiencyTable
            tracker={tracker}
            showHealing={showHealing}
            detailedView={detailedView}
            showCooldowns={showCooldowns}
          />
        </tbody>
      </table>
    </>
  );
};

export default HealingEfficiencyBreakdown;
