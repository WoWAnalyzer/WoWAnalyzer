import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';

import SPELLS from 'common/SPELLS/classic';

interface ShadowWordPainTracker {
  applicationTime: number;
  shadowWeavingStackCount: number;
}

class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private shadowWordPainTracker: { [targetId: number]: ShadowWordPainTracker } = {};

  private overwrittenShadowWordPains = 0;
  private shadowWeavingDurationByStack = [0, 0, 0, 0, 0, 0];

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get currentShadowWeavingStacks() {
    return this.selectedCombatant.getBuffStacks(SPELLS.SHADOW_WEAVING_BUFF.id);
  }

  shadowWeavingStacksPercentByRank(rank: number) {
    if (rank < 0 || rank >= this.shadowWeavingDurationByStack.length) {
      return 0;
    }
    return (
      this.shadowWeavingDurationByStack[rank] /
      this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id)
    );
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell({ id: SPELLS.SHADOW_WORD_PAIN.id }),
      this.swpApplication,
    );

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell({ id: SPELLS.SHADOW_WORD_PAIN.id }),
      this.swpRefresh,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell({ id: SPELLS.SHADOW_WORD_PAIN.id }),
      this.swpRemoval,
    );
  }

  swpApplication(event: ApplyDebuffEvent) {
    this.shadowWordPainTracker[event.targetID] = this.shadowWordPainTracker[event.targetID] || {};
    this.shadowWordPainTracker[event.targetID].applicationTime = event.timestamp;
    this.shadowWordPainTracker[event.targetID].shadowWeavingStackCount =
      this.currentShadowWeavingStacks;
  }

  swpRefresh(event: RefreshDebuffEvent) {
    this.shadowWordPainTracker[event.targetID] = this.shadowWordPainTracker[event.targetID] || {};
    if (this.shadowWordPainTracker[event.targetID].applicationTime) {
      this.overwrittenShadowWordPains += 1;
      const applicationTime = this.shadowWordPainTracker[event.targetID].applicationTime;
      const stackCount = this.shadowWordPainTracker[event.targetID].shadowWeavingStackCount;
      this.shadowWeavingDurationByStack[stackCount] += event.timestamp - applicationTime;
    }
    this.shadowWordPainTracker[event.targetID].applicationTime = event.timestamp;
    this.shadowWordPainTracker[event.targetID].shadowWeavingStackCount =
      this.currentShadowWeavingStacks;

    this.overwrittenShadowWordPains += 1;
  }

  swpRemoval(event: RemoveDebuffEvent) {
    this.shadowWordPainTracker[event.targetID] = this.shadowWordPainTracker[event.targetID] || {};
    const applicationTime = this.shadowWordPainTracker[event.targetID].applicationTime;
    const stackCount = this.shadowWordPainTracker[event.targetID].shadowWeavingStackCount;
    this.shadowWeavingDurationByStack[stackCount] += event.timestamp - applicationTime;
    delete this.shadowWordPainTracker[event.targetID];
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get shadowWeavingSuggestionThresholds() {
    return {
      actual: this.shadowWeavingStacksPercentByRank(5),
      isLessThan: {
        minor: 0.95,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get shadowWordPainOverwriteThresholds() {
    return {
      actual: this.overwrittenShadowWordPains,
      isGreaterThanOrEqual: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> uptime can be improved. Try to pay more
          attention to your <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> on the boss.
        </span>,
      )
        .icon('spell_shadow_shadowwordpain')
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.shadowWordPain.uptime',
            message: `${formatPercentage(actual)}% Shadow Word: Pain uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );

    when(this.shadowWeavingSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You should apply <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> when you have 5 stacks of{' '}
          <SpellLink spell={SPELLS.SHADOW_WEAVING_BUFF} />. The damage of{' '}
          <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> snapshots when you apply it, but not when
          you refresh it. The more stacks of <SpellLink spell={SPELLS.SHADOW_WEAVING_BUFF} /> you
          have when applying SWP, the better.
        </span>,
      )
        .icon('spell_shadow_shadowwordpain')
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.shadowWordPain.shadowWeavingUptime',
            message: `${formatPercentage(actual)}% Shadow Word: Pain uptime at 5 stacks`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );

    when(this.shadowWordPainOverwriteThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> is automatically refreshed by{' '}
          <SpellLink spell={SPELLS.PAIN_AND_SUFFERING_TALENT} />. Try to avoid hardcasting{' '}
          <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> unless you cast it with less than 5 stacks
          of <SpellLink spell={SPELLS.SHADOW_WEAVING_BUFF} />
        </span>,
      )
        .icon('spell_shadow_shadowwordpain')
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.shadowWordPain.shadowWordPainOverwrite',
            message: `${actual} Shadow Word Pain Overwrites`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.SHADOW_WORD_PAIN.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon spell={SPELLS.SHADOW_WORD_PAIN} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default ShadowWordPain;
