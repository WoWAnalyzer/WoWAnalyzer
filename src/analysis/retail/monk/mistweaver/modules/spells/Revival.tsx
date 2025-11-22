import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Talent } from 'common/TALENTS/types';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SPELL_COLORS } from '../../constants';
import { isFromRevival } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SpellUsable from 'parser/shared/modules/SpellUsable';

interface RevivalCastTracker {
  timeStamp: number; // time of cast
  celestialOnCd: boolean;
}

class Revival extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  castTracker: RevivalCastTracker[] = [];

  activeTalent!: Talent;
  revivalDirectHealing = 0;
  revivalDirectOverHealing = 0;
  upliftedSpiritsActive = false;
  usHealing = 0;
  usOverhealing = 0;

  gustsHealing = 0;
  gustOverHealing = 0;
  minEfHotsBeforeCast = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT);

    if (!this.active) {
      return;
    }
    this.upliftedSpiritsActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.UPLIFTED_SPIRITS_TALENT,
    );
    this.activeTalent = this.getRevivalTalent();
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS_MONK.REVIVAL_TALENT, TALENTS_MONK.RESTORAL_TALENT]),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.REVIVAL_TALENT),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.RESTORAL_TALENT),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGustsOfMists,
    );

    if (this.upliftedSpiritsActive) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.UPLIFTED_SPIRITS_HEAL),
        this.handleUsHeal,
      );
    }
  }

  getRevivalTalent() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
      ? TALENTS_MONK.RESTORAL_TALENT
      : TALENTS_MONK.REVIVAL_TALENT;
  }

  getCelestialTalent(): Talent {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
      ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT
      : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;
  }

  handleCast(event: CastEvent) {
    this.castTracker.push({
      timeStamp: event.timestamp,
      celestialOnCd: this.spellUsable.isOnCooldown(this.getCelestialTalent().id),
    });
  }

  handleRevivalDirect(event: HealEvent) {
    this.revivalDirectHealing += event.amount + (event.absorbed || 0);
    this.revivalDirectOverHealing += event.overheal || 0;
  }

  handleGustsOfMists(event: HealEvent) {
    if (isFromRevival(event)) {
      this.gustsHealing += event.amount + (event.absorbed || 0);
      this.gustOverHealing += event.overheal || 0;
    }
  }

  handleUsHeal(event: HealEvent) {
    this.usHealing += event.amount + (event.absorbed || 0);
    this.usOverhealing += event.overheal || 0;
  }

  renderRevivalChart() {
    const items = [
      {
        color: SPELL_COLORS.REVIVAL,
        label: this.activeTalent.name,
        spellId: this.activeTalent.id,
        value: this.revivalDirectHealing,
        valueTooltip: formatThousands(this.revivalDirectHealing),
      },
      {
        color: SPELL_COLORS.GUSTS_OF_MISTS,
        label: 'Gust Of Mist',
        spellId: SPELLS.GUSTS_OF_MISTS.id,
        value: this.gustsHealing,
        valueTooltip: formatThousands(this.gustsHealing),
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.UPLIFTED_SPIRITS_TALENT)) {
      items.push({
        color: SPELL_COLORS.UPLIFTED_SPIRITS,
        label: 'Uplifted Spirits',
        spellId: TALENTS_MONK.UPLIFTED_SPIRITS_TALENT.id,
        value: this.usHealing,
        valueTooltip: formatThousands(this.usHealing),
      });
    }

    return <DonutChart items={items} />;
  }

  get totalHealing() {
    return this.gustsHealing + this.revivalDirectHealing + this.usHealing;
  }

  get avgHealingPerCast() {
    return this.totalHealing / this.castTracker.length;
  }

  get avgRawPerCast() {
    return (
      (this.totalHealing +
        this.gustOverHealing +
        this.revivalDirectOverHealing +
        this.usOverhealing) /
      this.castTracker.length
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 55;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.getRevivalTalent()} />
        </strong>{' '}
        is a fairly straightforward cooldown that should be used to heal burst damage events with a
      </p>
    );
    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timeStamp)} &mdash;{' '}
              <SpellLink spell={this.getRevivalTalent()} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          const allPerfs: QualitativePerformance[] = [];
          const averagePerf = getLowestPerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={averagePerf}
              key={idx}
            />
          );
        })}
      </div>
    );
    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink spell={this.activeTalent}>{this.activeTalent.name}</SpellLink> breakdown
          </label>
          {this.renderRevivalChart()}
          <hr />
          <TooltipElement
            content={
              <>
                {formatNumber(this.avgRawPerCast)} <small>raw healing per cast</small>
              </>
            }
          >
            {formatNumber(this.avgHealingPerCast)} average Healing Per Cast
          </TooltipElement>
        </div>
      </Statistic>
    );
  }
}

export default Revival;
