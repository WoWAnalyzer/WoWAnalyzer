import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import { PerformanceMark } from 'interface/guide';
import UptimeIcon from 'interface/icons/Uptime';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from '../core/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TooltipElement } from 'interface/Tooltip';
import { BESTIAL_WRATH_DURATION_MS } from '../../constants';

export interface BestialWrathCast {
  castEvent: CastEvent;
  isFirstCast: boolean;
  barbedShotCharges: number;
  wailingArrowCastInWindow: boolean;
  windowEnd: number;
}

class BestialWrath extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  casts = 0;
  accumulatedFocusAtBWCast = 0;

  readonly bestialWrathCasts: BestialWrathCast[] = [];
  readonly isDarkRanger: boolean;
  readonly hasScentOfBlood: boolean;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT);
    this.isDarkRanger = this.selectedCombatant.hasTalent(TALENTS.WAILING_DEAD_TALENT);
    this.hasScentOfBlood = this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathCast,
    );

    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathRemove,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WAILING_ARROW_DAMAGE),
      this.onWailingArrow,
    );
  }

  get percentUptime() {
    return formatPercentage(
      this.selectedCombatant.getBuffUptime(TALENTS.BESTIAL_WRATH_TALENT.id) /
        this.owner.fightDuration,
    );
  }

  get averageFocusAtBestialWrathCast() {
    return this.accumulatedFocusAtBWCast / this.casts;
  }

  private get currentWindow(): BestialWrathCast | undefined {
    return this.bestialWrathCasts.at(-1);
  }

  onBestialWrathCast(event: CastEvent) {
    this.casts += 1;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (resource) {
      this.accumulatedFocusAtBWCast += resource.amount || 0;
    }

    const barbedShotCharges = this.spellUsable.chargesAvailable(TALENTS.BARBED_SHOT_TALENT.id);

    this.bestialWrathCasts.push({
      castEvent: event,
      isFirstCast: this.bestialWrathCasts.length === 0,
      barbedShotCharges,
      wailingArrowCastInWindow: false,
      windowEnd: event.timestamp + BESTIAL_WRATH_DURATION_MS,
    });
  }

  onBestialWrathRemove(event: RemoveBuffEvent) {
    const window = this.currentWindow;
    if (window) {
      window.windowEnd = event.timestamp;
    }
  }

  onWailingArrow(event: CastEvent) {
    const window = this.currentWindow;
    if (!window) {
      return;
    }
    window.wailingArrowCastInWindow = true;
  }

  checklist(cast: BestialWrathCast): {
    checklist: CooldownExpandableItem[];
    perf: QualitativePerformance;
  } {
    const items: CooldownExpandableItem[] = [];
    let overallPerf = QualitativePerformance.Good;

    const downgrade = (perf: QualitativePerformance) => {
      if (perf < overallPerf) {
        overallPerf = perf;
      }
    };

    // 1. Barbed Shot charges at BW cast (only with Scent of Blood).
    // 0 charges = good (spent both), 1 = ok (spent one), 2 = fail (didn't spend any).
    if (this.hasScentOfBlood) {
      let barbedPerf: QualitativePerformance;
      if (cast.barbedShotCharges === 0 || (cast.barbedShotCharges === 1 && cast.isFirstCast)) {
        barbedPerf = QualitativePerformance.Good;
      } else if (cast.barbedShotCharges === 1) {
        barbedPerf = QualitativePerformance.Ok;
      } else {
        barbedPerf = QualitativePerformance.Fail;
      }

      downgrade(barbedPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> charges should be spent before
                  casting <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} />. Having charges
                  available means you delayed spending them.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={barbedPerf} />,
        details:
          cast.barbedShotCharges > 0 ? (
            <TooltipElement
              content={
                cast.isFirstCast
                  ? `${cast.barbedShotCharges} charge${cast.barbedShotCharges !== 1 ? 's' : ''} available on first cast`
                  : `${cast.barbedShotCharges} charge${cast.barbedShotCharges !== 1 ? 's' : ''} available at cast`
              }
            >
              (?)
            </TooltipElement>
          ) : null,
      });
    }

    // 2. Wailing Arrow used during window (Dark Ranger only)
    if (this.isDarkRanger) {
      const wailingPerf = cast.wailingArrowCastInWindow
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;
      downgrade(wailingPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} />{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} /> should always be cast during{' '}
                  <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> to benefit from the damage
                  increase.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={wailingPerf} />,
        details: !cast.wailingArrowCastInWindow ? (
          <TooltipElement content="not cast during Bestial Wrath">(?) </TooltipElement>
        ) : null,
      });
    }

    return { checklist: items, perf: overallPerf };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left">
                    <b>Statistic</b>
                  </td>
                  <td>
                    <b>Info</b>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">Average focus on cast</td>
                  <td>
                    <>
                      {formatNumber(this.averageFocusAtBestialWrathCast)}
                      <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink />
                    </>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.BESTIAL_WRATH_TALENT}>
          <>
            <UptimeIcon /> {this.percentUptime}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BestialWrath;
