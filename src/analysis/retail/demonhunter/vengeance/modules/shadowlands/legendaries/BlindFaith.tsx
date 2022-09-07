import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import VersatilityIcon from 'interface/icons/Versatility';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { ConsumeSoulFragmentsEvent } from '../../statistics/SoulFragmentsConsume';

type Dataset = Record<number, { start: number; end: number }>;

/**
 * Blind Faith
 * Shadowlands legendary that buffs the player after casting Elysian Decree
 * for 20 seconds
 */
export default class BlindFaith extends Analyzer {
  blindFaithActive = false;
  currentStacks = 0;

  data: number[] = [];
  dataset: Dataset = {
    0: { start: 0, end: 0 },
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.BLIND_FAITH);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLIND_FAITH_BUFF),
      this.onBlindFaithGain,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLIND_FAITH_BUFF),
      this.onBlindFaithLoss,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLIND_FAITH_BUFF),
      this.onBlindFaithGain,
    );
    this.addEventListener(EventType.ConsumeSoulFragments, this.onSoulFragmentsConsumed);
  }

  get calcGoodWindowsPercentage() {
    return this.data.filter((window) => window > 10).length / this.data.length;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.calcGoodWindowsPercentage,
      isLessThan: {
        minor: 0.75,
        average: 0.65,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onBlindFaithGain(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.blindFaithActive = true;
    // e.g. when recasting Decree while Urh is up, you lose internal stacks
    this.currentStacks = 0;
    this.dataset[0].start = event.timestamp;
  }

  onBlindFaithLoss(event: RemoveBuffEvent) {
    this.blindFaithActive = false;
    this.currentStacks = 0;

    const highestStacksReached = Object.keys(this.dataset)
      .map((key) => Number.parseInt(key))
      .reduce((acc, key) => (acc > key ? acc : key), 0);

    // mark as finished
    this.dataset[highestStacksReached].end = event.timestamp;

    const averageStacks = Object.entries(this.dataset).reduce((acc, [stacksAsString, entry]) => {
      const timeSpentAt = entry.end - entry.start;

      if (timeSpentAt === 0) {
        return acc;
      }

      return acc + (timeSpentAt / 20000) * Number.parseInt(stacksAsString);
    }, 0);

    this.data.push(averageStacks);

    this.dataset = {
      0: { start: 0, end: 0 },
    };
  }

  onSoulFragmentsConsumed(event: ConsumeSoulFragmentsEvent) {
    if (!this.blindFaithActive || this.currentStacks === 20) {
      return;
    }

    const nextStacks = event.numberofSoulFragmentsConsumed + this.currentStacks;
    this.currentStacks = nextStacks > 20 ? 20 : nextStacks;

    const prevStacks =
      nextStacks > 1
        ? Object.keys(this.dataset)
            .map((key) => Number.parseInt(key))
            .reduce((acc, key) => (acc > key ? acc : key), 0)
        : 0;

    // if numberOfSoulFragmentsConsumed > 1 we're skipping stacks
    if (prevStacks in this.dataset) {
      this.dataset[prevStacks].end = event.timestamp;
    }

    this.dataset[nextStacks] = { start: event.timestamp, end: 0 };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {t({
            id: 'demonhunter.vengeance.suggestions.blindFaith.suggest.a',
            message: 'Try to consume more Soul Fragments during your',
          })}{' '}
          <SpellLink id={SPELLS.BLIND_FAITH_BUFF.id} />{' '}
          {t({ id: 'demonhunter.vengeance.suggestions.blindFaith.suggest.b', message: 'windows.' })}
        </>,
      )
        .icon(SPELLS.BLIND_FAITH_BUFF.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.blindFaith.actual',
            message: `${formatPercentage(
              this.calcGoodWindowsPercentage,
            )}% of windows with an average of 10 or more stacks.`,
          }),
        )
        .recommended(
          t({
            id: 'demonhunter.vengeance.suggestions.blindFaith.recommended',
            message: `>${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    const avg = (this.data.reduce((acc, value) => acc + value, 0) / this.data.length).toFixed(2);

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={SPELLS.BLIND_FAITH.id}>
          <>
            <VersatilityIcon /> {avg}% average Versatility <small>per Elysian Decree.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
