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
import ItemManaGained from 'parser/ui/ItemManaGained';

export const ESSENCE_COSTS: { [name: string]: number } = {
  'Emerald Blossom': 3,
  Echo: 2,
  Disintegrate: 3,
};

export const MANA_COSTS: { [name: string]: number } = {
  'Emerald Blossom': SPELLS.EMERALD_BLOSSOM_CAST.manaCost,
  Echo: TALENTS_EVOKER.ECHO_TALENT.manaCost!,
  Disintegrate: 0,
};

class EssenceBurst extends Analyzer {
  totalConsumed: number = 0;
  totalExpired: number = 0;
  essenceSaved: number = 0;
  manaSaved: number = 0;
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
      this.manaSaved += MANA_COSTS[spellName];
      this.consumptionCount[spellName] += 1;
    } else if (event.type === EventType.RemoveBuff) {
      this.totalExpired += 1;
    } else {
      this.totalExpired += (event as RemoveBuffStackEvent).stack;
    }
  }

  get averageManaSavedForHealingSpells() {
    return this.manaSaved / (this.totalConsumed - this.consumptionCount.Disintegrate);
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
    return items.length > 0 ? <DonutChart items={items} /> : null;
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

  get buffApplyThreshold() {
    return {
      actual: this.totalConsumed + this.totalExpired,
      isLessThan: {
        major: 3,
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
    const donutChart = this.renderDonutChart();
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT} /> consumption by spell
          </label>
          {donutChart ? (
            donutChart
          ) : (
            <small>
              You gained no <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> buffs during
              the encounter
            </small>
          )}
          <ItemManaGained amount={this.manaSaved} useAbbrev />
        </div>
      </Statistic>
    );
  }
}

export default EssenceBurst;
