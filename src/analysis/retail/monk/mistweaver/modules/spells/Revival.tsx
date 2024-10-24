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

import { LESSONS_BUFFS, SPELL_COLORS } from '../../constants';
import { isFromRevival } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { PerformanceMark } from 'interface/guide';
import ShaohaosLessons from './ShaohaosLessons';
import InformationIcon from 'interface/icons/Information';
import SpellUsable from 'parser/shared/modules/SpellUsable';

interface RevivalCastTracker {
  timeStamp: number; // time of cast
  lessonsBuffActive: boolean; // was SG pre cast
  celestialOnCd: boolean;
}

class Revival extends Analyzer {
  static dependencies = {
    shaohaos: ShaohaosLessons,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected shaohaos!: ShaohaosLessons;
  castTracker: RevivalCastTracker[] = [];

  activeTalent!: Talent;
  revivalDirectHealing: number = 0;
  revivalDirectOverHealing: number = 0;
  upliftedSpiritsActive: boolean = false;
  usHealing: number = 0;
  usOverhealing: number = 0;

  gustsHealing: number = 0;
  gustOverHealing: number = 0;
  minEfHotsBeforeCast: number = 0;

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
      lessonsBuffActive: LESSONS_BUFFS.some((buff) => this.selectedCombatant.hasBuff(buff.id)),
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
        relatively short checklist to maximize its healing. If talented into{' '}
        <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />, always pre-cast{' '}
        <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> if your next buff is not{' '}
        <SpellLink spell={SPELLS.LESSON_OF_FEAR_BUFF} />. If talented into{' '}
        <SpellLink spell={TALENTS_MONK.JADE_BOND_TALENT} />, make sure to use{' '}
        <SpellLink spell={this.getRevivalTalent()} /> while your celestial is on cooldown in order
        to get celestial CDR.
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
          if (this.selectedCombatant.hasTalent(TALENTS_MONK.SHAOHAOS_LESSONS_TALENT)) {
            let lessonPerf = QualitativePerformance.Fail;
            if (
              cast.lessonsBuffActive ||
              this.shaohaos.getNextBuff() === SPELLS.LESSON_OF_FEAR_BUFF
            ) {
              lessonPerf = QualitativePerformance.Good;
            }
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} /> buff active if next
                  buff is not <SpellLink spell={SPELLS.LESSON_OF_FEAR_BUFF} />
                  <Tooltip
                    hoverable
                    content={
                      <>
                        Make sure to use <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} />{' '}
                        right before <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT} /> if the next
                        buff is not
                        <SpellLink spell={SPELLS.LESSON_OF_FEAR_BUFF} /> as haste does not buff{' '}
                        <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT} /> in any way.
                      </>
                    }
                  >
                    <span>
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PerformanceMark perf={lessonPerf} />,
              details: <>{lessonPerf === QualitativePerformance.Good ? <>Yes</> : <>No</>}</>,
            });
            allPerfs.push(lessonPerf);
          }
          if (this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_BOND_TALENT)) {
            const jbPerf = cast.celestialOnCd
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={this.getCelestialTalent()} /> on cooldown
                  <Tooltip
                    hoverable
                    content={
                      <>
                        Make sure to cast <SpellLink spell={this.getRevivalTalent()} /> when your
                        celestial is on cooldown in order to get celestial CDR from{' '}
                        <SpellLink spell={TALENTS_MONK.JADE_BOND_TALENT} />
                      </>
                    }
                  >
                    <span>
                      {' '}
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PerformanceMark perf={jbPerf} />,
              details: <>{jbPerf === QualitativePerformance.Good ? <>Yes</> : <>No</>}</>,
            });
            allPerfs.push(jbPerf);
          }
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
