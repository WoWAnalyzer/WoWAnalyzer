import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { EventType, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { getEssenceBurstConsumeAbility } from '../../normalizers/CastLinkNormalizer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SPELL_COLORS } from 'analysis/retail/evoker/preservation/constants';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';

const ESSENCE_COSTS: { [name: string]: number } = {
  'Emerald Blossom': 3,
  Echo: 2,
  Disintegrate: 3,
};

class EssenceBurst extends Analyzer {
  totalConsumed: number = 0;
  totalExpired: number = 0;
  essenceSaved: number = 0;
  consumptionCount: { [name: string]: number } = { 'Emerald Blossom': 0, Echo: 0, Disintegrate: 0 };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onBuffRemove,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_ATTUNEMENT_TALENT)) {
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
        this.onBuffRemove,
      );
    }
  }

  onBuffRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumeAbility = getEssenceBurstConsumeAbility(event);
    if (consumeAbility) {
      const spellName = consumeAbility.ability.name;
      this.totalConsumed += 1;
      this.essenceSaved += ESSENCE_COSTS[spellName];
      this.consumptionCount[spellName] += 1;
    } else if (event.type === EventType.RemoveBuff) {
      this.totalExpired += 1;
    } else {
      this.totalExpired += (event as RemoveBuffStackEvent).stack;
    }
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.DISINTEGRATE,
        label: 'Disintegrate',
        spellId: SPELLS.DISINTEGRATE.id,
        value: this.consumptionCount['Disintegrate'],
        valueTooltip: this.consumptionCount['Disintegrate'],
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.consumptionCount['Emerald Blossom'],
        valueTooltip: this.consumptionCount['Emerald Blossom'],
      },
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.consumptionCount['Echo'],
        valueTooltip: this.consumptionCount['Echo'],
      },
    ].filter((item) => {
      return item.value > 0;
    });
    return <DonutChart items={items} />;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalExpired,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid wasting <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> stacks.
        </>,
      )
        .icon(TALENTS_EVOKER.ESSENCE_BURST_TALENT.icon)
        .actual(
          `${actual} ${t({
            id: 'evoker.preservation.suggestions.essenceBurst.wastedStacks',
            message: ` wasted Essence Burst stacks`,
          })}`,
        )
        .recommended(`${recommended} wasted stacks recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT} /> consumption by spell
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default EssenceBurst;
