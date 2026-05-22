import { formatPercentage } from 'common/format';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  SummonEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { CSSProperties, JSX } from 'react';
import SpellUsable from '../core/SpellUsable';

const LEGEND_DOT_BASE_STYLE: CSSProperties = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginRight: '6px',
};

class Putrefy extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private chargesSpentDuringDarkTransformation = 0;
  private chargesSpentOutsideDarkTransformation = 0;
  private readonly entries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PUTREFY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.PUTREFY_TALENT),
      this.onPutrefyCooldownUpdate,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.HARBINGER_OF_DOOM_TALENT)) {
      this.addEventListener(
        Events.summon.by(SELECTED_PLAYER).spell(DK_SPELLS.LESSER_GHOUL),
        this.onHarbingerOfDoomLesserGhoulSummon,
      );
    }
  }

  private onPutrefyCooldownUpdate(event: UpdateSpellUsableEvent) {
    if (
      event.updateType !== UpdateSpellUsableType.BeginCooldown &&
      event.updateType !== UpdateSpellUsableType.UseCharge
    ) {
      return;
    }

    if (this.selectedCombatant.hasBuff(DK_SPELLS.DARK_TRANSFORMATION_BUFF)) {
      this.chargesSpentDuringDarkTransformation += 1;
      this.entries.push({
        value: QualitativePerformance.Good,
        tooltip: (
          <>
            Spent @ {this.owner.formatTimestamp(event.timestamp)} during{' '}
            <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />.
          </>
        ),
      });
      return;
    }

    this.chargesSpentOutsideDarkTransformation += 1;
    this.entries.push({
      value: QualitativePerformance.Fail,
      tooltip: (
        <>
          Spent @ {this.owner.formatTimestamp(event.timestamp)} outside{' '}
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />.
        </>
      ),
    });
  }

  private onHarbingerOfDoomLesserGhoulSummon(_event: SummonEvent) {
    this.deps.spellUsable.reduceCooldown(TALENTS.PUTREFY_TALENT.id, 2500);
  }

  get totalChargesSpent(): number {
    return this.chargesSpentDuringDarkTransformation + this.chargesSpentOutsideDarkTransformation;
  }

  get efficiency(): number {
    return this.totalChargesSpent > 0
      ? 1 - this.chargesSpentOutsideDarkTransformation / this.totalChargesSpent
      : 1;
  }

  private get breakdownItems() {
    return [
      {
        color: '#22c55e',
        label: (
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF}>
            During Dark Transformation
          </SpellLink>
        ),
        value: this.chargesSpentDuringDarkTransformation,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.chargesSpentDuringDarkTransformation} <SpellLink spell={TALENTS.PUTREFY_TALENT} />{' '}
            charges spent during <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </>
        ),
      },
      {
        color: '#ef4444',
        label: (
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF}>
            Outside Dark Transformation
          </SpellLink>
        ),
        value: this.chargesSpentOutsideDarkTransformation,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.chargesSpentOutsideDarkTransformation}{' '}
            <SpellLink spell={TALENTS.PUTREFY_TALENT} /> charges spent outside{' '}
            <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </>
        ),
      },
    ];
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.PUTREFY_TALENT} />
        </strong>{' '}
        should only be used during <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />.
        Spending charges outside this window is a damage loss, so your goal is 100%{' '}
        <SpellLink spell={TALENTS.PUTREFY_TALENT} /> usage during{' '}
        <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />.
      </p>
    );

    const data = (
      <div>
        <div style={{ marginBottom: '6px' }}>
          <strong>
            <SpellLink spell={TALENTS.PUTREFY_TALENT} /> charge usage
          </strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>{formatPercentage(this.efficiency, 0)}%</strong> <small>efficiency</small>
        </div>
        <p style={{ margin: '0 0 8px 0' }}>
          Only use <SpellLink spell={TALENTS.PUTREFY_TALENT} /> charges during{' '}
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />.
        </p>
        <small style={{ display: 'grid', gap: '2px', marginBottom: '6px' }}>
          <span>
            <span
              style={{
                ...LEGEND_DOT_BASE_STYLE,
                backgroundColor: '#4caf50',
              }}
            />
            During <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </span>
          <span>
            <span
              style={{
                ...LEGEND_DOT_BASE_STYLE,
                backgroundColor: '#ef5350',
              }}
            />
            Outside <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </span>
        </small>
        <div style={{ marginBottom: '8px' }}>
          <PerformanceBoxRow values={this.entries} />
        </div>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.PUTREFY_TALENT}>
          <div>
            {formatPercentage(this.efficiency, 0)}% <small>efficiency</small>
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart items={this.breakdownItems} />
        </div>
      </Statistic>
    );
  }
}

export default Putrefy;
