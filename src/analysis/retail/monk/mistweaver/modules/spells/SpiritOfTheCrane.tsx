import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ResourceChangeEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TEACHINGS_OF_THE_MONASTERY_DURATION } from '../../constants';

const SOTC_MANA_PER_SECOND_RETURN_MINOR = 80;
const SOTC_MANA_PER_SECOND_RETURN_AVERAGE: number = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;
const SOTC_MANA_PER_SECOND_RETURN_MAJOR: number = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;

class SpiritOfTheCrane extends Analyzer {
  lastTotmBuffTimestamp: number = 0;

  currentStacks: number = 0;
  firstRefreshAtMax: boolean = false;

  refreshedStacks: number = 0;
  droppedStacks: number = 0;

  manaReturn: number = 0;
  manaWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.firstStack,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.gainStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.lostStacks,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.refreshStack,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_THE_CRANE_BUFF),
      this.sotcManaChange,
    );
  }

  firstStack(event: ApplyBuffEvent) {
    this.lastTotmBuffTimestamp = event.timestamp;
    this.currentStacks = 1;
  }

  gainStacks(event: ApplyBuffStackEvent) {
    this.lastTotmBuffTimestamp = event.timestamp;
    this.currentStacks = event.stack;
    if (event.stack === 3) {
      this.firstRefreshAtMax = true;
    }
  }

  lostStacks(event: RemoveBuffEvent) {
    const currentTime = event.timestamp;
    const timeDifference = currentTime - this.lastTotmBuffTimestamp;

    if (timeDifference >= TEACHINGS_OF_THE_MONASTERY_DURATION) {
      this.droppedStacks += this.currentStacks;
    }

    this.currentStacks = 0;
  }

  refreshStack(event: RefreshBuffEvent) {
    // the log is weird and when you hit max stacks you also get a refresh event
    if (this.firstRefreshAtMax) {
      this.firstRefreshAtMax = false;
      return;
    }
    this.refreshedStacks += 1;
  }

  sotcManaChange(event: ResourceChangeEvent) {
    this.manaReturn += event.resourceChange - event.waste;
    this.manaWasted += event.waste;
  }

  get suggestionThresholds() {
    return {
      actual: this.manaReturn,
      isLessThan: {
        minor: SOTC_MANA_PER_SECOND_RETURN_MINOR * (this.owner.fightDuration / 1000),
        average: SOTC_MANA_PER_SECOND_RETURN_AVERAGE * (this.owner.fightDuration / 1000),
        major: SOTC_MANA_PER_SECOND_RETURN_MAJOR * (this.owner.fightDuration / 1000),
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are not utilizing your <SpellLink spell={TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT} />{' '}
          talent as effectively as you could. Make sure you are using any available downtime to use{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} /> and <SpellLink spell={SPELLS.BLACKOUT_KICK} /> to
          take advantage of this talent.
        </>,
      )
        .icon(TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT.icon)
        .actual(
          `${formatNumber(this.manaReturn)}${t({
            id: 'monk.mistweaver.suggestions.spiritOfTheCrane.manaReturned',
            message: ` mana returned through Spirit of the Crane`,
          })}`,
        )
        .recommended(`${formatNumber(recommended)} is the recommended mana return`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You gained a raw total of {((this.manaReturn + this.manaWasted) / 1000).toFixed(0)}k
            mana from SotC with {(this.manaWasted / 1000).toFixed(0)}k wasted.
            <br />
            You lost {this.droppedStacks + this.refreshedStacks} Teachings of the Monestery stacks.
            <br />
            <ul>
              {this.refreshedStacks > 0 && (
                <li>You overcapped Teachings {this.refreshedStacks} times</li>
              )}
              {this.droppedStacks > 0 && (
                <li>You let Teachings drop off {this.droppedStacks} times</li>
              )}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT}>
          <ItemManaGained amount={this.manaReturn} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SpiritOfTheCrane;
