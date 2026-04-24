import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import { getBlossomSource } from '../../normalizers/EventLinking/helpers';
import { BLOSSOM_SOURCE } from '../../normalizers/EventLinking/constants';
import { SPELL_COLORS } from '../../constants';

class FlutteringSeedlings extends Analyzer {
  healingBySource: Record<BLOSSOM_SOURCE, number> = {
    [BLOSSOM_SOURCE.BLOSSOM_CAST]: 0,
    [BLOSSOM_SOURCE.VERDANT_EMBRACE]: 0,
    [BLOSSOM_SOURCE.FIELD_OF_DREAMS]: 0,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLUTTERING_SEEDLINGS_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const source = getBlossomSource(event);
    this.healingBySource[source] += event.amount + (event.absorbed ?? 0);
  }

  get totalHealing() {
    return (
      this.healingBySource[BLOSSOM_SOURCE.BLOSSOM_CAST] +
      this.healingBySource[BLOSSOM_SOURCE.VERDANT_EMBRACE] +
      this.healingBySource[BLOSSOM_SOURCE.FIELD_OF_DREAMS]
    );
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM_CAST.id,
        value: this.healingBySource[BLOSSOM_SOURCE.BLOSSOM_CAST],
        valueTooltip: formatNumber(this.healingBySource[BLOSSOM_SOURCE.BLOSSOM_CAST]),
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
        value: this.healingBySource[BLOSSOM_SOURCE.VERDANT_EMBRACE],
        valueTooltip: formatNumber(this.healingBySource[BLOSSOM_SOURCE.VERDANT_EMBRACE]),
      },
      {
        color: SPELL_COLORS.FLUTTERING_SEEDLING,
        label: 'Field of Dreams',
        spellId: TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT.id,
        value: this.healingBySource[BLOSSOM_SOURCE.FIELD_OF_DREAMS],
        valueTooltip: formatNumber(this.healingBySource[BLOSSOM_SOURCE.FIELD_OF_DREAMS]),
      },
    ].filter((item) => item.value > 0);

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> (hardcast):{' '}
              {formatNumber(this.healingBySource[BLOSSOM_SOURCE.BLOSSOM_CAST])}
            </li>
            <li>
              <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} />:{' '}
              {formatNumber(this.healingBySource[BLOSSOM_SOURCE.VERDANT_EMBRACE])}
            </li>
            <li>
              <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} />:{' '}
              {formatNumber(this.healingBySource[BLOSSOM_SOURCE.FIELD_OF_DREAMS])}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT}>
              Seedling sources:
            </SpellLink>
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default FlutteringSeedlings;
