import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { TrackedBuffEvent } from 'parser/core/Entity';

const BAR_COLOR = '#6600CC';

class DarkEvangelism extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT);
  }
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DARK_EVANGELISM_TALENT_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={TALENTS.DARK_EVANGELISM_TALENT} /> uptime can be improved. Try to
          pay more attention to your <SpellLink spell={TALENTS.DARK_EVANGELISM_TALENT} /> buff.
        </span>,
      )
        .icon(TALENTS.DARK_EVANGELISM_TALENT.icon)
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.darkEvangilism.uptime',
            message: `${formatPercentage(actual)}% Dark Evangilism uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  // This gets an uptime history for a buff on the player in the same way enemies.getDebuffHistory does for a debuff on an enemy.
  // By doing so, I can pass this into the same uptime bar that I do for my debuffs.
  // This seems like it would be very useful for many specs, but I couldn't find a function that does exactly this.
  get uptimeHistory() {
    type TempBuffInfo = {
      timestamp: number;
      type: 'apply' | 'remove';
      buff: TrackedBuffEvent;
    };
    const events: TempBuffInfo[] = [];

    const buffHistory = this.selectedCombatant.getBuffHistory(
      SPELLS.DARK_EVANGELISM_TALENT_BUFF.id,
    );
    buffHistory.forEach((buff) => {
      events.push({
        timestamp: buff.start,
        type: 'apply',
        buff,
      });
      events.push({
        timestamp: buff.end !== null ? buff.end : this.owner.currentTimestamp, // buff end is null if it's still active, it can also be 0 if buff ended at pull
        type: 'remove',
        buff,
      });
    });

    type PlayerBuffHistory = {
      start: number;
      end: number;
    };

    const history: PlayerBuffHistory[] = [];
    let current: PlayerBuffHistory | null = null;
    let active = 0;

    events
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => {
        if (event.type === 'apply') {
          if (current === null) {
            current = { start: event.timestamp, end: this.owner.currentTimestamp };
          }
          active += 1;
        }
        if (event.type === 'remove') {
          active -= 1;
          if (active === 0) {
            // We know for a fact that there will be a temp 'apply' before a temp 'remove'
            // because of the previous forEach, so its safe to non-null assert these
            current!.end = event.timestamp;
            history.push(current!);
            current = null;
          }
        }
      });
    // if buff lasted till end of combat, maybe doesn't ever happen due to some normalizing
    if (current !== null) {
      history.push(current);
    }
    return history;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.DARK_EVANGELISM_TALENT_BUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default DarkEvangelism;
