import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import Events, { CastEvent } from 'parser/core/Events';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ReactNode } from 'react';
import { TooltipElement } from 'interface/Tooltip';

export const TAKEDOWN_WINDOW_MS = 8_000;
export const WINDOW_EXTENSION_MS = 3_000;
const BOOMSTICK_LOOKBACK_MS = 6_000;
const MAX_TIP_STACKS = 3;

export interface TakedownCast {
  castEvent: CastEvent;
  isFirstTakedown: boolean;
  hasRaptorSwipeBuff: boolean;
  tipStacks: number;
  boomstickCooldownAtCast: number;
  hasBoomstickBeforeCast: boolean;
  wildfireBombCastInWindow: boolean;
  wastedTipStacks: number;
  castsInWindow: CastEvent[];
  windowEnd: number;
}

export default class Takedown extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  readonly isPackLeader: boolean;
  private readonly hasTwinFangs: boolean;
  private readonly hasBoomstick: boolean;
  private readonly kcStacksGenerated: number;

  readonly takedownCasts: TakedownCast[] = [];

  private lastBoomstickTimestamp = -Infinity;

  constructor(options: Options) {
    super(options);

    this.isPackLeader = !this.selectedCombatant.hasTalent(TALENTS.MOONLIGHT_CHAKRAM_TALENT);
    this.hasTwinFangs = this.selectedCombatant.hasTalent(TALENTS.TWIN_FANGS_TALENT);
    this.hasBoomstick = this.selectedCombatant.hasTalent(TALENTS.BOOMSTICK_TALENT);
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
    if (event.ability.guid === TALENTS.BOOMSTICK_TALENT.id) {
      this.lastBoomstickTimestamp = event.timestamp;
    }

    if (event.ability.guid === SPELLS.TAKEDOWN_PLAYER.id) {
      this.onTakedown(event);
      return;
    }

    // Accumulate casts that fall inside the current window
    const window = this.currentWindow;
    if (window && event.timestamp <= window.windowEnd) {
      window.castsInWindow.push(event);

      if (event.ability.guid === TALENTS.WILDFIRE_BOMB_TALENT.id) {
        window.wildfireBombCastInWindow = true;
      }

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

    const boomstickCooldownAtCast = this.hasBoomstick
      ? this.deps.spellUsable.cooldownRemaining(TALENTS.BOOMSTICK_TALENT.id)
      : 0;

    const hasBoomstickBeforeCast =
      this.hasBoomstick && event.timestamp - this.lastBoomstickTimestamp <= BOOMSTICK_LOOKBACK_MS;

    const windowEnd = event.timestamp + TAKEDOWN_WINDOW_MS + WINDOW_EXTENSION_MS;

    this.takedownCasts.push({
      castEvent: event,
      isFirstTakedown,
      hasRaptorSwipeBuff,
      tipStacks,
      boomstickCooldownAtCast,
      hasBoomstickBeforeCast,
      wildfireBombCastInWindow: false,
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

    // 2. Tip of the Spear active at cast (only without Twin Fangs)
    if (!this.hasTwinFangs) {
      const tipPerf =
        cast.tipStacks > 0 ? QualitativePerformance.Good : QualitativePerformance.Fail;
      downgrade(tipPerf);
      items.push({
        label: (
          <>
            Takedown Tipped{' '}
            <TooltipElement
              content={
                <>
                  Without <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown does not
                  generate <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own.
                  Cast Takedown with at least one stack active.
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

    // 3. No Wildfire Bomb during the Takedown window (Pack Leader only)
    if (this.isPackLeader) {
      const wfbPerf = cast.wildfireBombCastInWindow
        ? QualitativePerformance.Fail
        : QualitativePerformance.Good;
      downgrade(wfbPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> to extend{' '}
                  <SpellLink spell={SPELLS.WYVERNS_CRY} /> should be held until after{' '}
                  <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> ends, or only used when out of focus
                  and out of <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> charges.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={wfbPerf} />,
        details: cast.wildfireBombCastInWindow ? (
          <TooltipElement content="cast during Takedown window">(?)</TooltipElement>
        ) : null,
      });
    }

    // 4. Wasted Tip of the Spear (KC cast while capped)
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
                priority over generating new ones. Never use{' '}
                <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> when already at 3 stacks
                — spend on <SpellLink spell={SPELLS.RAPTOR_SWIPE_BUFF} /> first to avoid wasting the
                generated stack.
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

    // 5. Boomstick before Takedown
    //    First Takedown: always evaluated
    //    Subsequent Takedowns: only evaluated if Boomstick was available at cast time;
    //    It largely should not overlap other than on pull due to mismatched cd timess.
    if (this.hasBoomstick && (cast.isFirstTakedown || cast.boomstickCooldownAtCast === 0)) {
      let boomstickPerf: QualitativePerformance;
      let details: ReactNode = null;

      if (cast.hasBoomstickBeforeCast) {
        boomstickPerf = QualitativePerformance.Good;
      } else if (cast.isFirstTakedown && cast.boomstickCooldownAtCast > 0) {
        // First Takedown only: still on CD from an earlier use is acceptable
        boomstickPerf = QualitativePerformance.Good;
        details = <TooltipElement content="on cooldown at cast time">(?) </TooltipElement>;
      } else {
        // Available but not cast immediately before Takedown
        boomstickPerf = QualitativePerformance.Fail;
        details = (
          <TooltipElement content="was available but not cast before Takedown">(?) </TooltipElement>
        );
      }

      downgrade(boomstickPerf);
      items.push({
        label: (
          <>
            <SpellLink spell={TALENTS.BOOMSTICK_TALENT} />{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={TALENTS.BOOMSTICK_TALENT} /> should be cast before{' '}
                  <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> to build stacks of{' '}
                  <SpellLink spell={SPELLS.MONGOOSE_FURY} />. If it becomes available during{' '}
                  <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> it is fine to cast it then as Pack
                  Leader, but when available beforehand it should always come first in Single
                  Target.
                </>
              }
            >
              (?)
            </TooltipElement>
          </>
        ),
        result: <PerformanceMark perf={boomstickPerf} />,
        details,
      });
    }

    return { checklist: items, perf: overallPerf };
  }
}
