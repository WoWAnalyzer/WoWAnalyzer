import { t } from '@lingui/macro';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const debug = false;
const BUFF_CD = 10000;
const HEAL_EVENT_BUFFER = 100;

class VivaciousVivification extends Analyzer {
  lastApply: number = 0;
  lastRemove: number = 0;
  totalCasts: number = 0;
  wastedTime: number = 0;
  totalHealed: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.death.by(SELECTED_PLAYER), (event) => {
      this.lastApply = 0;
      this.lastRemove = 0;
    });
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onRemove,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onCast);
  }

  onApply(event: ApplyBuffEvent) {
    this.lastApply = event.timestamp;
  }

  onRemove(event: RemoveBuffEvent) {
    // overcap when more than 10 seconds since last apply (CD for next application starts on apply)
    if (this.lastApply && event.timestamp - this.lastApply > BUFF_CD) {
      this.wastedTime += event.timestamp - this.lastApply - BUFF_CD;
      debug &&
        console.log(
          'Capped by ' +
            (event.timestamp - this.lastApply - BUFF_CD) +
            ' seconds at ' +
            this.owner.formatTimestamp(event.timestamp),
        );
    }
    this.lastRemove = event.timestamp;
  }

  onHeal(event: HealEvent) {
    if (Math.abs(event.timestamp - this.lastRemove) < HEAL_EVENT_BUFFER) {
      this.totalHealed += event.amount;
    }
  }

  onCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.VIVIFICATION_BUFF.id) &&
      event.ability.guid === SPELLS.VIVIFY.id
    ) {
      this.totalCasts += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedTime,
      isGreaterThan: {
        minor: 30000, // 30 seconds
        average: 60000, // 1 minute
        major: 120000, // 2 minutes
      },
      recommended: 0,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are currently overcapping on{' '}
          <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} /> and wasting instant{' '}
          <SpellLink id={SPELLS.VIVIFY.id} /> casts
        </>,
      )
        .icon(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.icon)
        .actual(
          `${formatDuration(this.wastedTime) + ' '}${t({
            id: 'monk.mistweaver.suggestions.vivaciousVivification.wastedTime',
            message: ` seconds of overcapping`,
          })}`,
        )
        .recommended(`<${formatNumber(recommended / 1000)} seconds of overcapping is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Total Healed: {formatNumber(this.totalHealed)} </li>
            <li>Total Instant Casts: {this.totalCasts}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT}>
          <ItemHealingDone amount={this.totalHealed} />
          <br />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VivaciousVivification;
