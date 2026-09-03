import { SpellLink } from 'interface';
import { AplTriggerEvent, Condition, tenseAlt } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS';
import { EventType, UpdateSpellUsableEvent } from 'parser/core/Events';
import { getMaxComboPoints } from '../../constants';

/*
 * TODO:
 * Due to how resource events are batched, eg. you press a builder, you get the resource event,
 * before the cast event, cp ruling can be a bit off sometimes.
 * Ideally we'd just grab the proper values using this.comboPointTracker.resourceUpdates.at(-1)
 * but until APLCheck is turned into a proper analyzer, we can't do that.
 */

interface ComboPointState {
  current: number;
  previous: number;
  max: number;
  hasDealFate: boolean;
  hasKillingSpree: boolean;
  betweenTheEyesUsable: UpdateSpellUsableEvent | null;
  killingSpreeUsable: UpdateSpellUsableEvent | null;
  /** Deficit required by `comboPointDeficitAtLeast`, when that variant is in use. */
  requiredDeficit: number;
}

const castComboPoints = (event: AplTriggerEvent) =>
  event.classResources?.find(({ type }) => type === RESOURCE_TYPES.COMBO_POINTS.id);

const currentComboPoints = (state: ComboPointState, event: AplTriggerEvent) => {
  const resource = castComboPoints(event);
  return resource ? resource.amount : state.previous;
};

const comboPointDeficit = (state: ComboPointState, event: AplTriggerEvent) =>
  state.max - currentComboPoints(state, event);

const spellIsReady = (state: UpdateSpellUsableEvent | null) => state === null || state.isAvailable;

export const finisherComboPointCondition = (): Condition<ComboPointState> => {
  return {
    key: 'outlaw-finisher-combo-point-condition',
    init: ({ combatant }) => ({
      current: 0,
      previous: 0,
      max: getMaxComboPoints(combatant),
      hasDealFate: combatant.hasTalent(TALENTS.DEAL_FATE_TALENT),
      hasKillingSpree: combatant.hasTalent(TALENTS.KILLING_SPREE_TALENT),
      betweenTheEyesUsable: null,
      killingSpreeUsable: null,
      requiredDeficit: 0,
    }),
    update: (state, event) => {
      if (
        event.type === EventType.ResourceChange &&
        event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id
      ) {
        return {
          ...state,
          current: event.resourceChange - event.waste + state.current,
          previous: state.current,
        };
      }

      if (event.type === EventType.Cast) {
        const resource = castComboPoints(event);
        if (resource) {
          return {
            ...state,
            current: resource.amount - (resource.cost || 0),
            previous: state.current,
          };
        }
      }

      if (event.type === EventType.UpdateSpellUsable) {
        if (event.ability.guid === SPELLS.BETWEEN_THE_EYES.id) {
          return { ...state, betweenTheEyesUsable: event };
        }
        if (event.ability.guid === TALENTS.KILLING_SPREE_TALENT.id) {
          return { ...state, killingSpreeUsable: event };
        }
      }

      return state;
    },
    validate: (state, event) => {
      const shouldFinishEarlier =
        !spellIsReady(state.betweenTheEyesUsable) &&
        (state.hasDealFate || (state.hasKillingSpree && spellIsReady(state.killingSpreeUsable)));
      const threshold = state.max - 1 - (shouldFinishEarlier ? 1 : 0);

      return currentComboPoints(state, event) >= threshold;
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} enough combo points to spend — one below maximum, or
        two below while <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> is down
      </>
    ),
  };
};

/**
 * SimC: `combo_points.deficit>=(1+talent.quick_draw+(talent.quick_draw*talent.fan_the_hammer.rank))`
 *
 * The required deficit depends on Quick Draw and Fan the Hammer's rank, so it is resolved from the
 * combatant rather than passed in.
 */
export const fanTheHammerComboPointDeficit = (): Condition<ComboPointState> => {
  const base = finisherComboPointCondition();

  return {
    ...base,
    key: 'outlaw-fan-the-hammer-combo-point-deficit',
    init: (info) => ({
      ...base.init(info),
      requiredDeficit:
        1 +
        (info.combatant.hasTalent(TALENTS.QUICK_DRAW_TALENT)
          ? 1 + info.combatant.getTalentRank(TALENTS.FAN_THE_HAMMER_TALENT)
          : 0),
    }),
    validate: (state, event) => comboPointDeficit(state, event) >= state.requiredDeficit,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} enough combo-point deficit for{' '}
        <SpellLink spell={TALENTS.FAN_THE_HAMMER_TALENT} />
      </>
    ),
  };
};

export const comboPointDeficitAtMost = (deficit: number): Condition<ComboPointState> => {
  return {
    ...finisherComboPointCondition(),
    key: `outlaw-combo-point-deficit-at-most-${deficit}`,
    validate: (state, event) => comboPointDeficit(state, event) <= deficit,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} at most {deficit} combo-point deficit
      </>
    ),
  };
};
