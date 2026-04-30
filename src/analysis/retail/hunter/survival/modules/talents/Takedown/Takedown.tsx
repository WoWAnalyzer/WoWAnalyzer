import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import Events, { CastEvent } from 'parser/core/Events';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TooltipElement } from 'interface/Tooltip';

export const TAKEDOWN_WINDOW_MS = 8_000;
export const WINDOW_EXTENSION_MS = 3_000;
const MAX_TIP_STACKS = 3;

export interface TakedownCast {
  castEvent: CastEvent;
  isFirstTakedown: boolean;
  hasRaptorSwipeBuff: boolean;
  tipStacks: number;
  wastedTipStacks: number;
  castsInWindow: CastEvent[];
  windowEnd: number;
}

export default class Takedown extends Analyzer {
  readonly isPackLeader: boolean;
  private readonly hasTwinFangs: boolean;
  private readonly kcStacksGenerated: number;

  readonly takedownCasts: TakedownCast[] = [];

  constructor(options: Options) {
    super(options);

    this.isPackLeader = !this.selectedCombatant.hasTalent(TALENTS.MOONLIGHT_CHAKRAM_TALENT);
    this.hasTwinFangs = this.selectedCombatant.hasTalent(TALENTS.TWIN_FANGS_TALENT);
    this.kcStacksGenerated = this.selectedCombatant.hasTalent(TALENTS.PRIMAL_SURGE_TALENT) ? 2 : 1;

    this.active = this.selectedCombatant.hasTalent(TALENTS.TAKEDOWN_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
  }

  private get currentWindow(): TakedownCast | undefined {
    return this.takedownCasts.at(-1);
  }

  private onAnyCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.TAKEDOWN_PLAYER.id) {
      this.onTakedown(event);
      return;
    }

    // Accumulate casts that fall inside the current window
    const window = this.currentWindow;
    if (window && event.timestamp <= window.windowEnd) {
      window.castsInWindow.push(event);

      // Kill Command while TotS would overflow the cap = wasted stacks
      if (event.ability.guid === TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id) {
        const tipStacks = this.selectedCombatant.getBuffStacks(SPELLS.TIP_OF_THE_SPEAR_CAST.id);
        const overflow = tipStacks + this.kcStacksGenerated - MAX_TIP_STACKS;
        if (overflow > 0) {
          window.wastedTipStacks += overflow;
        }
      }
    }
  }

  private onTakedown(event: CastEvent) {
    const isFirstTakedown = this.takedownCasts.length === 0;
    const hasRaptorSwipeBuff =
      this.selectedCombatant.hasBuff(SPELLS.RAPTOR_SWIPE_BUFF.id) ||
      this.selectedCombatant.hasBuff(SPELLS.RAPTOR_SWIPE_BUFF_2.id);
    const tipStacks = this.selectedCombatant.getBuffStacks(SPELLS.TIP_OF_THE_SPEAR_CAST.id);

    const windowEnd = event.timestamp + TAKEDOWN_WINDOW_MS + WINDOW_EXTENSION_MS;

    this.takedownCasts.push({
      castEvent: event,
      isFirstTakedown,
      hasRaptorSwipeBuff,
      tipStacks,
      wastedTipStacks: 0,
      castsInWindow: [],
      windowEnd,
    });
  }

  checklist(cast: TakedownCast): {
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

    // 1. Raptor Swipe buffed before cast
    const swipeBuffPerf = cast.hasRaptorSwipeBuff
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    downgrade(swipeBuffPerf);
    items.push({
      label: (
        <>
          <SpellLink spell={SPELLS.RAPTOR_SWIPE_BUFF} />{' '}
          <TooltipElement
            content={
              <>
                <SpellLink spell={SPELLS.RAPTOR_SWIPE_BUFF} /> can be primed to maximise the number
                of <SpellLink spell={TALENTS.STRIKE_AS_ONE_TALENT} /> procs from our Apex Talent
                during <SpellLink spell={TALENTS.TAKEDOWN_TALENT} />.
              </>
            }
          >
            (?)
          </TooltipElement>
        </>
      ),
      result: <PerformanceMark perf={swipeBuffPerf} />,
      details: !cast.hasRaptorSwipeBuff ? (
        <TooltipElement content="not primed before cast">(?) </TooltipElement>
      ) : null,
    });

    // 2. Tip of the Spear stacks at cast
    if (this.hasTwinFangs) {
      // Twin Fangs generates TotS during Takedown, so ideally enter with 0 stacks
      const tipPerf =
        cast.tipStacks === 0 ? QualitativePerformance.Good : QualitativePerformance.Ok;
      downgrade(tipPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> at cast{' '}
            <TooltipElement
              content={
                <>
                  With <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown generates{' '}
                  <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own. Enter
                  Takedown with 0 stacks to avoid wasting stacks generated by Twin Fangs.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={tipPerf} />,
        details:
          cast.tipStacks > 0 ? (
            <TooltipElement
              content={`${cast.tipStacks} stack${cast.tipStacks !== 1 ? 's' : ''} at cast — dump before Takedown`}
            >
              (?)
            </TooltipElement>
          ) : null,
      });
    } else {
      // Without Twin Fangs, Takedown does not generate stacks — need them going in
      const tipPerf =
        cast.tipStacks >= 2
          ? QualitativePerformance.Good
          : cast.tipStacks === 1
            ? QualitativePerformance.Ok
            : QualitativePerformance.Fail;
      downgrade(tipPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> at cast{' '}
            <TooltipElement
              content={
                <>
                  Without <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown does not
                  generate <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own. Use{' '}
                  <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> before Takedown to
                  maximise stacks during the window.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={tipPerf} />,
        details: (
          <TooltipElement
            content={`${cast.tipStacks} stack${cast.tipStacks !== 1 ? 's' : ''} at cast`}
          >
            (?)
          </TooltipElement>
        ),
      });
    }

    // 3. Wasted Tip of the Spear (KC cast while capped)
    const tipWastePerf =
      cast.wastedTipStacks === 0 ? QualitativePerformance.Good : QualitativePerformance.Fail;
    downgrade(tipWastePerf);
    items.push({
      label: (
        <>
          <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} />{' '}
          <TooltipElement
            content={
              <>
                Spending <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks always takes
                priority over generating new ones. Do not use{' '}
                <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> unless spawning a Beast
                or out of tip stacks/focus.
              </>
            }
          >
            (?)
          </TooltipElement>
        </>
      ),
      result: <PerformanceMark perf={tipWastePerf} />,
      details:
        cast.wastedTipStacks > 0 ? (
          <TooltipElement
            content={`${cast.wastedTipStacks} stack${cast.wastedTipStacks !== 1 ? 's' : ''} wasted`}
          >
            (?)
          </TooltipElement>
        ) : null,
    });

    return { checklist: items, perf: overallPerf };
  }
}
