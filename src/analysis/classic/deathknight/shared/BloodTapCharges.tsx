import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { SpellInfo } from 'parser/core/EventFilter';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const MAX_CHARGES = 12; // Blood Charge buff is capped at 12 stacks
const CHARGE_GAIN = 2; // Each generator grants 2 Blood Charges per cast
const JITTER_MS = 50;

/**
 * Tracks wasted Blood Tap charges for a spec's Blood Charge generator casts
 * at the Blood Charge cap (12 stacks). Shared between Frost (generator: Frost
 * Strike) and Unholy (generator: Death Coil) — the two specs only differ by
 * which spell generates charges, so this factory takes that spell as a
 * parameter.
 *
 * The generator grants 2 Blood Charges per cast (max 12). Casting while at
 * 11 stacks wastes 1 charge (only +1 gained); at 12 stacks wastes 2 charges
 * (nothing gained). Blood Charges should be spent via Blood Tap before they
 * reach the cap.
 *
 * WCL can report the Blood Charge stack-increase event for a generator cast
 * either before or after that cast's own event. The accompanying
 * EventLinkNormalizer resolves this ordering ambiguity up front by linking
 * each generator cast to its Blood Charge gain event (if any fired):
 * - Partial overflow (11 -> 12, +1 instead of +2) is detected from the delta
 *   on the linked gain event itself.
 * - Full overflow (already at 12, no stack event fires at all since nothing
 *   changes) is detected at cast-time when there's no linked gain event.
 */
export function createBloodTapCharges(generatorSpell: SpellInfo, generatorName: string) {
  const link: EventLink = {
    linkRelation: 'BloodChargeGain',
    linkingEventId: generatorSpell.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.BLOOD_CHARGE.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    forwardBufferMs: JITTER_MS,
    backwardBufferMs: JITTER_MS,
  };
  const { normalizer, linkHelper } = EventLinkNormalizer.build(link);

  class BloodTapCharges extends Analyzer {
    private _currentCharges = 0;
    private _badCasts = 0;

    constructor(options: Options) {
      super(options);
      this.addEventListener(
        Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
        this.onChargeApply,
      );
      this.addEventListener(
        Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
        this.onChargeStack,
      );
      this.addEventListener(
        Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
        this.onChargeRemoveStack,
      );
      this.addEventListener(
        Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.BLOOD_CHARGE),
        this.onChargeRemove,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(generatorSpell),
        this.onChargeGenerator,
      );
    }

    private onChargeApply(event: ApplyBuffEvent) {
      const stack = (event as ApplyBuffEvent & { stack?: number }).stack;
      const newStack = stack !== undefined ? stack : Math.max(this._currentCharges, CHARGE_GAIN);
      this._applyGain(newStack);
    }

    private onChargeStack(event: ApplyBuffStackEvent) {
      this._applyGain(event.stack);
    }

    // Records a Blood Charge increase and checks, from the delta alone,
    // whether it was a partial-overflow waste.
    private _applyGain(newStack: number) {
      const previousCharges = this._currentCharges;
      const gained = Math.max(0, newStack - previousCharges);
      if (gained > 0 && gained < CHARGE_GAIN) {
        this._badCasts += 1;
      }
      this._currentCharges = newStack;
    }

    private onChargeRemoveStack(event: RemoveBuffStackEvent) {
      this._currentCharges = event.stack;
    }

    private onChargeRemove(_event: RemoveBuffEvent) {
      this._currentCharges = 0;
    }

    private onChargeGenerator(event: CastEvent) {
      // If this cast has a linked Blood Charge gain event, it's already been
      // accounted for by _applyGain — don't double count.
      const linkedGain = linkHelper.first(event);
      if (linkedGain) {
        return;
      }
      // No gain event will ever fire for this cast (stack is already at the
      // cap and won't change), so this is an unambiguous full waste.
      if (this._currentCharges >= MAX_CHARGES) {
        this._badCasts += 1;
      }
    }

    get suggestionThresholds() {
      return {
        actual: this._badCasts,
        isGreaterThan: {
          minor: 0,
          average: 2,
          major: 5,
        },
        style: ThresholdStyle.NUMBER,
      };
    }

    statistic() {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(50)}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={`${generatorName} casts at 11 or 12 Blood Charges waste 1 or 2 charges respectively.`}
        >
          <BoringSpellValueText spell={SPELLS.BLOOD_TAP}>
            {this._badCasts}{' '}
            <small>
              wasted {generatorName} cast{this._badCasts !== 1 ? 's' : ''}
            </small>
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }

  return { analyzer: BloodTapCharges, normalizer };
}
